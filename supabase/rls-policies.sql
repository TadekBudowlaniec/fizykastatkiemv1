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
where relname in ('video','video_segments','tasks','task_images','enrollments','users');

select schemaname, tablename, policyname, cmd, roles, qual
from pg_policies
where tablename in ('video','video_segments','tasks','task_images','enrollments','users')
order by tablename, policyname;

-- Jeśli powyżej istnieje permisywna polityka SELECT (np. "Enable read access for all"),
-- usuń ją PRZED dodaniem nowych, np.:
--   drop policy "Enable read access for all users" on public.video;

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

-- ---------- SEKCJA 3: tasks (zapisani / admin) ----------
alter table public.tasks enable row level security;
drop policy if exists "tasks_select_access" on public.tasks;
create policy "tasks_select_access" on public.tasks
  for select to authenticated
  using (
    exists (
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

-- ---------- SEKCJA 4: task_images (przez tasks -> enrollments) ----------
alter table public.task_images enable row level security;
drop policy if exists "task_images_select_access" on public.task_images;
create policy "task_images_select_access" on public.task_images
  for select to authenticated
  using (
    exists (
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

-- ============================================================================
-- WERYFIKACJA (wykonaj po zastosowaniu)
-- ============================================================================
-- A) Jako ANON (klucz anon, bez zalogowania) — powinny być PUSTE lub tylko course 0:
--      select course_id, count(*) from public.video group by course_id;   -- tylko 0
--      select count(*) from public.tasks;          -- 0
--      select count(*) from public.enrollments;    -- 0
-- B) Jako ZALOGOWANY user z enrollmentem na dział 2:
--      - widzi lekcje/zadania działu 2, NIE widzi działu, którego nie kupił.
-- C) W APLIKACJI: zaloguj się, wejdź na kupiony dział (lekcje + zadania działają),
--      wejdź na /kurs/0 (moduł „Tutaj zacznij") zalogowany i wylogowany — działa.
--      Płatności (webhook) i pobieranie PDF (get-pdf-url) — bez zmian (service_role).

-- ============================================================================
-- ROLLBACK (gdyby cokolwiek się popsuło — przywraca stan sprzed skryptu)
-- ============================================================================
-- drop policy if exists "enrollments_select_own"       on public.enrollments;
-- drop policy if exists "video_select_access"          on public.video;
-- drop policy if exists "video_segments_select_access" on public.video_segments;
-- drop policy if exists "tasks_select_access"          on public.tasks;
-- drop policy if exists "task_images_select_access"    on public.task_images;
-- -- oraz, jeśli RLS był wcześniej wyłączony i chcesz wrócić do stanu sprzed:
-- -- alter table public.video disable row level security;   (itd. dla pozostałych)
