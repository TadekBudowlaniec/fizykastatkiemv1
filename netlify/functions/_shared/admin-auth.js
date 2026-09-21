// netlify/functions/_shared/admin-auth.js
// Wspólna bramka admina dla funkcji panelu: weryfikacja JWT (anon client)
// + sprawdzenie users.is_admin przez service_role (omija RLS).
// Wzorzec identyczny jak w admin-stats.js / get-pdf-url.js.

const { createClient } = require('@supabase/supabase-js');

const supabaseAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function json(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify(body),
    };
}

/**
 * Zwraca { user } dla zalogowanego admina albo { response } z gotową odpowiedzią
 * 401/403 do zwrócenia z handlera.
 */
async function requireAdmin(event) {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { response: json(401, { error: 'Brak autoryzacji.' }) };
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    if (error || !user) return { response: json(401, { error: 'Nieprawidłowy token.' }) };

    const { data: row } = await supabaseAdmin
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
    if (!row || !row.is_admin) {
        return { response: json(403, { error: 'Brak uprawnień administratora.' }) };
    }
    return { user };
}

module.exports = { requireAdmin, json };
