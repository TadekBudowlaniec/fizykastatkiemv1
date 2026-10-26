// netlify/functions/send-campaign-background.js
// Kampania jednorazowa do bazy leadów - WYSYŁKA. Sufiks „-background" robi z tej
// funkcji Netlify Background Function: odpowiada od razu 202 i pracuje w tle
// do 15 minut (zwykła funkcja ma 10 s, co przy setkach maili to za mało).
//
// Dwa tryby wywołania (oba z ?key=CRON_SECRET):
//   A) zlecenie z panelu / crona:  ?run=<uuid z email_campaign_runs>
//      kampania i opcje czytane z wiersza; status i wynik zapisywane do niego.
//   B) ręcznie z przeglądarki:      ?campaign=<slug>[&skip_unfinished=1][&accounts=0][&limit=N]
//      (awaryjnie, bez wpisu w historii panelu; accounts=0 = tylko leady z bazy
//      mailingowej, bez kont bez kursu)
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

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    // ── Tryb A: zlecenie z tabeli ──
    const runId = qp.run ? String(qp.run) : null;
    let run = null;
    if (runId) {
        const { data, error } = await supabase
            .from('email_campaign_runs')
            .select('id, campaign, skip_unfinished, include_accounts, status')
            .eq('id', runId)
            .maybeSingle();
        if (error || !data) {
            console.error(`send-campaign-background: run ${runId} not found`, error && error.message);
            return { statusCode: 404 };
        }
        if (data.status !== 'queued' && data.status !== 'scheduled') {
            // done/running/cancelled - nie startujemy drugi raz.
            console.log(`send-campaign-background: run ${runId} has status ${data.status}, skipping`);
            return { statusCode: 200 };
        }
        run = data;
        await supabase
            .from('email_campaign_runs')
            .update({ status: 'running', started_at: new Date().toISOString() })
            .eq('id', runId);
    }

    const slug = run ? run.campaign : String(qp.campaign || '');
    const skipUnfinished = run ? !!run.skip_unfinished : qp.skip_unfinished === '1';
    const includeAccounts = run ? run.include_accounts !== false : qp.accounts !== '0';
    const limit = run ? HARD_MAX : Math.min(HARD_MAX, Math.max(1, Number(qp.limit) || HARD_MAX));

    const finishRun = async (patch) => {
        if (!run) return;
        const { error } = await supabase
            .from('email_campaign_runs')
            .update({ finished_at: new Date().toISOString(), ...patch })
            .eq('id', run.id);
        if (error) console.error('send-campaign-background: run update failed:', error.message);
    };

    if (!prepareCampaignEmail(slug)) {
        console.error(`send-campaign-background: unknown campaign "${slug}"`);
        await finishRun({ status: 'failed', error: `Nieznana kampania „${slug}".` });
        return { statusCode: 400 };
    }

    let recipients;
    let stats;
    try {
        ({ recipients, stats } = await resolveRecipients(supabase, slug, { skipUnfinished, includeAccounts }));
    } catch (e) {
        const msg = e && e.message ? e.message : String(e);
        console.error('send-campaign-background: resolveRecipients failed:', e);
        await finishRun({ status: 'failed', error: `Nie udało się ustalić odbiorców: ${msg}` });
        await sendAdminPush({
            title: '⚠️ Kampania nie ruszyła',
            body: `${slug}: nie udało się ustalić odbiorców (${msg}). Nic nie wysłano.`,
            url: '/admin/#kampanie',
            tag: `campaign-${slug}`,
        });
        return { statusCode: 500 };
    }

    const batch = recipients.slice(0, limit);
    console.log(`send-campaign-background ${slug}: start, recipients=${recipients.length} batch=${batch.length} skipped=${JSON.stringify(stats)}`);

    let sent = 0;
    let failed = 0;
    let lastError = null;
    for (const { email, source } of batch) {
        const r = await sendCampaignEmail(email, slug, source);
        if (!r.ok) {
            failed++;
            lastError = r.error || null;
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
    console.log(`send-campaign-background ${slug}: done sent=${sent} failed=${failed} remaining=${remaining + failed}`);
    await finishRun({
        status: sent === 0 && failed > 0 ? 'failed' : 'done',
        sent,
        failed,
        remaining: remaining + failed,
        skipped: stats,
        error: failed > 0 ? `${failed} maili nie wyszło. Ostatni błąd: ${lastError || 'nieznany'}` : null,
    });
    await sendAdminPush({
        title: failed > 0 ? '⚠️ Kampania zakończona z błędami' : '✅ Kampania wysłana',
        body: `${slug}: wysłano ${sent}, błędów ${failed}, zostało ${remaining + failed}. Pula: leady ${stats.leads}, konta bez kursu ${stats.accounts}. Pominięto: kursanci ${stats.buyers}, już mieli ${stats.alreadySent}, w sekwencji ${stats.unfinished}.`,
        url: '/admin/#kampanie',
        tag: `campaign-${slug}`,
    });
    return { statusCode: 200 };
};
