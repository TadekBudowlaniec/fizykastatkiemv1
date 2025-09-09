#!/bin/bash

# Payment Tester - Przykładowe Skrypty Testowe
# Automatyczne testowanie funkcjonalności systemu płatności

set -e

# Konfiguracja
BASE_URL="http://localhost:3002/api/test"
FRONTEND_URL="http://localhost:8080"

# Kolory dla outputu
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funkcje pomocnicze
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Sprawdź czy backend działa
check_backend() {
    log_info "Sprawdzanie połączenia z backendem..."
    
    if curl -f -s "$BASE_URL/health" > /dev/null; then
        log_success "Backend działa poprawnie"
        return 0
    else
        log_error "Backend nie odpowiada na $BASE_URL"
        log_info "Uruchom backend: node test-backend.js"
        return 1
    fi
}

# Test 1: Health Check
test_health_check() {
    log_info "Test 1: Health Check"
    
    RESPONSE=$(curl -s "$BASE_URL/health")
    STATUS=$(echo "$RESPONSE" | jq -r '.status' 2>/dev/null || echo "error")
    
    if [ "$STATUS" = "healthy" ]; then
        log_success "Health check passed"
        return 0
    else
        log_error "Health check failed: $RESPONSE"
        return 1
    fi
}

# Test 2: Successful Payment
test_successful_payment() {
    log_info "Test 2: Successful Payment"
    
    USER_ID="TEST_script_$(date +%s)"
    EMAIL="test-script@example.com"
    
    RESPONSE=$(curl -s -X POST "$BASE_URL/create-payment-session" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$USER_ID\",
            \"email\": \"$EMAIL\",
            \"courseId\": \"1\",
            \"amount\": 1990,
            \"simulateStatus\": \"success\"
        }")
    
    SESSION_ID=$(echo "$RESPONSE" | jq -r '.sessionId' 2>/dev/null || echo "null")
    STATUS=$(echo "$RESPONSE" | jq -r '.status' 2>/dev/null || echo "null")
    
    if [ "$SESSION_ID" != "null" ] && [ "$STATUS" = "completed" ]; then
        log_success "Payment created successfully: $SESSION_ID"
        
        # Sprawdź status płatności
        PAYMENT_STATUS=$(curl -s "$BASE_URL/payment-status/$SESSION_ID" | jq -r '.status' 2>/dev/null || echo "null")
        
        if [ "$PAYMENT_STATUS" = "completed" ]; then
            log_success "Payment status verified"
            return 0
        else
            log_error "Payment status verification failed: $PAYMENT_STATUS"
            return 1
        fi
    else
        log_error "Payment creation failed: $RESPONSE"
        return 1
    fi
}

# Test 3: Failed Payment
test_failed_payment() {
    log_info "Test 3: Failed Payment"
    
    USER_ID="TEST_failed_$(date +%s)"
    EMAIL="test-failed@example.com"
    
    RESPONSE=$(curl -s -X POST "$BASE_URL/create-payment-session" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$USER_ID\",
            \"email\": \"$EMAIL\",
            \"courseId\": \"5\",
            \"amount\": 1990,
            \"simulateStatus\": \"failed\"
        }")
    
    STATUS=$(echo "$RESPONSE" | jq -r '.status' 2>/dev/null || echo "null")
    
    if [ "$STATUS" = "failed" ]; then
        log_success "Failed payment simulated correctly"
        return 0
    else
        log_error "Failed payment simulation error: $RESPONSE"
        return 1
    fi
}

# Test 4: Access Management
test_access_management() {
    log_info "Test 4: Access Management"
    
    USER_ID="TEST_access_$(date +%s)"
    COURSE_ID="8"
    
    # Grant access
    log_info "Granting access..."
    GRANT_RESPONSE=$(curl -s -X POST "$BASE_URL/manage-access" \
        -H "Content-Type: application/json" \
        -d "{
            \"action\": \"grant\",
            \"userId\": \"$USER_ID\",
            \"courseId\": \"$COURSE_ID\"
        }")
    
    GRANT_SUCCESS=$(echo "$GRANT_RESPONSE" | jq -r '.success' 2>/dev/null || echo "false")
    
    if [ "$GRANT_SUCCESS" = "true" ]; then
        log_success "Access granted successfully"
    else
        log_error "Failed to grant access: $GRANT_RESPONSE"
        return 1
    fi
    
    # Check access
    log_info "Checking access..."
    CHECK_RESPONSE=$(curl -s -X POST "$BASE_URL/manage-access" \
        -H "Content-Type: application/json" \
        -d "{
            \"action\": \"check\",
            \"userId\": \"$USER_ID\",
            \"courseId\": \"$COURSE_ID\"
        }")
    
    HAS_ACCESS=$(echo "$CHECK_RESPONSE" | jq -r '.hasAccess' 2>/dev/null || echo "false")
    
    if [ "$HAS_ACCESS" = "true" ]; then
        log_success "Access verification passed"
    else
        log_error "Access verification failed: $CHECK_RESPONSE"
        return 1
    fi
    
    # Revoke access
    log_info "Revoking access..."
    REVOKE_RESPONSE=$(curl -s -X POST "$BASE_URL/manage-access" \
        -H "Content-Type: application/json" \
        -d "{
            \"action\": \"revoke\",
            \"userId\": \"$USER_ID\",
            \"courseId\": \"$COURSE_ID\"
        }")
    
    REVOKE_SUCCESS=$(echo "$REVOKE_RESPONSE" | jq -r '.success' 2>/dev/null || echo "false")
    
    if [ "$REVOKE_SUCCESS" = "true" ]; then
        log_success "Access revoked successfully"
        return 0
    else
        log_error "Failed to revoke access: $REVOKE_RESPONSE"
        return 1
    fi
}

# Test 5: Full Access Payment
test_full_access_payment() {
    log_info "Test 5: Full Access Payment"
    
    USER_ID="TEST_full_$(date +%s)"
    EMAIL="test-full@example.com"
    
    RESPONSE=$(curl -s -X POST "$BASE_URL/create-payment-session" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$USER_ID\",
            \"email\": \"$EMAIL\",
            \"courseId\": \"full_access\",
            \"amount\": 29900,
            \"simulateStatus\": \"success\"
        }")
    
    SESSION_ID=$(echo "$RESPONSE" | jq -r '.sessionId' 2>/dev/null || echo "null")
    STATUS=$(echo "$RESPONSE" | jq -r '.status' 2>/dev/null || echo "null")
    
    if [ "$SESSION_ID" != "null" ] && [ "$STATUS" = "completed" ]; then
        log_success "Full access payment created: $SESSION_ID"
        
        # Sprawdź ile enrollments zostało utworzonych
        sleep 2  # Poczekaj na przetworzenie
        PAYMENT_DATA=$(curl -s "$BASE_URL/payment-status/$SESSION_ID")
        ENROLLMENTS_COUNT=$(echo "$PAYMENT_DATA" | jq -r '.enrollments | length' 2>/dev/null || echo "0")
        
        if [ "$ENROLLMENTS_COUNT" -eq 16 ]; then
            log_success "All 16 course enrollments created"
            return 0
        else
            log_warning "Expected 16 enrollments, got $ENROLLMENTS_COUNT"
            return 1
        fi
    else
        log_error "Full access payment failed: $RESPONSE"
        return 1
    fi
}

# Test 6: Data Export
test_data_export() {
    log_info "Test 6: Data Export"
    
    RESPONSE=$(curl -s "$BASE_URL/data")
    PAYMENTS_COUNT=$(echo "$RESPONSE" | jq -r '.payments | length' 2>/dev/null || echo "0")
    ENROLLMENTS_COUNT=$(echo "$RESPONSE" | jq -r '.enrollments | length' 2>/dev/null || echo "0")
    
    if [ "$PAYMENTS_COUNT" -gt 0 ] && [ "$ENROLLMENTS_COUNT" -gt 0 ]; then
        log_success "Data export successful: $PAYMENTS_COUNT payments, $ENROLLMENTS_COUNT enrollments"
        return 0
    else
        log_error "Data export failed or no data found"
        return 1
    fi
}

# Test 7: Reports Generation
test_reports() {
    log_info "Test 7: Reports Generation"
    
    RESPONSE=$(curl -s "$BASE_URL/reports")
    TOTAL_TESTS=$(echo "$RESPONSE" | jq -r '.summary.totalTests' 2>/dev/null || echo "0")
    SUCCESS_RATE=$(echo "$RESPONSE" | jq -r '.summary.successRate' 2>/dev/null || echo "0")
    
    if [ "$TOTAL_TESTS" -gt 0 ]; then
        log_success "Reports generated: $TOTAL_TESTS tests, $SUCCESS_RATE% success rate"
        return 0
    else
        log_error "Reports generation failed: $RESPONSE"
        return 1
    fi
}

# Test 8: Webhook Simulation
test_webhook_simulation() {
    log_info "Test 8: Webhook Simulation"
    
    # Najpierw utwórz płatność pending
    USER_ID="TEST_webhook_$(date +%s)"
    
    PAYMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/create-payment-session" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$USER_ID\",
            \"email\": \"test-webhook@example.com\",
            \"courseId\": \"3\",
            \"amount\": 1990,
            \"simulateStatus\": \"pending\"
        }")
    
    SESSION_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.sessionId' 2>/dev/null || echo "null")
    
    if [ "$SESSION_ID" = "null" ]; then
        log_error "Failed to create pending payment for webhook test"
        return 1
    fi
    
    # Symuluj webhook
    WEBHOOK_RESPONSE=$(curl -s -X POST "$BASE_URL/simulate-webhook" \
        -H "Content-Type: application/json" \
        -d "{
            \"sessionId\": \"$SESSION_ID\",
            \"eventType\": \"checkout.session.completed\"
        }")
    
    PROCESSED=$(echo "$WEBHOOK_RESPONSE" | jq -r '.processed' 2>/dev/null || echo "false")
    
    if [ "$PROCESSED" = "true" ]; then
        log_success "Webhook simulation successful"
        return 0
    else
        log_error "Webhook simulation failed: $WEBHOOK_RESPONSE"
        return 1
    fi
}

# Test 9: Stress Test (Mini)
test_stress_mini() {
    log_info "Test 9: Mini Stress Test (5 concurrent payments)"
    
    # Utwórz 5 płatności równocześnie
    PIDS=()
    
    for i in {1..5}; do
        (
            USER_ID="TEST_stress_${i}_$(date +%s)"
            COURSE_ID=$((i % 16 + 1))  # Kursy 1-16
            
            curl -s -X POST "$BASE_URL/create-payment-session" \
                -H "Content-Type: application/json" \
                -d "{
                    \"userId\": \"$USER_ID\",
                    \"email\": \"stress-$i@example.com\",
                    \"courseId\": \"$COURSE_ID\",
                    \"amount\": 1990,
                    \"simulateStatus\": \"success\"
                }" > /tmp/stress_$i.json
        ) &
        PIDS+=($!)
    done
    
    # Poczekaj na wszystkie procesy
    for pid in "${PIDS[@]}"; do
        wait $pid
    done
    
    # Sprawdź wyniki
    SUCCESS_COUNT=0
    for i in {1..5}; do
        if [ -f "/tmp/stress_$i.json" ]; then
            STATUS=$(cat "/tmp/stress_$i.json" | jq -r '.status' 2>/dev/null || echo "null")
            if [ "$STATUS" = "completed" ]; then
                ((SUCCESS_COUNT++))
            fi
            rm -f "/tmp/stress_$i.json"
        fi
    done
    
    if [ "$SUCCESS_COUNT" -eq 5 ]; then
        log_success "Stress test passed: $SUCCESS_COUNT/5 payments successful"
        return 0
    else
        log_warning "Stress test partial success: $SUCCESS_COUNT/5 payments successful"
        return 1
    fi
}

# Test 10: Data Cleanup
test_data_cleanup() {
    log_info "Test 10: Data Cleanup"
    
    # Sprawdź dane przed czyszczeniem
    BEFORE_DATA=$(curl -s "$BASE_URL/data")
    BEFORE_PAYMENTS=$(echo "$BEFORE_DATA" | jq -r '.payments | length' 2>/dev/null || echo "0")
    
    if [ "$BEFORE_PAYMENTS" -eq 0 ]; then
        log_warning "No test data to cleanup"
        return 0
    fi
    
    # Wyczyść dane
    CLEANUP_RESPONSE=$(curl -s -X DELETE "$BASE_URL/clear-data")
    CLEANUP_SUCCESS=$(echo "$CLEANUP_RESPONSE" | jq -r '.success' 2>/dev/null || echo "false")
    
    if [ "$CLEANUP_SUCCESS" = "true" ]; then
        # Sprawdź dane po czyszczeniu
        AFTER_DATA=$(curl -s "$BASE_URL/data")
        AFTER_PAYMENTS=$(echo "$AFTER_DATA" | jq -r '.payments | length' 2>/dev/null || echo "0")
        
        log_success "Data cleanup successful: $BEFORE_PAYMENTS -> $AFTER_PAYMENTS payments"
        return 0
    else
        log_error "Data cleanup failed: $CLEANUP_RESPONSE"
        return 1
    fi
}

# Główna funkcja testowa
run_all_tests() {
    log_info "🧪 Uruchamianie wszystkich testów Payment Tester"
    echo "================================================="
    
    # Sprawdź backend
    if ! check_backend; then
        exit 1
    fi
    
    # Sprawdź czy jq jest dostępne
    if ! command -v jq &> /dev/null; then
        log_warning "jq nie jest zainstalowane. Niektóre testy mogą nie działać poprawnie."
        log_info "Zainstaluj jq: sudo apt-get install jq (Ubuntu/Debian) lub brew install jq (macOS)"
    fi
    
    # Lista testów
    TESTS=(
        "test_health_check"
        "test_successful_payment" 
        "test_failed_payment"
        "test_access_management"
        "test_full_access_payment"
        "test_data_export"
        "test_reports"
        "test_webhook_simulation"
        "test_stress_mini"
        "test_data_cleanup"
    )
    
    # Liczniki
    PASSED=0
    FAILED=0
    
    # Uruchom testy
    for test in "${TESTS[@]}"; do
        echo ""
        if $test; then
            ((PASSED++))
        else
            ((FAILED++))
        fi
    done
    
    # Podsumowanie
    echo ""
    echo "================================================="
    log_info "🏁 Podsumowanie testów:"
    log_success "Testy zaliczone: $PASSED"
    if [ "$FAILED" -gt 0 ]; then
        log_error "Testy niezaliczone: $FAILED"
    else
        log_success "Testy niezaliczone: $FAILED"
    fi
    
    TOTAL=$((PASSED + FAILED))
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
    log_info "Współczynnik sukcesu: $SUCCESS_RATE%"
    
    if [ "$FAILED" -eq 0 ]; then
        log_success "🎉 Wszystkie testy przeszły pomyślnie!"
        return 0
    else
        log_warning "⚠️ Niektóre testy nie przeszły. Sprawdź logi powyżej."
        return 1
    fi
}

# Funkcja pomocy
show_help() {
    echo "Payment Tester - Skrypty testowe"
    echo ""
    echo "Użycie: $0 [opcja]"
    echo ""
    echo "Opcje:"
    echo "  all              Uruchom wszystkie testy (domyślnie)"
    echo "  health           Test health check"
    echo "  payment          Test udanej płatności"
    echo "  failed           Test nieudanej płatności"
    echo "  access           Test zarządzania dostępami"
    echo "  full             Test pełnego dostępu"
    echo "  export           Test eksportu danych"
    echo "  reports          Test generowania raportów"
    echo "  webhook          Test symulacji webhook'ów"
    echo "  stress           Mini test obciążenia"
    echo "  cleanup          Test czyszczenia danych"
    echo "  help             Pokaż tę pomoc"
    echo ""
    echo "Przykłady:"
    echo "  $0                 # Uruchom wszystkie testy"
    echo "  $0 payment         # Uruchom tylko test płatności"
    echo "  $0 cleanup         # Wyczyść dane testowe"
    echo ""
}

# Główna logika
case "${1:-all}" in
    "all")
        run_all_tests
        ;;
    "health")
        check_backend && test_health_check
        ;;
    "payment")
        check_backend && test_successful_payment
        ;;
    "failed")
        check_backend && test_failed_payment
        ;;
    "access")
        check_backend && test_access_management
        ;;
    "full")
        check_backend && test_full_access_payment
        ;;
    "export")
        check_backend && test_data_export
        ;;
    "reports")
        check_backend && test_reports
        ;;
    "webhook")
        check_backend && test_webhook_simulation
        ;;
    "stress")
        check_backend && test_stress_mini
        ;;
    "cleanup")
        check_backend && test_data_cleanup
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        log_error "Nieznana opcja: $1"
        show_help
        exit 1
        ;;
esac