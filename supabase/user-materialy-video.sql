-- ============================================================================
-- Fizyka Statkiem — „obejrzane" wideo w postępie działu
-- ============================================================================
-- Rozszerza public.user_materialy o poziom 0 = lekcja wideo (file = yt_id).
-- URUCHOM tylko, jeśli tabelę utworzyłeś PRZED dodaniem tej linii do
-- user-materialy.sql (świeża instalacja ma już check 0..4).
-- ============================================================================

alter table public.user_materialy
  drop constraint if exists user_materialy_poziom_check;
alter table public.user_materialy
  add constraint user_materialy_poziom_check check (poziom between 0 and 4);

-- ---------- WERYFIKACJA ----------
-- select pg_get_constraintdef(oid) from pg_constraint where conname = 'user_materialy_poziom_check';
