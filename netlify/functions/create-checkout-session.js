// netlify/functions/create-checkout-session.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Klient Supabase do weryfikacji JWT (anon key)
const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// =============================================
//  PROMOCJA — 1h od wejścia użytkownika
// =============================================
const PROMO_DURATION_MS = 60 * 60 * 1000; // 1 godzina
const STRIPE_MIN_EXPIRES = 30 * 60;       // 30 min w sekundach
const STRIPE_MAX_EXPIRES = 24 * 60 * 60;  // 24h w sekundach

// Mapowanie courseId -> { name, regularPrice, promoPrice } (kwoty w GROSZACH)
const courseData = {
    1:  { name: 'Kinematyka',                        regularPrice: 4900, promoPrice: 4900 },
    2:  { name: 'Dynamika',                          regularPrice: 4900, promoPrice: 4900 },
    3:  { name: 'Praca, moc, energia',               regularPrice: 4900, promoPrice: 4900 },
    4:  { name: 'Bryła sztywna',                     regularPrice: 4900, promoPrice: 4900 },
    5:  { name: 'Ruch drgający',                     regularPrice: 4900, promoPrice: 4900 },
    6:  { name: 'Fale mechaniczne',                  regularPrice: 4900, promoPrice: 4900 },
    7:  { name: 'Hydrostatyka',                      regularPrice: 4900, promoPrice: 4900 },
    8:  { name: 'Termodynamika',                     regularPrice: 4900, promoPrice: 4900 },
    9:  { name: 'Grawitacja i astronomia',            regularPrice: 4900, promoPrice: 4900 },
    10: { name: 'Elektrostatyka',                    regularPrice: 4900, promoPrice: 4900 },
    11: { name: 'Prąd elektryczny',                  regularPrice: 4900, promoPrice: 4900 },
    12: { name: 'Magnetyzm',                         regularPrice: 4900, promoPrice: 4900 },
    13: { name: 'Indukcja elektromagnetyczna',       regularPrice: 4900, promoPrice: 4900 },
    14: { name: 'Fale elektromagnetyczne i optyka',  regularPrice: 4900, promoPrice: 4900 },
    15: { name: 'Fizyka atomowa',                    regularPrice: 4900, promoPrice: 4900 },
    16: { name: 'Fizyka jądrowa i relatywistyka',    regularPrice: 4900, promoPrice: 4900 },
    17: { name: 'Kurs Samodzielny (pełny dostęp)',     regularPrice: 69900, promoPrice: 59900 },
    18: { name: 'Kurs + Live (pełny dostęp + live)',  regularPrice: 94700, promoPrice: 84700 },
    19: { name: 'Kurs VIP 1:1 (indywidualna nauka)',  regularPrice: 199700, promoPrice: 189700 },
};

const CLIENT_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Sprawdza czy promo jest aktywna na podstawie timestampa rozpoczęcia (per-user)
function isPromoActive(promoStartedAt) {
    if (!promoStartedAt) return false;
    const startMs = Number(promoStartedAt);
    if (isNaN(startMs)) return false;
    const now = Date.now();
    return startMs <= now && (now - startMs) < PROMO_DURATION_MS;
}

function getPromoEndMs(promoStartedAt) {
    return Number(promoStartedAt) + PROMO_DURATION_MS;
}

function getPrice(course, promoStartedAt) {
    return isPromoActive(promoStartedAt) ? course.promoPrice : course.regularPrice;
}

// Oblicza expires_at — sesja wygasa gdy kończy się promo użytkownika
function getExpiresAt(promoStartedAt) {
    if (!isPromoActive(promoStartedAt)) return undefined;

    const nowSec = Math.floor(Date.now() / 1000);
    const promoEndSec = Math.floor(getPromoEndMs(promoStartedAt) / 1000);
    const diffSec = promoEndSec - nowSec;

    if (diffSec >= STRIPE_MIN_EXPIRES && diffSec <= STRIPE_MAX_EXPIRES) {
        return promoEndSec;
    }
    return undefined;
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { courseId, promoStartedAt, guestEmail } = JSON.parse(event.body);

        if (!courseId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Brak wymaganych danych.' }) };
        }

        // --- Rozpoznaj tryb: zalogowany (JWT) vs gość (guestEmail) ---
        let userId = null;
        let customerEmail = null;

        const authHeader = event.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            // Tryb zalogowany — weryfikacja JWT
            const token = authHeader.replace('Bearer ', '');
            const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

            if (authError || !user) {
                return { statusCode: 401, body: JSON.stringify({ error: 'Nieprawidłowy token.' }) };
            }
            userId = user.id;
            customerEmail = user.email;
        } else {
            // Tryb gość — email opcjonalny (Stripe zbierze jeśli brak)
            if (guestEmail) {
                customerEmail = guestEmail;
            }
        }

        // Normalizacja courseId
        const courseIdMap = { 'full_access': 17, 'full_access_live': 18, 'vip': 19 };
        const normalizedCourseId = courseIdMap[courseId] || Number(courseId);

        const course = courseData[normalizedCourseId];
        if (!course) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Nieprawidłowy kurs.' }) };
        }

        const unitAmount = getPrice(course, promoStartedAt);

        // Tworzenie sesji Stripe
        const sessionParams = {
            payment_method_types: ['card', 'blik', 'klarna'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'pln',
                        product_data: {
                            name: course.name,
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            allow_promotion_codes: true,
            metadata: {
                courseId: String(normalizedCourseId),
                checkoutMode: userId ? 'authenticated' : 'guest',
            },
            success_url: `${CLIENT_URL}/sukces?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${CLIENT_URL}/kurs`,
        };

        // Jeśli zalogowany — przekaż userId w metadata
        if (userId) {
            sessionParams.metadata.userId = userId;
        }

        // Email: jeśli mamy — prefill, jeśli nie — Stripe zbierze sam
        if (customerEmail) {
            sessionParams.customer_email = customerEmail;
        }

        // Zabezpieczenie: expires_at blokuje „trzymanie" starej ceny
        const expiresAt = getExpiresAt(promoStartedAt);
        if (expiresAt) {
            sessionParams.expires_at = expiresAt;
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

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
