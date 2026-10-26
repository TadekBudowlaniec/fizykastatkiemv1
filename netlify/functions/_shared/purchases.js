// netlify/functions/_shared/purchases.js
// Zakupy dla panelu admina. Webhook Stripe zapisuje Kurs Pełny jako 16 wierszy
// enrollments (po jednym na dział, w odstępie milisekund), więc „ostatnie
// dostępy" pokazywałyby 16 pozycji zamiast jednego zakupu. Tu sklejamy wiersze
// jednego użytkownika nadane w krótkim oknie w JEDEN zakup i dopinamy kwotę
// z sesji Stripe Checkout (enrollments nie ma cen).

const FULL_COURSE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
// Wiersze tego samego usera w tym oknie = jeden zakup (webhook robi 16 upsertów
// w ok. 2-3 s; ręczne nadanie w Supabase też mieści się w minucie).
const GROUP_WINDOW_MS = 2 * 60 * 1000;
// Dopasowanie sesji Stripe do zakupu: sesja powstała przed nadaniem dostępu
// (Klarna potrafi potwierdzić płatność po godzinach) i nie później niż 10 min po.
const MATCH_BEFORE_MS = 48 * 60 * 60 * 1000;
const MATCH_AFTER_MS = 10 * 60 * 1000;

const ts = (iso) => (iso ? new Date(iso).getTime() : 0);

// rows: enrollments (user_id, course_id, enrolled_at), dowolna kolejność.
// Zwraca zakupy od najnowszego: { user_id, courses, kind, enrolled_at }.
function groupPurchases(rows) {
    const byUser = new Map();
    for (const r of rows) {
        if (!byUser.has(r.user_id)) byUser.set(r.user_id, []);
        byUser.get(r.user_id).push(r);
    }
    const purchases = [];
    for (const [user_id, list] of byUser) {
        list.sort((a, b) => ts(a.enrolled_at) - ts(b.enrolled_at));
        let cur = null;
        for (const r of list) {
            const t = ts(r.enrolled_at);
            if (cur && t - cur.lastTs <= GROUP_WINDOW_MS) {
                cur.courses.push(r.course_id);
                cur.lastTs = t;
                cur.enrolled_at = r.enrolled_at;
            } else {
                cur = { user_id, courses: [r.course_id], firstTs: t, lastTs: t, enrolled_at: r.enrolled_at };
                purchases.push(cur);
            }
        }
    }
    return purchases
        .map((p) => {
            const courses = [...new Set(p.courses)].sort((a, b) => a - b);
            const full = FULL_COURSE_IDS.every((id) => courses.includes(id));
            return {
                user_id: p.user_id,
                courses,
                kind: full ? 'full' : courses.length === 1 ? 'single' : 'multi',
                enrolled_at: p.enrolled_at,
                _firstTs: p.firstTs,
            };
        })
        .sort((a, b) => ts(b.enrolled_at) - ts(a.enrolled_at));
}

// sessions: Stripe Checkout Sessions (opłacone). emailOf: user_id -> email.
// Każda sesja może być użyta raz. Dopasowanie po metadata.userId albo e-mailu
// klienta, w oknie czasowym; przy kilku kandydatach wygrywa najbliższa w czasie.
function attachAmounts(purchases, sessions, emailOf) {
    const paid = (sessions || []).filter(
        (s) => s && (s.payment_status === 'paid' || s.payment_status === 'no_payment_required')
    );
    const used = new Set();
    return purchases.map((p) => {
        const email = String(emailOf(p.user_id) || '').toLowerCase();
        const granted = p._firstTs || ts(p.enrolled_at);
        let best = null;
        let bestDist = Infinity;
        for (const s of paid) {
            if (used.has(s.id)) continue;
            const created = (s.created || 0) * 1000;
            if (created < granted - MATCH_BEFORE_MS || created > granted + MATCH_AFTER_MS) continue;
            const metaUser = s.metadata && s.metadata.userId;
            const sEmail = String(
                (s.customer_details && s.customer_details.email) || s.customer_email || ''
            ).toLowerCase();
            const same = (metaUser && metaUser === p.user_id) || (email && sEmail && sEmail === email);
            if (!same) continue;
            const dist = Math.abs(granted - created);
            if (dist < bestDist) { best = s; bestDist = dist; }
        }
        if (best) used.add(best.id);
        const { _firstTs, ...rest } = p;
        return {
            ...rest,
            email: emailOf(p.user_id) || null,
            amount: best ? (best.amount_total || 0) / 100 : null,
            currency: best ? String(best.currency || 'pln').toUpperCase() : null,
            session_id: best ? best.id : null,
        };
    });
}

module.exports = { groupPurchases, attachAmounts, FULL_COURSE_IDS, GROUP_WINDOW_MS };
