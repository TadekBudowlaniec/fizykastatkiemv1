-- Payment Tester - Setup bazy danych
-- Wykonaj te zapytania w Supabase SQL Editor

-- 1. Tabela dla testowych płatności
CREATE TABLE IF NOT EXISTS test_payments (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    course_id INTEGER,
    price_id VARCHAR(255),
    amount INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'PLN',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    payment_method VARCHAR(50) DEFAULT 'card',
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_test_payments_user_id ON test_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_test_payments_status ON test_payments(status);
CREATE INDEX IF NOT EXISTS idx_test_payments_created_at ON test_payments(created_at);
CREATE INDEX IF NOT EXISTS idx_test_payments_course_id ON test_payments(course_id);

-- 3. Tabela dla logów testowych (opcjonalna)
CREATE TABLE IF NOT EXISTS test_logs (
    id BIGSERIAL PRIMARY KEY,
    test_session_id VARCHAR(255),
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    status VARCHAR(50),
    message TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Indeksy dla logów
CREATE INDEX IF NOT EXISTS idx_test_logs_session_id ON test_logs(test_session_id);
CREATE INDEX IF NOT EXISTS idx_test_logs_user_id ON test_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_test_logs_created_at ON test_logs(created_at);

-- 5. Tabela dla scenariuszy testowych
CREATE TABLE IF NOT EXISTS test_scenarios (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Wstaw przykładowe scenariusze
INSERT INTO test_scenarios (name, description, config) VALUES
('new_user_full_access', 'Nowy użytkownik kupuje pełny dostęp', '{"courseId": "full_access", "expectedEnrollments": 16, "amount": 29900}'),
('existing_user_single_course', 'Istniejący użytkownik kupuje pojedynczy kurs', '{"courseId": 8, "expectedEnrollments": 1, "amount": 1990}'),
('payment_failure_retry', 'Test nieudanej płatności i ponownej próby', '{"courseId": 5, "simulateFailure": true, "retryAfter": 5000}'),
('bulk_users_test', 'Test masowego tworzenia użytkowników', '{"userCount": 10, "randomCourses": true}'),
('access_expiry_test', 'Test różnych dat wygaśnięcia dostępu', '{"courses": [1,2,3,8,10], "varyDates": true}'),
('database_stress_test', 'Test obciążenia bazy danych', '{"operationCount": 50, "concurrent": true}')
ON CONFLICT (name) DO NOTHING;

-- 7. Funkcja do czyszczenia starych danych testowych
CREATE OR REPLACE FUNCTION cleanup_old_test_data(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_payments INTEGER;
    deleted_logs INTEGER;
BEGIN
    -- Usuń stare płatności testowe
    DELETE FROM test_payments 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_payments = ROW_COUNT;
    
    -- Usuń stare logi testowe
    DELETE FROM test_logs 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_logs = ROW_COUNT;
    
    -- Usuń stare enrollments testowe
    DELETE FROM enrollments 
    WHERE user_id LIKE 'TEST_%' 
    AND enrolled_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    RETURN deleted_payments + deleted_logs;
END;
$$ LANGUAGE plpgsql;

-- 8. Funkcja do generowania raportów testowych
CREATE OR REPLACE FUNCTION get_test_report(days_back INTEGER DEFAULT 7)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    WITH payment_stats AS (
        SELECT 
            COUNT(*) as total_payments,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_payments,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
            COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END), 0) as total_revenue
        FROM test_payments 
        WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
    ),
    enrollment_stats AS (
        SELECT 
            COUNT(*) as total_enrollments,
            COUNT(DISTINCT user_id) as unique_users
        FROM enrollments 
        WHERE user_id LIKE 'TEST_%' 
        AND enrolled_at >= NOW() - INTERVAL '1 day' * days_back
    ),
    course_popularity AS (
        SELECT 
            course_id,
            COUNT(*) as enrollment_count
        FROM enrollments 
        WHERE user_id LIKE 'TEST_%' 
        AND enrolled_at >= NOW() - INTERVAL '1 day' * days_back
        GROUP BY course_id
        ORDER BY COUNT(*) DESC
        LIMIT 5
    )
    SELECT jsonb_build_object(
        'period_days', days_back,
        'generated_at', NOW(),
        'payments', row_to_json(payment_stats.*),
        'enrollments', row_to_json(enrollment_stats.*),
        'top_courses', COALESCE(
            (SELECT jsonb_agg(row_to_json(course_popularity.*)) FROM course_popularity),
            '[]'::jsonb
        )
    ) INTO result
    FROM payment_stats, enrollment_stats;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger do automatycznego ustawiania updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_test_payments_updated_at 
    BEFORE UPDATE ON test_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_scenarios_updated_at 
    BEFORE UPDATE ON test_scenarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Polityki RLS (Row Level Security) - opcjonalne
-- Jeśli masz włączone RLS, dodaj odpowiednie polityki

-- ALTER TABLE test_payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE test_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE test_scenarios ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Enable read access for all users" ON test_payments FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON test_payments FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update access for all users" ON test_payments FOR UPDATE USING (true);
-- CREATE POLICY "Enable delete access for all users" ON test_payments FOR DELETE USING (true);

-- 11. Widoki dla łatwiejszego dostępu do danych
CREATE OR REPLACE VIEW test_payment_summary AS
SELECT 
    tp.session_id,
    tp.user_id,
    tp.email,
    tp.course_id,
    tp.amount,
    tp.status,
    tp.created_at,
    COUNT(e.id) as enrollment_count
FROM test_payments tp
LEFT JOIN enrollments e ON tp.user_id = e.user_id 
WHERE tp.user_id LIKE 'TEST_%'
GROUP BY tp.session_id, tp.user_id, tp.email, tp.course_id, tp.amount, tp.status, tp.created_at
ORDER BY tp.created_at DESC;

-- 12. Przykładowe zapytania do testowania

-- Sprawdź wszystkie testowe płatności z ostatnich 24h
-- SELECT * FROM test_payments WHERE created_at >= NOW() - INTERVAL '1 day';

-- Sprawdź enrollments dla testowych użytkowników
-- SELECT * FROM enrollments WHERE user_id LIKE 'TEST_%' ORDER BY enrolled_at DESC;

-- Wygeneruj raport z ostatnich 7 dni
-- SELECT get_test_report(7);

-- Wyczyść dane starsze niż 30 dni
-- SELECT cleanup_old_test_data(30);

-- Sprawdź statystyki success rate
-- SELECT 
--     status,
--     COUNT(*) as count,
--     ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
-- FROM test_payments 
-- GROUP BY status;

COMMENT ON TABLE test_payments IS 'Tabela przechowująca informacje o testowych płatnościach';
COMMENT ON TABLE test_logs IS 'Tabela przechowująca logi z testów płatności';
COMMENT ON TABLE test_scenarios IS 'Tabela z predefiniowanymi scenariuszami testowymi';
COMMENT ON FUNCTION cleanup_old_test_data IS 'Funkcja do czyszczenia starych danych testowych';
COMMENT ON FUNCTION get_test_report IS 'Funkcja generująca raporty z testów płatności';