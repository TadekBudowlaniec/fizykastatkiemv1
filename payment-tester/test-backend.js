// Payment Tester Backend - Node.js Express Server
// Rozszerza istniejący backend o funkcje testowe

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Konfiguracja Supabase
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://kldekjrpottsqebueojg.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZGVranJwb3R0c3FlYnVlb2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTc4NTcsImV4cCI6MjA2NzYzMzg1N30.aYCWfbhliWM3yQRyZUDL59IgMOWklwa0ZA4QOSdyLh0'
);

// Konfiguracja Stripe (tylko do testów)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Mapowanie kursów
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
    16: 'Fizyka Jądrowa i Relatywistyka'
};

// Endpoint do tworzenia testowej sesji płatności
app.post('/api/test/create-payment-session', async (req, res) => {
    const { userId, email, courseId, amount, simulateStatus = 'success' } = req.body;
    
    console.log(`[TEST] Tworzenie testowej sesji płatności dla ${userId}`);
    
    try {
        // Generuj unikalny session_id
        const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Zapisz testową płatność w bazie danych
        const paymentData = {
            session_id: sessionId,
            user_id: userId,
            email: email,
            course_id: courseId,
            amount: amount,
            status: simulateStatus === 'success' ? 'completed' : 
                   simulateStatus === 'pending' ? 'pending' : 'failed',
            payment_method: 'test_card',
            created_at: new Date().toISOString()
        };
        
        if (simulateStatus === 'failed') {
            paymentData.error_message = 'Test payment failure simulation';
        }
        
        // Wstaw do tabeli payments (jeśli istnieje) lub utwórz lokalnie
        const { data, error } = await supabase
            .from('test_payments')
            .insert([paymentData]);
            
        if (error && error.code === '42P01') {
            // Tabela nie istnieje, utwórz ją
            console.log('[TEST] Tworzenie tabeli test_payments...');
            await createTestTables();
            
            // Spróbuj ponownie
            const { data: retryData, error: retryError } = await supabase
                .from('test_payments')
                .insert([paymentData]);
                
            if (retryError) {
                console.error('Błąd przy tworzeniu testowej płatności:', retryError);
                return res.status(500).json({ error: 'Database error', details: retryError });
            }
        } else if (error) {
            console.error('Błąd przy zapisie testowej płatności:', error);
            return res.status(500).json({ error: 'Database error', details: error });
        }
        
        // Jeśli płatność udana, dodaj enrollments
        if (simulateStatus === 'success') {
            await processSuccessfulTestPayment(userId, courseId);
        }
        
        res.json({
            sessionId: sessionId,
            status: paymentData.status,
            message: `Test payment ${paymentData.status}`,
            userId: userId,
            courseId: courseId
        });
        
    } catch (error) {
        console.error('Błąd podczas tworzenia testowej sesji:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Endpoint do symulacji webhook'a Stripe
app.post('/api/test/simulate-webhook', async (req, res) => {
    const { sessionId, eventType = 'checkout.session.completed' } = req.body;
    
    console.log(`[TEST] Symulacja webhook'a: ${eventType} dla sesji ${sessionId}`);
    
    try {
        // Pobierz dane płatności
        const { data: payments, error } = await supabase
            .from('test_payments')
            .select('*')
            .eq('session_id', sessionId)
            .single();
            
        if (error || !payments) {
            return res.status(404).json({ error: 'Payment session not found' });
        }
        
        if (eventType === 'checkout.session.completed') {
            // Aktualizuj status na completed
            await supabase
                .from('test_payments')
                .update({ status: 'completed', updated_at: new Date().toISOString() })
                .eq('session_id', sessionId);
                
            // Przetwórz udaną płatność
            await processSuccessfulTestPayment(payments.user_id, payments.course_id);
        }
        
        res.json({ 
            received: true, 
            processed: true,
            sessionId: sessionId,
            eventType: eventType
        });
        
    } catch (error) {
        console.error('Błąd podczas symulacji webhook\'a:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Endpoint do sprawdzania statusu testowej płatności
app.get('/api/test/payment-status/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    
    try {
        const { data: payment, error } = await supabase
            .from('test_payments')
            .select('*')
            .eq('session_id', sessionId)
            .single();
            
        if (error || !payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        // Sprawdź enrollments dla tego użytkownika
        const { data: enrollments } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', payment.user_id);
            
        res.json({
            sessionId: sessionId,
            status: payment.status,
            userId: payment.user_id,
            courseId: payment.course_id,
            amount: payment.amount,
            createdAt: payment.created_at,
            enrollments: enrollments || []
        });
        
    } catch (error) {
        console.error('Błąd podczas sprawdzania statusu płatności:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Endpoint do zarządzania dostępami użytkowników (testowy)
app.post('/api/test/manage-access', async (req, res) => {
    const { action, userId, courseId } = req.body;
    
    console.log(`[TEST] Zarządzanie dostępem: ${action} dla użytkownika ${userId}, kurs ${courseId}`);
    
    try {
        switch (action) {
            case 'grant':
                await grantCourseAccess(userId, courseId);
                break;
            case 'revoke':
                await revokeCourseAccess(userId, courseId);
                break;
            case 'check':
                const access = await checkUserAccess(userId, courseId);
                return res.json({ userId, courseId, hasAccess: access });
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
        
        res.json({ 
            success: true, 
            action: action,
            userId: userId,
            courseId: courseId
        });
        
    } catch (error) {
        console.error('Błąd podczas zarządzania dostępem:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Endpoint do pobierania wszystkich danych testowych
app.get('/api/test/data', async (req, res) => {
    try {
        const { data: payments, error: paymentsError } = await supabase
            .from('test_payments')
            .select('*')
            .order('created_at', { ascending: false });
            
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('enrollments')
            .select('*')
            .like('user_id', 'TEST_%')
            .order('enrolled_at', { ascending: false });
            
        res.json({
            payments: payments || [],
            enrollments: enrollments || [],
            stats: {
                totalPayments: payments ? payments.length : 0,
                successfulPayments: payments ? payments.filter(p => p.status === 'completed').length : 0,
                totalEnrollments: enrollments ? enrollments.length : 0
            }
        });
        
    } catch (error) {
        console.error('Błąd podczas pobierania danych testowych:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Endpoint do czyszczenia danych testowych
app.delete('/api/test/clear-data', async (req, res) => {
    console.log('[TEST] Czyszczenie danych testowych...');
    
    try {
        // Usuń testowe płatności
        const { error: paymentsError } = await supabase
            .from('test_payments')
            .delete()
            .neq('id', 0); // usuń wszystkie
            
        // Usuń testowe enrollments
        const { error: enrollmentsError } = await supabase
            .from('enrollments')
            .delete()
            .like('user_id', 'TEST_%');
            
        res.json({ 
            success: true, 
            message: 'Test data cleared successfully' 
        });
        
    } catch (error) {
        console.error('Błąd podczas czyszczenia danych testowych:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Endpoint do generowania raportów testowych
app.get('/api/test/reports', async (req, res) => {
    try {
        const { data: payments } = await supabase
            .from('test_payments')
            .select('*');
            
        const { data: enrollments } = await supabase
            .from('enrollments')
            .select('*')
            .like('user_id', 'TEST_%');
            
        // Analiza danych
        const report = {
            summary: {
                totalTests: payments ? payments.length : 0,
                successRate: payments ? 
                    (payments.filter(p => p.status === 'completed').length / payments.length * 100).toFixed(2) : 0,
                totalUsers: enrollments ? 
                    [...new Set(enrollments.map(e => e.user_id))].length : 0,
                totalRevenue: payments ? 
                    payments.filter(p => p.status === 'completed')
                            .reduce((sum, p) => sum + (p.amount || 0), 0) / 100 : 0
            },
            paymentsByStatus: {},
            coursePopularity: {},
            timeAnalysis: {
                last24h: 0,
                last7days: 0,
                last30days: 0
            }
        };
        
        // Analiza statusów płatności
        if (payments) {
            payments.forEach(payment => {
                report.paymentsByStatus[payment.status] = 
                    (report.paymentsByStatus[payment.status] || 0) + 1;
            });
        }
        
        // Analiza popularności kursów
        if (enrollments) {
            enrollments.forEach(enrollment => {
                const courseName = COURSE_NAMES[enrollment.course_id] || `Course ${enrollment.course_id}`;
                report.coursePopularity[courseName] = 
                    (report.coursePopularity[courseName] || 0) + 1;
            });
        }
        
        // Analiza czasowa
        const now = new Date();
        if (payments) {
            payments.forEach(payment => {
                const paymentDate = new Date(payment.created_at);
                const daysDiff = (now - paymentDate) / (1000 * 60 * 60 * 24);
                
                if (daysDiff <= 1) report.timeAnalysis.last24h++;
                if (daysDiff <= 7) report.timeAnalysis.last7days++;
                if (daysDiff <= 30) report.timeAnalysis.last30days++;
            });
        }
        
        res.json(report);
        
    } catch (error) {
        console.error('Błąd podczas generowania raportu:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Funkcje pomocnicze
async function createTestTables() {
    // Ta funkcja powinna być wywoływana tylko raz, aby utworzyć tabele testowe
    console.log('[TEST] Tworzenie tabel testowych w Supabase...');
    
    // W prawdziwej aplikacji, te tabele powinny być tworzone przez migracje SQL
    // Tutaj pokazuję strukturę, która powinna być utworzona
    
    const createTestPaymentsTable = `
        CREATE TABLE IF NOT EXISTS test_payments (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(255) UNIQUE NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            course_id INTEGER,
            amount INTEGER,
            status VARCHAR(50) DEFAULT 'pending',
            payment_method VARCHAR(50),
            error_message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    `;
    
    // W prawdziwej implementacji, wykonaj te zapytania przez Supabase SQL editor
    console.log('SQL do wykonania w Supabase:');
    console.log(createTestPaymentsTable);
}

async function processSuccessfulTestPayment(userId, courseId) {
    console.log(`[TEST] Przetwarzanie udanej płatności dla użytkownika ${userId}, kurs ${courseId}`);
    
    try {
        if (courseId === 'full_access' || courseId === 17) {
            // Pełny dostęp - dodaj wszystkie kursy
            for (let i = 1; i <= 16; i++) {
                await grantCourseAccess(userId, i);
            }
        } else {
            // Pojedynczy kurs
            await grantCourseAccess(userId, parseInt(courseId));
        }
    } catch (error) {
        console.error('Błąd podczas przetwarzania udanej płatności:', error);
        throw error;
    }
}

async function grantCourseAccess(userId, courseId) {
    const { error } = await supabase
        .from('enrollments')
        .upsert({
            user_id: userId,
            course_id: parseInt(courseId),
            access_granted: true,
            enrolled_at: new Date().toISOString()
        });
        
    if (error) {
        console.error(`Błąd przy przyznawaniu dostępu do kursu ${courseId}:`, error);
        throw error;
    }
    
    console.log(`[TEST] Przyznano dostęp do kursu ${courseId} dla użytkownika ${userId}`);
}

async function revokeCourseAccess(userId, courseId) {
    const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('user_id', userId)
        .eq('course_id', parseInt(courseId));
        
    if (error) {
        console.error(`Błąd przy odbieraniu dostępu do kursu ${courseId}:`, error);
        throw error;
    }
    
    console.log(`[TEST] Odebrano dostęp do kursu ${courseId} dla użytkownika ${userId}`);
}

async function checkUserAccess(userId, courseId = null) {
    let query = supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', userId)
        .eq('access_granted', true);
        
    if (courseId) {
        query = query.eq('course_id', parseInt(courseId));
    }
    
    const { data, error } = await query;
    
    if (error) {
        console.error('Błąd przy sprawdzaniu dostępu:', error);
        throw error;
    }
    
    return courseId ? data && data.length > 0 : data;
}

// Middleware do logowania requestów testowych
app.use('/api/test/*', (req, res, next) => {
    console.log(`[TEST API] ${req.method} ${req.path}`, req.body || req.query);
    next();
});

// Endpoint zdrowia
app.get('/api/test/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Payment Tester Backend',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

const PORT = process.env.TEST_PORT || 3002;
app.listen(PORT, () => {
    console.log(`🧪 Payment Tester Backend listening on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/test/health`);
    console.log(`🔧 Test endpoints available at: http://localhost:${PORT}/api/test/*`);
});

module.exports = app;