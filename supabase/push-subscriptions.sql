-- ============================================================================
-- Subskrypcje Web Push administratorów (panel /admin jako PWA na telefonie).
-- Jeden wiersz = jedno urządzenie/przeglądarka. Funkcje Netlify wysyłają
-- powiadomienia przez web-push (VAPID); wygasłe subskrypcje (404/410) są
-- usuwane przy wysyłce. Dostęp WYŁĄCZNIE przez service_role (RLS włączone,
-- brak polityk - anon/authenticated nic tu nie widzą).
--
-- Uruchom raz w Supabase → SQL Editor.
-- ============================================================================

create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  endpoint     text not null unique,
  p256dh       text not null,
  auth         text not null,
  user_email   text not null,            -- admin, który włączył powiadomienia
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists push_subscriptions_user_email_idx
  on public.push_subscriptions (user_email);

alter table public.push_subscriptions enable row level security;
