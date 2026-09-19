// netlify/functions/admin-users.js
// Lista kursantów dla panelu admina. Dostęp WYŁĄCZNIE dla users.is_admin = true.
//
// Emaile żyją w auth.users (public.users NIE ma kolumny email) — dlatego łączymy:
//   auth.users (email, created_at) + public.users (full_name, is_admin)
//   + enrollments (liczba dostępów per user).

const { createClient } = require('@supabase/supabase-js');

const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const MAX_USERS = 2000;
const PER_PAGE = 200;

function json(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify(body),
    };
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return json(405, { error: 'Method Not Allowed' });
    }

    try {
        // 1) JWT + 2) autoryzacja admina
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return json(401, { error: 'Brak autoryzacji.' });
        }
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
        if (authError || !user) {
            return json(401, { error: 'Nieprawidłowy token.' });
        }
        const { data: me } = await supabaseAdmin
            .from('users')
            .select('is_admin')
            .eq('id', user.id)
            .single();
        if (!me || !me.is_admin) {
            return json(403, { error: 'Brak uprawnień administratora.' });
        }

        // 3) Wszyscy użytkownicy z auth (email + created_at), z paginacją
        const authUsers = [];
        for (let page = 1; authUsers.length < MAX_USERS; page++) {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({
                page,
                perPage: PER_PAGE,
            });
            if (error) {
                console.error('listUsers error:', error);
                return json(500, { error: 'Błąd odczytu użytkowników.' });
            }
            const batch = data?.users ?? [];
            authUsers.push(...batch);
            if (batch.length < PER_PAGE) break;
        }

        // 4) Profile (full_name, is_admin) + dostępy (liczba per user)
        const [{ data: profiles }, { data: enr }] = await Promise.all([
            supabaseAdmin.from('users').select('id, full_name, is_admin'),
            supabaseAdmin
                .from('enrollments')
                .select('user_id')
                .eq('access_granted', true),
        ]);

        const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
        const courseCount = new Map();
        for (const row of enr ?? []) {
            courseCount.set(row.user_id, (courseCount.get(row.user_id) || 0) + 1);
        }

        const users = authUsers
            .map((u) => {
                const p = profileMap.get(u.id);
                return {
                    id: u.id,
                    email: u.email || '—',
                    full_name: (p && p.full_name) || null,
                    is_admin: !!(p && p.is_admin),
                    courses: courseCount.get(u.id) || 0,
                    created_at: u.created_at || null,
                };
            })
            .sort((a, b) => {
                const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
                const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
                return tb - ta;
            });

        const paying = users.filter((u) => u.courses > 0).length;

        return json(200, {
            users,
            summary: { total: users.length, paying },
            generatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('admin-users error:', err);
        return json(500, { error: 'Wystąpił błąd serwera.' });
    }
};
