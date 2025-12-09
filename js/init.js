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
        const email = document.getElementById('registerEmail');
        const password = document.getElementById('registerPassword');
        const repeatPassword = document.getElementById('registerRepeatPassword');
        const name = document.getElementById('registerName');
        const passwordError = document.getElementById('registerPasswordError');
        const repeatError = document.getElementById('registerRepeatPasswordError');

        clearFieldError(password, passwordError);
        clearFieldError(repeatPassword, repeatError);

        const pwd = password.value;
        const repeat = repeatPassword.value;

        if (pwd.length < 8) {
            setFieldError(password, passwordError, 'Hasło musi mieć co najmniej 8 znaków.');
            return;
        }
        if (!/[A-Z]/.test(pwd)) {
            setFieldError(password, passwordError, 'Hasło musi zawierać co najmniej jedną wielką literę.');
            return;
        }
        if (pwd !== repeat) {
            setFieldError(repeatPassword, repeatError, 'Hasła nie są takie same.');
            return;
        }

        // Zapamiętaj e-mail w localStorage
        let emails = JSON.parse(localStorage.getItem('usedEmails') || '[]');
        if (!emails.includes(email.value)) {
            emails.push(email.value);
            localStorage.setItem('usedEmails', JSON.stringify(emails));
        }
        await register(email.value, pwd, name.value);
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
    // Podpowiedzi i walidacja hasła w locie
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerRepeatPasswordInput = document.getElementById('registerRepeatPassword');
    const passwordHints = document.getElementById('registerPasswordHints');
    const passwordError = document.getElementById('registerPasswordError');
    const repeatError = document.getElementById('registerRepeatPasswordError');

    function updatePasswordHints(value) {
        if (!passwordHints) return;
        const lengthItem = passwordHints.querySelector('[data-req="length"]');
        const uppercaseItem = passwordHints.querySelector('[data-req="uppercase"]');
        if (lengthItem) {
            lengthItem.classList.toggle('valid', value.length >= 8);
        }
        if (uppercaseItem) {
            uppercaseItem.classList.toggle('valid', /[A-Z]/.test(value));
        }
    }

    registerPasswordInput?.addEventListener('input', () => {
        updatePasswordHints(registerPasswordInput.value);
        clearFieldError(registerPasswordInput, passwordError);
    });

    registerRepeatPasswordInput?.addEventListener('input', () => {
        clearFieldError(registerRepeatPasswordInput, repeatError);
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
    
    // Obsługa powrotu po płatności Stripe
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
        // handleStripeReturn() w payments.js obsłuży to
        console.log('Session ID detected, handleStripeReturn will process it');
    }
    // Sprawdzenie sesji użytkownika
    supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            currentUser = user;
            // Najpierw sprawdź uprawnienia (w tym admina)
            checkUserAccess().then(() => {
                showSection(initialSection);
                updateNavigation();
                updateDropdownMenu();
                if (initialSection === 'dashboard') {
                    renderDashboardPanel();
                }
            });
        } else {
            showSection(initialSection);
            updateNavigation();
            updateDropdownMenu();
        }
    });
    // Dodaj obsługę kliknięcia w zakładkę kursy (dashboard)
    const kursBtn = document.querySelector('[data-section="dashboard"], #dashboardBtn, .go-to-dashboard');
    if (kursBtn) {
        kursBtn.addEventListener('click', async () => {
            console.log('Kliknięto przycisk Kurs');
            await checkUserAccess();
            console.log('Wywołuję renderDashboardPanel');
            renderDashboardPanel();
        });
    }
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
    
    // Inicjalizacja breadcrumbs
    if (typeof updateBreadcrumbs === 'function') {
        updateBreadcrumbs(initialSection);
    }
    
    // Obsługa powrotu po płatności Stripe
    handleStripeReturn();
});

function setFieldError(inputEl, errorEl, message) {
    if (inputEl) {
        inputEl.classList.add('input-error');
    }
    if (errorEl) {
        errorEl.textContent = message || '';
        errorEl.classList.remove('hidden');
    }
}

function clearFieldError(inputEl, errorEl) {
    if (inputEl) {
        inputEl.classList.remove('input-error');
    }
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
    }
}

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

// Debug: sprawdź czy jesteś adminem
window.isAdmin = function() {
    return typeof currentUserIsAdmin !== 'undefined' ? currentUserIsAdmin : false;
}; 