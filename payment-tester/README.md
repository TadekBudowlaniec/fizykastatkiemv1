# Payment Tester 🧪

Zaawansowane narzędzie do testowania płatności i manipulacji bazy danych dla systemu opartego na Stripe + Supabase.

## 🚀 Funkcje

### Testowanie Płatności
- ✅ Symulacja udanych płatności
- ❌ Symulacja nieudanych płatności  
- ⏳ Symulacja oczekujących płatności
- 🔄 Automatyczne przetwarzanie webhook'ów

### Manipulacja Bazy Danych
- 👤 Zarządzanie dostępami użytkowników
- 📊 Przegląd danych w czasie rzeczywistym
- 🗄️ Operacje CRUD na enrollments
- 📤 Eksport danych testowych

### Gotowe Scenariusze
- 🆕 Nowy użytkownik - pełny dostęp
- 👤 Istniejący użytkownik - pojedynczy kurs
- 💳 Nieudana płatność - ponowna próba
- 👥 Test masowy (wielu użytkowników)
- ⏰ Test wygasania dostępu
- 🔥 Test obciążenia bazy danych

## 📋 Wymagania

- Node.js >= 16.0.0
- npm lub yarn
- Dostęp do bazy danych Supabase
- Klucze API Stripe (opcjonalnie)

## 🔧 Instalacja

1. **Zainstaluj zależności:**
   ```bash
   cd payment-tester
   npm install
   ```

2. **Skonfiguruj zmienne środowiskowe:**
   Utwórz plik `.env` w katalogu payment-tester:
   ```env
   SUPABASE_URL=https://kldekjrpottsqebueojg.supabase.co
   SUPABASE_ANON_KEY=twoj_klucz_supabase
   STRIPE_SECRET_KEY=sk_test_twoj_klucz_stripe
   TEST_PORT=3002
   ```

3. **Uruchom backend testowy:**
   ```bash
   npm start
   ```

4. **Uruchom frontend (w nowym terminalu):**
   ```bash
   npm run frontend
   ```

5. **Lub uruchom wszystko jednocześnie:**
   ```bash
   npm run full
   ```

## 🌐 Użytkowanie

### Frontend
Otwórz przeglądarkę i przejdź do: `http://localhost:8080`

### Backend API
Backend testowy działa na: `http://localhost:3002`

#### Dostępne endpointy:

**Testowanie płatności:**
- `POST /api/test/create-payment-session` - Tworzy testową sesję płatności
- `POST /api/test/simulate-webhook` - Symuluje webhook Stripe
- `GET /api/test/payment-status/:sessionId` - Sprawdza status płatności

**Zarządzanie dostępami:**
- `POST /api/test/manage-access` - Zarządza dostępami użytkowników

**Dane testowe:**
- `GET /api/test/data` - Pobiera wszystkie dane testowe
- `DELETE /api/test/clear-data` - Czyści dane testowe
- `GET /api/test/reports` - Generuje raporty testowe

**Zdrowie systemu:**
- `GET /api/test/health` - Sprawdza status backendu

## 📊 Interfejs Użytkownika

### Sekcja Testowania Płatności
- Wprowadź dane użytkownika (ID, email)
- Wybierz kurs do zakupu
- Kliknij przycisk symulacji (udana/nieudana/oczekująca)

### Sekcja Manipulacji Bazy Danych
- Zarządzaj dostępami użytkowników
- Przyznawaj/odbieraj dostęp do kursów
- Sprawdzaj status dostępu

### Gotowe Scenariusze
Kliknij na kartę scenariusza, aby uruchomić predefiniowany test:

1. **Nowy Użytkownik - Pełny Dostęp**: Symuluje nowego użytkownika kupującego dostęp do wszystkich kursów
2. **Istniejący Użytkownik - Pojedynczy Kurs**: Użytkownik z dostępem kupuje dodatkowy kurs
3. **Nieudana Płatność - Ponowna Próba**: Symuluje nieudaną płatność, następnie udaną
4. **Test Masowy**: Tworzy wielu testowych użytkowników
5. **Test Wygasania Dostępu**: Testuje różne scenariusze dat wygaśnięcia
6. **Test Obciążenia**: Wykonuje wiele operacji jednocześnie

### Przegląd Bazy Danych
- Wyświetla aktualne dane z tabel enrollments i payments
- Możliwość odświeżania w czasie rzeczywistym
- Eksport danych do pliku JSON

## 🔍 Mapowanie Kursów

```javascript
1: 'Kinematyka'
2: 'Dynamika'
3: 'Praca moc energia'
4: 'Bryła Sztywna'
5: 'Ruch Drgający'
6: 'Fale Mechaniczne'
7: 'Hydrostatyka'
8: 'Termodynamika'
9: 'Grawitacja i Astronomia'
10: 'Elektrostatyka'
11: 'Prąd Elektryczny'
12: 'Magnetyzm'
13: 'Indukcja Elektromagnetyczna'
14: 'Fale Elektromagnetyczne i Optyka'
15: 'Fizyka Atomowa'
16: 'Fizyka Jądrowa i Relatywistyka'
full_access: 'Wszystkie kursy'
```

## 🗄️ Struktura Bazy Danych

### Tabela: test_payments
```sql
CREATE TABLE test_payments (
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
```

### Tabela: enrollments (istniejąca)
```sql
-- Wykorzystuje istniejącą tabelę enrollments
-- user_id, course_id, access_granted, enrolled_at
```

## 🧪 Przykłady Testów

### Test 1: Symulacja Udanej Płatności
```javascript
// Frontend
simulateSuccessfulPayment()

// Lub API call
POST /api/test/create-payment-session
{
    "userId": "TEST_user_123",
    "email": "test@example.com",
    "courseId": "8",
    "amount": 1990,
    "simulateStatus": "success"
}
```

### Test 2: Zarządzanie Dostępami
```javascript
// Przyznaj dostęp
POST /api/test/manage-access
{
    "action": "grant",
    "userId": "TEST_user_123",
    "courseId": "8"
}

// Sprawdź dostęp
POST /api/test/manage-access
{
    "action": "check",
    "userId": "TEST_user_123",
    "courseId": "8"
}
```

## 📈 Raporty i Analityka

System generuje automatyczne raporty zawierające:
- Statystyki płatności (success rate, total revenue)
- Popularność kursów
- Analizę czasową (24h, 7 dni, 30 dni)
- Liczbę użytkowników testowych

## 🔒 Bezpieczeństwo

- Wszystkie dane testowe mają prefix `TEST_`
- Osobne tabele dla danych testowych
- Możliwość czyszczenia danych testowych jednym kliknięciem
- Izolacja od danych produkcyjnych

## 🛠️ Rozwiązywanie Problemów

### Problem: Backend nie startuje
```bash
# Sprawdź czy port 3002 jest wolny
lsof -i :3002

# Zmień port w .env
TEST_PORT=3003
```

### Problem: Brak połączenia z Supabase
```bash
# Sprawdź klucze API w .env
# Upewnij się, że masz odpowiednie uprawnienia
```

### Problem: Frontend nie ładuje się
```bash
# Sprawdź czy Python jest zainstalowany
python3 --version

# Alternatywnie użyj innego serwera HTTP
npx http-server -p 8080
```

## 🔄 Integracja z Istniejącym Systemem

Narzędzie jest zaprojektowane do współpracy z istniejącym systemem:
- Wykorzystuje te same tabele bazy danych
- Kompatybilne z mapowaniem kursów
- Nie ingeruje w produkcyjne dane
- Może być uruchomione równolegle z główną aplikacją

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź logi w konsoli przeglądarki
2. Sprawdź logi backendu w terminalu
3. Upewnij się, że wszystkie zależności są zainstalowane
4. Sprawdź konfigurację zmiennych środowiskowych

## 🎯 Roadmapa

- [ ] Integracja z prawdziwymi webhook'ami Stripe
- [ ] Zaawansowane scenariusze testowe
- [ ] Dashboard analityczny
- [ ] Automatyczne testy regresyjne
- [ ] Export raportów do PDF/Excel
- [ ] Integracja z CI/CD

---

**Utworzono przez:** Payment Tester v1.0.0  
**Licencja:** MIT  
**Ostatnia aktualizacja:** 2024