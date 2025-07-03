# Backend Setup dla Fizyka Statkiem

## 1. Supabase Konfiguracja

### Tabele do utworzenia:

#### Tabela `enrollments`
```sql
CREATE TABLE enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  access_granted BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- RLS (Row Level Security)
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Polityki RLS
CREATE POLICY "Users can view their own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Tabela `download_logs`
```sql
CREATE TABLE download_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own download logs" ON download_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own download logs" ON download_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Storage Bucket `pdfs`
```sql
-- Utwórz bucket dla PDF
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', false);

-- Polityki dla storage
CREATE POLICY "Users with access can download PDFs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'pdfs' AND 
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE user_id = auth.uid() 
      AND access_granted = true
    )
  );
```

## 2. Backend API Endpoints

### Node.js/Express Przykład:

```javascript
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Tworzenie sesji płatności
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { userId, email, courseId, priceId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId, // ID ceny z Stripe Dashboard
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      customer_email: email,
      metadata: {
        userId: userId,
        courseId: courseId
      }
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Błąd tworzenia sesji:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sprawdzanie statusu płatności
app.get('/api/check-payment-status', async (req, res) => {
  try {
    const { session_id } = req.query;
    
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      // Dodaj dostęp użytkownika
      const { error } = await supabase
        .from('enrollments')
        .upsert({
          user_id: session.metadata.userId,
          course_id: session.metadata.courseId,
          access_granted: true,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 rok
        });

      if (error) throw error;
      
      res.json({ success: true });
    } else {
      res.json({ success: false, error: 'Płatność nie została zrealizowana' });
    }
  } catch (error) {
    console.error('Błąd sprawdzania płatności:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook Stripe
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Dodaj dostęp użytkownika
    await supabase
      .from('enrollments')
      .upsert({
        user_id: session.metadata.userId,
        course_id: session.metadata.courseId,
        access_granted: true,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });
  }

  res.json({ received: true });
});

app.listen(3001, () => {
  console.log('Backend server running on port 3001');
});
```

## 3. Zmienne środowiskowe

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_51RVvveJLuu6b086bkMWivsLTKUamDhivaYv3ObKeMpV2kHSjCKuYE3sijENdGWISCsVBz3RI40MgYX0P1jhL2ICz00B2VbJDF3
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend
FRONTEND_URL=http://localhost:3000
```

## 4. Stripe Dashboard Konfiguracja

1. **Utwórz produkt** w Stripe Dashboard
2. **Dodaj cenę** (99 zł)
3. **Skopiuj Price ID** (price_xxx)
4. **Skonfiguruj webhook** na `https://your-domain.com/api/webhook/stripe`
5. **Dodaj event** `checkout.session.completed`

## 5. Aktualizacja frontend

W `js/main.js` zaktualizuj:
```javascript
const supabaseUrl = 'https://wurtrfsdzcttmhxxqiqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cnRyZnNkemN0dG1oeHhxaXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDA2NjEsImV4cCI6MjA2NzA3NjY2MX0.yudWqtQJuajovtyKkttOzlbUqsY9_oniF2L9HbHTzPg';
```

## 6. Testowanie

1. Uruchom backend server
2. Otwórz aplikację w przeglądarce
3. Zarejestruj się/zaloguj
4. Kliknij "Kup teraz"
5. Przetestuj płatność w trybie testowym Stripe 