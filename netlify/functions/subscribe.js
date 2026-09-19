// netlify/functions/subscribe.js
// Zapis leada (planer / exit-intent) do email_subscribers + start sekwencji.
//
// WAŻNE: ta funkcja jest NIEZALEŻNA od logowania OTP w SqueezeForm. Nawet jeśli
// tu coś padnie, użytkownik i tak dostaje magic link do planera. Dlatego zawsze
// odpowiadamy 200 z flagą `ok` — front nie blokuje UX na błędzie zapisu leada.
//
// Zgoda marketingowa (RODO): sekwencja mailowa rusza TYLKO gdy consent === true.
// Bez zgody zapisujemy sam fakt zapisu na planer (dostarczenie usługi), ale nie
// wysyłamy maili marketingowych.
//
// Mailing: Resend (zastąpił Brevo). Dzień 1 wysyłamy OD RAZU (transakcyjnie,
// dostarczenie planera). Dni 2-5 dosyła send-sequence.js (cron dzienny).

const { createClient } = require('@supabase/supabase-js');
const { sendSequenceEmail } = require('./_shared/mailer');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SOURCES = new Set(['planer_squeeze', 'exit_intent']);

function json(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify(body),
    };
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return json(405, { ok: false, error: 'Method Not Allowed' });
    }

    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch {
        return json(200, { ok: false, error: 'Nieprawidłowe dane.' });
    }

    const email = String(payload.email || '').trim().toLowerCase();
    const consent = payload.consent === true;
    const source = ALLOWED_SOURCES.has(payload.source) ? payload.source : 'planer_squeeze';

    if (!EMAIL_RE.test(email)) {
        return json(200, { ok: false, error: 'Nieprawidłowy adres e-mail.' });
    }

    try {
        // 1) Dzień 1 od razu (tylko przy zgodzie marketingowej).
        let day1Sent = false;
        if (consent) {
            const r = await sendSequenceEmail(email, 1);
            day1Sent = r.ok;
            if (!r.ok) console.error('Resend day1 failed:', r.error);
        }

        // 2) Zapis/aktualizacja leada (service_role omija RLS).
        //    seq_day_sent = 1 gdy Dzień 1 poszedł; inaczej 0 (cron dośle/ponowi).
        const row = {
            email,
            source,
            consent_marketing: consent,
            consent_at: consent ? new Date().toISOString() : null,
            status: 'active',
            seq_day_sent: day1Sent ? 1 : 0,
        };

        const { error } = await supabase
            .from('email_subscribers')
            .upsert(row, { onConflict: 'email', ignoreDuplicates: false });

        if (error) {
            console.error('subscribe upsert error:', error);
            await supabase.from('email_subscribers').insert(row);
        }

        return json(200, { ok: true, day1Sent });
    } catch (err) {
        console.error('subscribe error:', err);
        // Nie blokujemy UX — front i tak wysłał magic link.
        return json(200, { ok: false, error: 'Zapis nie powiódł się.' });
    }
};
