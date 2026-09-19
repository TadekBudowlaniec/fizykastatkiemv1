-- ============================================================================
-- email-sequence.sql — migracja pod mailing na Resend (zastępuje Brevo).
-- Uruchom RAZ na żywej bazie (SQL Editor w Supabase). Idempotentne.
--
-- Dodaje śledzenie postępu sekwencji powitalnej. Dzień 1 wysyła subscribe.js
-- od razu (ustawia seq_day_sent=1), Dni 2-5 dosyła send-sequence.js (cron).
-- ============================================================================

-- Najwyższy wysłany dzień sekwencji (0 = nic nie wysłano, 5 = komplet).
alter table public.email_subscribers
    add column if not exists seq_day_sent smallint not null default 0;

-- Kolumna po Brevo jest już zbędna, ale zostawiamy ją (nic nie kosztuje i nie
-- łamiemy starych rekordów). Gdybyś chciał posprzątać:
--   alter table public.email_subscribers drop column if exists brevo_synced;

-- Indeks pod zapytanie crona: aktywni, ze zgodą, z niedokończoną sekwencją.
create index if not exists email_subscribers_sequence_idx
    on public.email_subscribers (status, consent_marketing, seq_day_sent);

-- Podgląd postępu sekwencji:
--   select seq_day_sent, count(*) from public.email_subscribers
--   where consent_marketing = true group by seq_day_sent order by seq_day_sent;
