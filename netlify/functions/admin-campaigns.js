// netlify/functions/admin-campaigns.js
// Kampanie mailowe w panelu admina. Dostęp WYŁĄCZNIE dla users.is_admin = true
// (wspólna bramka _shared/admin-auth). POST z JSON { action, ... }:
//
//   overview                       lista kampanii z kodu + historia zleceń
//   preview  { slug }              HTML maila (do podglądu w panelu)
//   count    { slug, skipUnfinished }  ilu dostanie / ilu pominiemy i dlaczego
//   test     { slug }              wysyła 1 mail testowy na adres zalogowanego admina
//   schedule { slug, scheduledAt, skipUnfinished }  zlecenie na datę (ISO)
//   sendNow  { slug, skipUnfinished }  zlecenie „teraz" + natychmiastowy start
//   cancel   { runId }             odwołuje zlecenie ze statusem scheduled
//
// Treść kampanii żyje w kodzie (CAMPAIGNS w _shared/mailer.js), panel tylko
// uruchamia. Samo wysyłanie robi send-campaign-background.js.

const { createClient } = require('@supabase/supabase-js');
const { requireAdmin, json } = require('./_shared/admin-auth');
const { CAMPAIGNS, prepareCampaignEmail, renderEmail, sendCampaignEmail, daysToMatura } = require('./_shared/mailer');
const { resolveRecipients, claimAndTriggerRun } = require('./_shared/campaign');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OPEN_STATUSES = ['scheduled', 'queued', 'running'];

async function listRuns() {
    const { data, error } = await supabase
        .from('email_campaign_runs')
        .select('*')
        .order('scheduled_at', { ascending: false })
        .limit(50);
    if (error) throw new Error(error.message);
    return data || [];
}

async function createRun({ slug, scheduledAt, skipUnfinished, createdBy }) {
    // Jedno otwarte zlecenie na kampanię - dwa naraz tylko by się myliły
    // (wysyłka i tak jest idempotentna, więc to ochrona przed bałaganem, nie dublami).
    const { data: open, error: openErr } = await supabase
        .from('email_campaign_runs')
        .select('id, status, scheduled_at')
        .eq('campaign', slug)
        .in('status', OPEN_STATUSES)
        .limit(1);
    if (openErr) throw new Error(openErr.message);
    if (open && open.length) {
        const o = open[0];
        const err = new Error(
            o.status === 'scheduled'
                ? 'Ta kampania ma już zaplanowaną wysyłkę. Odwołaj ją, żeby ustawić nową.'
                : 'Ta kampania właśnie się wysyła. Poczekaj, aż się skończy.'
        );
        err.statusCode = 409;
        throw err;
    }
    const { data, error } = await supabase
        .from('email_campaign_runs')
        .insert({
            campaign: slug,
            scheduled_at: scheduledAt,
            skip_unfinished: !!skipUnfinished,
            created_by: createdBy || null,
        })
        .select('*')
        .single();
    if (error) throw new Error(error.message);
    return data;
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

    try {
        const gate = await requireAdmin(event);
        if (gate.response) return gate.response;
        const admin = gate.user;

        let body = {};
        try {
            body = JSON.parse(event.body || '{}');
        } catch {
            return json(400, { error: 'Nieprawidłowe body.' });
        }
        const action = String(body.action || 'overview');

        if (action === 'overview') {
            const runs = await listRuns();
            return json(200, {
                campaigns: CAMPAIGNS.map((c) => {
                    const e = prepareCampaignEmail(c.slug);
                    return { slug: c.slug, subject: e.subject, preheader: e.preheader, ctaLabel: e.cta.label, ctaUrl: e.cta.url };
                }),
                runs,
                daysToMatura: daysToMatura(),
                cronSecretSet: !!process.env.CRON_SECRET,
                adminEmail: admin.email || null,
                now: new Date().toISOString(),
            });
        }

        if (action === 'cancel') {
            const runId = String(body.runId || '');
            if (!UUID_RE.test(runId)) return json(400, { error: 'Nieprawidłowe zlecenie.' });
            const { data, error } = await supabase
                .from('email_campaign_runs')
                .update({ status: 'cancelled', finished_at: new Date().toISOString() })
                .eq('id', runId)
                .eq('status', 'scheduled')
                .select('id')
                .maybeSingle();
            if (error) return json(500, { error: error.message });
            if (!data) return json(409, { error: 'Tego zlecenia nie da się już odwołać (wystartowało albo jest zakończone).' });
            return json(200, { ok: true, runs: await listRuns() });
        }

        // Pozostałe akcje dotyczą konkretnej kampanii.
        const slug = String(body.slug || '');
        const email = prepareCampaignEmail(slug);
        if (!email) return json(400, { error: 'Nieznana kampania.' });
        const skipUnfinished = body.skipUnfinished === true;

        if (action === 'preview') {
            const { html, subject } = renderEmail(email, admin.email || 'podglad@example.com');
            return json(200, { subject, preheader: email.preheader, html });
        }

        if (action === 'count') {
            const { recipients, stats } = await resolveRecipients(supabase, slug, { skipUnfinished });
            return json(200, { willSend: recipients.length, skipped: stats, sample: recipients.slice(0, 5) });
        }

        if (action === 'test') {
            if (!admin.email) return json(400, { error: 'Konto admina nie ma adresu e-mail.' });
            const r = await sendCampaignEmail(admin.email, slug);
            if (!r.ok) return json(502, { error: `Resend: ${r.error || 'błąd wysyłki'}` });
            return json(200, { ok: true, to: admin.email, subject: email.subject });
        }

        if (action === 'schedule') {
            const when = new Date(String(body.scheduledAt || ''));
            if (!Number.isFinite(when.getTime())) return json(400, { error: 'Podaj poprawną datę i godzinę.' });
            if (when.getTime() < Date.now() - 60 * 1000) return json(400, { error: 'Ta data już minęła. Użyj „Wyślij teraz" albo wybierz późniejszy termin.' });
            const run = await createRun({ slug, scheduledAt: when.toISOString(), skipUnfinished, createdBy: admin.email });
            return json(200, { ok: true, run, runs: await listRuns() });
        }

        if (action === 'sendNow') {
            const run = await createRun({ slug, scheduledAt: new Date().toISOString(), skipUnfinished, createdBy: admin.email });
            try {
                await claimAndTriggerRun(supabase, run.id);
            } catch (e) {
                // Zlecenie zostało oznaczone jako failed w claimAndTriggerRun; cron go nie podejmie.
                return json(502, { error: `Nie udało się uruchomić wysyłki: ${e && e.message ? e.message : e}`, runs: await listRuns() });
            }
            return json(200, { ok: true, run, runs: await listRuns() });
        }

        return json(400, { error: 'Nieznana akcja.' });
    } catch (err) {
        console.error('admin-campaigns error:', err);
        const status = err && err.statusCode ? err.statusCode : 500;
        return json(status, { error: status === 500 ? 'Wystąpił błąd serwera.' : err.message });
    }
};
