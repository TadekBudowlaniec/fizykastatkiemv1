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
        const repeatPassword = document.getElementById('registerRepeatPassword').value;
        const name = document.getElementById('registerName').value;
        if (password !== repeatPassword) {
            alert('Hasła nie są takie same.');
            return;
        }
        if (password.length < 8) {
            alert('Hasło musi mieć co najmniej 8 znaków.');
            return;
        }
        if (!/[A-Z]/.test(password)) {
            alert('Hasło musi zawierać co najmniej jedną wielką literę.');
            return;
        }
        // Zapamiętaj e-mail w localStorage
        let emails = JSON.parse(localStorage.getItem('usedEmails') || '[]');
        if (!emails.includes(email)) {
            emails.push(email);
            localStorage.setItem('usedEmails', JSON.stringify(emails));
        }
        await register(email, password, name);
    });
    // Podpowiedzi e-maili przy wejściu na formularz rejestracji
    const registerEmailInput = document.getElementById('registerEmail');
    const registerEmailSuggestions = document.getElementById('registerEmailSuggestions');
    if (registerEmailInput && registerEmailSuggestions) {
        registerEmailInput.addEventListener('focus', () => {
            const emails = JSON.parse(localStorage.getItem('usedEmails') || '[]');
            registerEmailSuggestions.innerHTML = '';
            emails.forEach(email => {
                const option = document.createElement('option');
                option.value = email;
                registerEmailSuggestions.appendChild(option);
            });
        });
    }
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
        // Obsługa formularza zmiany hasła
        const form = document.getElementById('changePasswordForm');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const repeatNewPassword = document.getElementById('repeatNewPassword').value;
                await changePassword(currentPassword, newPassword, repeatNewPassword);
                form.reset();
            };
        }
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

// Funkcja do podglądu hasła
window.togglePassword = function(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
        btn.setAttribute('aria-label', 'Ukryj hasło');
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
        btn.setAttribute('aria-label', 'Pokaż hasło');
    }
} 