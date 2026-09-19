// netlify/functions/unsubscribe.js
// Obsługa wypisu z sekwencji. Link w każdym mailu + nagłówek List-Unsubscribe.
// GET  ?t=<token>  -> strona z potwierdzeniem (klik z maila)
// POST ?t=<token>  -> Gmail „one-click" (List-Unsubscribe-Post) — bez strony
// Token jest podpisany HMAC (patrz _shared/mailer.js), więc nie trzeba logowania.

const { createClient } = require('@supabase/supabase-js');
const { verifyUnsubToken } = require('./_shared/mailer');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

function page(title, msg) {
    return `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:64px auto;padding:0 20px;color:#1a1a1a;line-height:1.6">
<h1 style="font-size:20px">${title}</h1>
<p>${msg}</p>
<p><a href="https://fizykastatkiem.pl" style="color:#1a56db">Wróć na fizykastatkiem.pl</a></p>
</body></html>`;
}

function html(statusCode, body) {
    return { statusCode, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }, body };
}

exports.handler = async (event) => {
    const token = (event.queryStringParameters && event.queryStringParameters.t) || '';
    const email = verifyUnsubToken(token);
    const oneClick = event.httpMethod === 'POST'; // Gmail one-click

    if (!email) {
        return oneClick
            ? { statusCode: 400, body: 'invalid token' }
            : html(400, page('Nieprawidłowy link', 'Ten link wypisu jest nieprawidłowy lub niekompletny. Napisz na hej@fizykastatkiem.pl, a wypiszemy Cię ręcznie.'));
    }

    try {
        await supabase
            .from('email_subscribers')
            .update({ status: 'unsubscribed' })
            .eq('email', email);
    } catch (e) {
        console.error('unsubscribe error:', e);
        // Nie pokazujemy błędu użytkownikowi — dla niego liczy się, że kliknął.
    }

    return oneClick
        ? { statusCode: 200, body: 'ok' }
        : html(200, page('Wypisano', 'Gotowe — nie dostaniesz już od nas maili z tej serii. Szkoda, że tak wyszło. Dostęp do planera i konta zostaje bez zmian.'));
};
