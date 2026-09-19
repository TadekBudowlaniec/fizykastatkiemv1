# Sekwencja powitalna — lead magnet „Planer nauki" (5 dni)

Trigger w Brevo: **dodanie kontaktu do listy „Leady - planer"** (robi to `netlify/functions/subscribe.js`).
Warunek wejścia: kontakt ma zgodę marketingową (`consent_marketing = true`) — bez zgody nie trafia na listę.

Cadencja: Dzień 1 = natychmiast po zapisie, potem +1 dzień. Nadawca: `kontakt@fizykastatkiem.pl`.
Każdy mail MUSI mieć link „wypisz się" (Brevo dodaje automatycznie — nie usuwać).

Placeholdery Brevo: `{{ contact.FIRSTNAME | default : "Cześć" }}`.
Linki CTA dodać z UTM, np. `?utm_source=brevo&utm_medium=email&utm_campaign=welcome&utm_content=dzien5`.

---

## Dzień 1 — Dostarczenie planera + jak z niego korzystać

**Temat:** Twój planer nauki do matury jest gotowy 🧭
**Preheader:** Otwórz i zobacz, od czego zacząć w tym tygodniu.

Cześć{{ contact.FIRSTNAME ? ", " : "" }}{{ contact.FIRSTNAME }},

masz to. Twój **darmowy planer nauki do matury z fizyki** czeka w środku — spersonalizowany plan dzień po dniu, aż do egzaminu.

Zanim zaczniesz, jedna rada, która robi całą różnicę:

**Nie ucz się „wszystkiego naraz". Ucz się tego, co planer pokazuje na dziś.**

Jak z niego skorzystać w 3 krokach:
1. Wejdź do planera i **zaznacz działy, które już ogarniasz** — resztą zajmiemy się my.
2. Zobacz sekcję **„Dziś w planie"** — to Twoje zadanie na dzisiaj. Tyle. Nic więcej.
3. Odhaczaj kroki. Pasek postępu robi swoje — zobaczysz, jak matura zamienia się z „ogromu" w listę małych, wykonalnych kroków.

👉 **[Otwórz swój planer](https://fizykastatkiem.pl/planer)**

Jutro napiszę Ci, dlaczego fizyka wydaje się trudniejsza, niż jest naprawdę (i co z tym zrobić).

Do jutra,
Czarek — FizykaStatkiem

---

## Dzień 2 — Pokonanie obiekcji („fizyka wydaje się trudna, a nie jest")

**Temat:** Fizyka nie jest trudna. Jest źle tłumaczona.
**Preheader:** Prawdziwy powód, dla którego „nie rozumiesz" — i jak to odwrócić.

Cześć{{ contact.FIRSTNAME ? ", " : "" }}{{ contact.FIRSTNAME }},

powiem Ci coś, czego nie usłyszysz w szkole:

**Jeśli „nie rozumiesz fizyki", to prawie nigdy nie jest kwestia zdolności.** To kwestia tego, że ktoś pokazał Ci wzór, zanim pokazał Ci, *o co w ogóle chodzi*.

Fizyka to nie zbiór 200 wzorów do wykucia. To garść prostych zasad, które **powtarzają się** w każdym dziale. Kto raz je zobaczy „od środka", przestaje się uczyć na pamięć — zaczyna rozumieć.

Przykład? Ten sam sposób myślenia o sile z Dynamiki wraca przy ruchu drgającym, w polu grawitacyjnym i w prądzie. Jedna intuicja — cztery działy z głowy.

Dlatego mój kurs nie zaczyna się od wzorów. Zaczyna się od **„dlaczego"**. A wzory? Same wtedy wchodzą do głowy.

👉 **[Zobacz, jak wygląda nauka „od zrozumienia"](https://fizykastatkiem.pl/kurs/0)** (moduł „Tutaj zacznij" — za darmo)

Jutro pokażę Ci historię kogoś, kto był dokładnie tam, gdzie Ty teraz.

Czarek

---

## Dzień 3 — Case study (Nadia / Filip)

**Temat:** „Byłam pewna, że oblewę". Skończyło się inaczej.
**Preheader:** Historia Nadii — i co konkretnie zrobiła.

Cześć{{ contact.FIRSTNAME ? ", " : "" }}{{ contact.FIRSTNAME }},

Nadia napisała do mnie w styczniu. Trzy miesiące do matury, w głowie chaos, w dzienniku oceny, na które „lepiej nie patrzeć".

Nie była leniwa. Odwrotnie — uczyła się dużo. Tylko **bez planu**: raz kinematyka, raz elektryczność, wszystko po łebkach, nic do końca.

Co zmieniła? Dwie rzeczy:
- **Przestała skakać po działach.** Zaczęła robić jeden temat na raz — dokładnie tak, jak układa to planer.
- **Zaczęła od zrozumienia, nie od zadań.** Najpierw „dlaczego", potem liczby.

Efekt? Z „na pewno oblcję" zrobiło się **spokojne wejście na maturę i wynik, którego sama się nie spodziewała.** Nie dlatego, że nagle stała się geniuszem. Dlatego, że zaczęła uczyć się *systemem*, a nie zrywami.

Filip? Podobna historia, inny start. Ta sama zasada: **plan + rozumienie > godziny wkuwania.**

Ty masz już plan — jest w Twoim planerze. Brakuje tylko materiału, który tłumaczy „dlaczego". O tym jutro — dam Ci kawałek za darmo.

👉 **[Wróć do planera i zrób dzisiejszy krok](https://fizykastatkiem.pl/planer)**

Czarek

---

## Dzień 4 — Wartość (darmowa pigułka wiedzy z Kinematyki)

**Temat:** Darmowa lekcja: cała Kinematyka w jednej zasadzie
**Preheader:** Zrozum to raz, a zadania z ruchu przestaną być problemem.

Cześć{{ contact.FIRSTNAME ? ", " : "" }}{{ contact.FIRSTNAME }},

obiecana pigułka. Bez sprzedaży — po prostu weź i korzystaj.

**Kinematyka w jednym zdaniu:** wszystkie zadania z ruchu to odpowiedź na trzy pytania — *gdzie jest ciało, jak szybko się porusza i jak ta prędkość się zmienia*. Położenie → prędkość → przyspieszenie. Tyle. Reszta to warianty tej samej historii.

Mała zmiana myślenia, która oszczędza mnóstwo błędów:
> Zanim wstawisz cokolwiek do wzoru, **narysuj sytuację i zaznacz zwroty** (co jest „+”, co „−”). 80% pomyłek w kinematyce to nie wzór — to znak.

To fragment tego, jak uczę w środku kursu: najpierw obraz i intuicja, potem dopiero rachunki.

👉 **[Zobacz darmowy moduł „Tutaj zacznij"](https://fizykastatkiem.pl/kurs/0)**

Jutro ostatni mail z tej serii — pokażę Ci, jak przejść z „rozumiem pojedyncze tematy" do „mam ogarnięty cały materiał na maturę".

Czarek

---

## Dzień 5 — Zaproszenie do Kursu Pełnego (Gwarancja Dobrego Wyniku)

**Temat:** Masz plan. Czas na resztę mapy.
**Preheader:** Kurs Pełny + Gwarancja Dobrego Wyniku — dlaczego to bez ryzyka.

Cześć{{ contact.FIRSTNAME ? ", " : "" }}{{ contact.FIRSTNAME }},

przez ostatnie dni dostałeś ode mnie plan i kawałek metody. To działa — ale to wciąż fragment.

**Kurs Pełny** to cały materiał maturalny z fizyki poukładany tak, jak układa go Twój planer: dział po dziale, od „dlaczego" do zadań maturalnych, z rozwiązaniami krok po kroku.

Co dostajesz:
- **Wszystkie działy** — od kinematyki po fizykę jądrową, w jednej spójnej metodzie.
- **Wideo + materiały PDF + zadania** z pełnymi rozwiązaniami.
- **Planer**, który prowadzi Cię przez to wszystko aż do matury.

Cena: **828 zł** za komplet — mniej niż kilka godzin korepetycji, a zostaje z Tobą do samego egzaminu.

A teraz najważniejsze — **Gwarancja Dobrego Wyniku.** Uczysz się według planu, a jeśli mimo to kurs Ci nie pomoże — masz jasne zasady zwrotu. Ryzyko jest po mojej stronie, nie Twojej. Twoim jedynym zadaniem jest robić dzienny krok z planera.

👉 **[Odbierz Kurs Pełny](https://fizykastatkiem.pl/cennik)**

Masz plan. Masz metodę. Zostało tylko zacząć.

Trzymam kciuki za Twoją maturę,
Czarek — FizykaStatkiem

*PS Jeśli wolisz najpierw pojedynczy dział, żeby sprawdzić, jak uczę — też możesz. Ale komplet + gwarancja to najspokojniejsza droga do wyniku, na którym Ci zależy.*
