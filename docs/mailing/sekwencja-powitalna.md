# Sekwencja powitalna, lead magnet „Planer nauki" (5 dni)

Wysyłka: **Resend** (zastąpił Brevo). Treść poniżej jest ŹRÓDŁEM PRAWDY, ale maile wysyła KOD,
nie panel — copy jest zaszyte w `netlify/functions/_shared/mailer.js` (stała `SEQUENCE`).
Chcesz zmienić tekst maila? Edytuj `SEQUENCE` w `mailer.js`, nie tylko ten plik.

Architektura:
- `subscribe.js` — zapis leada do `email_subscribers` + wysyłka **Dnia 1 od razu** (transakcyjnie).
- `send-sequence.js` — cron dzienny (netlify.toml, 08:00 UTC), dosyła **Dni 2-5** wg `consent_at`.
- `unsubscribe.js` — link „wypisz się" (w każdym mailu + nagłówek List-Unsubscribe, wymóg RODO/Gmail).
- `_shared/mailer.js` — silnik: treść, render HTML+plain, wysyłka Resend, tokeny wypisu.

Warunek wejścia: `consent_marketing = true`. Bez zgody lead się zapisuje, ale maile nie idą.
Nadawca: `EMAIL_FROM` (domyślnie „Czarek z FizykaStatkiem <hej@fizykastatkiem.pl>").

Deliverability (cel: „Główne", nie „Oferty"): wysyłka 1:1 przez Resend, prosty HTML (czarny tekst,
jeden link, bez obrazków i plakietki), bez pixela śledzącego, wersja tekstowa obok HTML.
WYMAGANE poza kodem: domena `fizykastatkiem.pl` zweryfikowana w Resend (SPF/DKIM/DMARC).

Poniższe treści to referencja czytelna dla człowieka (TEMAT / PREHEADER / TRESC).
Wersja realnie wysyłana = `SEQUENCE` w `mailer.js`.

---

## Dzień 1, dostarczenie planera + jak z niego korzystać

TEMAT: Twój planer nauki: od czego zacząć
PREHEADER: Otwórz i zobacz, co robić w tym tygodniu.

TRESC MAILA:

Cześć,

masz to. Twój darmowy planer nauki do matury z fizyki czeka w środku: spersonalizowany plan dzień po dniu, aż do egzaminu.

Zanim zaczniesz, jedna rada, która robi całą różnicę: nie ucz się „wszystkiego naraz". Ucz się tego, co planer pokazuje na dziś.

Jak z niego skorzystać w 3 krokach:

1. Wejdź do planera i zaznacz działy, które już ogarniasz. Resztą zajmiemy się my.

2. Zobacz sekcję „Dziś w planie". To Twoje zadanie na dzisiaj. Tyle. Nic więcej.

3. Odhaczaj kroki. Pasek postępu robi swoje. Zobaczysz, jak matura zamienia się z „ogromu" w listę małych, wykonalnych kroków.

Otwórz swój planer: https://fizykastatkiem.pl/planer

Jutro napiszę Ci, dlaczego fizyka wydaje się trudniejsza, niż jest naprawdę (i co z tym zrobić).

Do jutra,
Czarek z FizykaStatkiem

---

## Dzień 2, pokonanie obiekcji („fizyka wydaje się trudna, a nie jest")

TEMAT: Fizyka nie jest trudna. Jest źle tłumaczona.
PREHEADER: Prawdziwy powód, dla którego „nie rozumiesz", i jak to odwrócić.

TRESC MAILA:

Cześć,

powiem Ci coś, czego nie usłyszysz w szkole: jeśli „nie rozumiesz fizyki", to prawie nigdy nie jest kwestia zdolności. To kwestia tego, że ktoś pokazał Ci wzór, zanim pokazał Ci, o co w ogóle chodzi.

Fizyka to nie zbiór 200 wzorów do wykucia. To garść prostych zasad, które powtarzają się w każdym dziale. Kto raz je zobaczy „od środka", przestaje się uczyć na pamięć. Zaczyna rozumieć.

Przykład? Ten sam sposób myślenia o sile z Dynamiki wraca przy ruchu drgającym, w polu grawitacyjnym i w prądzie. Jedna intuicja, cztery działy z głowy.

Dlatego mój kurs nie zaczyna się od wzorów. Zaczyna się od „dlaczego". A wzory? Same wtedy wchodzą do głowy.

Zobacz, jak wygląda nauka „od zrozumienia" (moduł „Tutaj zacznij", za darmo): https://fizykastatkiem.pl/kurs/0

Jutro pokażę Ci historię kogoś, kto był dokładnie tam, gdzie Ty teraz.

Czarek

---

## Dzień 3, case study (Nadia / Filip)

TEMAT: „Byłam pewna, że oblewę". Skończyło się inaczej.
PREHEADER: Historia Nadii, i co konkretnie zrobiła.

TRESC MAILA:

Cześć,

Nadia napisała do mnie w styczniu. Trzy miesiące do matury, w głowie chaos, w dzienniku oceny, na które „lepiej nie patrzeć".

Nie była leniwa. Odwrotnie, uczyła się dużo. Tylko bez planu: raz kinematyka, raz elektryczność, wszystko po łebkach, nic do końca.

Co zmieniła? Dwie rzeczy:

Przestała skakać po działach. Zaczęła robić jeden temat na raz, dokładnie tak, jak układa to planer.

Zaczęła od zrozumienia, nie od zadań. Najpierw „dlaczego", potem liczby.

Efekt? Z „na pewno oblewę" zrobiło się spokojne wejście na maturę i wynik, którego sama się nie spodziewała. Nie dlatego, że nagle stała się geniuszem. Dlatego, że zaczęła uczyć się systemem, a nie zrywami.

Filip? Podobna historia, inny start. Ta sama zasada: plan plus rozumienie biją godziny wkuwania.

Ty masz już plan. Jest w Twoim planerze. Brakuje tylko materiału, który tłumaczy „dlaczego". O tym jutro. Dam Ci kawałek za darmo.

Wróć do planera i zrób dzisiejszy krok: https://fizykastatkiem.pl/planer

Czarek

---

## Dzień 4, wartość (darmowa pigułka wiedzy z Kinematyki)

TEMAT: Cała kinematyka w jednej zasadzie
PREHEADER: Zrozum to raz, a zadania z ruchu przestaną być problemem.

TRESC MAILA:

Cześć,

obiecana pigułka. Bez sprzedaży. Po prostu weź i korzystaj.

Kinematyka w jednym zdaniu: wszystkie zadania z ruchu to odpowiedź na trzy pytania: gdzie jest ciało, jak szybko się porusza i jak ta prędkość się zmienia. Położenie, prędkość, przyspieszenie. Tyle. Reszta to warianty tej samej historii.

Mała zmiana myślenia, która oszczędza mnóstwo błędów: zanim wstawisz cokolwiek do wzoru, narysuj sytuację i zaznacz zwroty (co jest „plus", co „minus"). 80% pomyłek w kinematyce to nie wzór, to znak.

To fragment tego, jak uczę w środku kursu: najpierw obraz i intuicja, potem dopiero rachunki.

Zobacz darmowy moduł „Tutaj zacznij": https://fizykastatkiem.pl/kurs/0

Jutro ostatni mail z tej serii. Pokażę Ci, jak przejść z „rozumiem pojedyncze tematy" do „mam ogarnięty cały materiał na maturę".

Czarek

---

## Dzień 5, zaproszenie do Kursu Pełnego (Gwarancja Dobrego Wyniku)

TEMAT: Masz plan. Czas na resztę mapy.
PREHEADER: Kurs Pełny plus Gwarancja Dobrego Wyniku, dlaczego to bez ryzyka.

TRESC MAILA:

Cześć,

przez ostatnie dni dostałeś ode mnie plan i kawałek metody. To działa, ale to wciąż fragment.

Kurs Pełny to cały materiał maturalny z fizyki poukładany tak, jak układa go Twój planer: dział po dziale, od „dlaczego" do zadań maturalnych, z rozwiązaniami krok po kroku.

Co dostajesz:

Wszystkie działy, od kinematyki po fizykę jądrową, w jednej spójnej metodzie.

Wideo, materiały PDF i zadania z pełnymi rozwiązaniami.

Planer, który prowadzi Cię przez to wszystko aż do matury.

Cena: 828 zł za komplet, mniej niż kilka godzin korepetycji, a zostaje z Tobą do samego egzaminu.

A teraz najważniejsze. Gwarancja Dobrego Wyniku. Uczysz się według planu, a jeśli mimo to kurs Ci nie pomoże, masz jasne zasady zwrotu. Ryzyko jest po mojej stronie, nie Twojej. Twoim jedynym zadaniem jest robić dzienny krok z planera.

Odbierz Kurs Pełny: https://fizykastatkiem.pl/cennik

Masz plan. Masz metodę. Zostało tylko zacząć.

Trzymam kciuki za Twoją maturę,
Czarek z FizykaStatkiem

PS Jeśli wolisz najpierw pojedynczy dział, żeby sprawdzić, jak uczę, też możesz. Ale komplet plus gwarancja to najspokojniejsza droga do wyniku, na którym Ci zależy.
