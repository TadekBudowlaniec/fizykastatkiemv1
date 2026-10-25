-- ============================================================================
-- email-campaigns.sql — pamięć wysyłek kampanii jednorazowych (Resend).
-- Uruchom RAZ na żywej bazie (SQL Editor w Supabase). Idempotentne.
--
-- Kampania = mail wysyłany do całej bazy leadów (stała CAMPAIGNS w
-- netlify/functions/_shared/mailer.js). Wiersz tutaj = „ten adres dostał już
-- tę kampanię", dzięki czemu wysyłkę można bezpiecznie przerwać i wznowić
-- (send-campaign-background.js pomija adresy, które już tu są).
-- ============================================================================

create table if not exists public.email_campaign_sends (
    campaign   text        not null,                 -- slug z CAMPAIGNS
    email      text        not null,                 -- lowercase, jak w email_subscribers
    sent_at    timestamptz not null default now(),
    resend_id  text,                                 -- id wiadomości z Resend (debug)
    primary key (campaign, email)
);

-- RLS ON, zero polityk => tylko service_role (Netlify Functions), jak email_subscribers.
alter table public.email_campaign_sends enable row level security;

-- Podgląd:
--   select campaign, count(*) from public.email_campaign_sends group by campaign;
