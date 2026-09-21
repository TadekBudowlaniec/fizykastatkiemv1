// netlify/functions/_shared/push.js
// Web Push do administratorów (panel /admin zainstalowany jako PWA na telefonie).
//
// Klucze VAPID (Netlify → Environment variables):
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY  - publiczny; wbudowany w front (pushManager.subscribe)
//   VAPID_PRIVATE_KEY             - prywatny; tylko funkcje (podpis wysyłki)
//   VAPID_SUBJECT                 - mailto:… (kontakt dla dostawcy push)
// Wygeneruj raz: `npx web-push generate-vapid-keys`.
//
// Bez kluczy wysyłka jest pomijana po cichu - powiadomienia to dodatek i NIGDY
// nie mogą wywrócić webhooka Stripe ani zapisu leada.

const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

function admin() {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

function isPushConfigured() {
    return !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let vapidReady = false;
function ensureVapid() {
    if (vapidReady) return true;
    if (!isPushConfigured()) return false;
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:fizykastatkiem@gmail.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
    vapidReady = true;
    return true;
}

/** Zapis/odświeżenie subskrypcji urządzenia (klucz: endpoint). */
async function savePushSubscription(sub, userEmail, userAgent) {
    const { error } = await admin()
        .from('push_subscriptions')
        .upsert(
            {
                endpoint: sub.endpoint,
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
                user_email: String(userEmail || '').toLowerCase(),
                user_agent: userAgent || null,
            },
            { onConflict: 'endpoint' }
        );
    if (error) throw new Error(`Nie udało się zapisać subskrypcji: ${error.message}`);
}

async function deletePushSubscription(endpoint) {
    await admin().from('push_subscriptions').delete().eq('endpoint', endpoint);
}

async function countPushSubscriptions() {
    const { count, error } = await admin()
        .from('push_subscriptions')
        .select('id', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    return count || 0;
}

/**
 * Wysyła powiadomienie na WSZYSTKIE zapisane urządzenia adminów.
 * payload: { title, body, url?, tag? }. Nigdy nie rzuca; zwraca liczbę dostarczonych.
 * Wygasłe subskrypcje (404/410) są usuwane.
 */
async function sendAdminPush(payload) {
    try {
        if (!ensureVapid()) return 0;
        const db = admin();
        const { data, error } = await db
            .from('push_subscriptions')
            .select('endpoint, p256dh, auth');
        if (error || !data || data.length === 0) return 0;

        const body = JSON.stringify({ ...payload, url: payload.url || '/admin/' });
        let delivered = 0;
        const gone = [];
        await Promise.all(
            data.map(async (s) => {
                try {
                    await webpush.sendNotification(
                        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
                        body,
                        { TTL: 60 * 60 * 24, urgency: 'high' }
                    );
                    delivered += 1;
                } catch (err) {
                    const status = err && err.statusCode;
                    if (status === 404 || status === 410) gone.push(s.endpoint);
                    else console.error('[push] wysyłka nieudana:', status, err && err.message);
                }
            })
        );
        if (gone.length) await db.from('push_subscriptions').delete().in('endpoint', gone);
        if (delivered) {
            await db
                .from('push_subscriptions')
                .update({ last_used_at: new Date().toISOString() })
                .in('endpoint', data.map((s) => s.endpoint).filter((e) => !gone.includes(e)));
        }
        return delivered;
    } catch (err) {
        console.error('[push] błąd wysyłki:', err);
        return 0;
    }
}

/** Format kwoty w groszach → „828 zł”. */
function zl(amountMinor, currency) {
    const v = Math.round((Number(amountMinor) || 0) / 100);
    return `${v.toLocaleString('pl-PL')} ${(currency || 'pln').toUpperCase() === 'PLN' ? 'zł' : (currency || '').toUpperCase()}`;
}

module.exports = {
    isPushConfigured,
    savePushSubscription,
    deletePushSubscription,
    countPushSubscriptions,
    sendAdminPush,
    zl,
};
