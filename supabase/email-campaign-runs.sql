-- ============================================================================
-- email-campaign-runs.sql — planowanie i historia wysyłek kampanii (panel admina).
-- Uruchom RAZ na żywej bazie (SQL Editor w Supabase). Idempotentne.
--
-- Jeden wiersz = jedno zlecenie wysyłki kampanii (z panelu: „Wyślij teraz" albo
-- „Zaplanuj na datę/godzinę"). Cykl życia statusu:
--   scheduled -> queued (cron/panel przekazał do funkcji w tle)
--             -> running (funkcja w tle wystartowała)
--             -> done | failed
--   scheduled -> cancelled (odwołane z panelu, przed startem)
-- Kto dostał maila trzyma osobno email_campaign_sends (idempotencja wysyłki).
-- ============================================================================

create table if not exists public.email_campaign_runs (
    id              uuid        primary key default gen_random_uuid(),
    campaign        text        not null,                    -- slug z CAMPAIGNS (mailer.js)
    scheduled_at    timestamptz not null,                    -- kiedy ma ruszyć
    skip_unfinished boolean     not null default false,      -- pomiń leady w trakcie sekwencji
    include_accounts boolean    not null default true,       -- także konta bez dostępu do kursu
    status          text        not null default 'scheduled'
        check (status in ('scheduled', 'queued', 'running', 'done', 'failed', 'cancelled')),
    created_at      timestamptz not null default now(),
    created_by      text,                                    -- e-mail admina
    started_at      timestamptz,
    finished_at     timestamptz,
    sent            integer     not null default 0,
    failed          integer     not null default 0,
    remaining       integer     not null default 0,          -- nie zmieścili się w limicie / błędy
    skipped         jsonb,                                   -- {total, alreadySent, buyers, unfinished}
    error           text
);

-- Dodane później (27.10.2026): odbiorcy = leady + konta bez kursu. Idempotentne.
alter table public.email_campaign_runs
    add column if not exists include_accounts boolean not null default true;

-- Cron co 5 minut pyta o dojrzałe zlecenia.
create index if not exists email_campaign_runs_due_idx
    on public.email_campaign_runs (status, scheduled_at);

-- RLS ON, zero polityk => tylko service_role (funkcje Netlify), jak email_subscribers.
alter table public.email_campaign_runs enable row level security;
