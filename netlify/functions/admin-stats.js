// netlify/functions/admin-stats.js
// Statystyki dla panelu admina. Dostęp WYŁĄCZNIE dla users.is_admin = true.
// Wzorzec bezpieczeństwa jak w get-pdf-url.js: weryfikacja JWT (anon client),
// autoryzacja + odczyt danych przez service_role (omija RLS enrollments_select_own).
//
// Źródła danych:
//   - enrollments (Supabase, service_role) -> nadane dostępy = "sprzedaże"
//   - Stripe API -> przychód (jedyne wiarygodne źródło kwot; enrollments nie ma cen)

const { createClient } = require('@supabase/supabase-js');

// Preferuj klucz LIVE (prawdziwy przychód na produkcji); TEST jako fallback lokalnie.
const stripe = require('stripe')(
    process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_TEST
);

const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const DAY = 24 * 60 * 60 * 1000;

function json(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify(body),
    };
}

// Przychód netto z opłaconych, udanych obciążeń (gross - zwroty), w zł.
async function loadStripeRevenue() {
    const now = Math.floor(Date.now() / 1000);
    const since30 = now - 30 * 24 * 60 * 60;

    const sumNet = (charges) =>
        charges.reduce((acc, ch) => {
            if (ch.paid && ch.status === 'succeeded') {
                acc += (ch.amount - (ch.amount_refunded || 0));
            }
            return acc;
        }, 0);

    // Ostatnie 30 dni (do liczby transakcji + kwoty 30d)
    const last30 = await stripe.charges
        .list({ created: { gte: since30 }, limit: 100 })
        .autoPagingToArray({ limit: 2000 });

    // Całość (niski wolumen korepetycji/kursu - bezpieczny limit)
    const all = await stripe.charges
        .list({ limit: 100 })
        .autoPagingToArray({ limit: 5000 });

    const paid30 = last30.filter((c) => c.paid && c.status === 'succeeded');
    const currency = (all.find((c) => c.currency)?.currency || 'pln').toUpperCase();

    return {
        currency,
        totalNet: Math.round(sumNet(all)) / 100,
        last30dNet: Math.round(sumNet(last30)) / 100,
        last30dCount: paid30.length,
    };
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return json(405, { error: 'Method Not Allowed' });
    }

    try {
        // 1) Weryfikacja JWT
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return json(401, { error: 'Brak autoryzacji.' });
        }
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
        if (authError || !user) {
            return json(401, { error: 'Nieprawidłowy token.' });
        }

        // 2) Autoryzacja: TYLKO admin
        const { data: userRow } = await supabaseAdmin
            .from('users')
            .select('is_admin')
            .eq('id', user.id)
            .single();
        if (!userRow || !userRow.is_admin) {
            return json(403, { error: 'Brak uprawnień administratora.' });
        }

        // 3) Enrollments (service_role omija RLS) - agregacja w JS (niski wolumen)
        const { data: rows, error: enrErr } = await supabaseAdmin
            .from('enrollments')
            .select('user_id, course_id, enrolled_at')
            .eq('access_granted', true)
            .order('enrolled_at', { ascending: false })
            .limit(5000);
        if (enrErr) {
            console.error('admin-stats enrollments error:', enrErr);
            return json(500, { error: 'Błąd odczytu enrollments.' });
        }

        const now = Date.now();
        const since30 = now - 30 * DAY;
        const since7 = now - 7 * DAY;
        const byCourseMap = new Map();
        let last30 = 0;
        let last7 = 0;

        for (const r of rows) {
            const t = r.enrolled_at ? new Date(r.enrolled_at).getTime() : 0;
            if (t >= since30) last30 += 1;
            if (t >= since7) last7 += 1;
            byCourseMap.set(r.course_id, (byCourseMap.get(r.course_id) || 0) + 1);
        }

        const byCourse = [...byCourseMap.entries()]
            .map(([course_id, count]) => ({ course_id, count }))
            .sort((a, b) => b.count - a.count);

        const recent = rows.slice(0, 15);

        // 4) Przychód ze Stripe (nie może wywalić całego dashboardu)
        let revenue = null;
        try {
            revenue = await loadStripeRevenue();
        } catch (e) {
            console.error('admin-stats stripe error:', e);
            revenue = { error: 'Nie udało się pobrać danych ze Stripe.' };
        }

        return json(200, {
            enrollments: {
                total: rows.length,
                last30d: last30,
                last7d: last7,
                byCourse,
                recent,
            },
            revenue,
            generatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('admin-stats error:', err);
        return json(500, { error: 'Wystąpił błąd serwera.' });
    }
};
