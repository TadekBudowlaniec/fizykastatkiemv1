# Kampanie jednorazowe (mail do całej bazy leadów)

Obok 5-dniowej sekwencji powitalnej (`sekwencja-powitalna.md`) mamy kampanie: jeden mail
wysyłany raz do wszystkich aktywnych leadów ze zgodą marketingową. Treść siedzi w kodzie,
w stałej `CAMPAIGNS` w `netlify/functions/_shared/mailer.js` (ten sam format co `SEQUENCE`,
tylko zamiast `day` jest `slug`).

Pliki:
- `_shared/mailer.js`: treść (`CAMPAIGNS`), placeholdery `{{dni}}` / `{{tygodnie}}` (dni do matury
  wg `MATURA_DATE`, domyślnie 2027-05-19), render, wysyłka przez Resend.
- `_shared/campaign.js`: kto dostaje maila (patrz niżej).
- `send-campaign.js`: podgląd, liczenie odbiorców, mail testowy (synchroniczne, 10 s).
- `send-campaign-background.js`: właściwa wysyłka w tle (Netlify Background Function, 15 min).
- `supabase/email-campaigns.sql`: tabela `email_campaign_sends` (pamięć „kto już dostał").

## Kto dostaje maila

Aktywni leady ze zgodą (`email_subscribers.status = 'active'`, `consent_marketing = true`), minus:
- adresy, które już dostały tę kampanię (`email_campaign_sends`),
- kursanci z nadanym dostępem (`enrollments.access_granted` + e-mail z `auth.users`), bo mail
  sprzedaje kurs,
- opcjonalnie (`skip_unfinished=1`) leady w trakcie sekwencji powitalnej, żeby nie dostali dwóch
  maili jednego dnia.

Jeśli nie da się ustalić listy kursantów, funkcja NIE wysyła nic (lepiej nic niż oferta do klienta).

## Jak wysłać kampanię (krok po kroku)

Wszystkie wywołania wymagają `?key=<CRON_SECRET>` (zmienna w Netlify). Bez ustawionego sekretu
funkcje odmawiają pracy.

1. Jednorazowo: uruchom `supabase/email-campaigns.sql` w SQL Editorze Supabase.
2. Podgląd w przeglądarce:
   `/.netlify/functions/send-campaign?key=…&campaign=<slug>&mode=preview`
3. Test na własną skrzynkę (bez zapisu w bazie):
   `/.netlify/functions/send-campaign?key=…&campaign=<slug>&mode=test&email=twoj@adres.pl`
4. Ile osób dostanie:
   `/.netlify/functions/send-campaign?key=…&campaign=<slug>&mode=count`
   (odpowiedź: `willSend`, `skipped.buyers`, `skipped.alreadySent`, `skipped.unfinished`, próbka adresów).
5. Wysyłka do wszystkich (odpowiada od razu 202, pracuje w tle):
   `/.netlify/functions/send-campaign-background?key=…&campaign=<slug>`
   Opcje: `&limit=100` (pierwsza ostrożna partia), `&skip_unfinished=1`.
   Po zakończeniu przychodzi push do panelu admina z podsumowaniem; szczegóły w logach Netlify
   (`send-campaign-background <slug>: done sent=… failed=…`).
6. Powtórz krok 4. Jeśli `willSend > 0` (błędy, limit), odpal krok 5 ponownie. Wysyłka jest
   idempotentna: nikt nie dostanie maila drugi raz.

## Jak dodać kolejną kampanię

Dopisz obiekt do `CAMPAIGNS` w `mailer.js` z nowym, unikalnym `slug` (to on jest kluczem w
`email_campaign_sends`, więc nigdy nie zmieniaj slugu wysłanej kampanii). Zasady treści jak w
sekwencji: polskie cudzysłowy, bez długich myślników, `**pogrubienie**`, jeden CTA, bez obrazków.

## Kampania: `odliczanie-2027-1` (październik 2026)

Check-in do wszystkich leadów: ile dni zostało do matury, pytanie „na czym stoisz?" z prośbą o
odpowiedź (odpowiedzi idą na `EMAIL_REPLY_TO`, czyli hej@fizykastatkiem.pl), przypomnienie
Kursu Pełnego (828 zł, Gwarancja Dobrego Wyniku), CTA do `/cennik`. Treść realnie wysyłana =
`CAMPAIGNS` w `mailer.js`.
