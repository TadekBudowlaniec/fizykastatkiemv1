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
    'price_1RtPFoJLuu6b086bmfvVO4G8': 1,
    'price_1RtPGOJLuu6b086b1QN5l4DE': 2,
    'price_1Rgt0yJLuu6b086b115h7OXM': 3,
    'price_1RtPKTJLuu6b086b3wG0IiaV': 4,
    'price_1RtPKkJLuu6b086b2lfhBfDX': 5,
    'price_1RtPL2JLuu6b086bLl03p2R9': 6,
    'price_1RtPLlJLuu6b086bbJxG1bqw': 7,
    'price_1RgqlFJLuu6b086bf2Wl2bUg': 8,
    'price_1RtPMCJLuu6b086bV3Zk0il6': 9,
    'price_1Rgt1HJLuu6b086bmNgENAIM': 10,
    'price_1RtPNJJLuu6b086bBejuPL2T': 11,
    'price_1RtPNdJLuu6b086bjn7p0Wsn': 12,
    'price_1RtPORJLuu6b086b1yxr0voQ': 13,
    'price_1Rgt1TJLuu6b086bNn14JbJa': 14,
    'price_1Rgt1lJLuu6b086bk3TJqFzM': 15,
    'price_1Rgt21JLuu6b086bTBuO2djx': 16,
    'price_1RtPPaJLuu6b086bdmWNAsGI': 17
};

// Wymagaj SERVICE_KEY — webhook musi mieć pełne uprawnienia
if (!process.env.SUPABASE_SERVICE_KEY) {
    console.error('FATAL: SUPABASE_SERVICE_KEY not configured');
}
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const CLIENT_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Znajdź lub utwórz użytkownika Supabase Auth po emailu
async function findOrCreateUser(email) {
    // Szukaj istniejącego usera w Supabase Auth po emailu
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
    }

    const existingAuthUser = users?.find(u => u.email === email);
    if (existingAuthUser) {
        console.log('Found existing auth user:', existingAuthUser.id, email);
        return existingAuthUser.id;
    }

    // Utwórz nowe konto w Supabase Auth — generuje random hasło
    // Użytkownik dostanie magic link do logowania
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true, // od razu potwierdź email (zapłacił, więc email jest prawdziwy)
    });

    if (createError) {
        console.error('Error creating auth user:', createError);
        return null;
    }

    console.log('Created new auth user:', newUser.user.id, email);

    // Wyślij magic link — użytkownik kliknie i będzie zalogowany
    const { error: otpError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
            redirectTo: `${CLIENT_URL}/kurs`,
        },
    });
    if (otpError) {
        console.error('Error sending magic link to new user:', otpError);
    }

    return newUser.user.id;
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const sig = event.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let eventData;

    try {
        eventData = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
        console.log('Webhook received:', eventData.type);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    if (eventData.type === 'checkout.session.completed') {
        const session = eventData.data.object;
        console.log('Processing completed session:', session.id);

        try {
            // --- Ustal userId: z metadata (zalogowany) lub po emailu (gość) ---
            let userId = session.metadata?.userId || null;
            const customerEmail = session.customer_email || session.customer_details?.email;
            const checkoutMode = session.metadata?.checkoutMode || 'authenticated';

            if (!userId && checkoutMode === 'guest') {
                if (!customerEmail) {
                    console.error('Guest checkout without email — cannot provision access');
                    return { statusCode: 400, body: JSON.stringify({ error: 'No email for guest checkout' }) };
                }
                // Znajdź lub utwórz konto po emailu
                userId = await findOrCreateUser(customerEmail);
                if (!userId) {
                    console.error('Failed to find/create user for:', customerEmail);
                    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to provision user' }) };
                }
            }

            if (!userId) {
                console.error('No userId resolved for session:', session.id);
                return { statusCode: 400, body: JSON.stringify({ error: 'Missing userId' }) };
            }

            // --- Ustal kursy do odblokowania ---
            const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ['line_items', 'line_items.data.price']
            });
            const lineItems = sessionWithLineItems.line_items?.data || [];

            let courseIds = [];

            if (lineItems.length > 0 && lineItems[0]?.price?.id) {
                const priceId = lineItems[0].price.id;
                const courseIdFromPrice = priceToCourseId[priceId];

                if (courseIdFromPrice === 17) {
                    courseIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
                } else if (courseIdFromPrice) {
                    courseIds = [courseIdFromPrice];
                }
            }

            // Fallback: metadata.courseId (zawsze obecne)
            if (courseIds.length === 0 && session.metadata?.courseId) {
                const metaCourseId = session.metadata.courseId;
                if (metaCourseId === 'full_access' || metaCourseId === '17') {
                    courseIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
                } else if (!Number.isNaN(Number(metaCourseId))) {
                    courseIds = [Number(metaCourseId)];
                }
            }

            // --- Upewnij się, że user istnieje w tabeli users ---
            const { data: existingUser, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('id', userId)
                .single();

            if (userError && userError.code !== 'PGRST116') {
                console.error('Error checking user:', userError);
            } else if (!existingUser) {
                const { error: createUserError } = await supabase
                    .from('users')
                    .insert({
                        id: userId,
                        email: customerEmail || 'unknown@example.com',
                        created_at: new Date().toISOString()
                    });

                if (createUserError) {
                    console.error('Error creating user row:', createUserError);
                } else {
                    console.log('User row created:', userId);
                }
            }

            // --- Dodaj enrollments ---
            for (const courseId of courseIds) {
                const { error } = await supabase
                    .from('enrollments')
                    .upsert({
                        user_id: userId,
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
                    console.log(`Access granted for user ${userId} to course ${courseId}`);
                }
            }

            return { statusCode: 200, body: JSON.stringify({ received: true }) };

        } catch (error) {
            console.error('Error processing webhook:', error);
            return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
        }
    } else {
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
    }
};
