-- ============================================================================
-- email_subscribers — leady z lead magnetu (planer) + exit-intent popup.
-- Źródło prawdy o zgodzie marketingowej (RODO) i stanie synchronizacji z Brevo.
--
-- BEZPIECZEŃSTWO: RLS włączone BEZ polityk => klient (anon/authenticated) nie ma
-- dostępu. Zapisujemy i czytamy WYŁĄCZNIE przez service_role (Netlify Functions:
-- subscribe.js, admin-*.js), który omija RLS. To zgodne z wzorcem enrollments.
-- ============================================================================

create table if not exists public.email_subscribers (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    -- skąd przyszedł lead: 'planer_squeeze' | 'exit_intent'
    source text not null default 'planer_squeeze',
    -- zgoda marketingowa (dobrowolna, osobna od loginu OTP) — podstawa RODO
    consent_marketing boolean not null default false,
    consent_at timestamptz,
    -- 'active' | 'unsubscribed' | 'bounced'
    status text not null default 'active',
    -- czy kontakt trafił już do Brevo (żeby nie dublować przy retry)
    brevo_synced boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- email unikalny. Normalizujemy do lowercase w aplikacji (subscribe.js), więc
-- zwykły unikat na kolumnie działa jak case-insensitive i pozwala na
-- upsert onConflict:'email'.
create unique index if not exists email_subscribers_email_key
    on public.email_subscribers (email);

create index if not exists email_subscribers_created_at_idx
    on public.email_subscribers (created_at desc);

-- RLS ON, zero polityk => tylko service_role
alter table public.email_subscribers enable row level security;

-- (idempotentnie sprzątamy ewentualne stare polityki, gdyby ktoś je dodał)
drop policy if exists "email_subscribers_select" on public.email_subscribers;
drop policy if exists "email_subscribers_insert" on public.email_subscribers;

-- auto-aktualizacja updated_at
create or replace function public.email_subscribers_touch()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists email_subscribers_touch on public.email_subscribers;
create trigger email_subscribers_touch
    before update on public.email_subscribers
    for each row execute function public.email_subscribers_touch();

-- Podgląd:
--   select count(*), source, consent_marketing from public.email_subscribers
--   group by source, consent_marketing;
