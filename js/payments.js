// payments.js

// Mapowanie course_id -> Stripe Payment Link
const courseIdToPaymentLink = {
    full_access: 'https://buy.stripe.com/00w00k7IFaZA9OG9Ht0ZW06',
    1: 'https://buy.stripe.com/bJe14o8MJ7Nof90f1N0ZW07', // Kinematyka
    2: 'https://buy.stripe.com/aFacN66EB9Vwd0S7zl0ZW08', // Dynamika
    3: 'https://buy.stripe.com/6oU4gA5AxaZAf90f1N0ZW09', // Praca moc energia
    4: 'https://buy.stripe.com/9B6aEYgfb8RsaSK6vh0ZW0a', // Bryła Sztywna
    5: 'https://buy.stripe.com/5kQ28sbYV2t4d0S1aX0ZW0h', // Ruch Drgający
    6: 'https://buy.stripe.com/3cI28s9QNaZA6CucTF0ZW0g', // Fale Mechaniczne
    7: 'https://buy.stripe.com/9B6eVefb7gjUf90cTF0ZW0b', // Hydrostatyka
    8: 'https://buy.stripe.com/14AcN6bYV4BcaSK5rd0ZW00', // Termodynamika
    9: 'https://buy.stripe.com/dRm7sM1kh3x87Gy3j50ZW0c', // Grawitacja i Astronomia
    10: 'https://buy.stripe.com/aFa14o4wtgjU3qiaLx0ZW04', // Elektrostatyka
    11: 'https://buy.stripe.com/6oUeVe2olaZA3qi5rd0ZW0d', // Prąd Elektryczny
    12: 'https://buy.stripe.com/8x2bJ2bYV5Fg5yqdXJ0ZW0e', // Magnetyzm
    13: 'https://buy.stripe.com/8x214o0gdebM2meg5R0ZW0f', // Indukcja Elektromagnetyczna
    14: 'https://buy.stripe.com/cNi5kE8MJ2t42meaLx0ZW03', // Fale Elektromagnetyczne i Optyka
    15: 'https://buy.stripe.com/aFaeVe0gd2t4d0S8Dp0ZW02', // Fizyka Atomowa
    16: 'https://buy.stripe.com/5kQ5kEaUR0kW6CuaLx0ZW01'  // Fizyka Jądrowa i Relatywistyka
};

function buyViaLink(courseId = 'full_access') {
    const link = courseIdToPaymentLink[courseId];
    if (!link) {
        alert('Brak linku płatności dla wybranego kursu.');
        return;
    }
    window.open(link, '_blank');
}
// Udostępnij globalnie
window.buyViaLink = buyViaLink;
window.buyAccess = buyAccess;
window.buyAsGuest = buyAsGuest;

async function buyAccess(courseId = 'full_access') {
    // Jeśli niezalogowany — przełącz na guest checkout
    if (!currentUser) {
        return buyAsGuest(courseId);
    }

    if (hasAccessToCourse(courseId)) {
        alert('Masz już dostęp do tego kursu!');
        return;
    }

    try {
        const token = await getAuthToken();
        if (!token) {
            alert('Sesja wygasła. Zaloguj się ponownie.');
            showSection('login');
            return;
        }

        const promoStartedAt = localStorage.getItem('promoStartedAt') || null;
        const response = await fetch('/.netlify/functions/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ courseId, promoStartedAt })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || response.statusText);
        }

        const session = await response.json();

        const result = await window.stripe.redirectToCheckout({ sessionId: session.id });
        if (result.error) {
            alert('Błąd płatności: ' + result.error.message);
        }
    } catch (error) {
        alert('Błąd podczas przetwarzania płatności: ' + error.message);
    }
}

// Guest Checkout — bez logowania, email opcjonalny (Stripe zbierze)
async function buyAsGuest(courseId = 'full_access') {
    try {
        // Spróbuj pobrać email z squeeze forma (localStorage)
        const guestEmail = localStorage.getItem('squeezeMagicEmail') || null;
        const promoStartedAt = localStorage.getItem('promoStartedAt') || null;

        const response = await fetch('/.netlify/functions/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId, promoStartedAt, guestEmail })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || response.statusText);
        }

        const session = await response.json();

        const result = await window.stripe.redirectToCheckout({ sessionId: session.id });
        if (result.error) {
            alert('Błąd płatności: ' + result.error.message);
        }
    } catch (error) {
        alert('Błąd podczas przetwarzania płatności: ' + error.message);
    }
}

// Funkcja do obsługi powrotu po płatności Stripe
async function handleStripeReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (!sessionId) return;

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await checkUserAccess();

        const url = new URL(window.location);
        url.searchParams.delete('session_id');
        window.history.replaceState({}, document.title, url);

        showSection('dashboard');
        alert('Płatność zakończona pomyślnie! Sprawdź dostęp do kursów w panelu.');
    } catch (error) {
        alert('Płatność została zrealizowana. Sprawdź dostęp w panelu kursów.');
    }
}
