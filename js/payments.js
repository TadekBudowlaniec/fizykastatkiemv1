// payments.js

// Używam window.stripe z supabase-config.js zamiast lokalnej zmiennej

const coursePriceIds = {
    mechanika: 'price_mechanika',
    // productId: prod_Sc4vpFdyoHuAbV
    termodynamika: 'price_1RgqlFJLuu6b086bf2Wl2bUg',
    elektromagnetyzm: 'price_elektromagnetyzm',
    optyka: 'price_optyka',
    atomowa: 'price_atomowa',
    jadrowa: 'price_jadrowa',
    full_access: 'price_full_access'
};

// Mapowanie course_id -> Stripe Payment Link (z payment_links.csv)
// 1: Kinematyka, 2: Dynamika, 3: Praca moc energia, 4: Bryła Sztywna, 5: Ruch Drgający,
// 6: Fale Mechaniczne, 7: Hydrostatyka, 8: Termodynamika, 9: Grawitacja i Astronomia,
// 10: Elektrostatyka, 11: Prąd Elektryczny, 12: Magnetyzm, 13: Indukcja Elektromagnetyczna,
// 14: Fale Elektromagnetyczne i Optyka, 15: Fizyka Atomowa, 16: Fizyka Jądrowa i Relatywistyka
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

async function buyAccess(courseId = 'full_access') {
    if (!currentUser) {
        alert('Musisz się zalogować, aby kupić dostęp!');
        showSection('login');
        return;
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user.id;
        
        // Mapowanie courseId na priceId
        let priceId;
        if (courseId === 'full_access') {
            priceId = 'price_1RtPPaJLuu6b086bdmWNAsGI'; // Wszystkie materiały
        } else {
            // Mapowanie course_id na priceId
            const coursePriceMapping = {
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
                16: 'price_1Rgt21JLuu6b086bTBuO2djx' // Fizyka Jądrowa i Relatywistyka
            };
            priceId = coursePriceMapping[courseId] || 'price_1RtPPaJLuu6b086bdmWNAsGI'; // fallback na full_access
        }

        const response = await fetch('http://localhost:3001/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                email: currentUser.email,
                courseId: courseId,
                priceId: priceId
            }),
        });
        
        if (!response.ok) {
            throw new Error('Błąd serwera podczas tworzenia sesji płatności');
        }
        
        const session = await response.json();
        const result = await window.stripe.redirectToCheckout({ sessionId: session.id });
        
        if (result.error) {
            alert('Błąd płatności: ' + result.error.message);
        }
    } catch (error) {
        console.error('Błąd płatności:', error);
        alert('Błąd podczas przetwarzania płatności: ' + error.message);
    }
}

async function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
        try {
            const response = await fetch(`http://localhost:3001/api/check-payment-status?session_id=${sessionId}`);
            const result = await response.json();
            if (result.success) {
                await checkUserAccess();
                showSection('dashboard');
                alert('Płatność zakończona pomyślnie! Masz teraz dostęp do wszystkich kursów.');
            } else {
                alert('Błąd płatności: ' + result.error);
            }
        } catch (error) {
            console.error('Błąd sprawdzania statusu płatności:', error);
        }
    }
}

// Funkcja do obsługi powrotu po płatności Stripe
async function handleStripeReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (!sessionId) return;
    try {
        const response = await fetch(`http://localhost:3001/api/check-payment-status?session_id=${sessionId}`);
        const result = await response.json();
        if (result.success) {
            await checkUserAccess();
            showSection('dashboard');
            alert('Płatność zakończona pomyślnie! Masz dostęp do kursu.');
        } else {
            alert('Błąd płatności: ' + (result.error || 'Nie udało się potwierdzić płatności.'));
        }
    } catch (error) {
        alert('Błąd podczas sprawdzania statusu płatności: ' + error.message);
    }
} 