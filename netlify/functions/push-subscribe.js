// netlify/functions/push-subscribe.js
// Subskrypcje Web Push urządzeń admina (panel jako PWA).
//   GET    -> { configured, devices, publicKey }  (stan dla panelu)
//   POST   -> zapis subskrypcji z pushManager.subscribe().toJSON()
//   DELETE -> usunięcie subskrypcji { endpoint }
// Wszystko tylko dla zalogowanego admina (JWT + users.is_admin).

const { requireAdmin, json } = require('./_shared/admin-auth');
const {
    isPushConfigured,
    savePushSubscription,
    deletePushSubscription,
    countPushSubscriptions,
} = require('./_shared/push');

function parseSubscription(body) {
    const s = body || {};
    if (
        typeof s.endpoint !== 'string' ||
        !s.endpoint.startsWith('https://') ||
        !s.keys ||
        typeof s.keys.p256dh !== 'string' ||
        typeof s.keys.auth !== 'string'
    ) {
        return null;
    }
    return { endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } };
}

exports.handler = async (event) => {
    const gate = await requireAdmin(event);
    if (gate.response) return gate.response;
    const user = gate.user;

    let body = null;
    try {
        body = event.body ? JSON.parse(event.body) : null;
    } catch {
        body = null;
    }

    try {
        if (event.httpMethod === 'GET') {
            let devices = 0;
            let dbError = null;
            try {
                devices = await countPushSubscriptions();
            } catch (e) {
                dbError = e.message;
            }
            return json(200, {
                configured: isPushConfigured(),
                publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null,
                devices,
                dbError,
            });
        }

        if (event.httpMethod === 'POST') {
            const sub = parseSubscription(body);
            if (!sub) return json(400, { error: 'Nieprawidłowa subskrypcja.' });
            await savePushSubscription(
                sub,
                user.email,
                event.headers['user-agent'] || event.headers['User-Agent'] || null
            );
            return json(200, { ok: true });
        }

        if (event.httpMethod === 'DELETE') {
            if (!body || typeof body.endpoint !== 'string') {
                return json(400, { error: 'Brak endpointu.' });
            }
            await deletePushSubscription(body.endpoint);
            return json(200, { ok: true });
        }

        return json(405, { error: 'Method Not Allowed' });
    } catch (err) {
        console.error('push-subscribe error:', err);
        return json(500, { error: err.message || 'Błąd zapisu subskrypcji.' });
    }
};
