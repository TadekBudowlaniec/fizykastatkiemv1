#!/bin/bash

# Payment Tester - Skrypt uruchamiający
# Automatycznie konfiguruje i uruchamia narzędzie testowe

set -e

echo "🧪 Payment Tester - Uruchamianie..."
echo "=================================="

# Sprawdź czy Node.js jest zainstalowany
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nie jest zainstalowany. Zainstaluj Node.js >= 16.0.0"
    exit 1
fi

# Sprawdź wersję Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Wymagana wersja Node.js >= 16.0.0, obecna: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) - OK"

# Sprawdź czy npm jest zainstalowany
if ! command -v npm &> /dev/null; then
    echo "❌ npm nie jest zainstalowany"
    exit 1
fi

echo "✅ npm $(npm --version) - OK"

# Przejdź do katalogu payment-tester
cd "$(dirname "$0")"
echo "📁 Katalog roboczy: $(pwd)"

# Sprawdź czy plik package.json istnieje
if [ ! -f "package.json" ]; then
    echo "❌ Nie znaleziono pliku package.json"
    exit 1
fi

# Sprawdź czy node_modules istnieje, jeśli nie - zainstaluj zależności
if [ ! -d "node_modules" ]; then
    echo "📦 Instalowanie zależności..."
    npm install
    echo "✅ Zależności zainstalowane"
else
    echo "✅ Zależności już zainstalowane"
fi

# Sprawdź czy plik .env istnieje
if [ ! -f ".env" ]; then
    echo "⚙️  Tworzenie pliku .env z przykładowej konfiguracji..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Plik .env utworzony z .env.example"
        echo "💡 Możesz edytować plik .env aby dostosować konfigurację"
    else
        echo "⚠️  Nie znaleziono pliku .env.example, tworzę podstawowy .env"
        cat > .env << EOF
SUPABASE_URL=https://kldekjrpottsqebueojg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZGVranJwb3R0c3FlYnVlb2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTc4NTcsImV4cCI6MjA2NzYzMzg1N30.aYCWfbhliWM3yQRyZUDL59IgMOWklwa0ZA4QOSdyLh0
TEST_PORT=3002
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
EOF
        echo "✅ Podstawowy plik .env utworzony"
    fi
else
    echo "✅ Plik .env już istnieje"
fi

# Sprawdź czy porty są wolne
check_port() {
    local port=$1
    if lsof -i :$port &> /dev/null; then
        echo "⚠️  Port $port jest zajęty"
        return 1
    else
        echo "✅ Port $port jest wolny"
        return 0
    fi
}

# Sprawdź port backendu (3002)
if ! check_port 3002; then
    echo "💡 Spróbuj zabić proces na porcie 3002: lsof -ti:3002 | xargs kill -9"
fi

# Sprawdź port frontendu (8080)
if ! check_port 8080; then
    echo "💡 Spróbuj zabić proces na porcie 8080: lsof -ti:8080 | xargs kill -9"
fi

echo ""
echo "🚀 Uruchamianie Payment Tester..."
echo ""

# Funkcja do obsługi sygnału przerwania (Ctrl+C)
cleanup() {
    echo ""
    echo "🛑 Zatrzymywanie serwerów..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    wait
    echo "✅ Serwery zatrzymane"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Uruchom backend w tle
echo "🔧 Uruchamianie backendu testowego (port 3002)..."
node test-backend.js &
BACKEND_PID=$!

# Poczekaj chwilę na uruchomienie backendu
sleep 3

# Sprawdź czy backend działa
if ! curl -s http://localhost:3002/api/test/health &> /dev/null; then
    echo "❌ Backend nie odpowiada na porcie 3002"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Backend uruchomiony (PID: $BACKEND_PID)"

# Uruchom frontend w tle
echo "🌐 Uruchamianie frontendu (port 8080)..."

# Sprawdź czy Python3 jest dostępny
if command -v python3 &> /dev/null; then
    python3 -m http.server 8080 --directory . &> /dev/null &
    FRONTEND_PID=$!
    echo "✅ Frontend uruchomiony z Python3 (PID: $FRONTEND_PID)"
elif command -v python &> /dev/null; then
    python -m http.server 8080 --directory . &> /dev/null &
    FRONTEND_PID=$!
    echo "✅ Frontend uruchomiony z Python (PID: $FRONTEND_PID)"
elif command -v npx &> /dev/null; then
    npx http-server -p 8080 --silent &> /dev/null &
    FRONTEND_PID=$!
    echo "✅ Frontend uruchomiony z http-server (PID: $FRONTEND_PID)"
else
    echo "⚠️  Nie można uruchomić serwera HTTP. Zainstaluj Python3 lub http-server"
    echo "   npm install -g http-server"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Poczekaj chwilę na uruchomienie frontendu
sleep 2

echo ""
echo "🎉 Payment Tester uruchomiony pomyślnie!"
echo "=================================="
echo ""
echo "🌐 Frontend:  http://localhost:8080"
echo "🔧 Backend:   http://localhost:3002"
echo "📊 Health:    http://localhost:3002/api/test/health"
echo ""
echo "💡 Naciśnij Ctrl+C aby zatrzymać serwery"
echo ""

# Opcjonalnie otwórz przeglądarkę
if command -v xdg-open &> /dev/null; then
    echo "🔗 Otwieranie przeglądarki..."
    xdg-open http://localhost:8080 &> /dev/null &
elif command -v open &> /dev/null; then
    echo "🔗 Otwieranie przeglądarki..."
    open http://localhost:8080 &> /dev/null &
fi

# Czekaj na sygnał przerwania
wait $BACKEND_PID $FRONTEND_PID