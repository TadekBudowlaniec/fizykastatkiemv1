// netlify/functions/create-checkout-session.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Klient Supabase do weryfikacji JWT
const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Mapowanie courseId -> Stripe priceId (serwer decyduje o cenie, NIE klient)
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

const ALLOWED_ORIGIN = process.env.FRONTEND_URL || 'https://remarkable-cascaron-72cefc.netlify.app';

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 1. Weryfikacja JWT — jedyne źródło prawdy o userId i email
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Brak autoryzacji.' }) };
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

        if (authError || !user) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Nieprawidłowy token.' }) };
        }

        // 2. Parsuj request — przyjmujemy TYLKO courseId, resztę bierzemy z tokenu
        const { courseId } = JSON.parse(event.body);

        if (!courseId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Brak wymaganych danych.' }) };
        }

        // 3. Serwer sam mapuje courseId na priceId — klient NIE może manipulować ceną
        const priceId = coursePriceIds[courseId];
        if (!priceId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Nieprawidłowy kurs.' }) };
        }

        // 4. Tworzenie sesji Stripe z bezpiecznym origin
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'blik', 'klarna'],
            mode: 'payment',
            customer_email: user.email,
            line_items: [
                { price: priceId, quantity: 1 },
            ],
            allow_promotion_codes: true,
            metadata: {
                userId: user.id,
                courseId: String(courseId)
            },
            success_url: `${ALLOWED_ORIGIN}/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${ALLOWED_ORIGIN}/kurs`,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ id: session.id }),
        };
    } catch (err) {
        console.error('Stripe error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Wystąpił błąd podczas tworzenia płatności.' }),
        };
    }
};
