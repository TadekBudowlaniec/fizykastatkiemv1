// Payment Tester - JavaScript Logic
// Integracja z istniejącym systemem Stripe + Supabase

// Konfiguracja
const CONFIG = {
    supabaseUrl: 'https://kldekjrpottsqebueojg.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZGVranJwb3R0c3FlYnVlb2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTc4NTcsImV4cCI6MjA2NzYzMzg1N30.aYCWfbhliWM3yQRyZUDL59IgMOWklwa0ZA4QOSdyLh0',
    backendUrl: 'http://localhost:3001',
    testDataPrefix: 'TEST_'
};

// Mapowanie kursów na priceId (z istniejącego systemu)
const COURSE_PRICE_IDS = {
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
    16: 'price_1Rgt21JLuu6b086bTBuO2djx', // Fizyka Jądrowa i Relatywistyka
    full_access: 'price_1RtPPaJLuu6b086bdmWNAsGI' // Wszystkie materiały
};

const COURSE_NAMES = {
    1: 'Kinematyka',
    2: 'Dynamika',
    3: 'Praca moc energia',
    4: 'Bryła Sztywna',
    5: 'Ruch Drgający',
    6: 'Fale Mechaniczne',
    7: 'Hydrostatyka',
    8: 'Termodynamika',
    9: 'Grawitacja i Astronomia',
    10: 'Elektrostatyka',
    11: 'Prąd Elektryczny',
    12: 'Magnetyzm',
    13: 'Indukcja Elektromagnetyczna',
    14: 'Fale Elektromagnetyczne i Optyka',
    15: 'Fizyka Atomowa',
    16: 'Fizyka Jądrowa i Relatywistyka',
    full_access: 'Wszystkie kursy'
};

// Inicjalizacja Supabase (symulowana - w prawdziwej aplikacji użyj biblioteki Supabase)
let supabaseClient = null;

// Funkcje pomocnicze
function logMessage(message, type = 'info') {
    const logContainer = document.getElementById('logContainer');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.innerHTML = `[${timestamp}] ${message}`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
    
    // Zachowaj tylko ostatnie 50 wpisów
    while (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.firstChild);
    }
}

function showPaymentStatus(status, type = 'info') {
    const statusDisplay = document.getElementById('paymentStatus');
    const statusText = document.getElementById('paymentStatusText');
    statusDisplay.style.display = 'block';
    statusText.textContent = status;
    statusDisplay.className = `status-display ${type}`;
}

function generateTestUserId() {
    return `${CONFIG.testDataPrefix}user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateTestEmail() {
    return `test_${Date.now()}@example.com`;
}

// Symulacja połączenia z bazą danych
class MockSupabaseClient {
    constructor() {
        this.data = {
            enrollments: JSON.parse(localStorage.getItem('test_enrollments') || '[]'),
            payments: JSON.parse(localStorage.getItem('test_payments') || '[]'),
            users: JSON.parse(localStorage.getItem('test_users') || '[]')
        };
    }
    
    saveData() {
        localStorage.setItem('test_enrollments', JSON.stringify(this.data.enrollments));
        localStorage.setItem('test_payments', JSON.stringify(this.data.payments));
        localStorage.setItem('test_users', JSON.stringify(this.data.users));
    }
    
    async from(table) {
        return {
            select: (fields = '*') => ({
                eq: (column, value) => ({
                    execute: async () => {
                        const results = this.data[table].filter(item => item[column] === value);
                        return { data: results, error: null };
                    }
                }),
                execute: async () => {
                    return { data: this.data[table], error: null };
                }
            }),
            insert: (record) => ({
                execute: async () => {
                    const newRecord = { ...record, id: Date.now(), created_at: new Date().toISOString() };
                    this.data[table].push(newRecord);
                    this.saveData();
                    return { data: [newRecord], error: null };
                }
            }),
            upsert: (record) => ({
                execute: async () => {
                    const existingIndex = this.data[table].findIndex(
                        item => item.user_id === record.user_id && item.course_id === record.course_id
                    );
                    
                    if (existingIndex >= 0) {
                        this.data[table][existingIndex] = { ...this.data[table][existingIndex], ...record };
                    } else {
                        const newRecord = { ...record, id: Date.now(), created_at: new Date().toISOString() };
                        this.data[table].push(newRecord);
                    }
                    this.saveData();
                    return { data: [record], error: null };
                }
            }),
            delete: () => ({
                eq: (column, value) => ({
                    execute: async () => {
                        const initialLength = this.data[table].length;
                        this.data[table] = this.data[table].filter(item => item[column] !== value);
                        this.saveData();
                        return { data: null, error: null, count: initialLength - this.data[table].length };
                    }
                })
            })
        };
    }
}

// Inicjalizacja mock klienta
supabaseClient = new MockSupabaseClient();

// Funkcje testowania płatności
async function simulateSuccessfulPayment() {
    const userId = document.getElementById('testUserId').value || generateTestUserId();
    const email = document.getElementById('testUserEmail').value || generateTestEmail();
    const courseId = document.getElementById('courseSelect').value;
    
    logMessage(`🚀 Rozpoczynam symulację udanej płatności dla użytkownika: ${userId}`, 'info');
    
    try {
        // Symulacja sesji Stripe
        const sessionId = `cs_test_${Date.now()}`;
        const priceId = COURSE_PRICE_IDS[courseId];
        
        // Zapisz płatność w bazie danych
        await supabaseClient.from('payments').insert({
            session_id: sessionId,
            user_id: userId,
            email: email,
            course_id: courseId,
            price_id: priceId,
            amount: courseId === 'full_access' ? 29900 : 1990, // ceny w groszach
            status: 'completed',
            payment_method: 'card'
        }).execute();
        
        // Przyznaj dostęp do kursu/kursów
        if (courseId === 'full_access') {
            // Pełny dostęp - dodaj wszystkie kursy
            for (let i = 1; i <= 16; i++) {
                await supabaseClient.from('enrollments').upsert({
                    user_id: userId,
                    course_id: i,
                    access_granted: true,
                    enrolled_at: new Date().toISOString()
                }).execute();
            }
            logMessage(`✅ Przyznano pełny dostęp do wszystkich kursów dla użytkownika: ${userId}`, 'success');
        } else {
            // Pojedynczy kurs
            await supabaseClient.from('enrollments').upsert({
                user_id: userId,
                course_id: parseInt(courseId),
                access_granted: true,
                enrolled_at: new Date().toISOString()
            }).execute();
            logMessage(`✅ Przyznano dostęp do kursu "${COURSE_NAMES[courseId]}" dla użytkownika: ${userId}`, 'success');
        }
        
        showPaymentStatus(`Płatność zakończona pomyślnie! Session ID: ${sessionId}`, 'success');
        
        // Aktualizuj pola formularza
        document.getElementById('testUserId').value = userId;
        document.getElementById('testUserEmail').value = email;
        
        logMessage(`💰 Płatność ${sessionId} zakończona pomyślnie`, 'success');
        
    } catch (error) {
        logMessage(`❌ Błąd podczas symulacji płatności: ${error.message}`, 'error');
        showPaymentStatus(`Błąd: ${error.message}`, 'error');
    }
}

async function simulateFailedPayment() {
    const userId = document.getElementById('testUserId').value || generateTestUserId();
    const email = document.getElementById('testUserEmail').value || generateTestEmail();
    const courseId = document.getElementById('courseSelect').value;
    
    logMessage(`💳 Rozpoczynam symulację nieudanej płatności dla użytkownika: ${userId}`, 'warning');
    
    try {
        const sessionId = `cs_failed_${Date.now()}`;
        const priceId = COURSE_PRICE_IDS[courseId];
        
        // Zapisz nieudaną płatność
        await supabaseClient.from('payments').insert({
            session_id: sessionId,
            user_id: userId,
            email: email,
            course_id: courseId,
            price_id: priceId,
            amount: courseId === 'full_access' ? 29900 : 1990,
            status: 'failed',
            payment_method: 'card',
            error_message: 'Your card was declined. Please try again with a different payment method.'
        }).execute();
        
        showPaymentStatus(`Płatność nieudana! Session ID: ${sessionId}`, 'error');
        logMessage(`❌ Płatność ${sessionId} nieudana - karta została odrzucona`, 'error');
        
        // Aktualizuj pola formularza
        document.getElementById('testUserId').value = userId;
        document.getElementById('testUserEmail').value = email;
        
    } catch (error) {
        logMessage(`❌ Błąd podczas symulacji nieudanej płatności: ${error.message}`, 'error');
        showPaymentStatus(`Błąd: ${error.message}`, 'error');
    }
}

async function simulatePendingPayment() {
    const userId = document.getElementById('testUserId').value || generateTestUserId();
    const email = document.getElementById('testUserEmail').value || generateTestEmail();
    const courseId = document.getElementById('courseSelect').value;
    
    logMessage(`⏳ Rozpoczynam symulację oczekującej płatności dla użytkownika: ${userId}`, 'warning');
    
    try {
        const sessionId = `cs_pending_${Date.now()}`;
        const priceId = COURSE_PRICE_IDS[courseId];
        
        // Zapisz oczekującą płatność
        await supabaseClient.from('payments').insert({
            session_id: sessionId,
            user_id: userId,
            email: email,
            course_id: courseId,
            price_id: priceId,
            amount: courseId === 'full_access' ? 29900 : 1990,
            status: 'pending',
            payment_method: 'card'
        }).execute();
        
        showPaymentStatus(`Płatność oczekuje na potwierdzenie! Session ID: ${sessionId}`, 'warning');
        logMessage(`⏳ Płatność ${sessionId} oczekuje na potwierdzenie`, 'warning');
        
        // Aktualizuj pola formularza
        document.getElementById('testUserId').value = userId;
        document.getElementById('testUserEmail').value = email;
        
        // Symuluj automatyczne potwierdzenie po 5 sekundach
        setTimeout(async () => {
            try {
                // Aktualizuj status płatności na completed
                const payments = supabaseClient.data.payments;
                const paymentIndex = payments.findIndex(p => p.session_id === sessionId);
                if (paymentIndex >= 0) {
                    payments[paymentIndex].status = 'completed';
                    supabaseClient.saveData();
                    
                    // Przyznaj dostęp
                    if (courseId === 'full_access') {
                        for (let i = 1; i <= 16; i++) {
                            await supabaseClient.from('enrollments').upsert({
                                user_id: userId,
                                course_id: i,
                                access_granted: true,
                                enrolled_at: new Date().toISOString()
                            }).execute();
                        }
                    } else {
                        await supabaseClient.from('enrollments').upsert({
                            user_id: userId,
                            course_id: parseInt(courseId),
                            access_granted: true,
                            enrolled_at: new Date().toISOString()
                        }).execute();
                    }
                    
                    logMessage(`✅ Płatność ${sessionId} została automatycznie potwierdzona`, 'success');
                    showPaymentStatus(`Płatność została potwierdzona automatycznie!`, 'success');
                }
            } catch (error) {
                logMessage(`❌ Błąd podczas automatycznego potwierdzania: ${error.message}`, 'error');
            }
        }, 5000);
        
    } catch (error) {
        logMessage(`❌ Błąd podczas symulacji oczekującej płatności: ${error.message}`, 'error');
        showPaymentStatus(`Błąd: ${error.message}`, 'error');
    }
}

// Funkcje manipulacji bazy danych
async function grantAccess() {
    const userId = document.getElementById('dbUserId').value;
    const courseId = document.getElementById('dbCourseId').value;
    
    if (!userId || !courseId) {
        logMessage('❌ Podaj ID użytkownika i wybierz kurs', 'error');
        return;
    }
    
    try {
        await supabaseClient.from('enrollments').upsert({
            user_id: userId,
            course_id: parseInt(courseId),
            access_granted: true,
            enrolled_at: new Date().toISOString()
        }).execute();
        
        logMessage(`✅ Przyznano dostęp do kursu "${COURSE_NAMES[courseId]}" dla użytkownika: ${userId}`, 'success');
    } catch (error) {
        logMessage(`❌ Błąd podczas przyznawania dostępu: ${error.message}`, 'error');
    }
}

async function revokeAccess() {
    const userId = document.getElementById('dbUserId').value;
    const courseId = document.getElementById('dbCourseId').value;
    
    if (!userId || !courseId) {
        logMessage('❌ Podaj ID użytkownika i wybierz kurs', 'error');
        return;
    }
    
    try {
        await supabaseClient.from('enrollments').delete()
            .eq('user_id', userId)
            .eq('course_id', parseInt(courseId))
            .execute();
        
        logMessage(`❌ Odebrano dostęp do kursu "${COURSE_NAMES[courseId]}" dla użytkownika: ${userId}`, 'warning');
    } catch (error) {
        logMessage(`❌ Błąd podczas odbierania dostępu: ${error.message}`, 'error');
    }
}

async function checkUserAccess() {
    const userId = document.getElementById('dbUserId').value;
    
    if (!userId) {
        logMessage('❌ Podaj ID użytkownika', 'error');
        return;
    }
    
    try {
        const { data: enrollments } = await supabaseClient.from('enrollments')
            .select('*')
            .eq('user_id', userId)
            .execute();
        
        if (enrollments.length === 0) {
            logMessage(`ℹ️ Użytkownik ${userId} nie ma dostępu do żadnego kursu`, 'info');
        } else {
            const courseNames = enrollments.map(e => COURSE_NAMES[e.course_id]).join(', ');
            logMessage(`ℹ️ Użytkownik ${userId} ma dostęp do: ${courseNames}`, 'info');
        }
    } catch (error) {
        logMessage(`❌ Błąd podczas sprawdzania dostępu: ${error.message}`, 'error');
    }
}

async function clearAllAccess() {
    const userId = document.getElementById('dbUserId').value;
    
    if (!userId) {
        logMessage('❌ Podaj ID użytkownika', 'error');
        return;
    }
    
    if (!confirm(`Czy na pewno chcesz usunąć wszystkie dostępy dla użytkownika ${userId}?`)) {
        return;
    }
    
    try {
        const { count } = await supabaseClient.from('enrollments').delete()
            .eq('user_id', userId)
            .execute();
        
        logMessage(`🧹 Usunięto ${count || 0} dostępów dla użytkownika: ${userId}`, 'warning');
    } catch (error) {
        logMessage(`❌ Błąd podczas usuwania dostępów: ${error.message}`, 'error');
    }
}

// Funkcje scenariuszy testowych
async function runScenario(scenarioType) {
    logMessage(`🎬 Rozpoczynam scenariusz: ${scenarioType}`, 'info');
    
    switch (scenarioType) {
        case 'new_user_full_access':
            await newUserFullAccessScenario();
            break;
        case 'existing_user_single_course':
            await existingUserSingleCourseScenario();
            break;
        case 'payment_failure_retry':
            await paymentFailureRetryScenario();
            break;
        case 'bulk_users_test':
            await bulkUsersTestScenario();
            break;
        case 'access_expiry_test':
            await accessExpiryTestScenario();
            break;
        case 'database_stress_test':
            await databaseStressTestScenario();
            break;
        default:
            logMessage(`❌ Nieznany scenariusz: ${scenarioType}`, 'error');
    }
}

async function newUserFullAccessScenario() {
    const userId = generateTestUserId();
    const email = generateTestEmail();
    
    // Ustaw dane w formularzu
    document.getElementById('testUserId').value = userId;
    document.getElementById('testUserEmail').value = email;
    document.getElementById('courseSelect').value = 'full_access';
    
    // Symuluj płatność
    await simulateSuccessfulPayment();
    
    logMessage(`✅ Scenariusz "Nowy Użytkownik - Pełny Dostęp" zakończony dla: ${userId}`, 'success');
}

async function existingUserSingleCourseScenario() {
    const userId = generateTestUserId();
    const email = generateTestEmail();
    
    // Najpierw daj dostęp do jednego kursu
    await supabaseClient.from('enrollments').upsert({
        user_id: userId,
        course_id: 1,
        access_granted: true,
        enrolled_at: new Date(Date.now() - 86400000).toISOString() // wczoraj
    }).execute();
    
    logMessage(`ℹ️ Utworzono istniejącego użytkownika z dostępem do Kinematyki: ${userId}`, 'info');
    
    // Teraz kup dodatkowy kurs
    document.getElementById('testUserId').value = userId;
    document.getElementById('testUserEmail').value = email;
    document.getElementById('courseSelect').value = '8'; // Termodynamika
    
    await simulateSuccessfulPayment();
    
    logMessage(`✅ Scenariusz "Istniejący Użytkownik - Pojedynczy Kurs" zakończony dla: ${userId}`, 'success');
}

async function paymentFailureRetryScenario() {
    const userId = generateTestUserId();
    const email = generateTestEmail();
    
    // Ustaw dane
    document.getElementById('testUserId').value = userId;
    document.getElementById('testUserEmail').value = email;
    document.getElementById('courseSelect').value = '5'; // Ruch Drgający
    
    // Pierwsza nieudana próba
    await simulateFailedPayment();
    
    // Poczekaj 2 sekundy i spróbuj ponownie
    setTimeout(async () => {
        logMessage(`🔄 Ponowna próba płatności dla użytkownika: ${userId}`, 'info');
        await simulateSuccessfulPayment();
        logMessage(`✅ Scenariusz "Nieudana Płatność - Ponowna Próba" zakończony dla: ${userId}`, 'success');
    }, 2000);
}

async function bulkUsersTestScenario() {
    const userCount = 10;
    logMessage(`👥 Tworzenie ${userCount} testowych użytkowników...`, 'info');
    
    for (let i = 0; i < userCount; i++) {
        const userId = generateTestUserId();
        const email = generateTestEmail();
        const courseId = Math.floor(Math.random() * 16) + 1; // losowy kurs 1-16
        
        // Symuluj różne statusy płatności
        const paymentStatus = Math.random() > 0.8 ? 'failed' : 'completed';
        
        await supabaseClient.from('payments').insert({
            session_id: `cs_bulk_${Date.now()}_${i}`,
            user_id: userId,
            email: email,
            course_id: courseId,
            price_id: COURSE_PRICE_IDS[courseId],
            amount: 1990,
            status: paymentStatus,
            payment_method: 'card'
        }).execute();
        
        // Jeśli płatność udana, przyznaj dostęp
        if (paymentStatus === 'completed') {
            await supabaseClient.from('enrollments').upsert({
                user_id: userId,
                course_id: courseId,
                access_granted: true,
                enrolled_at: new Date().toISOString()
            }).execute();
        }
        
        if (i % 3 === 0) {
            logMessage(`📊 Utworzono ${i + 1}/${userCount} użytkowników...`, 'info');
        }
    }
    
    logMessage(`✅ Scenariusz "Test Masowy" zakończony - utworzono ${userCount} użytkowników`, 'success');
}

async function accessExpiryTestScenario() {
    const userId = generateTestUserId();
    
    // Utwórz dostępy z różnymi datami
    const courses = [1, 2, 3, 8, 10];
    const dates = [
        new Date(Date.now() - 30 * 86400000), // 30 dni temu
        new Date(Date.now() - 7 * 86400000),  // 7 dni temu
        new Date(Date.now() - 86400000),      // wczoraj
        new Date(),                           // dzisiaj
        new Date(Date.now() + 30 * 86400000)  // za 30 dni
    ];
    
    for (let i = 0; i < courses.length; i++) {
        await supabaseClient.from('enrollments').upsert({
            user_id: userId,
            course_id: courses[i],
            access_granted: true,
            enrolled_at: dates[i].toISOString(),
            expires_at: new Date(dates[i].getTime() + 365 * 86400000).toISOString() // rok później
        }).execute();
    }
    
    logMessage(`✅ Scenariusz "Test Wygasania Dostępu" zakończony dla użytkownika: ${userId}`, 'success');
}

async function databaseStressTestScenario() {
    logMessage(`🔥 Rozpoczynam test obciążenia bazy danych...`, 'warning');
    
    const operations = [];
    
    // 50 równoczesnych operacji
    for (let i = 0; i < 50; i++) {
        const operation = (async () => {
            const userId = generateTestUserId();
            const courseId = Math.floor(Math.random() * 16) + 1;
            
            // Dodaj płatność
            await supabaseClient.from('payments').insert({
                session_id: `cs_stress_${Date.now()}_${i}`,
                user_id: userId,
                email: generateTestEmail(),
                course_id: courseId,
                price_id: COURSE_PRICE_IDS[courseId],
                amount: 1990,
                status: 'completed',
                payment_method: 'card'
            }).execute();
            
            // Dodaj enrollment
            await supabaseClient.from('enrollments').upsert({
                user_id: userId,
                course_id: courseId,
                access_granted: true,
                enrolled_at: new Date().toISOString()
            }).execute();
        })();
        
        operations.push(operation);
    }
    
    const startTime = Date.now();
    await Promise.all(operations);
    const endTime = Date.now();
    
    logMessage(`✅ Test obciążenia zakończony w ${endTime - startTime}ms`, 'success');
}

// Funkcje przeglądu bazy danych
async function refreshDatabaseView() {
    logMessage('🔄 Odświeżanie widoku bazy danych...', 'info');
    
    try {
        const { data: enrollments } = await supabaseClient.from('enrollments').select('*').execute();
        const { data: payments } = await supabaseClient.from('payments').select('*').execute();
        
        const databaseView = document.getElementById('databaseView');
        
        let html = `
            <h3>📋 Enrollments (${enrollments.length} rekordów)</h3>
            <table class="database-table">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Course ID</th>
                        <th>Course Name</th>
                        <th>Access Granted</th>
                        <th>Enrolled At</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        enrollments.slice(0, 20).forEach(enrollment => {
            html += `
                <tr>
                    <td>${enrollment.user_id}</td>
                    <td>${enrollment.course_id}</td>
                    <td>${COURSE_NAMES[enrollment.course_id] || 'Unknown'}</td>
                    <td>${enrollment.access_granted ? '✅' : '❌'}</td>
                    <td>${new Date(enrollment.enrolled_at).toLocaleString()}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
            
            <h3>💳 Payments (${payments.length} rekordów)</h3>
            <table class="database-table">
                <thead>
                    <tr>
                        <th>Session ID</th>
                        <th>User ID</th>
                        <th>Course</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        payments.slice(0, 20).forEach(payment => {
            const statusIcon = payment.status === 'completed' ? '✅' : 
                              payment.status === 'failed' ? '❌' : '⏳';
            html += `
                <tr>
                    <td>${payment.session_id}</td>
                    <td>${payment.user_id}</td>
                    <td>${COURSE_NAMES[payment.course_id] || 'Unknown'}</td>
                    <td>${(payment.amount / 100).toFixed(2)} PLN</td>
                    <td>${statusIcon} ${payment.status}</td>
                    <td>${new Date(payment.created_at).toLocaleString()}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        
        if (enrollments.length > 20 || payments.length > 20) {
            html += '<p><em>Pokazano tylko pierwszych 20 rekordów z każdej tabeli.</em></p>';
        }
        
        databaseView.innerHTML = html;
        
        logMessage(`✅ Odświeżono widok bazy danych (${enrollments.length} enrollments, ${payments.length} payments)`, 'success');
        
    } catch (error) {
        logMessage(`❌ Błąd podczas odświeżania widoku: ${error.message}`, 'error');
    }
}

async function exportData() {
    try {
        const { data: enrollments } = await supabaseClient.from('enrollments').select('*').execute();
        const { data: payments } = await supabaseClient.from('payments').select('*').execute();
        
        const exportData = {
            timestamp: new Date().toISOString(),
            enrollments,
            payments
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `payment-test-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        logMessage('📤 Dane zostały wyeksportowane', 'success');
        
    } catch (error) {
        logMessage(`❌ Błąd podczas eksportu: ${error.message}`, 'error');
    }
}

async function clearTestData() {
    if (!confirm('Czy na pewno chcesz usunąć wszystkie dane testowe? Ta operacja jest nieodwracalna!')) {
        return;
    }
    
    try {
        // Usuń wszystkie dane testowe (z prefiksem TEST_)
        const enrollments = supabaseClient.data.enrollments;
        const payments = supabaseClient.data.payments;
        
        const initialEnrollmentsCount = enrollments.length;
        const initialPaymentsCount = payments.length;
        
        supabaseClient.data.enrollments = enrollments.filter(e => !e.user_id.startsWith(CONFIG.testDataPrefix));
        supabaseClient.data.payments = payments.filter(p => !p.user_id.startsWith(CONFIG.testDataPrefix));
        
        supabaseClient.saveData();
        
        const deletedEnrollments = initialEnrollmentsCount - supabaseClient.data.enrollments.length;
        const deletedPayments = initialPaymentsCount - supabaseClient.data.payments.length;
        
        logMessage(`🗑️ Usunięto ${deletedEnrollments} enrollments i ${deletedPayments} payments`, 'warning');
        
        // Odśwież widok
        await refreshDatabaseView();
        
    } catch (error) {
        logMessage(`❌ Błąd podczas usuwania danych testowych: ${error.message}`, 'error');
    }
}

function clearLog() {
    const logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = '<div class="log-entry log-info">Log wyczyszczony - system gotowy do testowania...</div>';
    logMessage('🧹 Log został wyczyszczony', 'info');
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    logMessage('🚀 Payment Tester uruchomiony i gotowy do pracy!', 'success');
    logMessage('💡 Wybierz opcję testowania lub użyj gotowych scenariuszy', 'info');
    
    // Automatycznie odśwież widok bazy danych
    refreshDatabaseView();
});

// Dodaj obsługę klawiatury
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        simulateSuccessfulPayment();
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
        simulateFailedPayment();
    }
});

// Export funkcji dla użycia w HTML
window.simulateSuccessfulPayment = simulateSuccessfulPayment;
window.simulateFailedPayment = simulateFailedPayment;
window.simulatePendingPayment = simulatePendingPayment;
window.grantAccess = grantAccess;
window.revokeAccess = revokeAccess;
window.checkUserAccess = checkUserAccess;
window.clearAllAccess = clearAllAccess;
window.runScenario = runScenario;
window.refreshDatabaseView = refreshDatabaseView;
window.exportData = exportData;
window.clearTestData = clearTestData;
window.clearLog = clearLog;