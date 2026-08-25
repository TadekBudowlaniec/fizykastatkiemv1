# Fizyka Statkiem — Next.js (v2)

Migracja z vanilla-JS SPA na **Next.js 15 (App Router) + TypeScript + Tailwind v4**.
Backend płatności (Netlify Functions), Supabase (auth + baza) i Stripe pozostają bez zmian.

## Stack
- **Next.js 15** App Router, React 19, TypeScript
- **Tailwind CSS v4** (design system w `app/globals.css`, tokeny `@theme`)
- **Supabase** (`@supabase/ssr` — klient przeglądarki) — auth, `enrollments`, lekcje, zadania, planer
- **Stripe** — checkout przez istniejącą Netlify Function
- **KaTeX + react-markdown** — lekcje i treści SEO z LaTeX
- Deploy: **Netlify** z `@netlify/plugin-nextjs`

## Uruchomienie
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build produkcyjny
```
Zmienne środowiskowe: patrz `.env.example`. Publiczne klucze mają fallback w `lib/site.ts`,
więc dev działa od razu; sekrety serwerowe ustaw w panelu Netlify.

## Struktura
```
app/
  page.tsx                    # landing
  kurs/                       # dashboard + kurs/[id] (lekcje, PDF, zadania)
  planer/                     # planer nauki
  login, register, user/      # auth + profil
  cennik, korepetycje/        # marketing
  oferta-ratunkowa, sukces/   # VSL + powrót ze Stripe
  regulamin, polityka-*/      # dokumenty prawne
  fizyka/[slug], matura-z-fizyki/[slug],
  zadania-z-fizyki/**, korepetycje-z-fizyki/**,
  blog/**, baza-wiedzy/       # SEO SSG (źródło: seo/content/*.json, seo/cities.js)
  sitemap.ts, robots.ts
components/  ui | site | landing | shop | course | app | auth | seo
lib/         courses, site, checkout, db, planner, supabase/, types, seo
netlify/functions/            # NIEZMIENIONE: checkout, webhook, get-pdf-url
legacy/                       # stara wersja (referencja)
seo/                          # źródła treści SEO (JSON + miasta)
```

## Model dostępu
Dostęp do działu = wiersz w tabeli `enrollments` z `access_granted = true`
dla `(user_id, course_id 1..16)`. Webhook Stripe nadaje go po płatności.
Sprawdzenia po stronie klienta (`hasAccessToCourse`) to tylko UI — realne
zabezpieczenie PDF jest w Netlify Function `get-pdf-url` (service key + RLS).

## Płatności
`lib/checkout.ts` → `POST /.netlify/functions/create-checkout-session` →
przekierowanie na `session.url` (Stripe Checkout). Funkcja zwraca teraz `{ id, url }`
(dodano `url`; `id` zachowane dla zgodności). Webhook i `get-pdf-url` bez zmian.

## Uwagi / naprawione
- Bug z oryginału: Grawitacja i Elektrostatyka miały `buyAccess('9')` — teraz ID 1..16 po kolejności.
- `/pricing` → redirect na `/cennik`; `/home` → `/`.
- SEO generowane natywnie przez Next (SSG) zamiast `seo/generate.js` na buildzie.
```
