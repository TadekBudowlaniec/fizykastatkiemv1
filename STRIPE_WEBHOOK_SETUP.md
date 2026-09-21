# 🔧 Konfiguracja Stripe Webhook

## ✅ System płatności został naprawiony!

Wszystkie przyciski teraz używają `buyAccess()` zamiast `buyViaLink()`, co oznacza, że:

1. ✅ **Użytkownicy są przekierowywani do Stripe Checkout**
2. ✅ **Po udanej płatności Stripe wyśle webhook**
3. ✅ **Backend automatycznie zaktualizuje bazę danych**
4. ✅ **Użytkownik otrzyma dostęp do kursu**

## 🚀 Konfiguracja webhook w Stripe Dashboard

### 1. Przejdź do Stripe Dashboard
- Zaloguj się do [dashboard.stripe.com](https://dashboard.stripe.com)
- Przejdź do **Developers** → **Webhooks**

### 2. Utwórz nowy webhook
- Kliknij **"Add endpoint"**
- **Endpoint URL**: `https://your-domain.com/api/webhook`
  - Zastąp `your-domain.com` adresem Twojego serwera
  - Przykład: `https://fizykastatkiem.com/api/webhook`

### 3. Wybierz eventy do nasłuchiwania
Wybierz te eventy:
- ✅ `checkout.session.completed` - **WYMAGANE**
- ✅ `checkout.session.async_payment_succeeded` - **WYMAGANE** (Klarna i inne płatności odroczone)
- ✅ `checkout.session.async_payment_failed` - push do admina o nieudanej płatności odroczonej
- ✅ `charge.refunded` - push do admina o zwrocie
- ✅ `charge.dispute.created` - push do admina o chargebacku
- `payment_intent.succeeded`, `invoice.payment_succeeded` - opcjonalne (ignorowane przez kod)

Szczegóły powiadomień push: `docs/PWA_PUSH_ADMIN.md`.

### 4. Skopiuj Webhook Secret
- Po utworzeniu webhook, skopiuj **Signing secret**
- Wygląda jak: `whsec_1234567890abcdef...`

### 5. Dodaj do zmiennych środowiskowych
W pliku `.env` w folderze `backend/`:

```env
STRIPE_WEBHOOK_SECRET=whsec_twoj_webhook_secret_tutaj
```

### 6. Uruchom backend
```bash
cd backend
npm start
```

## 🧪 Testowanie systemu

### 1. Test lokalny
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend (jeśli używasz serwera lokalnego)
# Otwórz index.html w przeglądarce
```

### 2. Test płatności
1. Otwórz stronę w przeglądarce
2. Zaloguj się lub zarejestruj
3. Kliknij "Kup teraz" na dowolnym kursie
4. Przejdź przez proces płatności Stripe
5. Po udanej płatności użytkownik powinien mieć dostęp do kursu

### 3. Sprawdzenie logów
W terminalu backend zobaczysz:
```
Webhook received: checkout.session.completed
Processing completed session: cs_xxx
Price ID from session: price_xxx
Mapped course ID: 1
✅ Access granted for user xxx to course 1
```

## 🔍 Rozwiązywanie problemów

### Problem: Webhook nie jest wywoływany
**Rozwiązanie:**
1. Sprawdź czy URL webhook jest poprawny
2. Sprawdź czy backend jest dostępny z internetu
3. Użyj ngrok dla testów lokalnych: `ngrok http 3001`

### Problem: "Webhook signature verification failed"
**Rozwiązanie:**
1. Sprawdź czy `STRIPE_WEBHOOK_SECRET` jest poprawny
2. Skopiuj ponownie secret z Stripe Dashboard

### Problem: "Session missing required metadata"
**Rozwiązanie:**
1. Sprawdź czy `buyAccess()` przekazuje `userId` w metadanych
2. Upewnij się, że użytkownik jest zalogowany

### Problem: Użytkownik nie ma dostępu po płatności
**Rozwiązanie:**
1. Sprawdź logi backend
2. Sprawdź czy webhook został wywołany
3. Sprawdź bazę danych Supabase

## 📊 Monitorowanie

### Stripe Dashboard
- **Webhooks** → **Logs** - zobacz historię webhooków
- **Payments** - zobacz udane płatności

### Backend Logs
```bash
# W terminalu backend
tail -f logs/app.log  # jeśli masz logi w pliku
# lub po prostu obserwuj terminal
```

### Supabase Dashboard
- **Table Editor** → **enrollments** - sprawdź czy są nowe wpisy
- **Table Editor** → **users** - sprawdź czy użytkownicy są tworzeni

## 🎯 Gotowe!

Po skonfigurowaniu webhook system będzie działał automatycznie:

1. **Użytkownik klika "Kup teraz"**
2. **Przekierowanie do Stripe Checkout**
3. **Udana płatność**
4. **Stripe wyśle webhook**
5. **Backend zaktualizuje bazę danych**
6. **Użytkownik ma dostęp do kursu**

Wszystko dzieje się automatycznie! 🚀
