# AUDYT TREŚCI — fizykastatkiem.pl

Data audytu: **2026-09-10**
Zakres: pełne repozytorium (kod aktywny Next.js + treści SEO + JSON-LD + dane strukturalne).
Metoda: przeszukanie `app/`, `components/`, `lib/`, `seo/`, `netlify/functions/` pod kątem
liczb, ocen, opinii i statystyk marketingowych oraz danych strukturalnych (schema.org).

**Uwaga o `legacy/`**: katalog `legacy/` (stary SPA w HTML) **nie jest deployowany** —
`netlify.toml` publikuje wyłącznie `.next`. Zawiera stare claimy, ale nie trafia na produkcję.
Nie modyfikowano go w tym audycie; do rozważenia usunięcie w osobnym porządkowym PR.

Legenda statusów:
- **NAPRAWIONE (P0)** — fałszywy claim usunięty/poprawiony w ramach Priorytetu 0.
- **DO ZMIANY (P1)** — dotyczy oferty/cennika/gwarancji → Priorytet 1 (osobny commit/PR).
- **WYMAGA WERYFIKACJI** — liczba/statystyka niezweryfikowana; nie usuwać automatycznie, decyzja właściciela.
- **ZACHOWANE** — claim prawdziwy, pozostaje bez zmian.
- **BRAK** — szukano, nie znaleziono (istotne dla schema.org).

---

## 1. Fałszywe claimy marketingowe (Priorytet 0)

| Claim | Lokalizacja | Typ | Status | Działanie |
| --- | --- | --- | --- | --- |
| `2000+ maturzystów` | `components/landing/Hero.tsx:7` | liczba klientów | NAPRAWIONE (P0) | Usunięto. Zastąpiono: „100% zdawalności” + „28/28 absolwentów zdało maturę”. |
| `4.9/5 średnia ocen` | `components/landing/Hero.tsx:8` | ocena/rating | NAPRAWIONE (P0) | Usunięto gwiazdkę ⭐ i ocenę. |
| `2000+ zadowolonych uczniów` | `components/landing/StatsBar.tsx:4` | liczba klientów | NAPRAWIONE (P0) | Usunięto. StatsBar przebudowany na prawdziwe dane. |
| `4.9/5 średnia ocen kursu` | `components/landing/StatsBar.tsx:7` | ocena/rating | NAPRAWIONE (P0) | Usunięto. |
| `500+ zadań z rozwiązaniami` | `components/landing/StatsBar.tsx:6` | statystyka | WYMAGA WERYFIKACJI | Konkretna liczba niezweryfikowana (zadania są w bazie Supabase, nie w repo). Usunięto „500+” ze StatsBar; jeśli właściciel potwierdzi liczbę, można przywrócić. |
| Komponent `Stars()` — 5 gwiazdek przy każdej opinii | `components/landing/Testimonials.tsx:39-49,96` | wizualizacja ratingu | NAPRAWIONE (P0) | Usunięto — sugerowało system ocen/średnią. Realne screeny opinii pozostają. |
| `setki zadań CKE` (meta description) | `app/page.tsx:17` | statystyka | WYMAGA WERYFIKACJI | „setki” to nieprecyzyjny superlatyw liczbowy; do potwierdzenia. Pozostawione, oznaczone do weryfikacji (zmiana ceny w tej linii → P1). |

## 2. Dane strukturalne / JSON-LD (Priorytet 0 — krytyczne)

| Element | Lokalizacja | Status | Uwaga |
| --- | --- | --- | --- |
| `AggregateRating` | całe repo | BRAK | Nie znaleziono — dobrze. Nie było ukrytego ratingu w schema. |
| `Review` (schema z oceną) | całe repo | BRAK | Nie znaleziono. |
| `ratingValue` / `reviewCount` | całe repo | BRAK | Nie znaleziono. |
| Graf encji (Organization/WebSite/Person) | `app/layout.tsx:58-120` | ZACHOWANE | Brak ratingu. Person=Czarek z wynikiem 82% (prawdziwy). |
| `Course` offer `price: '699'` | `app/page.tsx:66` | DO ZMIANY (P1) | Stara cena — aktualizacja w Priorytecie 1 (→ 828). |
| `ItemList`/`Product` z cenami pakietów | `app/cennik/page.tsx:53-74`, `app/oferta-ratunkowa/page.tsx:16-39` | DO ZMIANY (P1) | Ceny generowane z `PLANS` — poprawi się po restrukturyzacji cennika. |

## 3. Prawdziwe dane — ZACHOWANE

| Claim | Lokalizacja | Status | Uwaga |
| --- | --- | --- | --- |
| Wyniki matury Czarka: 82% fiz. rozsz., 92% mat. rozsz., 100% mat. podst. | `app/o-mnie/page.tsx:23-27,48-54`, `app/korepetycje/page.tsx:82-86`, `app/layout.tsx:105` | ZACHOWANE | Prawdziwe wyniki autora. Oznaczone jasno jako „Moje wyniki z matury” / „Wyniki Czarka”. |
| `16 działów` | wiele plików (`lib/courses.ts`, Hero, StatsBar, CourseCatalog) | ZACHOWANE | Zgodne z `CANONICAL` (16 pozycji) w `lib/courses.ts:20-37`. |
| Korepetycje `100 zł / 60 min` | `lib/courses.ts:143`, `app/korepetycje/page.tsx` | ZACHOWANE | Cena zweryfikowana wcześniej. |
| 28/28 absolwentów zdało maturę | `Hero.tsx`, `StatsBar.tsx`, `SocialProof` (P1) | ZACHOWANE (dodane w P0) | Podane przez właściciela jako fakt (28 absolwentów, 28 podeszło, 28 zdało). Proof zdawalności prezentowany osobno od opinii. |
| 28/28 pozytywnych opinii | `Testimonials.tsx` | ZACHOWANE (dodane w P0) | Właściciel potwierdził 28 autentycznych, pozytywnych opinii (za zgodą). Odrębny proof od zdawalności (w komponencie opinii). StatsBar prezentuje zdawalność + „CAŁY SYSTEM”, bez dublowania opinii. |

## 4. Testimoniale z imieniem/zdjęciem (0.7)

| Miejsce | Treść | Dane osobowe | Status |
| --- | --- | --- | --- |
| `components/landing/Testimonials.tsx` | 3 opinie (Nadia, Filip, Daria) + screeny z bucketu Supabase `opinie` | imię + zdjęcie/screen | ZACHOWANE — właściciel potwierdził autentyczność i zgodę na publikację (łącznie 28 opinii). Komponent przygotowany pod łatwe dodanie kolejnych realnych opinii. |
| `app/korepetycje/page.tsx:106-130` | 3 opinie (Nadia „94%”, „Filip, 28 lat”, „Mama Darii ~90%”) | imię + wynik | WYMAGA WERYFIKACJI — potwierdzić autentyczność i zgodę (dotyczy korepetycji). |

## 5. Statystyki wymagające weryfikacji (0.8) — nie usuwać automatycznie

| Claim | Lokalizacja | Status | Uwaga |
| --- | --- | --- | --- |
| „moi uczniowie regularnie osiągają 90%+” | `app/korepetycje/page.tsx`, `app/o-mnie/page.tsx` | NAPRAWIONE (P0) | Claim usunięty i zastąpiony neutralnym copy (bez deklaracji wyników uczniów). Zachowany tylko prawdziwy wynik Czarka (82%). |
| „moi uczniowie regularnie osiągają 90%+” | `seo/content/blog.json:591` | NAPRAWIONE (P0) | Claim usunięty także z treści bloga. Cena w tej samej linii (49→177 zł) aktualizowana osobno w P1. |
| „setki zadań” | `components/landing/Hero.tsx`, `components/landing/HowItWorks.tsx`, `components/landing/Toolkit.tsx`, `app/baza-wiedzy/page.tsx`, `app/page.tsx` (meta) | ZACHOWANE (decyzja właściciela) | Właściciel potwierdził, że „setki zadań” zostaje. Doprecyzowano frazę do „setki zadań **na wzór CKE**”, aby nie sugerować oficjalnych arkuszy CKE. |
| „500+ zadań” (konkretna liczba) | `components/landing/StatsBar.tsx` (usunięte) | NAPRAWIONE (P0) | Konkretna liczba niezweryfikowana — usunięta ze StatsBar. |
| „28/28 pozytywnych opinii” | `components/landing/Testimonials.tsx` | ZACHOWANE (użyte w P0) | Właściciel POTWIERDZIŁ 28 autentycznych, pozytywnych opinii. Komunikacja: „28/28 pozytywnych opinii” + „Wszystkie 28 opinii, które otrzymaliśmy od naszych absolwentów, są pozytywne”. Bez gwiazdek/średniej/AggregateRating. Nie tworzono nowego komponentu ani placeholderów — użyto istniejącego komponentu opinii (3 realne przykłady, łatwo dodać kolejne). |

## 6. Elementy oferty do przebudowy (Priorytet 1 — tylko rejestr, zmiana w osobnym PR)

| Element | Lokalizacja | Status | Uwaga |
| --- | --- | --- | --- |
| Pakiet „Silver” (nazwa) | `lib/courses.ts:87-93`, `app/cennik/page.tsx:128` | DO ZMIANY (P1) | → „Kurs Pełny”, 828 zł. |
| Pakiet „Gold” + sesje live | `lib/courses.ts:104-120`, `app/cennik/page.tsx:29,47-48,129`, `app/page.tsx:28` | DO ZMIANY (P1) | Usunąć całkowicie (wycofane live). |
| Pakiet „Diamond” | `lib/courses.ts:122-136` | DO ZMIANY (P1) | → „VIP 1:1 (Diamond)”, 3497 zł, „Tylko 6 miejsc”. |
| Ceny pojedynczych działów `49 zł` | `lib/courses.ts:140`, `app/page.tsx:17`, `app/cennik/page.tsx:14`, `blog.json:591,642,656`, `app/korepetycje-z-fizyki/[city]/page.tsx:96` | DO ZMIANY (P1) | → 177 zł, przeniesione na `/dzialy`. |
| Ceny checkout (grosze) 69900/94700/199700 | `netlify/functions/create-checkout-session.js:37-39` | DO ZMIANY (P1) | → 82800 (Kurs Pełny), 349700 (VIP), 17700 (dział). Usunąć id 18 (Gold). **Krytyczne dla spójności ceny wyświetlanej vs pobieranej.** |
| Przekreślone ceny referencyjne (`priceOld`) | `lib/courses.ts:89,107,124`, `components/shop/PricingTiers.tsx:71-74` | DO ZMIANY (P1) | Sztuczna „promocja” (−65%). Usunąć, o ile nie są realnymi wcześniejszymi cenami. |
| Licznik promocji 1h (`PromoCountdown`) + `/oferta-ratunkowa` | `components/shop/PromoCountdown.tsx`, `app/oferta-ratunkowa/page.tsx` | WYMAGA DECYZJI (P1) | Sztuczne FOMO. Lejek poboczny — do decyzji właściciela; w P1 zneutralizowano różnicę promo (promoPrice=price). |

## 7. Gwarancja — NIESPÓJNOŚĆ (do ujednolicenia, Priorytet 1)

| Miejsce | Aktualna treść | Problem |
| --- | --- | --- |
| `components/landing/Guarantee.tsx:20-25` | „nie zdasz → **kolejny rok dostępu za darmo**” | ❌ Sprzeczne z regulaminem (regulamin = **zwrot pieniędzy**). |
| `app/page.tsx:36` (FAQ) | „nie zdasz → **kolejny rok dostępu za darmo**” | ❌ j.w. |
| `app/regulamin/page.tsx:228-280` (§9) | **Zwrot 100% ceny** przy wyniku <30%; warunki: zakup ≥30 dni przed maturą, ≥90% ukończenia kursu (logi), zgłoszenie **w ciągu 30 dni od ogłoszenia wyników przez CKE**, skan zaświadczenia OKE, weryfikacja 14 dni | ⚠️ Termin zgłoszenia: regulamin = 30 dni od ogłoszenia CKE; specyfikacja właściciela = **7 dni od otrzymania oficjalnego wyniku**. |

**Decyzja (P1):** komunikacja gwarancji na landingu/FAQ ujednolicona do modelu **zwrotu pieniędzy** przy wyniku
<30% (zgodnie z regulaminem), z terminem zgłoszenia **7 dni od otrzymania oficjalnego wyniku** (zgodnie ze
specyfikacją właściciela). Regulamin §9 zaktualizowano do 7 dni.
**WYMAGA POTWIERDZENIA WŁAŚCICIELA / PRAWNIKA** — zmiana terminu w dokumencie prawnym; pozostałe warunki
szczegółowe (≥90% ukończenia, zakup ≥30 dni przed maturą, zaświadczenie OKE) zachowane.
