// netlify/functions/test-sequence.js
// Jednorazowy podgląd sekwencji: wysyła CAŁĄ serię (Dni 1-5) na podany adres,
// od razu, BEZ dotykania bazy. Do testów „jak to wygląda u leada".
//
// To NIE jest funkcja z harmonogramem (scheduled functions Netlify blokuje po
// HTTP → 403), dlatego test siedzi tutaj, osobno od send-sequence.js.
//
// Wywołanie (chronione CRON_SECRET, jeśli ustawiony):
//   /.netlify/functions/test-sequence?key=<CRON_SECRET>&email=<adres>&day=<1..5>
//   - bez `day` wysyła wszystkie 5 maili.

const { sendSequenceEmail, TOTAL_DAYS } = require('./_shared/mailer');

const CRON_SECRET = process.env.CRON_SECRET || '';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(statusCode, body) {
    return { statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
    const qp = (event && event.queryStringParameters) || {};

    if (CRON_SECRET && qp.key !== CRON_SECRET) {
        return json(401, { ok: false, error: 'Unauthorized' });
    }

    const email = String(qp.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
        return json(400, { ok: false, error: 'Podaj poprawny ?email=' });
    }

    const days = qp.day
        ? [Math.max(1, Math.min(TOTAL_DAYS, Number(qp.day) || 1))]
        : Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);

    const results = [];
    for (const d of days) {
        const r = await sendSequenceEmail(email, d);
        results.push({ day: d, ok: r.ok, id: r.id || null, error: r.error || null });
    }

    console.log(`test-sequence -> ${email}:`, JSON.stringify(results));
    return json(200, { ok: results.every((x) => x.ok), email, results });
};
