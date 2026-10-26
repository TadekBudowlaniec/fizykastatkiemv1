// netlify/functions/send-campaign.js
// Kampania jednorazowa do bazy leadów - część SYNCHRONICZNA: podgląd, liczenie
// odbiorców i mail testowy. Właściwą wysyłkę do wszystkich robi
// send-campaign-background.js (funkcja w tle, limit 15 min zamiast 10 s).
//
// Wywołania (zawsze z ?key=CRON_SECRET; bez ustawionego sekretu funkcja odmawia):
//   ?key=…&campaign=<slug>&mode=preview            -> HTML maila w przeglądarce
//   ?key=…&campaign=<slug>&mode=count[&skip_unfinished=1][&accounts=0]
//                                                   -> ile osób dostanie, ile pominiemy i dlaczego
//                                                      (accounts=0 = bez kont bez kursu, tylko leady)
//   ?key=…&campaign=<slug>&mode=test&email=<adres>  -> wysyła 1 mail na podany adres, bez zapisu w bazie
//
// Kolejność pracy: preview -> test na siebie -> count -> start wysyłki w tle.

const { createClient } = require('@supabase/supabase-js');
const { CAMPAIGNS, prepareCampaignEmail, renderEmail, sendCampaignEmail } = require('./_shared/mailer');
const { resolveRecipients } = require('./_shared/campaign');

const CRON_SECRET = process.env.CRON_SECRET || '';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(statusCode, body) {
    return { statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
    const qp = (event && event.queryStringParameters) || {};

    // Kampania idzie do całej bazy, więc bez sekretu nie odpalamy jej NIGDY.
    if (!CRON_SECRET) return json(403, { ok: false, error: 'CRON_SECRET nie jest ustawiony w Netlify.' });
    if (qp.key !== CRON_SECRET) return json(401, { ok: false, error: 'Unauthorized' });

    const slug = String(qp.campaign || '');
    const email = prepareCampaignEmail(slug);
    if (!email) {
        return json(400, { ok: false, error: 'Nieznana kampania. Podaj ?campaign=<slug>.', available: CAMPAIGNS.map((c) => c.slug) });
    }

    const mode = String(qp.mode || 'preview');

    if (mode === 'preview') {
        const { html } = renderEmail(email, 'podglad@example.com');
        return { statusCode: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }, body: html };
    }

    if (mode === 'test') {
        const to = String(qp.email || '').trim().toLowerCase();
        if (!EMAIL_RE.test(to)) return json(400, { ok: false, error: 'Podaj poprawny ?email=' });
        const r = await sendCampaignEmail(to, slug);
        return json(r.ok ? 200 : 502, { ok: r.ok, campaign: slug, to, subject: email.subject, id: r.id || null, error: r.error || null });
    }

    if (mode === 'count') {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
        try {
            const skipUnfinished = qp.skip_unfinished === '1';
            const includeAccounts = qp.accounts !== '0';
            const { recipients, stats } = await resolveRecipients(supabase, slug, { skipUnfinished, includeAccounts });
            return json(200, {
                ok: true,
                campaign: slug,
                subject: email.subject,
                willSend: recipients.length,
                skipped: stats,
                sample: recipients.slice(0, 5),
                next: `/.netlify/functions/send-campaign-background?key=<CRON_SECRET>&campaign=${slug}${skipUnfinished ? '&skip_unfinished=1' : ''}${includeAccounts ? '' : '&accounts=0'}`,
            });
        } catch (e) {
            return json(500, { ok: false, error: String(e && e.message ? e.message : e) });
        }
    }

    return json(400, { ok: false, error: 'Nieznany mode. Użyj preview | count | test.' });
};
