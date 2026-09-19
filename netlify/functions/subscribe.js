// netlify/functions/subscribe.js
// Zapis leada (planer / exit-intent) do email_subscribers + synchronizacja z Brevo.
//
// WAŻNE: ta funkcja jest NIEZALEŻNA od logowania OTP w SqueezeForm. Nawet jeśli
// tu coś padnie, użytkownik i tak dostaje magic link do planera. Dlatego zawsze
// odpowiadamy 200 z flagą `ok` — front nie blokuje UX na błędzie zapisu leada.
//
// Zgoda marketingowa (RODO): kontakt trafia do listy/sekwencji Brevo TYLKO gdy
// consent === true. Bez zgody zapisujemy sam fakt zapisu na planer (dostarczenie
// usługi), ale nie robimy marketingu.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = process.env.BREVO_LIST_ID; // numeryczne ID listy w Brevo

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SOURCES = new Set(['planer_squeeze', 'exit_intent']);

function json(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify(body),
    };
}

// Dodaje/aktualizuje kontakt w Brevo i przypisuje do listy (trigger sekwencji).
// Zwraca true przy sukcesie. Nie rzuca — błąd tylko logujemy.
async function syncToBrevo(email, source) {
    if (!BREVO_API_KEY || !BREVO_LIST_ID) return false;
    try {
        const res = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
                'api-key': BREVO_API_KEY,
            },
            body: JSON.stringify({
                email,
                updateEnabled: true, // istniejący kontakt => update zamiast błędu
                listIds: [Number(BREVO_LIST_ID)],
                attributes: { SOURCE: source },
            }),
        });
        // 201 (nowy) / 204 (zaktualizowany) => OK
        if (res.ok) return true;
        const txt = await res.text().catch(() => '');
        console.error('Brevo sync failed:', res.status, txt);
        return false;
    } catch (e) {
        console.error('Brevo sync error:', e);
        return false;
    }
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
        // 1) Zapis/aktualizacja leada (service_role omija RLS)
        const brevoSynced = consent ? await syncToBrevo(email, source) : false;

        const row = {
            email,
            source,
            consent_marketing: consent,
            consent_at: consent ? new Date().toISOString() : null,
            status: 'active',
            brevo_synced: brevoSynced,
        };

        const { error } = await supabase
            .from('email_subscribers')
            .upsert(row, { onConflict: 'email', ignoreDuplicates: false });

        if (error) {
            // onConflict po kolumnie może wymagać indeksu — mamy unikat po lower(email).
            // Gdyby upsert się nie powiódł, spróbuj zwykłego insert (nowy lead).
            console.error('subscribe upsert error:', error);
            await supabase.from('email_subscribers').insert(row);
        }

        return json(200, { ok: true, brevoSynced });
    } catch (err) {
        console.error('subscribe error:', err);
        // Nie blokujemy UX — front i tak wysłał magic link.
        return json(200, { ok: false, error: 'Zapis nie powiódł się.' });
    }
};
