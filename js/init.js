// init.js
window.addEventListener('DOMContentLoaded', () => {
    // Obsługa wejścia bezpośrednio na /kurs, /user, /login, /register, /pricing, /home
    const pathToSection = {
        '/home': 'landing',
        '/kurs': 'dashboard',
        '/user': 'user',
        '/login': 'login',
        '/register': 'register',
        '/pricing': 'pricing'
    };
    const initialPath = window.location.pathname;
    let initialSection = pathToSection[initialPath] || 'landing';
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
                showSection(initialSection);
                updateNavigation();
                updateDropdownMenu();
            });
        } else {
            showSection(initialSection);
            updateNavigation();
            updateDropdownMenu();
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
    // Dropdown menu logic
    const dropdownBtn = document.getElementById('dropdownMenuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownProfile = document.getElementById('dropdownProfileLink');
    const dropdownLogin = document.getElementById('dropdownLoginLink');
    const dropdownRegister = document.getElementById('dropdownRegisterLink');
    const dropdownLogout = document.getElementById('dropdownLogoutLink');

    function updateDropdownMenu() {
        if (currentUser) {
            dropdownProfile.classList.remove('hidden');
            dropdownLogout.classList.remove('hidden');
            dropdownLogin.classList.add('hidden');
            dropdownRegister.classList.add('hidden');
        } else {
            dropdownProfile.classList.add('hidden');
            dropdownLogout.classList.add('hidden');
            dropdownLogin.classList.remove('hidden');
            dropdownRegister.classList.remove('hidden');
        }
    }

    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        // Zamknij menu po kliknięciu poza nim
        document.addEventListener('click', (e) => {
            if (!dropdownMenu.contains(e.target) && e.target !== dropdownBtn) {
                dropdownMenu.classList.remove('show');
            }
        });
        // Zamknij menu po kliknięciu linku
        dropdownMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
            });
        });
    }

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
        updateDropdownMenu();
    };
    // Obsługa powrotu po płatności Stripe
    handleStripeReturn();
}); 