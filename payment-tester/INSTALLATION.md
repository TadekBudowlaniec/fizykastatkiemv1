# 🔧 Instalacja Payment Tester

Szczegółowy przewodnik instalacji i konfiguracji narzędzia testowego płatności.

## 📋 Wymagania Wstępne

### Systemu
- **Node.js** >= 16.0.0
- **npm** >= 7.0.0  
- **Python 3.x** (dla serwera HTTP frontendu)
- **Git** (opcjonalnie)

### Sprawdzenie wersji
```bash
node --version    # v16.0.0 lub nowszy
npm --version     # 7.0.0 lub nowszy
python3 --version # 3.6.0 lub nowszy
```

### Usługi Zewnętrzne
- **Supabase** - działająca instancja z bazą danych
- **Stripe** - konto testowe (opcjonalnie)

## 🚀 Instalacja Krok po Krok

### 1. Przygotowanie Środowiska

```bash
# Przejdź do katalogu projektu
cd /workspace/payment-tester

# Sprawdź zawartość
ls -la
```

### 2. Instalacja Zależności

```bash
# Zainstaluj zależności Node.js
npm install

# Sprawdź czy instalacja przebiegła pomyślnie
npm list --depth=0
```

### 3. Konfiguracja Środowiska

```bash
# Skopiuj przykładowy plik konfiguracji
cp .env.example .env

# Edytuj plik .env
nano .env  # lub vim .env
```

**Przykład konfiguracji .env:**
```env
# Supabase (WYMAGANE)
SUPABASE_URL=https://kldekjrpottsqebueojg.supabase.co
SUPABASE_ANON_KEY=twoj_klucz_supabase

# Stripe (OPCJONALNE - dla prawdziwych testów)
STRIPE_SECRET_KEY=sk_test_twoj_klucz_stripe
STRIPE_WEBHOOK_SECRET=whsec_twoj_webhook_secret

# Serwer testowy
TEST_PORT=3002
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# Prefiks danych testowych
TEST_DATA_PREFIX=TEST_
```

### 4. Konfiguracja Bazy Danych Supabase

#### Opcja A: Automatyczne (Zalecane)

1. Zaloguj się do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz swój projekt
3. Przejdź do **SQL Editor**
4. Otwórz plik `database-setup.sql` z tego repozytorium
5. Skopiuj i wklej całą zawartość do SQL Editor
6. Kliknij **Run** aby wykonać zapytania

#### Opcja B: Ręczna

Wykonaj poniższe zapytania SQL w kolejności:

```sql
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
    status VARCHAR(50) DEFAULT 'pending',
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
```

### 5. Testowanie Instalacji

```bash
# Test backendu
node test-backend.js &
BACKEND_PID=$!

# Sprawdź czy backend działa
curl http://localhost:3002/api/test/health

# Zatrzymaj backend
kill $BACKEND_PID
```

### 6. Uruchomienie Pełne

```bash
# Użyj skryptu uruchamiającego
./start.sh

# Lub uruchom ręcznie w osobnych terminalach:
# Terminal 1 - Backend
node test-backend.js

# Terminal 2 - Frontend  
python3 -m http.server 8080
```

## 🔍 Weryfikacja Instalacji

### 1. Sprawdź Backend
```bash
curl http://localhost:3002/api/test/health
```

**Oczekiwana odpowiedź:**
```json
{
  "status": "healthy",
  "service": "Payment Tester Backend",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. Sprawdź Frontend
Otwórz przeglądarkę i przejdź do: `http://localhost:8080`

### 3. Test Funkcjonalności
```bash
# Utwórz testową płatność
curl -X POST http://localhost:3002/api/test/create-payment-session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "TEST_install_check",
    "email": "test@example.com",
    "courseId": "1",
    "amount": 1990,
    "simulateStatus": "success"
  }'
```

### 4. Sprawdź Dane w Bazie
```bash
curl http://localhost:3002/api/test/data
```

## 🛠️ Rozwiązywanie Problemów

### Problem: Port zajęty

```bash
# Sprawdź co używa portu
lsof -i :3002
lsof -i :8080

# Zabij proces
kill -9 $(lsof -ti:3002)
kill -9 $(lsof -ti:8080)

# Lub zmień port w .env
echo "TEST_PORT=3003" >> .env
```

### Problem: Błąd połączenia z Supabase

1. **Sprawdź klucze API:**
   ```bash
   # W pliku .env sprawdź:
   SUPABASE_URL=https://twoj-projekt.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJ...
   ```

2. **Sprawdź uprawnienia:**
   - Klucz `anon` musi mieć uprawnienia do tabel
   - Sprawdź RLS (Row Level Security) w Supabase

3. **Test połączenia:**
   ```bash
   curl -H "apikey: twoj_klucz" \
        -H "Authorization: Bearer twoj_klucz" \
        https://twoj-projekt.supabase.co/rest/v1/
   ```

### Problem: Brak tabeli test_payments

```bash
# Sprawdź czy tabela istnieje w Supabase Dashboard
# Lub wykonaj ponownie database-setup.sql
```

### Problem: Błędy npm install

```bash
# Wyczyść cache npm
npm cache clean --force

# Usuń node_modules i package-lock.json
rm -rf node_modules package-lock.json

# Zainstaluj ponownie
npm install
```

### Problem: Python nie działa

```bash
# Sprawdź dostępne wersje
python --version
python3 --version

# Alternatywnie użyj http-server
npm install -g http-server
http-server -p 8080

# Lub serve
npm install -g serve
serve -s . -p 8080
```

## 🔒 Konfiguracja Bezpieczeństwa

### 1. Zmienne Środowiskowe

```bash
# Nigdy nie commituj prawdziwych kluczy!
echo ".env" >> .gitignore

# Użyj różnych kluczy dla różnych środowisk
cp .env .env.development
cp .env .env.production
```

### 2. Ograniczenia Testowe

```env
# W pliku .env
MAX_TEST_USERS=1000
MAX_TEST_PAYMENTS=5000
TEST_SESSION_TIMEOUT=3600
```

### 3. Automatyczne Czyszczenie

```bash
# Ustaw automatyczne czyszczenie starych danych
echo "AUTO_CLEANUP_TEST_DATA=true" >> .env
echo "TEST_DATA_RETENTION_DAYS=7" >> .env
```

## 📊 Monitoring i Logi

### 1. Logi Backendu

```bash
# Uruchom z szczegółowymi logami
DEBUG=payment-tester:* node test-backend.js

# Zapisz logi do pliku
node test-backend.js > logs/backend.log 2>&1 &
```

### 2. Monitoring Bazy Danych

```sql
-- Sprawdź liczbę testowych rekordów
SELECT 
    'payments' as table_name,
    COUNT(*) as count 
FROM test_payments
UNION ALL
SELECT 
    'enrollments' as table_name,
    COUNT(*) as count 
FROM enrollments 
WHERE user_id LIKE 'TEST_%';
```

### 3. Health Checks

```bash
# Skrypt monitorujący
#!/bin/bash
while true; do
    if curl -f http://localhost:3002/api/test/health > /dev/null 2>&1; then
        echo "$(date): Backend OK"
    else
        echo "$(date): Backend ERROR"
    fi
    sleep 30
done
```

## 🔄 Aktualizacja

### 1. Aktualizacja Zależności

```bash
# Sprawdź dostępne aktualizacje
npm outdated

# Aktualizuj wszystkie zależności
npm update

# Aktualizuj konkretną zależność
npm install express@latest
```

### 2. Aktualizacja Bazy Danych

```bash
# Wykonaj nowe migracje w database-setup.sql
# Sprawdź czy nowe funkcje działają poprawnie
```

### 3. Backup Danych Testowych

```bash
# Eksportuj dane przed aktualizacją
curl http://localhost:3002/api/test/data > backup-$(date +%Y%m%d).json
```

## 📝 Następne Kroki

Po pomyślnej instalacji:

1. **Przeczytaj dokumentację:** `README.md`
2. **Sprawdź przykłady API:** `api-examples.md` 
3. **Zobacz demo:** Otwórz `demo.html` w przeglądarce
4. **Uruchom testy:** Użyj interfejsu webowego lub API
5. **Dostosuj konfigurację:** Edytuj `.env` według potrzeb

## 📞 Wsparcie

W przypadku problemów:

1. **Sprawdź logi** w konsoli backendu
2. **Sprawdź network tab** w przeglądarce
3. **Sprawdź konfigurację** w pliku `.env`
4. **Sprawdź połączenie** z bazą danych Supabase

---

**Pomyślnej instalacji i testowania! 🎉**