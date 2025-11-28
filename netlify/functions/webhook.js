// netlify/functions/webhook.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Użyj SERVICE_KEY, tak jak w oryginalnym kodzie, dla bezpiecznego dostępu do bazy
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

// Mapowanie priceId na course_id (wklej tutaj stałą priceToCourseId)
// ... (Wklej tutaj stałą priceToCourseId) ... 

exports.handler = async (event) => {
    // 1. Sprawdzenie metody i pobranie podpisu
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const sig = event.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let eventData;

    try {
        // Netlify przekazuje surowe ciało (rawBody) w event.body
        eventData = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    // 2. Wklej logikę obsługi 'checkout.session.completed' z oryginalnego pliku
    if (eventData.type === 'checkout.session.completed') {
        // TUTAJ WLEJ CAŁY KOD, KTÓRY był w oryginalnym pliku pod tą linią:
        // const session = event.data.object;
        // ... (od tego momentu, aż do res.json({ received: true }))
        // Pamiętaj, żeby zamiast 'res.json' użyć 'return { statusCode: 200, body: JSON.stringify(...) }'
        
        const session = eventData.data.object;
        // ... Twoja cała skomplikowana logika Supabase i Stripe ...
        // ... (została pominięta dla czytelności, ale musi tu trafić) ...
        
        // Example:
        // const { data, error } = await supabase.from('enrollments')...
        
        // ZAWSZE zwróć 200 na koniec!
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
    } else {
        return { statusCode: 200, body: JSON.stringify({ received: true, message: 'Unhandled event' }) };
    }
};