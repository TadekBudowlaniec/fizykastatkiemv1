# Kampanie jednorazowe (mail do całej bazy leadów)

Obok 5-dniowej sekwencji powitalnej (`sekwencja-powitalna.md`) mamy kampanie: jeden mail
wysyłany raz do wszystkich aktywnych leadów ze zgodą marketingową. Treść siedzi w kodzie,
w stałej `CAMPAIGNS` w `netlify/functions/_shared/mailer.js` (ten sam format co `SEQUENCE`,
tylko zamiast `day` jest `slug`). Wysyłką steruje się z panelu admina, sekcja **Kampanie**.

Pliki:
- `_shared/mailer.js`: treść (`CAMPAIGNS`), placeholdery `{{dni}}` / `{{tygodnie}}` (dni do matury
  wg `MATURA_DATE`, domyślnie 2027-05-19), render, wysyłka przez Resend.
- `_shared/campaign.js`: kto dostaje maila + przejmowanie zleceń (`claimAndTriggerRun`).
- `admin-campaigns.js`: backend sekcji w panelu (bramka `is_admin`): podgląd, test, liczenie,
  „Wyślij teraz", „Zaplanuj", „Odwołaj", historia.
- `check-campaign-schedule.js`: cron co 5 minut (netlify.toml), przekazuje dojrzałe zlecenia do tła.
- `send-campaign-background.js`: właściwa wysyłka w tle (Netlify Background Function, 15 min).
- `send-campaign.js`: awaryjne wywołania po URL z `CRON_SECRET` (preview / count / test), bez panelu.
- `components/admin/Campaigns.tsx`: UI sekcji w panelu.
- `supabase/email-campaigns.sql`: tabela `email_campaign_sends` (pamięć „kto już dostał").
- `supabase/email-campaign-runs.sql`: tabela `email_campaign_runs` (zlecenia i historia).

Obie migracje zostały uruchomione na żywej bazie 26.10.2026.

## Kto dostaje maila

Aktywni leady ze zgodą (`email_subscribers.status = 'active'`, `consent_marketing = true`), minus:
- adresy, które już dostały tę kampanię (`email_campaign_sends`),
- kursanci z nadanym dostępem (`enrollments.access_granted` + e-mail z `auth.users`), bo mail
  sprzedaje kurs,
- opcjonalnie (checkbox w panelu, domyślnie włączony) leady w trakcie sekwencji powitalnej,
  żeby nie dostali dwóch maili jednego dnia.

Jeśli nie da się ustalić listy kursantów, funkcja NIE wysyła nic (lepiej nic niż oferta do klienta).

## Jak wysłać kampanię z panelu

1. `/admin` → sekcja **Kampanie**. Wybierz kampanię (lista z kodu).
2. **Podgląd maila**: HTML w oknie, dokładnie to, co dostanie lead.
3. **Test do mnie**: jeden mail na adres zalogowanego admina (bez zapisu w bazie).
4. **Policz odbiorców**: ile osób dostanie, ilu pominiemy i dlaczego, próbka adresów.
5. **Zaplanuj wysyłkę** na datę i godzinę (czas polski) albo **Wyślij teraz** (z potwierdzeniem).
   Zaplanowane zlecenie startuje najpóźniej 5 minut po wybranej godzinie (cron). Do startu można
   je odwołać przyciskiem „Odwołaj".
6. **Historia wysyłek** pokazuje status (Zaplanowana → Startuje → Wysyła się → Wysłana/Błąd),
   liczby wysłanych/błędów/pominiętych. Gdy coś się wysyła, lista odświeża się co 15 s. Po
   zakończeniu przychodzi też push do panelu.

Jedna kampania może mieć tylko jedno otwarte zlecenie naraz (zaplanowane lub w trakcie).
Wysyłka jest idempotentna: jeśli zlecenie skończy się z błędami, kolejne wyśle tylko do tych,
którzy jeszcze nie dostali.

Cykl życia zlecenia (`email_campaign_runs.status`): `scheduled` → `queued` (cron/panel przekazał
do tła) → `running` → `done` | `failed`; `scheduled` → `cancelled`. Przejęcie zlecenia jest
atomowe (`update … where status='scheduled'`), więc cron i panel nie wyślą tej samej kampanii dwa razy.

## Awaryjnie, bez panelu (URL + CRON_SECRET)

```
/.netlify/functions/send-campaign?key=…&campaign=<slug>&mode=preview
/.netlify/functions/send-campaign?key=…&campaign=<slug>&mode=test&email=twoj@adres.pl
/.netlify/functions/send-campaign?key=…&campaign=<slug>&mode=count[&skip_unfinished=1]
/.netlify/functions/send-campaign-background?key=…&campaign=<slug>[&skip_unfinished=1][&limit=100]
```

Wysyłka po URL nie zostawia wpisu w historii panelu (tylko w `email_campaign_sends`).

## Jak dodać kolejną kampanię

Dopisz obiekt do `CAMPAIGNS` w `mailer.js` z nowym, unikalnym `slug` (to on jest kluczem w
`email_campaign_sends`, więc nigdy nie zmieniaj slugu wysłanej kampanii). Zasady treści jak w
sekwencji: polskie cudzysłowy, bez długich myślników, `**pogrubienie**`, jeden CTA, bez obrazków.
Po deployu kampania sama pojawi się na liście w panelu.

## Kampania: `odliczanie-2027-1` (październik 2026)

Check-in do wszystkich leadów: ile dni zostało do matury, pytanie „na czym stoisz?" z prośbą o
odpowiedź (odpowiedzi idą na `EMAIL_REPLY_TO`, czyli hej@fizykastatkiem.pl), przypomnienie
Kursu Pełnego (828 zł, Gwarancja Dobrego Wyniku), CTA do `/cennik`. Treść realnie wysyłana =
`CAMPAIGNS` w `mailer.js`.
