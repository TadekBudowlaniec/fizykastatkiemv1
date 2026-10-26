// netlify/functions/check-campaign-schedule.js
// Cron co 5 minut (harmonogram w netlify.toml): szuka zaplanowanych zleceń
// kampanii (email_campaign_runs, status='scheduled', scheduled_at <= teraz)
// i przekazuje je funkcji w tle (send-campaign-background?run=…).
//
// Bez sekretu: funkcji z harmonogramem Netlify nie da się wywołać z zewnątrz
// (patrz naprawa send-sequence z 10.2026). Przejęcie zlecenia jest atomowe
// (update ... where status='scheduled'), więc nawet dwa równoległe wywołania
// nie wyślą kampanii dwa razy.

const { createClient } = require('@supabase/supabase-js');
const { claimAndTriggerRun } = require('./_shared/campaign');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function json(statusCode, body) {
    return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

exports.handler = async () => {
    const nowIso = new Date().toISOString();
    const { data: due, error } = await supabase
        .from('email_campaign_runs')
        .select('id, campaign, scheduled_at')
        .eq('status', 'scheduled')
        .lte('scheduled_at', nowIso)
        .order('scheduled_at', { ascending: true })
        .limit(20);

    if (error) {
        console.error('check-campaign-schedule query error:', error);
        return json(500, { ok: false, error: error.message });
    }

    let triggered = 0;
    let failed = 0;
    for (const run of due || []) {
        try {
            const mine = await claimAndTriggerRun(supabase, run.id);
            if (mine) {
                triggered++;
                console.log(`check-campaign-schedule: triggered run ${run.id} (${run.campaign}, planned ${run.scheduled_at})`);
            }
        } catch (e) {
            failed++;
            console.error(`check-campaign-schedule: run ${run.id} failed to start:`, e && e.message ? e.message : e);
        }
    }

    console.log(`check-campaign-schedule done: due=${(due || []).length} triggered=${triggered} failed=${failed}`);
    return json(200, { ok: true, due: (due || []).length, triggered, failed });
};
