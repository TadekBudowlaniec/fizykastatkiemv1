// netlify/functions/_shared/campaign.js
// Wspólna logika kampanii jednorazowych: KTO ma dostać maila + uruchamianie
// zleceń (email_campaign_runs) w funkcji w tle.
//
// Kampania sprzedaje kurs, więc idzie WYŁĄCZNIE do osób bez dostępu do
// jakiegokolwiek kursu. Dwa źródła odbiorców:
//   1) leady: email_subscribers ze statusem active i zgodą marketingową,
//   2) konta: auth.users bez wiersza w enrollments (access_granted), czyli
//      zarejestrowani, którzy nic nie kupili (opcja includeAccounts, domyślnie tak).
//      O adresie, który jest też w email_subscribers, decyduje ta tabela
//      (brak zgody / wypis = nie wysyłamy). Konta bez potwierdzonego e-maila
//      i konta adminów pomijamy.
// Minus zawsze:
//   - kursanci z nadanym dostępem (enrollments -> auth.users.email),
//   - ci, którzy już dostali tę kampanię (email_campaign_sends),
//   - (opcjonalnie, skipUnfinished) leady w trakcie sekwencji powitalnej
//     (seq_day_sent < TOTAL_DAYS), żeby nie dostali dwóch maili jednego dnia.
//
// resolveRecipients zwraca listę { email, source: 'lead' | 'account' } - source
// steruje stopką maila („bo zapisałeś się po planer" / „bo masz konto").
//
// Używane przez send-campaign.js (podgląd/test), send-campaign-background.js,
// admin-campaigns.js (panel) i check-campaign-schedule.js (cron).

const { TOTAL_DAYS } = require('./mailer');

const PAGE = 1000;
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://fizykastatkiem.pl').replace(/\/$/, '');
const CRON_SECRET = process.env.CRON_SECRET || '';

const norm = (e) => String(e || '').trim().toLowerCase();

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

// Wszystkie konta: e-mail + czy ma dostęp do kursu + czy admin + czy e-mail
// potwierdzony. Rzuca błędem, gdy czegoś nie da się odczytać - lepiej nie
// wysłać nic niż wysłać ofertę klientom.
async function fetchAccounts(supabase) {
    const enr = await fetchAll(() =>
        supabase.from('enrollments').select('user_id').eq('access_granted', true)
    );
    const withAccess = new Set(enr.map((e) => e.user_id));
    const profiles = await fetchAll(() => supabase.from('users').select('id, is_admin'));
    const admins = new Set(profiles.filter((p) => p.is_admin).map((p) => p.id));

    const accounts = [];
    for (let page = 1; page <= 1000; page++) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE });
        if (error) throw new Error(`auth.listUsers: ${error.message}`);
        const users = (data && data.users) || [];
        for (const u of users) {
            const email = norm(u.email);
            if (!email) continue;
            accounts.push({
                email,
                hasAccess: withAccess.has(u.id),
                isAdmin: admins.has(u.id),
                confirmed: !!u.email_confirmed_at,
            });
        }
        if (users.length < PAGE) break;
    }
    return accounts;
}

async function resolveRecipients(supabase, slug, opts = {}) {
    const skipUnfinished = !!opts.skipUnfinished;
    const includeAccounts = opts.includeAccounts !== false;

    // Cała tabela leadów (także bez zgody / wypisani): dla kont bez kursu to ona
    // mówi, czy wolno pisać.
    const subs = await fetchAll(() =>
        supabase
            .from('email_subscribers')
            .select('email, status, consent_marketing, seq_day_sent, consent_at')
            .order('created_at', { ascending: true })
    );
    const subByEmail = new Map(subs.map((s) => [norm(s.email), s]));

    const sentRows = await fetchAll(() =>
        supabase.from('email_campaign_sends').select('email').eq('campaign', slug)
    );
    const alreadySent = new Set(sentRows.map((r) => norm(r.email)));

    const accounts = await fetchAccounts(supabase);
    const buyers = new Set(accounts.filter((a) => a.hasAccess).map((a) => a.email));

    const recipients = [];
    const seen = new Set();
    // leads/accounts = wielkość puli z każdego źródła, total = ich suma;
    // reszta to powody pominięcia.
    const stats = { total: 0, leads: 0, accounts: 0, alreadySent: 0, buyers: 0, unfinished: 0 };

    // 1) Leady ze zgodą.
    for (const s of subs) {
        if (s.status !== 'active' || !s.consent_marketing) continue;
        const email = norm(s.email);
        if (!email || seen.has(email)) continue;
        stats.leads++;
        if (alreadySent.has(email)) { stats.alreadySent++; continue; }
        if (buyers.has(email)) { stats.buyers++; continue; }
        if (skipUnfinished && (s.seq_day_sent || 0) < TOTAL_DAYS) { stats.unfinished++; continue; }
        seen.add(email);
        recipients.push({ email, source: 'lead' });
    }

    // 2) Konta bez dostępu do żadnego kursu (nieobecne w bazie leadów).
    if (includeAccounts) {
        for (const a of accounts) {
            if (a.hasAccess || a.isAdmin || !a.confirmed) continue;
            if (subByEmail.has(a.email) || seen.has(a.email)) continue;
            stats.accounts++;
            if (alreadySent.has(a.email)) { stats.alreadySent++; continue; }
            seen.add(a.email);
            recipients.push({ email: a.email, source: 'account' });
        }
    }

    stats.total = stats.leads + stats.accounts;
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
