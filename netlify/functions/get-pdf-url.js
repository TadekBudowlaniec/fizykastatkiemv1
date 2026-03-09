// netlify/functions/get-pdf-url.js
// Generuje krótkotrwałe podpisane URL-e do PDF-ów po weryfikacji dostępu użytkownika

const { createClient } = require('@supabase/supabase-js');

const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Mapowanie courseId + etap -> bucket + nazwa pliku w Supabase Storage
const coursePdfFiles = {
    1: {
        3: { bucket: 'Etap 3', file: 'Kinematyka ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Kinematyka ETAP 2.pdf' },
        1: { bucket: 'Etap 1', file: 'Kinematyka ETAP 1.pdf' },
    },
    2: {
        3: { bucket: 'Etap 3', file: 'Dynamika ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Dynamika ETAP 2.pdf' },
        1: { bucket: 'Etap 1', file: 'Dynamika ETAP 1.pdf' },
    },
    3: {
        2: { bucket: 'Etap 2', file: 'Praca moc energia ETAP 2.pdf' },
        1: { bucket: 'Etap 1', file: 'Praca moc energia ETAP 1.pdf' },
    },
    4: {
        3: { bucket: 'Etap 3', file: 'Bryla Sztywna ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Bryla sztywna ETAP 2.pdf' },
        1: { bucket: 'Etap 1', file: 'Bryla Sztywna ETAP 1.pdf' },
    },
    5: {
        3: { bucket: 'Etap 3', file: 'Ruch Drgajacy ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Ruch drgajacy ETAP 2.pdf' },
        1: { bucket: 'Etap 1', file: 'Ruch drgajacy ETAP 1.pdf' },
    },
    6: {
        3: { bucket: 'Etap 3', file: 'Fale mechaniczne ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Fale mechaniczne ETAP 2.pdf' },
        1: { bucket: 'Etap 1', file: 'Fale mechaniczne ETAP 1.pdf' },
    },
    7: {
        3: { bucket: 'Etap 3', file: 'Hydrostatyka ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Hydrostatyka ETAP 2.pdf' },
        1: { bucket: 'Etap 3', file: 'Hydrostatyka ETAP 1.pdf' },
    },
    8: {
        3: { bucket: 'Etap 3', file: 'Termodynamika ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Termodynamika ETAP 2.pdf' },
        1: { bucket: 'Etap 3', file: 'Termodynamika ETAP 1.pdf' },
    },
    9: {
        3: { bucket: 'Etap 3', file: 'Grawitacja i astronomia ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Grawitacja i astronomia ETAP 2.pdf' },
        1: { bucket: 'Etap 1', file: 'Grawitacja i astronomia ETAP 1.pdf' },
    },
    10: {
        3: { bucket: 'Etap 3', file: 'Elektrostatyka ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Elektrostatyka ETAP 2.pdf' },
        1: { bucket: 'Etap 1', file: 'Elektrostatyka ETAP 1.pdf' },
    },
    11: {
        3: { bucket: 'Etap 3', file: 'Prad elektryczny ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Prad elektryczny ETAP 2.pdf' },
        1: { bucket: 'Etap 1', file: 'Prad elektryczny ETAP 1.pdf' },
    },
    12: {
        3: { bucket: 'Etap 3', file: 'Magnetyzm ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Magnetyzm ETAP 2.pdf' },
        1: { bucket: 'Etap 1', file: 'Magnetyzm ETAP 1.pdf' },
    },
    13: {
        3: { bucket: 'Etap 3', file: 'Indukcja ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Indukcja ETAP 2.pdf' },
        1: { bucket: 'Etap 1', file: 'Indukcja ETAP 1.pdf' },
    },
    14: {
        3: { bucket: 'Etap 3', file: 'Fale elektromagnetyczne ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Fale elektromagnetyczne ETAP 2.pdf' },
        1: { bucket: 'Etap 1', file: 'Fale elektromagnetyczne ETAP 1.pdf' },
    },
    15: {
        3: { bucket: 'Etap 3', file: 'Atomowa ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Atomowa ETAP 2.pdf' },
        1: { bucket: 'Etap 1', file: 'Atomowa ETAP 1.pdf' },
    },
    16: {
        3: { bucket: 'Etap 3', file: 'Jadrowa i relatywistyka ETAP 3.pdf' },
        2: { bucket: 'Etap 2', file: 'Jadrowa i relatywistyka ETAP 2.pdf' },
        1: { bucket: 'Etap 1', file: 'Jadrowa i relatywistyka ETAP 1.pdf' },
    },
};

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

        const { courseId, etap } = JSON.parse(event.body);
        const courseIdNum = Number(courseId);
        const etapNum = Number(etap);

        if (!courseIdNum || !etapNum || etapNum < 1 || etapNum > 3) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Nieprawidłowe parametry.' }) };
        }

        // 2. Sprawdź enrollment (dostęp do kursu)
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
            return { statusCode: 403, body: JSON.stringify({ error: 'Brak dostępu do tego kursu.' }) };
        }

        // 3. Znajdź plik PDF
        const courseFiles = coursePdfFiles[courseIdNum];
        if (!courseFiles) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Nie znaleziono kursu.' }) };
        }

        const pdfInfo = courseFiles[etapNum];
        if (!pdfInfo) {
            return { statusCode: 404, body: JSON.stringify({ error: 'PDF niedostępny dla tego etapu.' }) };
        }

        // 4. Generuj krótkotrwały signed URL (5 minut)
        const { data: signedUrlData, error: signError } = await supabaseAdmin.storage
            .from(pdfInfo.bucket)
            .createSignedUrl(pdfInfo.file, 300);

        if (signError) {
            console.error('Signed URL error:', signError);
            return { statusCode: 500, body: JSON.stringify({ error: 'Błąd generowania linku do PDF.' }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ url: signedUrlData.signedUrl }),
        };
    } catch (err) {
        console.error('get-pdf-url error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Wystąpił błąd serwera.' }),
        };
    }
};
