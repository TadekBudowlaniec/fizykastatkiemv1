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
        alert('Rejestracja zakończona pomyślnie! Sprawdź swoją skrzynkę email.');
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
        // Add user to users table if not present
        const userId = data.user.id;
        const fullName = data.user.user_metadata?.full_name || data.user.email || '';
        await addUserToDatabase(userId, fullName);
        // Fetch is_admin from public.users
        const { data: userRow } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', userId)
            .single();
        currentUserIsAdmin = !!(userRow && userRow.is_admin);
        console.log('userRow:', userRow);
        console.log('currentUserIsAdmin:', currentUserIsAdmin);
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
        // Pobierz is_admin z tabeli users
        const { data: userRow } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', userId)
            .single();
        currentUserIsAdmin = !!(userRow && userRow.is_admin);
        // Pobierz enrollments
        const { data: enrollments, error } = await supabase
            .from('enrollments')
            .select('course_id, access_granted, enrolled_at')
            .eq('user_id', userId)
            .eq('access_granted', true);
            
        console.log('Raw enrollments from database:', enrollments);
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
    if (currentUserIsAdmin) return true;
    if (!userEnrollments || userEnrollments.length === 0) return false;
    // Konwertuj courseId na string, bo w bazie danych course_id jest typu TEXT
    const courseIdStr = String(courseId);
    return userEnrollments.some(e => e.course_id === courseIdStr || e.course_id === 'full_access');
}

async function changePassword(currentPassword, newPassword, repeatNewPassword) {
    if (newPassword !== repeatNewPassword) {
        alert('Nowe hasła nie są takie same.');
        return;
    }
    if (!currentUser || !currentUser.email) {
        alert('Brak danych użytkownika.');
        return;
    }
    try {
        // Najpierw sprawdź aktualne hasło przez próbę zalogowania
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: currentUser.email,
            password: currentPassword
        });
        if (loginError) {
            alert('Aktualne hasło jest nieprawidłowe.');
            return;
        }
        // Zmień hasło
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