// netlify/functions/send-campaign-background.js
// Kampania jednorazowa do bazy leadów - WYSYŁKA. Sufiks „-background" robi z tej
// funkcji Netlify Background Function: odpowiada od razu 202 i pracuje w tle
// do 15 minut (zwykła funkcja ma 10 s, co przy setkach maili to za mało).
//
// Wywołanie (po sprawdzeniu count/test w send-campaign.js):
//   /.netlify/functions/send-campaign-background?key=CRON_SECRET&campaign=<slug>
//     [&skip_unfinished=1]  pomiń leady w trakcie sekwencji powitalnej
//     [&limit=200]          wyślij najwyżej N (np. pierwsza, ostrożna partia)
//
// Idempotentne: każdy wysłany adres ląduje w email_campaign_sends i przy
// kolejnym uruchomieniu jest pomijany. Można więc wołać wiele razy, aż
// count pokaże willSend=0. Wynik: logi Netlify + push do admina.

const { createClient } = require('@supabase/supabase-js');
const { sendCampaignEmail, prepareCampaignEmail } = require('./_shared/mailer');
const { resolveRecipients } = require('./_shared/campaign');
const { sendAdminPush } = require('./_shared/push');

const CRON_SECRET = process.env.CRON_SECRET || '';
// Resend domyślnie przyjmuje 2 żądania/s; 600 ms odstępu trzyma nas poniżej.
const GAP_MS = 600;
// Bezpiecznik na jedno uruchomienie (15 min / 0,6 s ~ 1500, zostawiamy margines).
const HARD_MAX = 1200;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

exports.handler = async (event) => {
    const qp = (event && event.queryStringParameters) || {};
    if (!CRON_SECRET || qp.key !== CRON_SECRET) {
        console.error('send-campaign-background: unauthorized call');
        return { statusCode: 401 };
    }

    const slug = String(qp.campaign || '');
    if (!prepareCampaignEmail(slug)) {
        console.error(`send-campaign-background: unknown campaign "${slug}"`);
        return { statusCode: 400 };
    }
    const skipUnfinished = qp.skip_unfinished === '1';
    const limit = Math.min(HARD_MAX, Math.max(1, Number(qp.limit) || HARD_MAX));

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    let recipients;
    let stats;
    try {
        ({ recipients, stats } = await resolveRecipients(supabase, slug, { skipUnfinished }));
    } catch (e) {
        console.error('send-campaign-background: resolveRecipients failed:', e);
        await sendAdminPush({
            title: '⚠️ Kampania nie ruszyła',
            body: `${slug}: nie udało się ustalić odbiorców (${e && e.message ? e.message : e}). Nic nie wysłano.`,
            url: '/admin/#mailing',
            tag: `campaign-${slug}`,
        });
        return { statusCode: 500 };
    }

    const batch = recipients.slice(0, limit);
    console.log(`send-campaign-background ${slug}: start, recipients=${recipients.length} batch=${batch.length} skipped=${JSON.stringify(stats)}`);

    let sent = 0;
    let failed = 0;
    for (const email of batch) {
        const r = await sendCampaignEmail(email, slug);
        if (!r.ok) {
            failed++;
            console.error(`send-campaign-background ${slug} -> ${email} failed:`, r.error);
            // Limit po stronie Resend: zwolnij, zamiast zbierać kolejne błędy.
            if (r.status === 429) await sleep(5000);
            await sleep(GAP_MS);
            continue;
        }
        const { error: insErr } = await supabase
            .from('email_campaign_sends')
            .insert({ campaign: slug, email, resend_id: r.id || null });
        if (insErr) {
            // Mail poszedł, ale nie zapisaliśmy tego - przy ponownym uruchomieniu
            // ten adres dostałby dubla. Logujemy wyraźnie.
            console.error(`send-campaign-background ${slug}: SENT to ${email} but insert failed:`, insErr.message);
        }
        sent++;
        await sleep(GAP_MS);
    }

    const remaining = recipients.length - batch.length;
    console.log(`send-campaign-background ${slug}: done sent=${sent} failed=${failed} remaining=${remaining}`);
    await sendAdminPush({
        title: failed > 0 ? '⚠️ Kampania zakończona z błędami' : '✅ Kampania wysłana',
        body: `${slug}: wysłano ${sent}, błędów ${failed}, zostało ${remaining + failed}. Pominięto: kursanci ${stats.buyers}, już mieli ${stats.alreadySent}, w sekwencji ${stats.unfinished}.`,
        url: '/admin/#mailing',
        tag: `campaign-${slug}`,
    });
    return { statusCode: 200 };
};
