// netlify/functions/_shared/campaign.js
// Wspólna logika kampanii jednorazowych: KTO ma dostać maila + uruchamianie
// zleceń (email_campaign_runs) w funkcji w tle.
//
// Odbiorcy = aktywni leady ze zgodą marketingową (email_subscribers)
//   minus ci, którzy już dostali tę kampanię (email_campaign_sends),
//   minus kursanci z nadanym dostępem (enrollments -> auth.users.email),
//     bo mail sprzedaje kurs, a kupującemu nie wypada go sprzedawać drugi raz,
//   minus (opcjonalnie, skipUnfinished) leady w trakcie sekwencji powitalnej
//     (seq_day_sent < TOTAL_DAYS), żeby nie dostali dwóch maili jednego dnia.
//
// Używane przez send-campaign.js (podgląd/test), send-campaign-background.js,
// admin-campaigns.js (panel) i check-campaign-schedule.js (cron).

const { TOTAL_DAYS } = require('./mailer');

const PAGE = 1000;
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://fizykastatkiem.pl').replace(/\/$/, '');
const CRON_SECRET = process.env.CRON_SECRET || '';

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

// ── Zlecenia (email_campaign_runs) ──────────────────────────────────────────

// Przejmuje zlecenie (scheduled -> queued) i budzi funkcję w tle. Zwraca true,
// gdy to MY je przejęliśmy (chroni przed podwójnym startem, gdy cron i panel
// trafią w tę samą sekundę: update z warunkiem status='scheduled' wygra raz).
async function claimAndTriggerRun(supabase, runId) {
    const { data, error } = await supabase
        .from('email_campaign_runs')
        .update({ status: 'queued' })
        .eq('id', runId)
        .eq('status', 'scheduled')
        .select('id')
        .maybeSingle();
    if (error) throw new Error(`supabase: ${error.message}`);
    if (!data) return false;

    if (!CRON_SECRET) {
        await supabase
            .from('email_campaign_runs')
            .update({ status: 'failed', error: 'CRON_SECRET nie jest ustawiony w Netlify.', finished_at: new Date().toISOString() })
            .eq('id', runId);
        throw new Error('CRON_SECRET nie jest ustawiony w Netlify.');
    }

    const url = `${FRONTEND_URL}/.netlify/functions/send-campaign-background?key=${encodeURIComponent(CRON_SECRET)}&run=${encodeURIComponent(runId)}`;
    let res;
    try {
        res = await fetch(url, { method: 'POST' });
    } catch (e) {
        await supabase
            .from('email_campaign_runs')
            .update({ status: 'failed', error: `Nie udało się uruchomić wysyłki: ${e && e.message ? e.message : e}`, finished_at: new Date().toISOString() })
            .eq('id', runId);
        throw e;
    }
    // Background Function odpowiada 202 od razu; każdy inny kod to problem.
    if (res.status !== 202 && res.status !== 200) {
        await supabase
            .from('email_campaign_runs')
            .update({ status: 'failed', error: `Funkcja w tle odpowiedziała HTTP ${res.status}`, finished_at: new Date().toISOString() })
            .eq('id', runId);
        throw new Error(`send-campaign-background HTTP ${res.status}`);
    }
    return true;
}

module.exports = { resolveRecipients, claimAndTriggerRun };
