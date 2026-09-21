// netlify/functions/push-test.js
// Testowe powiadomienie push na wszystkie urządzenia adminów - do sprawdzenia,
// czy telefon je odbiera. Tylko admin (JWT + users.is_admin).

const { requireAdmin, json } = require('./_shared/admin-auth');
const { isPushConfigured, sendAdminPush } = require('./_shared/push');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
    const gate = await requireAdmin(event);
    if (gate.response) return gate.response;

    if (!isPushConfigured()) {
        return json(503, {
            error: 'Brak kluczy VAPID na Netlify (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY).',
        });
    }
    const delivered = await sendAdminPush({
        title: 'Fizyka Statkiem - test',
        body: 'Powiadomienia działają. Tak wygląda nowe zamówienie albo lead.',
        url: '/admin/',
        tag: 'test',
    });
    return json(200, { ok: true, delivered });
};
