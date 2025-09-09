# Payment Tester - Przykłady API

Poniżej znajdziesz przykłady użycia API backendu testowego.

## 🔧 Podstawowe Informacje

- **Base URL**: `http://localhost:3002`
- **Content-Type**: `application/json`
- **Wszystkie endpointy**: `/api/test/*`

## 📋 Dostępne Endpointy

### 1. Health Check

**GET** `/api/test/health`

```bash
curl http://localhost:3002/api/test/health
```

**Odpowiedź:**
```json
{
  "status": "healthy",
  "service": "Payment Tester Backend",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. Tworzenie Testowej Sesji Płatności

**POST** `/api/test/create-payment-session`

```bash
curl -X POST http://localhost:3002/api/test/create-payment-session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "TEST_user_123",
    "email": "test@example.com",
    "courseId": "8",
    "amount": 1990,
    "simulateStatus": "success"
  }'
```

**Parametry:**
- `userId` (string) - ID użytkownika testowego
- `email` (string) - Email użytkownika
- `courseId` (string/number) - ID kursu lub "full_access"
- `amount` (number) - Kwota w groszach
- `simulateStatus` (string) - "success", "failed", lub "pending"

**Odpowiedź:**
```json
{
  "sessionId": "cs_test_1642248600000_abc123",
  "status": "completed",
  "message": "Test payment completed",
  "userId": "TEST_user_123",
  "courseId": "8"
}
```

### 3. Symulacja Webhook'a

**POST** `/api/test/simulate-webhook`

```bash
curl -X POST http://localhost:3002/api/test/simulate-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "cs_test_1642248600000_abc123",
    "eventType": "checkout.session.completed"
  }'
```

**Odpowiedź:**
```json
{
  "received": true,
  "processed": true,
  "sessionId": "cs_test_1642248600000_abc123",
  "eventType": "checkout.session.completed"
}
```

### 4. Sprawdzanie Statusu Płatności

**GET** `/api/test/payment-status/:sessionId`

```bash
curl http://localhost:3002/api/test/payment-status/cs_test_1642248600000_abc123
```

**Odpowiedź:**
```json
{
  "sessionId": "cs_test_1642248600000_abc123",
  "status": "completed",
  "userId": "TEST_user_123",
  "courseId": "8",
  "amount": 1990,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "enrollments": [
    {
      "id": 1,
      "user_id": "TEST_user_123",
      "course_id": 8,
      "access_granted": true,
      "enrolled_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 5. Zarządzanie Dostępami

**POST** `/api/test/manage-access`

#### Przyznanie dostępu:
```bash
curl -X POST http://localhost:3002/api/test/manage-access \
  -H "Content-Type: application/json" \
  -d '{
    "action": "grant",
    "userId": "TEST_user_123",
    "courseId": "8"
  }'
```

#### Odebranie dostępu:
```bash
curl -X POST http://localhost:3002/api/test/manage-access \
  -H "Content-Type: application/json" \
  -d '{
    "action": "revoke",
    "userId": "TEST_user_123",
    "courseId": "8"
  }'
```

#### Sprawdzenie dostępu:
```bash
curl -X POST http://localhost:3002/api/test/manage-access \
  -H "Content-Type: application/json" \
  -d '{
    "action": "check",
    "userId": "TEST_user_123",
    "courseId": "8"
  }'
```

**Odpowiedź dla check:**
```json
{
  "userId": "TEST_user_123",
  "courseId": "8",
  "hasAccess": true
}
```

### 6. Pobieranie Wszystkich Danych Testowych

**GET** `/api/test/data`

```bash
curl http://localhost:3002/api/test/data
```

**Odpowiedź:**
```json
{
  "payments": [
    {
      "id": 1,
      "session_id": "cs_test_1642248600000_abc123",
      "user_id": "TEST_user_123",
      "email": "test@example.com",
      "course_id": 8,
      "amount": 1990,
      "status": "completed",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "enrollments": [
    {
      "id": 1,
      "user_id": "TEST_user_123",
      "course_id": 8,
      "access_granted": true,
      "enrolled_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "stats": {
    "totalPayments": 1,
    "successfulPayments": 1,
    "totalEnrollments": 1
  }
}
```

### 7. Generowanie Raportów

**GET** `/api/test/reports`

```bash
curl http://localhost:3002/api/test/reports
```

**Odpowiedź:**
```json
{
  "summary": {
    "totalTests": 10,
    "successRate": "90.00",
    "totalUsers": 8,
    "totalRevenue": 159.20
  },
  "paymentsByStatus": {
    "completed": 9,
    "failed": 1
  },
  "coursePopularity": {
    "Termodynamika": 3,
    "Kinematyka": 2,
    "Dynamika": 2
  },
  "timeAnalysis": {
    "last24h": 5,
    "last7days": 8,
    "last30days": 10
  }
}
```

### 8. Czyszczenie Danych Testowych

**DELETE** `/api/test/clear-data`

```bash
curl -X DELETE http://localhost:3002/api/test/clear-data
```

**Odpowiedź:**
```json
{
  "success": true,
  "message": "Test data cleared successfully"
}
```

## 🔄 Przykładowe Scenariusze

### Scenariusz 1: Kompletny Test Płatności

```bash
# 1. Utwórz testową płatność
SESSION_ID=$(curl -s -X POST http://localhost:3002/api/test/create-payment-session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "TEST_user_' $(date +%s) '",
    "email": "test@example.com",
    "courseId": "1",
    "amount": 1990,
    "simulateStatus": "success"
  }' | jq -r '.sessionId')

echo "Session ID: $SESSION_ID"

# 2. Sprawdź status płatności
curl http://localhost:3002/api/test/payment-status/$SESSION_ID

# 3. Symuluj webhook
curl -X POST http://localhost:3002/api/test/simulate-webhook \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION_ID\", \"eventType\": \"checkout.session.completed\"}"
```

### Scenariusz 2: Test Nieudanej Płatności

```bash
# Utwórz nieudaną płatność
curl -X POST http://localhost:3002/api/test/create-payment-session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "TEST_user_failed_' $(date +%s) '",
    "email": "test-failed@example.com",
    "courseId": "5",
    "amount": 1990,
    "simulateStatus": "failed"
  }'
```

### Scenariusz 3: Test Pełnego Dostępu

```bash
# Kup pełny dostęp
curl -X POST http://localhost:3002/api/test/create-payment-session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "TEST_user_full_' $(date +%s) '",
    "email": "test-full@example.com",
    "courseId": "full_access",
    "amount": 29900,
    "simulateStatus": "success"
  }'
```

## 🔍 Debugowanie

### Sprawdzanie Logów

Logi backendu są wyświetlane w konsoli gdzie uruchomiony jest serwer.

### Sprawdzanie Bazy Danych

```bash
# Pobierz wszystkie dane
curl http://localhost:3002/api/test/data | jq '.'

# Sprawdź raporty
curl http://localhost:3002/api/test/reports | jq '.'
```

### Typowe Problemy

1. **Port zajęty**: Zmień port w `.env` lub zabij proces:
   ```bash
   lsof -ti:3002 | xargs kill -9
   ```

2. **Błąd bazy danych**: Sprawdź konfigurację Supabase w `.env`

3. **Brak odpowiedzi**: Sprawdź czy backend działa:
   ```bash
   curl http://localhost:3002/api/test/health
   ```

## 🧪 Automatyzacja Testów

### Bash Script dla Testów

```bash
#!/bin/bash
# test-automation.sh

BASE_URL="http://localhost:3002/api/test"

# Test 1: Health check
echo "Test 1: Health check"
curl -s $BASE_URL/health | jq '.status'

# Test 2: Successful payment
echo "Test 2: Successful payment"
RESPONSE=$(curl -s -X POST $BASE_URL/create-payment-session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "TEST_auto_' $(date +%s) '",
    "email": "auto-test@example.com",
    "courseId": "1",
    "amount": 1990,
    "simulateStatus": "success"
  }')

SESSION_ID=$(echo $RESPONSE | jq -r '.sessionId')
echo "Session created: $SESSION_ID"

# Test 3: Check payment status
echo "Test 3: Payment status"
curl -s $BASE_URL/payment-status/$SESSION_ID | jq '.status'

# Test 4: Get reports
echo "Test 4: Reports"
curl -s $BASE_URL/reports | jq '.summary.totalTests'

echo "All tests completed!"
```

### Python Script dla Testów

```python
#!/usr/bin/env python3
import requests
import json
import time

BASE_URL = "http://localhost:3002/api/test"

def test_payment_flow():
    # Create payment
    payload = {
        "userId": f"TEST_python_{int(time.time())}",
        "email": "python-test@example.com",
        "courseId": "8",
        "amount": 1990,
        "simulateStatus": "success"
    }
    
    response = requests.post(f"{BASE_URL}/create-payment-session", json=payload)
    session_data = response.json()
    
    print(f"Payment created: {session_data['sessionId']}")
    
    # Check status
    status_response = requests.get(f"{BASE_URL}/payment-status/{session_data['sessionId']}")
    status_data = status_response.json()
    
    print(f"Payment status: {status_data['status']}")
    
    return session_data['sessionId']

if __name__ == "__main__":
    session_id = test_payment_flow()
    print(f"Test completed for session: {session_id}")
```

## 📚 Dodatkowe Zasoby

- [Dokumentacja Stripe API](https://stripe.com/docs/api)
- [Dokumentacja Supabase](https://supabase.com/docs)
- [Express.js Documentation](https://expressjs.com/)

## ⚡ Szybkie Komendy

```bash
# Uruchom wszystko
./start.sh

# Tylko backend
node test-backend.js

# Test health
curl http://localhost:3002/api/test/health

# Wyczyść dane
curl -X DELETE http://localhost:3002/api/test/clear-data

# Pobierz raporty
curl http://localhost:3002/api/test/reports | jq '.'
```