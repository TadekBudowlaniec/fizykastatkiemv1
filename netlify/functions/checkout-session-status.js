// netlify/functions/checkout-session-status.js
//
// GET ?session_id=cs_... -> kwota faktycznie zapłacona i produkty, do zdarzenia
// GA4 `purchase` na /sukces (app/sukces/SuccessClient.tsx). Kwota pochodzi ze
// Stripe, nie z URL-a. Zwracamy tylko to, czego potrzebuje GA4 - bez e-maila
// ani danych klienta (ID sesji jest nie do zgadnięcia, ale i tak nie ujawniamy więcej).

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY);

const SESSION_ID_RE = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

function json(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify(body),
    };
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const sessionId = event.queryStringParameters && event.queryStringParameters.session_id;
    if (!sessionId || !SESSION_ID_RE.test(sessionId)) {
        return json(400, { error: 'Nieprawidłowy session_id.' });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items'],
        });

        const items = ((session.line_items && session.line_items.data) || []).map((li) => ({
            item_id: (session.metadata && session.metadata.courseId) || undefined,
            item_name: li.description,
            price: (li.amount_total || 0) / 100 / (li.quantity || 1),
            quantity: li.quantity || 1,
        }));

        return json(200, {
            id: session.id,
            payment_status: session.payment_status, // 'paid' | 'unpaid' | 'no_payment_required'
            value: (session.amount_total || 0) / 100, // po rabatach - kwota faktycznie zapłacona
            currency: (session.currency || 'pln').toUpperCase(),
            items,
        });
    } catch (err) {
        console.error('checkout-session-status error:', err.message);
        return json(404, { error: 'Nie znaleziono sesji.' });
    }
};
