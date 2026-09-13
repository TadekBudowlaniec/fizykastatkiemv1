-- ============================================================================
-- Fizyka Statkiem — postęp per plik (Poziom 1 „Teoria i Rozgrzewka")
-- ============================================================================
-- Poziom 1 ma zmienną liczbę PDF-ów per dział i każdy z nich liczy się osobno
-- do postępu działu. Poziomy 2–4 pozostają w public.user_levels (cały poziom).
-- Poziom 0 = lekcja wideo (file = yt_id_wideo) — „obejrzane".
-- Wzorzec 1:1 jak user_levels (RLS „własne wiersze", upsert onConflict).
--
-- URUCHOM w Supabase → SQL Editor (jednorazowo). Do czasu uruchomienia
-- frontend zapisuje postęp plików lokalnie (localStorage) — bez synchronizacji
-- między urządzeniami.
-- ============================================================================

create table if not exists public.user_materialy (
  user_id      uuid        not null references auth.users(id) on delete cascade,
  course_id    integer     not null,               -- dział 1..16
  poziom       smallint    not null check (poziom between 0 and 4), -- 0 = wideo
  file         text        not null,               -- nazwa pliku PDF lub yt_id (poziom 0)
  completed_at timestamptz not null default now(),
  primary key (user_id, course_id, poziom, file)
);

alter table public.user_materialy enable row level security;

drop policy if exists "user_materialy_rw_own" on public.user_materialy;
create policy "user_materialy_rw_own" on public.user_materialy
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- WERYFIKACJA ----------
-- select relname, relrowsecurity from pg_class where relname = 'user_materialy';
-- select policyname, cmd from pg_policies where tablename = 'user_materialy';

-- ---------- ROLLBACK ----------
-- drop policy if exists "user_materialy_rw_own" on public.user_materialy;
-- drop table if exists public.user_materialy;
