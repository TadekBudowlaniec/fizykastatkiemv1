// netlify/functions/create-checkout-session.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY);

// Mapowanie kursów (możesz je przenieść do oddzielnego pliku helpers.js lub wkleić tutaj)
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