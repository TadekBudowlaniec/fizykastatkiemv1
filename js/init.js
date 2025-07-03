// init.js
window.addEventListener('DOMContentLoaded', () => {
    // Obsługa nawigacji
    document.getElementById('loginBtn')?.addEventListener('click', () => showSection('login'));
    document.getElementById('registerBtn')?.addEventListener('click', () => showSection('register'));
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('buyAccessBtn')?.addEventListener('click', buyAccess);
    document.querySelectorAll('.subject-link').forEach(link => {
        link.addEventListener('click', e => {
            const subject = link.dataset.subject;
            showSubject(subject);
        });
    });
    // Formularz rejestracji
    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const name = document.getElementById('registerName').value;
        await register(email, password, name);
    });
    // Formularz logowania
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        await login(email, password);
    });
    // Pobieranie PDF
    document.querySelectorAll('.download-pdf').forEach(btn => {
        btn.addEventListener('click', e => {
            const pdfType = btn.dataset.pdf;
            downloadPDF(pdfType);
        });
    });
    // Sprawdzenie statusu płatności po powrocie ze Stripe
    checkPaymentStatus();
    // Sprawdzenie sesji użytkownika
    supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            currentUser = user;
            checkUserAccess().then(() => {
                showSection('dashboard');
                updateNavigation();
            });
        } else {
            showSection('landing');
            updateNavigation();
        }
    });
    // Dodaj link do profilu użytkownika w nawigacji, jeśli zalogowany
    if (document.getElementById('userProfileBtn')) {
        document.getElementById('userProfileBtn').addEventListener('click', () => showSection('user'));
    }
    // Załaduj dane profilu na stronie /user
    function loadUserProfile() {
        if (!currentUser) return;
        document.getElementById('userEmail').textContent = currentUser.email || '';
        document.getElementById('userName').textContent = currentUser.user_metadata?.full_name || '';
    }
    // Załaduj profil przy wejściu na stronę user
    window.addEventListener('popstate', () => {
        if (window.location.pathname === '/user') {
            loadUserProfile();
        }
    });
    // Po zalogowaniu lub sprawdzeniu dostępu renderuj dashboard
    const origShowSection = window.showSection;
    window.showSection = function(sectionId, push) {
        origShowSection(sectionId, push);
        if (sectionId === 'dashboard') {
            renderDashboard();
        }
        if (sectionId === 'user') {
            loadUserProfile();
        }
    };
    // Obsługa powrotu po płatności Stripe
    handleStripeReturn();
}); 