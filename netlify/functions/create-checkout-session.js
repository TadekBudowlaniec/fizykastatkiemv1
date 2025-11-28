// netlify/functions/create-checkout-session.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY);

// Mapowanie kursów (możesz je przenieść do oddzielnego pliku helpers.js lub wkleić tutaj)
// ... (Wklej tutaj stałą coursePriceIds) ... 

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { userId, email, courseId, priceId } = JSON.parse(event.body);

        if (!userId || !email || !courseId || !priceId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Brak wymaganych danych.' }) };
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'blik', 'klarna'],
            mode: 'payment',
            customer_email: email,
            line_items: [
                { price: priceId, quantity: 1 },
            ],
            metadata: {
                userId,
                courseId
            },
            // Zmień success_url i cancel_url z "localhost" na Twoją domenę Netlify
            success_url: `${event.headers.origin}/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${event.headers.origin}/kurs`,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ id: session.id }),
        };
    } catch (err) {
        console.error('Stripe error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Błąd Stripe: ' + err.message }),
        };
    }
};