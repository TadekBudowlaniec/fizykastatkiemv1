// netlify/functions/webhook.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const coursePriceIds = {
    1: 'price_1RtPFoJLuu6b086bmfvVO4G8', // Kinematyka
    2: 'price_1RtPGOJLuu6b086b1QN5l4DE', // Dynamika
    3: 'price_1Rgt0yJLuu6b086b115h7OXM', // Praca moc energia
    4: 'price_1RtPKTJLuu6b086b3wG0IiaV', // Bryła Sztywna
    5: 'price_1RtPKkJLuu6b086b2lfhBfDX', // Ruch Drgający
    6: 'price_1RtPL2JLuu6b086bLl03p2R9', // Fale Mechaniczne
    7: 'price_1RtPLlJLuu6b086bbJxG1bqw', // Hydrostatyka
    8: 'price_1RgqlFJLuu6b086bf2Wl2bUg', // Termodynamika
    9: 'price_1RtPMCJLuu6b086bV3Zk0il6', // Grawitacja i Astronomia
    10: 'price_1Rgt1HJLuu6b086bmNgENAIM', // Elektrostatyka
    11: 'price_1RtPNJJLuu6b086bBejuPL2T', // Prąd Elektryczny
    12: 'price_1RtPNdJLuu6b086bjn7p0Wsn', // Magnetyzm
    13: 'price_1RtPORJLuu6b086b1yxr0voQ', // Indukcja Elektromagnetyczna
    14: 'price_1Rgt1TJLuu6b086bNn14JbJa', // Fale Elektromagnetyczne i Optyka
    15: 'price_1Rgt1lJLuu6b086bk3TJqFzM', // Fizyka Atomowa
    16: 'price_1Rgt21JLuu6b086bTBuO2djx', // Fizyka Jądrowa i Relatywistyka
    17: 'price_1RtPPaJLuu6b086bdmWNAsGI' // Wszystkie materiały (full_access)
};

// Mapowanie priceId na course_id
const priceToCourseId = {
    'price_1RtPFoJLuu6b086bmfvVO4G8': 1, // Kinematyka
    'price_1RtPGOJLuu6b086b1QN5l4DE': 2, // Dynamika
    'price_1Rgt0yJLuu6b086b115h7OXM': 3, // Praca moc energia
    'price_1RtPKTJLuu6b086b3wG0IiaV': 4, // Bryła Sztywna
    'price_1RtPKkJLuu6b086b2lfhBfDX': 5, // Ruch Drgający
    'price_1RtPL2JLuu6b086bLl03p2R9': 6, // Fale Mechaniczne
    'price_1RtPLlJLuu6b086bbJxG1bqw': 7, // Hydrostatyka
    'price_1RgqlFJLuu6b086bf2Wl2bUg': 8, // Termodynamika
    'price_1RtPMCJLuu6b086bV3Zk0il6': 9, // Grawitacja i Astronomia
    'price_1Rgt1HJLuu6b086bmNgENAIM': 10, // Elektrostatyka
    'price_1RtPNJJLuu6b086bBejuPL2T': 11, // Prąd Elektryczny
    'price_1RtPNdJLuu6b086bjn7p0Wsn': 12, // Magnetyzm
    'price_1RtPORJLuu6b086b1yxr0voQ': 13, // Indukcja Elektromagnetyczna
    'price_1Rgt1TJLuu6b086bNn14JbJa': 14, // Fale Elektromagnetyczne i Optyka
    'price_1Rgt1lJLuu6b086bk3TJqFzM': 15, // Fizyka Atomowa
    'price_1Rgt21JLuu6b086bTBuO2djx': 16, // Fizyka Jądrowa i Relatywistyka
    'price_1RtPPaJLuu6b086bdmWNAsGI': 17 // Wszystkie materiały (full_access)
};

// Użyj SERVICE_KEY, tak jak w oryginalnym kodzie, dla bezpiecznego dostępu do bazy
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);


exports.handler = async (event) => {
    // 1. Walidacja metody
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const sig = event.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let eventData;

    try {
        // Netlify Functions dostarcza surowe ciało w event.body, idealne dla Stripe
        eventData = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
        console.log('Webhook received:', eventData.type);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        // Zastępuje return res.status(400).send(...)
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    // 2. Obsługa udanych płatności (checkout.session.completed)
    if (eventData.type === 'checkout.session.completed') {
        const session = eventData.data.object;
        console.log('Processing completed session:', session.id);
        
        if (!session.metadata || !session.metadata.userId) {
            console.error('Session missing required metadata:', session.metadata);
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing required metadata' }) };
        }
        
        try {
            // TUTAJ PONIŻEJ CAŁA LOGIKA SUPABASE JEST KOPIOWANA BEZ ZMIAN:
            
            const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ['line_items', 'line_items.data.price']
            });
            const lineItems = sessionWithLineItems.line_items?.data || [];

            let courseIds = [];
            // ... cała logika mapowania kursów i fallbacków jest kopiowana ...
            
            if (lineItems.length > 0 && lineItems[0]?.price?.id) {
                // ... reszta logiki mapowania ...
                const priceId = lineItems[0].price.id;
                const courseIdFromPrice = priceToCourseId[priceId];

                if (courseIdFromPrice === 17) {
                    courseIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
                } else if (courseIdFromPrice) {
                    courseIds = [courseIdFromPrice];
                }
            }

            // Fallback: jeśli brak dopasowania po priceId, użyj metadata.courseId
            if (courseIds.length === 0 && session.metadata?.courseId) {
                const metaCourseId = session.metadata.courseId;
                if (metaCourseId === 'full_access') {
                    courseIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
                } else if (!Number.isNaN(Number(metaCourseId))) {
                    courseIds = [Number(metaCourseId)];
                }
            }

            // Sprawdź czy użytkownik istnieje, jeśli nie - utwórz go
            const { data: existingUser, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('id', session.metadata.userId)
                .single();

            // ... Reszta logiki tworzenia użytkownika i obsługi błędów ...

            if (userError && userError.code !== 'PGRST116') {
                console.error('Error checking user:', userError);
            } else if (!existingUser) {
                 const { error: createUserError } = await supabase
                    .from('users')
                    .insert({
                        id: session.metadata.userId,
                        email: session.customer_email || session.customer_details?.email || 'unknown@example.com',
                        created_at: new Date().toISOString()
                    });

                if (createUserError) {
                    console.error('Error creating user:', createUserError);
                } else {
                    console.log('User created:', session.metadata.userId);
                }
            }

            // Dodaj wpisy do tabeli enrollments
            for (const courseId of courseIds) {
                const { data, error } = await supabase
                    .from('enrollments')
                    .upsert({
                        user_id: session.metadata.userId,
                        course_id: courseId,
                        access_granted: true,
                        enrolled_at: new Date().toISOString()
                    }, { 
                        onConflict: 'user_id,course_id',
                        ignoreDuplicates: false 
                    });

                if (error) {
                    console.error('Error adding enrollment for course', courseId, ':', error);
                } else {
                    console.log(`✅ Access granted for user ${session.metadata.userId} to course ${courseId}`);
                }
            }

            // Zastępuje res.json({ received: true });
            return { statusCode: 200, body: JSON.stringify({ received: true }) };
            
        } catch (error) {
            console.error('Error processing webhook:', error);
            // Zastępuje res.status(500).json(...)
            return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
        }
    } else {
        // Zastępuje res.json({ received: true });
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
    }
};