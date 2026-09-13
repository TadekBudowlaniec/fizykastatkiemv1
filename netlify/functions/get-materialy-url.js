// netlify/functions/get-materialy-url.js
// Poziomy 1–3 z bucketu „materialy-pdf". Ta sama metoda bezpieczeństwa co
// get-pdf-url (JWT + enrollment/admin + krótkotrwały signed URL). Różnica:
// nowy bucket z folderami per dział, Poziom 1 ma zmienną liczbę plików.
//
// Struktura Storage (bucket „materialy-pdf"):
//   {NN_Nazwa}/Poziom1_Teoria/*.pdf                     (zmienna liczba)
//   {NN_Nazwa}/Poziom2_Zadania_Dogrzewajace/Zadania.pdf + Odpowiedzi.pdf
//   {NN_Nazwa}/Poziom3_Zadania_Maturalne/Zadania.pdf   + Odpowiedzi.pdf
// gdzie NN = course_id z zerem wiodącym (01..16). Poziom 4 = dawny Etap 3
// (osobny mechanizm w get-pdf-url, nie tutaj).

const { createClient } = require('@supabase/supabase-js');

const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const BUCKET = 'materialy-pdf';
// Foldery działów są w folderze-owijce (nie na root bucketu).
const ROOT = 'Fizyka_Statkiem_Materialy';
const SUBFOLDER = {
    1: 'Poziom1_Teoria',
    2: 'Poziom2_Zadania_Dogrzewajace',
    3: 'Poziom3_Zadania_Maturalne',
};

// Nazwa folderu działu wynika z listy w buckecie (unikamy zgadywania nazwy PL
// po numerze). Dopasowanie po prefiksie „NN_" wewnątrz folderu-owijki.
// Zwraca pełną ścieżkę folderu działu (z ROOT).
async function resolveCourseFolder(courseIdNum) {
    const prefix = String(courseIdNum).padStart(2, '0') + '_';
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).list(ROOT, {
        limit: 1000,
    });
    if (error) {
        console.error('materialy list root error:', error);
        return null;
    }
    const folder = (data || []).find(
        (e) => e.name && e.name.startsWith(prefix)
    );
    return folder ? `${ROOT}/${folder.name}` : null;
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 1. Weryfikacja JWT
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Brak autoryzacji.' }) };
        }
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
        if (authError || !user) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Nieprawidłowy token.' }) };
        }

        const { courseId, poziom, action, file } = JSON.parse(event.body);
        const courseIdNum = Number(courseId);
        const poziomNum = Number(poziom);

        if (!courseIdNum || courseIdNum < 1 || courseIdNum > 16) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Nieprawidłowy dział.' }) };
        }
        if (!poziomNum || poziomNum < 1 || poziomNum > 3) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Nieprawidłowy poziom.' }) };
        }
        if (action !== 'list' && action !== 'sign') {
            return { statusCode: 400, body: JSON.stringify({ error: 'Nieprawidłowa akcja.' }) };
        }

        // 2. Kontrola dostępu: admin lub aktywny enrollment na ten dział
        const { data: userRow } = await supabaseAdmin
            .from('users')
            .select('is_admin')
            .eq('id', user.id)
            .single();
        const isAdmin = !!(userRow && userRow.is_admin);

        if (!isAdmin) {
            const { data: enrollment, error: enrollError } = await supabaseAdmin
                .from('enrollments')
                .select('course_id')
                .eq('user_id', user.id)
                .eq('course_id', courseIdNum)
                .eq('access_granted', true)
                .maybeSingle();
            if (enrollError) {
                console.error('Enrollment check error:', enrollError);
                return { statusCode: 500, body: JSON.stringify({ error: 'Błąd sprawdzania dostępu.' }) };
            }
            if (!enrollment) {
                return { statusCode: 403, body: JSON.stringify({ error: 'Brak dostępu do tego działu.' }) };
            }
        }

        // 3. Ustal folder działu i podfolder poziomu
        const folder = await resolveCourseFolder(courseIdNum);
        if (!folder) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Materiały dla tego działu nie są jeszcze dostępne.' }) };
        }
        const sub = SUBFOLDER[poziomNum];
        const dir = `${folder}/${sub}`;

        // 4a. LISTA plików
        if (action === 'list') {
            if (poziomNum === 1) {
                // Zmienna liczba plików - listujemy folder.
                const { data, error } = await supabaseAdmin.storage.from(BUCKET).list(dir, {
                    limit: 1000,
                    sortBy: { column: 'name', order: 'asc' },
                });
                if (error) {
                    console.error('materialy list P1 error:', error);
                    return { statusCode: 500, body: JSON.stringify({ error: 'Błąd listowania plików.' }) };
                }
                const files = (data || [])
                    .filter((e) => e.id && /\.pdf$/i.test(e.name || ''))
                    .map((e) => ({ name: e.name }));
                return { statusCode: 200, body: JSON.stringify({ files }) };
            }
            // Poziom 2/3 - stałe pliki (bez listowania).
            const files = [{ name: 'Zadania.pdf' }, { name: 'Odpowiedzi.pdf' }];
            return { statusCode: 200, body: JSON.stringify({ files }) };
        }

        // 4b. PODPISANY URL do konkretnego pliku
        // Serwer sam składa ścieżkę z zaufanych elementów; z body bierze tylko
        // nazwę pliku i waliduje ją (bez „/" i „..") - brak path traversal.
        const safeFile = String(file || '');
        if (!safeFile || safeFile.includes('/') || safeFile.includes('..')) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Nieprawidłowa nazwa pliku.' }) };
        }
        const path = `${dir}/${safeFile}`;
        const { data: signed, error: signError } = await supabaseAdmin.storage
            .from(BUCKET)
            .createSignedUrl(path, 300);
        if (signError) {
            console.error('materialy sign error:', signError, 'path:', path);
            return { statusCode: 404, body: JSON.stringify({ error: 'Nie znaleziono pliku PDF.' }) };
        }
        return { statusCode: 200, body: JSON.stringify({ url: signed.signedUrl }) };
    } catch (err) {
        console.error('get-materialy-url error:', err);
        return { statusCode: 500, body: JSON.stringify({ error: 'Wystąpił błąd serwera.' }) };
    }
};
