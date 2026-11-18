// netlify/functions/create-checkout-session.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Klient Supabase do weryfikacji JWT (anon key)
const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// =============================================
//  PROMOCJA - 1h od wejścia użytkownika
// =============================================
const PROMO_DURATION_MS = 60 * 60 * 1000; // 1 godzina
const STRIPE_MIN_EXPIRES = 30 * 60;       // 30 min w sekundach
const STRIPE_MAX_EXPIRES = 24 * 60 * 60;  // 24h w sekundach

// Mapowanie courseId -> { name, regularPrice, promoPrice } (kwoty w GROSZACH)
// Ceny zgodne z lib/courses.ts. Pakiet Gold (18) WYCOFANY - nie przywracać.
// Bez fałszywej promocji: promoPrice == regularPrice (brak sztucznego rabatu).
// Pojedynczy dział: 177 zł · Kurs Pełny (17): 828 zł · VIP 1:1 (19): 3497 zł.
const courseData = {
    1:  { name: 'Kinematyka',                        regularPrice: 17700, promoPrice: 17700 },
    2:  { name: 'Dynamika',                          regularPrice: 17700, promoPrice: 17700 },
    3:  { name: 'Praca, moc, energia',               regularPrice: 17700, promoPrice: 17700 },
    4:  { name: 'Bryła sztywna',                     regularPrice: 17700, promoPrice: 17700 },
    5:  { name: 'Ruch drgający',                     regularPrice: 17700, promoPrice: 17700 },
    6:  { name: 'Fale mechaniczne',                  regularPrice: 17700, promoPrice: 17700 },
    7:  { name: 'Hydrostatyka',                      regularPrice: 17700, promoPrice: 17700 },
    8:  { name: 'Termodynamika',                     regularPrice: 17700, promoPrice: 17700 },
    9:  { name: 'Grawitacja i astronomia',            regularPrice: 17700, promoPrice: 17700 },
    10: { name: 'Elektrostatyka',                    regularPrice: 17700, promoPrice: 17700 },
    11: { name: 'Prąd stały',                        regularPrice: 17700, promoPrice: 17700 },
    12: { name: 'Magnetyzm',                         regularPrice: 17700, promoPrice: 17700 },
    13: { name: 'Indukcja elektromagnetyczna',       regularPrice: 17700, promoPrice: 17700 },
    14: { name: 'Fale elektromagnetyczne i optyka',  regularPrice: 17700, promoPrice: 17700 },
    15: { name: 'Fizyka atomowa',                    regularPrice: 17700, promoPrice: 17700 },
    16: { name: 'Fizyka jądrowa i relatywistyka',    regularPrice: 17700, promoPrice: 17700 },
    17: { name: 'Kurs Pełny (pełny dostęp)',          regularPrice: 82800, promoPrice: 82800 },
    19: { name: 'VIP 1:1 (indywidualne prowadzenie)', regularPrice: 349700, promoPrice: 349700 },
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

// Oblicza expires_at - sesja wygasa gdy kończy się promo użytkownika
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

// =============================================
//  ATRYBUCJA - źródło sprzedaży do metadata Stripe
// =============================================
// fs_attr: first-touch UTM (lib/attribution.ts), _ga: client_id GA4,
// _ga_LFRFD4WDLB: sesja GA4 (pod ewentualny Measurement Protocol w przyszłości).
const GA_SESSION_COOKIE = '_ga_LFRFD4WDLB';

function parseCookies(header) {
    const out = {};
    if (!header) return out;
    for (const part of header.split(';')) {
        const i = part.indexOf('=');
        if (i < 0) continue;
        const key = part.slice(0, i).trim();
        if (key && !(key in out)) out[key] = part.slice(i + 1).trim();
    }
    return out;
}

// Metadata Stripe: max 500 znaków na wartość; tniemy do 100 i wyrzucamy znaki sterujące.
function clean(value) {
    if (typeof value !== 'string') return null;
    const v = value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 100);
    return v || null;
}

function getAttributionMetadata(cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    const meta = {};

    if (cookies.fs_attr) {
        try {
            const p = new URLSearchParams(decodeURIComponent(cookies.fs_attr));
            for (const k of ['utm_source', 'utm_medium', 'utm_campaign']) {
                const v = clean(p.get(k));
                if (v) meta[k] = v;
            }
        } catch { /* uszkodzone cookie - pomijamy */ }
    }

    // _ga = "GA1.1.<losowe>.<timestamp>" -> client_id = "<losowe>.<timestamp>"
    if (cookies._ga) {
        const parts = cookies._ga.split('.');
        if (parts.length >= 4) {
            const cid = clean(parts.slice(2).join('.'));
            if (cid) meta.ga_client_id = cid;
        }
    }

    // _ga_<ID>: stary format "GS1.1.<session_id>.<...>", nowy "GS2.1.s<session_id>$o..$g..".
    const gs = cookies[GA_SESSION_COOKIE];
    if (gs) {
        let sid = null;
        if (gs.startsWith('GS2.')) {
            const seg = gs.split('.').slice(2).join('.').split('$').find((s) => s.startsWith('s'));
            sid = seg ? seg.slice(1) : null;
        } else {
            sid = gs.split('.')[2] || null;
        }
        if (sid && /^\d+$/.test(sid)) meta.ga_session_id = sid;
    }

    return meta;
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
            // Tryb zalogowany - weryfikacja JWT
            const token = authHeader.replace('Bearer ', '');
            const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

            if (authError || !user) {
                return { statusCode: 401, body: JSON.stringify({ error: 'Nieprawidłowy token.' }) };
            }
            userId = user.id;
            customerEmail = user.email;
        } else {
            // Tryb gość - email opcjonalny (Stripe zbierze jeśli brak)
            if (guestEmail) {
                customerEmail = guestEmail;
            }
        }

        // Normalizacja courseId
        const courseIdMap = { 'full_access': 17, 'vip': 19 };
        const normalizedCourseId = courseIdMap[courseId] || Number(courseId);

        const course = courseData[normalizedCourseId];
        if (!course) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Nieprawidłowy kurs.' }) };
        }

        const unitAmount = getPrice(course, promoStartedAt);

        // Tworzenie sesji Stripe
        // Metody płatności NIE są wymuszane w kodzie - Checkout bierze te, które
        // są włączone w Stripe Dashboard (Settings → Payment methods): karta,
        // BLIK, Przelewy24, Klarna, Revolut Pay itd. Nowa metoda = włączyć w panelu, bez deployu.
        const sessionParams = {
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

        // Jeśli zalogowany - przekaż userId w metadata
        if (userId) {
            sessionParams.metadata.userId = userId;
        }

        // Źródło sprzedaży (UTM first-touch + identyfikatory GA4) - na sesji
        // i na płatności (widać je też w Stripe → Płatności).
        const attribution = getAttributionMetadata(event.headers.cookie || event.headers.Cookie);
        Object.assign(sessionParams.metadata, attribution);
        sessionParams.payment_intent_data = {
            metadata: { courseId: String(normalizedCourseId), ...attribution },
        };

        // Email: jeśli mamy - prefill, jeśli nie - Stripe zbierze sam
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
            // `id` zachowane dla kompatybilności; `url` do bezpośredniego przekierowania (Next.js).
            body: JSON.stringify({ id: session.id, url: session.url }),
        };
    } catch (err) {
        console.error('Stripe error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Wystąpił błąd podczas tworzenia płatności.' }),
        };
    }
};
