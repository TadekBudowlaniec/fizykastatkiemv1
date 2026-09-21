// netlify/functions/send-sequence.js
// Cron dzienny (harmonogram w netlify.toml). Dosyła kolejne dni sekwencji
// powitalnej (Dni 2-5) tym, którym „dojrzał" następny mail. Dzień 1 wysyła
// subscribe.js od razu przy zapisie.
//
// Logika: dla każdego aktywnego kontaktu ze zgodą liczymy, ile pełnych dni minęło
// od consent_at. Następny mail = seq_day_sent + 1; wysyłamy go, gdy minęło co
// najmniej (następny_dzień - 1) dni. Jeden mail na kontakt na uruchomienie.
// seq_day_sent zapobiega dublom i pozwala crona bezpiecznie ponawiać.

const { createClient } = require('@supabase/supabase-js');
const { sendSequenceEmail, TOTAL_DAYS } = require('./_shared/mailer');
const { sendAdminPush } = require('./_shared/push');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const DAY_MS = 24 * 60 * 60 * 1000;
const CRON_SECRET = process.env.CRON_SECRET || '';
const MAX_PER_RUN = 400; // bezpiecznik na limity Resend

function json(statusCode, body) {
    return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
    // Wywołanie z harmonogramu Netlify nie ma query/nagłówków użytkownika.
    // Ręczne wywołanie po HTTP wymaga ?key=CRON_SECRET (jeśli sekret ustawiony),
    // żeby ktoś z zewnątrz nie odpalał wysyłki.
    const isHttp = !!(event && event.httpMethod);
    if (isHttp && CRON_SECRET) {
        const key = (event.queryStringParameters && event.queryStringParameters.key) || '';
        if (key !== CRON_SECRET) return json(401, { ok: false, error: 'Unauthorized' });
    }

    const now = Date.now();

    const { data: subs, error } = await supabase
        .from('email_subscribers')
        .select('email, consent_at, seq_day_sent')
        .eq('status', 'active')
        .eq('consent_marketing', true)
        .lt('seq_day_sent', TOTAL_DAYS)
        .not('consent_at', 'is', null)
        .order('consent_at', { ascending: true })
        .limit(MAX_PER_RUN);

    if (error) {
        console.error('send-sequence query error:', error);
        return json(500, { ok: false, error: 'query failed' });
    }

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const s of subs || []) {
        const consentAt = s.consent_at ? new Date(s.consent_at).getTime() : NaN;
        if (!Number.isFinite(consentAt)) { skipped++; continue; }

        const daysSince = Math.floor((now - consentAt) / DAY_MS);
        const nextDay = (s.seq_day_sent || 0) + 1;
        if (nextDay > TOTAL_DAYS) { skipped++; continue; }
        // Dzień N wychodzi, gdy minęło >= N-1 pełnych dni od zapisu.
        if (daysSince < nextDay - 1) { skipped++; continue; }

        const r = await sendSequenceEmail(s.email, nextDay);
        if (!r.ok) {
            failed++;
            console.error(`send-sequence day ${nextDay} -> ${s.email} failed:`, r.error);
            continue; // nie podbijamy seq_day_sent — spróbujemy jutro
        }

        const { error: upErr } = await supabase
            .from('email_subscribers')
            .update({ seq_day_sent: nextDay })
            .eq('email', s.email);
        if (upErr) {
            // Mail poszedł, ale nie zapisaliśmy postępu — logujemy, żeby ręcznie sprawdzić.
            console.error(`send-sequence: sent day ${nextDay} to ${s.email} but failed to update seq_day_sent:`, upErr);
        }
        sent++;
    }

    console.log(`send-sequence done: sent=${sent} failed=${failed} skipped=${skipped} scanned=${(subs || []).length}`);
    // Push tylko gdy coś nie poszło - codzienny sukces nie ma budzić telefonu.
    if (failed > 0) {
        await sendAdminPush({
            title: '⚠️ Sekwencja mailowa: błędy wysyłki',
            body: `Nie wyszło ${failed} z ${sent + failed} maili (Resend). Cron spróbuje jutro; sprawdź logi Netlify i limity Resend.`,
            url: '/admin/#mailing',
            tag: 'sequence-errors',
        });
    }
    return json(200, { ok: true, sent, failed, skipped, scanned: (subs || []).length });
};
