// payments.js
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

async function buyAccess(courseId = 'full_access') {
    if (!currentUser) {
        alert('Musisz się zalogować, aby kupić dostęp!');
        showSection('login');
        return;
    }
    if (courseId === 'termodynamika') {
        window.location.href = 'https://buy.stripe.com/14AcN6bYV4BcaSK5rd0ZW00';
        return;
    }
    if (courseId === 'jadrowa') {
        window.location.href = 'https://buy.stripe.com/5kQ5kEaUR0kW6CuaLx0ZW01';
        return;
    }
    if (courseId === 'atomowa') {
        window.location.href = 'https://buy.stripe.com/aFaeVe0gd2t4d0S8Dp0ZW02';
        return;
    }
    if (courseId === 'optyka') {
        window.location.href = 'https://buy.stripe.com/cNi5kE8MJ2t42meaLx0ZW03';
        return;
    }
    if (courseId === 'mechanika') {
        window.location.href = 'https://buy.stripe.com/test_14AbJ3gw429X2xt7Ed8so00';
        return;
    }
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user.id;
        const priceId = coursePriceIds[courseId] || coursePriceIds['full_access'];
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
        const result = await stripe.redirectToCheckout({ sessionId: session.id });
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