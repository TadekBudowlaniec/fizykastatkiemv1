-- ============================================================================
-- Fizyka Statkiem - tabela postępu poziomów (Materiały PDF)
-- ============================================================================
-- Śledzi ukończenie 4 poziomów per dział przez zalogowanego użytkownika.
-- Odblokowuje quiz (zakładka „Zadania") danego działu po ukończeniu 4/4 poziomów.
-- Wzorzec 1:1 jak public.user_tasks (RLS „własne wiersze", upsert onConflict).
--
-- URUCHOM w Supabase → SQL Editor (jednorazowo).
-- ============================================================================

create table if not exists public.user_levels (
  user_id      uuid        not null references auth.users(id) on delete cascade,
  course_id    integer     not null,               -- dział 1..16 (spójnie z resztą repo)
  poziom       smallint    not null check (poziom between 1 and 4),
  completed_at timestamptz not null default now(),
  primary key (user_id, course_id, poziom)          -- idempotentny upsert / delete
);

alter table public.user_levels enable row level security;

-- Odczyt/zapis/usuwanie WYŁĄCZNIE własnych wierszy (jak user_tasks).
drop policy if exists "user_levels_rw_own" on public.user_levels;
create policy "user_levels_rw_own" on public.user_levels
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- WERYFIKACJA ----------
-- select relname, relrowsecurity from pg_class where relname = 'user_levels';
-- select policyname, cmd from pg_policies where tablename = 'user_levels';

-- ---------- ROLLBACK ----------
-- drop policy if exists "user_levels_rw_own" on public.user_levels;
-- drop table if exists public.user_levels;
