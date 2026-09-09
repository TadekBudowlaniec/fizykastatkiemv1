-- ============================================================================
-- HOTFIX PRODUKCJA — rejestracja zwraca „Database error saving new user"
-- ============================================================================
-- PRZYCZYNA: trigger on_auth_user_created wstawiał do public.users kolumnę
-- `email`, której ta tabela NIE MA. Rzeczywisty schemat public.users:
--   id (uuid, NOT NULL, default gen_random_uuid())
--   created_at (timestamptz, default now())
--   status (text), full_name (text), is_admin (bool), stripe_customer_id (text)
-- Insert triggera odwoływał się do nieistniejącej kolumny → wyjątek w triggerze
-- AFTER INSERT na auth.users wywracał całą transakcję rejestracji → auth.signUp
-- zwracał 500 „Database error saving new user". Tworzenie kont padało w 100%.
--
-- NAPRAWA: trigger wstawia TYLKO istniejące kolumny (id, full_name, is_admin);
-- created_at wypełnia default now(). Odporny na wyjątki — profil w public.users
-- nigdy więcej nie zablokuje rejestracji. Idempotentny; można uruchomić wielokrotnie.
--
-- URUCHOM: Supabase → SQL Editor → wklej całość → Run.
-- ============================================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    insert into public.users (id, full_name, is_admin)
    values (
      new.id,
      new.raw_user_meta_data->>'full_name',
      false
    )
    on conflict (id) do nothing;
  exception when others then
    -- Bezpiecznik: nie blokuj rejestracji z powodu profilu w public.users.
    begin
      insert into public.users (id)
      values (new.id)
      on conflict (id) do nothing;
    exception when others then
      null;
    end;
  end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- (OPCJONALNIE) Backfill dla kont z auth.users bez wiersza w public.users.
-- created_at wypełnia default now(). Bezpieczne, idempotentne.
insert into public.users (id)
select u.id
from auth.users u
where not exists (select 1 from public.users p where p.id = u.id)
on conflict (id) do nothing;

-- WERYFIKACJA: załóż testowe konto w aplikacji — powinno przejść bez błędu,
-- a poniższe zapytanie ma zwrócić świeży wiersz:
--   select id, full_name, is_admin, created_at
--   from public.users order by created_at desc limit 5;
