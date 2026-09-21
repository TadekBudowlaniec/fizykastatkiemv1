# Panel admina jako aplikacja na telefon (PWA) + powiadomienia push

Wzorowane 1:1 na Tłumaczalo. Panel `/admin` dodany na ekran główny iPhone'a
działa jak osobna aplikacja, odświeża dane sam i dostaje powiadomienia push
o wszystkim, o czym admin powinien wiedzieć.

## Co gdzie jest

| Element | Plik |
|---|---|
| Manifest PWA (standalone, start `/admin/`) | `app/manifest.ts` |
| Ikony (192/512/maskable/apple-touch) | `public/icons/` (generowane z `magenta_statek.png`) |
| `appleWebApp` + ikona Apple | `app/layout.tsx` (metadata) |
| Service worker (tylko push, zero cache) | `public/sw.js` (nagłówki no-cache w `netlify.toml`) |
| Tabela subskrypcji | `supabase/push-subscriptions.sql` |
| Wysyłka push (web-push + VAPID) | `netlify/functions/_shared/push.js` |
| Bramka admina dla funkcji | `netlify/functions/_shared/admin-auth.js` |
| Zapis/usunięcie subskrypcji, stan | `netlify/functions/push-subscribe.js` (GET/POST/DELETE) |
| Test push | `netlify/functions/push-test.js` |
| UI włączania + instrukcja | `components/admin/PushSettings.tsx`, sekcja „Powiadomienia” w `app/admin/page.tsx` |
| Auto-odświeżanie panelu | `app/admin/page.tsx` (visibilitychange/focus/pageshow + co 60 s) |

## Kiedy leci push (wszystkie best-effort, nigdy nie wywracają webhooka)

| Zdarzenie | Skąd | Tytuł |
|---|---|---|
| Opłacone zamówienie (kurs / VIP / dział) | `webhook.js` po nadaniu dostępu | 💰 Nowe zamówienie: … |
| Płatność OK, ale konto/dostęp nie nadany | `webhook.js` (ścieżki błędów) | ⚠️ Płatność bez dostępu! |
| Nieudana płatność odroczona (Klarna) | `webhook.js` `checkout.session.async_payment_failed` | ❌ Płatność odroczona nie powiodła się |
| Zwrot | `webhook.js` `charge.refunded` | ↩️ Zwrot płatności |
| Chargeback | `webhook.js` `charge.dispute.created` | 🚨 Chargeback |
| Nowy lead (pierwszy zapis e-maila) | `subscribe.js` | 🧭 Nowy lead |
| Błędy crona sekwencji mailowej | `send-sequence.js` (tylko gdy `failed > 0`) | ⚠️ Sekwencja mailowa: błędy |

Zdarzenia Stripe inne niż `checkout.session.*` trzeba **włączyć w Stripe**:
Developers → Webhooks → endpoint `/.netlify/functions/webhook` → Events →
dodaj `checkout.session.async_payment_failed`, `charge.refunded`,
`charge.dispute.created`. Bez tego te trzy powiadomienia po prostu nie przyjdą
(reszta działa).

## Konfiguracja jednorazowa (właściciel)

1. **Klucze VAPID** - wygenerowane lokalnie, leżą w `.env.local` (gitignore).
   Skopiuj do Netlify → Site configuration → Environment variables:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` = `mailto:fizykastatkiem@gmail.com`

   Potem **Trigger deploy** (publiczny klucz wbudowuje się w front przy buildzie).
   Nowe klucze można wygenerować w każdej chwili: `npx web-push generate-vapid-keys`
   (wtedy stare subskrypcje przestają działać - trzeba włączyć push ponownie).
2. **Tabela** - Supabase → SQL Editor → wklej `supabase/push-subscriptions.sql`.
3. **Stripe** - dopisz 3 zdarzenia jak wyżej (opcjonalne, ale warto).

## Instalacja na iPhonie (iOS 16.4+)

1. Safari → `fizykastatkiem.pl/admin` → zaloguj się.
2. Udostępnij → „Do ekranu początkowego” → Dodaj (ikona „FS Admin”).
3. Uruchom z ikony (nie z Safari; sesja jest osobna - zaloguj się ponownie).
4. Sekcja „Powiadomienia” → „Włącz powiadomienia” → „Wyślij testowe”.

Android/Chrome: menu ⋮ → „Dodaj do ekranu głównego”; push działa też w zwykłej
karcie Chrome na desktopie.

## Diagnostyka

- Sekcja „Powiadomienia” pokazuje: brak kluczy VAPID, brak tabeli, liczbę urządzeń.
- Wygasłe subskrypcje (404/410 od Apple/Google) są automatycznie usuwane przy wysyłce.
- Logi wysyłki: Netlify → Functions → `webhook` / `subscribe` / `send-sequence` (`[push] …`).
