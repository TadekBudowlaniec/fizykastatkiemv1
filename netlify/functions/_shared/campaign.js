// netlify/functions/_shared/campaign.js
// Wspólna logika kampanii jednorazowych: KTO ma dostać maila.
//
// Odbiorcy = aktywni leady ze zgodą marketingową (email_subscribers)
//   minus ci, którzy już dostali tę kampanię (email_campaign_sends),
//   minus kursanci z nadanym dostępem (enrollments -> auth.users.email),
//     bo mail sprzedaje kurs, a kupującemu nie wypada go sprzedawać drugi raz,
//   minus (opcjonalnie, skipUnfinished) leady w trakcie sekwencji powitalnej
//     (seq_day_sent < TOTAL_DAYS), żeby nie dostali dwóch maili jednego dnia.
//
// Używane przez send-campaign.js (podgląd/test) i send-campaign-background.js.

const { TOTAL_DAYS } = require('./mailer');

const PAGE = 1000;

async function fetchAll(query) {
    // Supabase zwraca max 1000 wierszy na zapytanie - stronicujemy range'em.
    const rows = [];
    for (let from = 0; ; from += PAGE) {
        const { data, error } = await query().range(from, from + PAGE - 1);
        if (error) throw new Error(`supabase: ${error.message}`);
        rows.push(...(data || []));
        if (!data || data.length < PAGE) break;
    }
    return rows;
}

// E-maile kursantów z dostępem. Rzuca błędem, gdy nie da się ich ustalić -
// lepiej nie wysłać nic niż wysłać ofertę klientom.
async function fetchBuyerEmails(supabase) {
    const enr = await fetchAll(() =>
        supabase.from('enrollments').select('user_id').eq('access_granted', true)
    );
    const buyerIds = new Set(enr.map((e) => e.user_id));
    if (buyerIds.size === 0) return new Set();

    const emails = new Set();
    for (let page = 1; page <= 1000; page++) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE });
        if (error) throw new Error(`auth.listUsers: ${error.message}`);
        const users = (data && data.users) || [];
        for (const u of users) {
            if (u.email && buyerIds.has(u.id)) emails.add(String(u.email).trim().toLowerCase());
        }
        if (users.length < PAGE) break;
    }
    return emails;
}

async function resolveRecipients(supabase, slug, opts = {}) {
    const skipUnfinished = !!opts.skipUnfinished;

    const subs = await fetchAll(() =>
        supabase
            .from('email_subscribers')
            .select('email, seq_day_sent, consent_at')
            .eq('status', 'active')
            .eq('consent_marketing', true)
            .order('consent_at', { ascending: true })
    );

    const sentRows = await fetchAll(() =>
        supabase.from('email_campaign_sends').select('email').eq('campaign', slug)
    );
    const alreadySent = new Set(sentRows.map((r) => r.email));
    const buyers = await fetchBuyerEmails(supabase);

    const recipients = [];
    const stats = { total: subs.length, alreadySent: 0, buyers: 0, unfinished: 0 };
    for (const s of subs) {
        const email = String(s.email || '').trim().toLowerCase();
        if (!email) continue;
        if (alreadySent.has(email)) { stats.alreadySent++; continue; }
        if (buyers.has(email)) { stats.buyers++; continue; }
        if (skipUnfinished && (s.seq_day_sent || 0) < TOTAL_DAYS) { stats.unfinished++; continue; }
        recipients.push(email);
    }
    return { recipients, stats };
}

module.exports = { resolveRecipients };
