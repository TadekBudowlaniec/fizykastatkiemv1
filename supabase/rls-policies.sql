-- ============================================================================
-- Fizyka Statkiem — RLS (Row Level Security) dla płatnych treści
-- ============================================================================
-- PROBLEM (audyt): kluczem anon można było czytać całą tabelę `video`, `tasks`,
-- `task_images` (płatne lekcje/zadania) oraz `enrollments` (kto co kupił).
--
-- Ten skrypt ogranicza SELECT do: modułu darmowego (course_id = 0), użytkowników
-- z aktywnym enrollmentem na dany dział, oraz adminów. `service_role` (webhook,
-- get-pdf-url) OMIJA RLS automatycznie, więc backend działa bez zmian.
--
-- ⚠️ URUCHOM ŚWIADOMIE. Nie mogłem tego przetestować na żywej bazie.
--   1) Najpierw wykonaj SEKCJĘ 0 (inspekcja) i sprawdź istniejące polityki.
--   2) Zastosuj SEKCJĘ 1–4.
--   3) Wykonaj SEKCJĘ „WERYFIKACJA".
--   4) Gdyby coś nie działało — SEKCJA „ROLLBACK" na dole.
-- Zakładam kolumny: video.course_id, tasks.course_id, task_images.task_id,
--   enrollments(user_id, course_id, access_granted), users(id, is_admin).
-- ============================================================================

-- ---------- SEKCJA 0: INSPEKCJA (uruchom najpierw, nic nie zmienia) ----------
-- Pokazuje obecny stan RLS i istniejące polityki — jeśli jest tam permisywna
-- polityka „allow all / to public", trzeba ją usunąć (patrz komentarz niżej).
select relname, relrowsecurity as rls_enabled
from pg_class
where relname in ('video','video_segments','tasks','task_images','enrollments','users','user_tasks','study_plans');

select schemaname, tablename, policyname, cmd, roles, qual
from pg_policies
where tablename in ('video','video_segments','tasks','task_images','enrollments','users','user_tasks','study_plans')
order by tablename, policyname;

-- Jeśli powyżej istnieje permisywna polityka SELECT (np. "Enable read access for all"),
-- usuń ją PRZED dodaniem nowych (patrz SEKCJA 0.5).

-- ---------- SEKCJA 0.5: USUŃ STARE PERMISYWNE POLITYKI (WYMAGANE!) ----------
-- WAŻNE: Postgres łączy polityki PERMISSIVE operatorem OR. Dopóki istnieje
-- którakolwiek „allow all" (qual = true, rola public), nowe restrykcyjne
-- polityki NIC nie dają — każdy nadal czyta wszystko. Najpierw je usuń.
-- Nazwy pochodzą z Twojej inspekcji (SEKCJA 0).

-- Płatne treści czytane obecnie przez „wszystkich":
drop policy if exists "Enable read access for all users" on public.video;
drop policy if exists "Enable read access for all users" on public.video_segments;
drop policy if exists "Enable read access for all users" on public.enrollments;
drop policy if exists "Anyone can view active tasks"     on public.tasks;
drop policy if exists "Anyone can view task images"      on public.task_images;

-- users: „Allow select for authenticated (true)" = każdy zalogowany widzi
-- e-maile WSZYSTKICH. Usuwamy — SEKCJA 7 daje odczyt tylko własnego wiersza.
drop policy if exists "Allow select for authenticated" on public.users;

-- enrollments: KRYTYCZNE — klient NIE może wstawiać enrollmentów (inaczej
-- zalogowany user mógłby sam sobie nadać dostęp do płatnego działu).
-- Enrollmenty pisze wyłącznie webhook (service_role, omija RLS). Aplikacja
-- nigdy nie wstawia enrollmentów z klienta, więc to bezpieczne.
drop policy if exists "Allow insert for authenticated" on public.enrollments;

-- users: nadmiarowe/luźne polityki insert — zastępuje je jedna z blokadą
-- eskalacji is_admin (SEKCJA 7). Wiersz i tak tworzy trigger on_auth_user_created.
drop policy if exists "Allow insert for authenticated"             on public.users;
drop policy if exists "Enable insert for authenticated users only" on public.users;

-- users: stara polityka UPDATE (rola public) — zastępuje ją users_update_self
-- (SEKCJA 7, z twardą blokadą is_admin). Usunięcie = jedna kanoniczna reguła.
drop policy if exists "Users can update own profile except is_admin" on public.users;

-- ---------- SEKCJA 1: enrollments (własne wiersze) ----------
alter table public.enrollments enable row level security;
drop policy if exists "enrollments_select_own" on public.enrollments;
create policy "enrollments_select_own" on public.enrollments
  for select to authenticated
  using (auth.uid() = user_id);

-- ---------- SEKCJA 2: video (darmowy dział 0 / zapisani / admin) ----------
alter table public.video enable row level security;
drop policy if exists "video_select_access" on public.video;
create policy "video_select_access" on public.video
  for select to anon, authenticated
  using (
    course_id = 0
    or exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid()
        and e.course_id = video.course_id
        and e.access_granted = true
    )
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.is_admin = true
    )
  );

-- video_segments (kolumna video_id przechowuje course_id)
alter table public.video_segments enable row level security;
drop policy if exists "video_segments_select_access" on public.video_segments;
create policy "video_segments_select_access" on public.video_segments
  for select to anon, authenticated
  using (
    video_id = 0
    or exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid()
        and e.course_id = video_segments.video_id
        and e.access_granted = true
    )
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.is_admin = true
    )
  );

-- ---------- SEKCJA 3: tasks (darmowy dział 0 / zapisani / admin) ----------
alter table public.tasks enable row level security;
drop policy if exists "tasks_select_access" on public.tasks;
create policy "tasks_select_access" on public.tasks
  for select to anon, authenticated
  using (
    course_id = 0
    or exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid()
        and e.course_id = tasks.course_id
        and e.access_granted = true
    )
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.is_admin = true
    )
  );

-- ---------- SEKCJA 4: task_images (darmowy dział 0 / przez tasks -> enrollments) ----------
alter table public.task_images enable row level security;
drop policy if exists "task_images_select_access" on public.task_images;
create policy "task_images_select_access" on public.task_images
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_images.task_id and t.course_id = 0
    )
    or exists (
      select 1
      from public.tasks t
      join public.enrollments e on e.course_id = t.course_id
      where t.id = task_images.task_id
        and e.user_id = auth.uid()
        and e.access_granted = true
    )
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.is_admin = true
    )
  );

-- ---------- SEKCJA 5: user_tasks (postępy w zadaniach — własne wiersze) ----------
-- Bez RLS każdy kluczem anon mógł czytać/nadpisywać/kasować cudze postępy
-- (lib/db.ts filtruje tylko po user_id po stronie klienta). Zamykamy do własnych.
alter table public.user_tasks enable row level security;
drop policy if exists "user_tasks_rw_own" on public.user_tasks;
create policy "user_tasks_rw_own" on public.user_tasks
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- SEKCJA 6: study_plans (planer — własne wiersze) ----------
alter table public.study_plans enable row level security;
drop policy if exists "study_plans_rw_own" on public.study_plans;
create policy "study_plans_rw_own" on public.study_plans
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- SEKCJA 7: users (własny wiersz; ZERO eskalacji is_admin) ----------
-- Bez RLS kluczem anon można było odczytać e-maile WSZYSTKICH klientów.
-- Ograniczamy odczyt do własnego wiersza — to też sprawia, że podzapytania
-- admina w SEKCJACH 2–4 (u.id = auth.uid()) działają poprawnie.
-- UWAGA: is_admin nadaje się WYŁĄCZNIE przez service_role / SQL, nigdy z klienta.
alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select to authenticated
  using (auth.uid() = id);

-- Wstawianie własnego wiersza — is_admin MUSI być false/null (blokada eskalacji).
drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self" on public.users
  for insert to authenticated
  with check (auth.uid() = id and coalesce(is_admin, false) = false);

-- Aktualizacja własnego wiersza — również bez podniesienia is_admin do true.
drop policy if exists "users_update_self" on public.users;
create policy "users_update_self" on public.users
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and coalesce(is_admin, false) = false);

-- --- Trigger: automatyczne utworzenie wiersza public.users przy rejestracji ---
-- KLUCZOWE dla braku regresji: przy włączonym potwierdzaniu e-maila po signUp
-- NIE ma sesji, więc kliencki upsert (AuthProvider.signUp) nie zadziała pod RLS.
-- SECURITY DEFINER omija RLS w kontrolowany sposób. Idempotentny.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, is_admin)
  values (new.id, new.email, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- (OPCJONALNIE, jednorazowo) Backfill dla kont zarejestrowanych PRZED triggerem,
-- które nie mają jeszcze wiersza w public.users (inaczej planer/zadania mogą nie
-- działać, jeśli istnieje FK user_tasks/study_plans -> users):
--   insert into public.users (id, email, is_admin)
--   select id, email, false from auth.users
--   on conflict (id) do nothing;

-- ============================================================================
-- WERYFIKACJA (wykonaj po zastosowaniu)
-- ============================================================================
-- A) Jako ANON (klucz anon, bez zalogowania) — powinny być PUSTE lub tylko course 0:
--      select course_id, count(*) from public.video group by course_id;   -- tylko 0
--      select count(*) from public.tasks;          -- 0
--      select count(*) from public.enrollments;    -- 0
--      select count(*) from public.user_tasks;     -- 0   (SEKCJA 5)
--      select count(*) from public.study_plans;    -- 0   (SEKCJA 6)
--      select count(*) from public.users;          -- 0   (SEKCJA 7 — brak wycieku e-maili)
-- B) Jako ZALOGOWANY user z enrollmentem na dział 2:
--      - widzi lekcje/zadania działu 2, NIE widzi działu, którego nie kupił.
--      - widzi TYLKO własne user_tasks / study_plans / własny wiersz users.
--      - próba `update users set is_admin=true where id=auth.uid()` MUSI zostać
--        odrzucona (blokada eskalacji z with check).
-- C) W APLIKACJI: zaloguj się, wejdź na kupiony dział (lekcje + zadania działają),
--      wejdź na /kurs/0 (moduł „Tutaj zacznij") zalogowany i wylogowany — działa.
--      Planer (/planer): generowanie i zaznaczanie planu działa (SEKCJA 6).
--      Postępy w zadaniach zapisują się (SEKCJA 5).
--      REJESTRACJA nowego konta: po potwierdzeniu e-maila wiersz w public.users
--      istnieje (utworzony triggerem on_auth_user_created).
--      Płatności (webhook) i pobieranie PDF (get-pdf-url) — bez zmian (service_role).

-- ============================================================================
-- ROLLBACK (gdyby cokolwiek się popsuło — przywraca stan sprzed skryptu)
-- ============================================================================
-- drop policy if exists "enrollments_select_own"       on public.enrollments;
-- drop policy if exists "video_select_access"          on public.video;
-- drop policy if exists "video_segments_select_access" on public.video_segments;
-- drop policy if exists "tasks_select_access"          on public.tasks;
-- drop policy if exists "task_images_select_access"    on public.task_images;
-- drop policy if exists "user_tasks_rw_own"            on public.user_tasks;
-- drop policy if exists "study_plans_rw_own"           on public.study_plans;
-- drop policy if exists "users_select_own"             on public.users;
-- drop policy if exists "users_insert_self"            on public.users;
-- drop policy if exists "users_update_self"            on public.users;
-- drop trigger  if exists on_auth_user_created on auth.users;
-- drop function if exists public.handle_new_auth_user();
-- -- oraz, jeśli RLS był wcześniej wyłączony i chcesz wrócić do stanu sprzed:
-- -- alter table public.video disable row level security;   (itd. dla pozostałych)
