// auth.js
async function addUserToDatabase(userId, fullName) {
    const { error } = await supabase
        .from('users')
        .insert({
            id: userId,
            full_name: fullName,
            status: 'active',
            is_admin: false,
            stripe_customer_id: null
        });
    if (error) {
        console.error('Błąd dodawania użytkownika do bazy:', error);
    }
}

async function register(email, password, name) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });
        if (error) throw error;
        if (data && data.user && data.user.id) {
            await addUserToDatabase(data.user.id, name);
        }
        showEmailVerificationPopup();
        showSection('login');
    } catch (error) {
        alert('Błąd rejestracji: ' + error.message);
    }
}

async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) throw error;
        currentUser = data.user;
        const userId = data.user.id;
        const fullName = data.user.user_metadata?.full_name || data.user.email || '';
        await addUserToDatabase(userId, fullName);
        const { data: userRow } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', userId)
            .single();
        currentUserIsAdmin = !!(userRow && userRow.is_admin);
        await checkUserAccess();
        showSection('dashboard');
        updateNavigation();
    } catch (error) {
        alert('Błąd logowania: ' + error.message);
    }
}

async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        currentUser = null;
        userHasAccess = false;
        userEnrollments = [];
        showSection('landing');
        updateNavigation();
    } catch (error) {
        alert('Błąd wylogowania: ' + error.message);
    }
}

async function checkUserAccess() {
    if (!supabase || !currentUser) {
        userHasAccess = false;
        userEnrollments = [];
        currentUserIsAdmin = false;
        return;
    }
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user.id;
        const { data: userRow } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', userId)
            .single();
        currentUserIsAdmin = !!(userRow && userRow.is_admin);
        const { data: enrollments, error } = await supabase
            .from('enrollments')
            .select('course_id, access_granted, enrolled_at')
            .eq('user_id', userId)
            .eq('access_granted', true);

        if (error) {
            userHasAccess = false;
            userEnrollments = [];
            return;
        }
        userEnrollments = enrollments || [];
        userHasAccess = userEnrollments.length > 0;
    } catch (error) {
        userHasAccess = false;
        userEnrollments = [];
        currentUserIsAdmin = false;
    }
}

let currentUserIsAdmin = false;

function hasAccessToCourse(courseId) {
    // UWAGA: currentUserIsAdmin służy TYLKO do sterowania UI.
    // Wszystkie krytyczne sprawdzenia uprawnień są po stronie serwera (RLS/Netlify Functions).
    if (currentUserIsAdmin) {
        return true;
    }

    if (courseId === '0' || courseId === 0) {
        if (!userEnrollments || userEnrollments.length === 0) {
            return false;
        }
        const hasAnyAccess = userEnrollments.some(e => {
            return e.course_id === 'full_access' || (typeof e.course_id === 'number' && e.course_id > 0);
        });
        return hasAnyAccess;
    }

    if (!userEnrollments || userEnrollments.length === 0) {
        return false;
    }

    const courseIdNum = Number(courseId);
    const courseIdStr = String(courseId);

    const hasAccess = userEnrollments.some(e => {
        return e.course_id === courseIdNum || e.course_id === courseIdStr || e.course_id === 'full_access';
    });

    return hasAccess;
}

async function changePassword(currentPassword, newPassword, repeatNewPassword) {
    if (newPassword !== repeatNewPassword) {
        alert('Nowe hasła nie są takie same.');
        return;
    }
    if (newPassword.length < 8) {
        alert('Nowe hasło musi mieć co najmniej 8 znaków.');
        return;
    }
    if (!/[A-Z]/.test(newPassword)) {
        alert('Nowe hasło musi zawierać co najmniej jedną wielką literę.');
        return;
    }
    if (!currentUser || !currentUser.email) {
        alert('Brak danych użytkownika.');
        return;
    }
    try {
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: currentUser.email,
            password: currentPassword
        });
        if (loginError) {
            alert('Aktualne hasło jest nieprawidłowe.');
            return;
        }
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (updateError) {
            alert('Błąd zmiany hasła: ' + updateError.message);
            return;
        }
        alert('Hasło zostało zmienione!');
    } catch (error) {
        alert('Błąd zmiany hasła: ' + error.message);
    }
}

function showEmailVerificationPopup() {
    const popup = document.getElementById('registerConfirmPopup');
    if (!popup) {
        alert('Rejestracja zakończona pomyślnie! Sprawdź swoją skrzynkę email.');
        return;
    }
    popup.classList.remove('hidden');
    const primaryButton = popup.querySelector('[data-action="confirm-email-ok"]');
    if (primaryButton) {
        primaryButton.focus();
    }
}

function hideEmailVerificationPopup() {
    const popup = document.getElementById('registerConfirmPopup');
    if (popup) {
        popup.classList.add('hidden');
    }
}
