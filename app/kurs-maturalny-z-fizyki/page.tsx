import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { FaqSection, type FaqItem } from '@/components/ui/Faq';
import { PricingTiers } from '@/components/shop/PricingTiers';
import { CourseFactsTable } from '@/components/landing/CourseFacts';
import { SocialProof } from '@/components/landing/SocialProof';
import { Testimonials } from '@/components/landing/Testimonials';
import { Guarantee } from '@/components/landing/Guarantee';
import { JsonLd, breadcrumbLd, faqLd, RelatedCard, RelatedGrid } from '@/components/seo/SeoBits';
import { CtaTracker } from '@/components/seo/SeoClient';
import { COURSES, PLANS, SINGLE_COURSE_PRICE, TUTORING_PRICE, VIP_SEATS } from '@/lib/courses';
import { courseLd, landingOpenGraph, DZIAL_PATH, MATURA, VIDEO_HOURS } from '@/lib/kurs';
import { seoTitle } from '@/lib/seo';
import { SITE } from '@/lib/site';

// Strona docelowa pod frazy komercyjne „kurs maturalny z fizyki”, „kurs maturalny
// z fizyki online”, „kurs maturalny fizyka (rozszerzona)”. Konkurencja rankuje na
// nie osobnymi stronami z taką frazą w adresie, a u nas trzymała ją strona główna,
// którą Google traktuje brandowo (GSC, XI 2026: na te zapytania wyświetlały się
// wpisy bloga na pozycjach 34-43). Strona główna zostaje stroną marki i oferty,
// tutaj jest jedna odpowiedź na jedno pytanie: jaki to kurs, dla kogo, za ile,
// czym różni się od zajęć na żywo i stacjonarnych, kiedy zacząć.
// Program działów zwykłym tekstem ma /kurs-fizyki-online/ (celowo nie dublujemy).

const fullPlan = PLANS.find((p) => p.key === 'full_access')!;
const vipPlan = PLANS.find((p) => p.key === 'vip')!;
const PATH = '/kurs-maturalny-z-fizyki/';
const TITLE = `Kurs maturalny z fizyki online - matura ${MATURA.year}`;
const DESC = `Kurs maturalny z fizyki online do matury ${MATURA.year} (rozszerzenie): 16 działów wideo HD, PDF-y, zadania CKE, quizy i planer. ${fullPlan.price} zł raz, bez abonamentu. 28/28 zdało.`;

export const metadata: Metadata = {
  title: seoTitle(TITLE),
  description: DESC,
  alternates: { canonical: PATH },
  ...landingOpenGraph(TITLE, DESC, PATH),
};

// Pytania z sekcji „Więcej pytań” Google dla tej frazy + te, które dostajemy
// mailem. Każda odpowiedź jest samodzielna (da się ją zacytować bez reszty strony).
const faq: FaqItem[] = [
  {
    q: 'Czy kurs maturalny z fizyki online wystarczy, żeby zdać maturę rozszerzoną?',
    a: `Tak, jeśli przerabiasz go systematycznie. Kurs obejmuje pełny zakres wymagań CKE na poziomie rozszerzonym (16 działów), a każdy dział kończysz na prawdziwych zadaniach z arkuszy. Nasi absolwenci zdali maturę w 28 na 28 przypadków. Jeśli utkniesz na konkretnym temacie, możesz dołożyć korepetycje (${TUTORING_PRICE} zł za 60 minut) albo wybrać wariant VIP 1:1 z cotygodniowymi zajęciami.`,
  },
  {
    q: 'Kiedy warto zapisać się na kurs maturalny z fizyki?',
    a: `Najlepiej na początku klasy maturalnej, czyli we wrześniu lub październiku: wtedy wychodzi mniej niż jeden dział na dwa tygodnie. Zapis w styczniu nadal daje czas na całość, ale tempo rośnie do działu na tydzień. Po marcu kurs ma sens w trybie skróconym: planer wybiera działy z największą liczbą punktów na maturze i rezerwuje ostatnie tygodnie na arkusze. Matura z fizyki ${MATURA.year} odbędzie się ${MATURA.examDate}.`,
  },
  {
    q: 'Ile kosztuje kurs maturalny z fizyki online?',
    a: `Kurs Pełny kosztuje ${fullPlan.price} zł jednorazowo, bez abonamentu, z dostępem do wszystkich 16 działów do końca sesji maturalnej. Pojedynczy dział kosztuje ${SINGLE_COURSE_PRICE} zł, a VIP 1:1 z cotygodniowymi zajęciami indywidualnymi ${vipPlan.price} zł. Dla porównania: roczne kursy grupowe na żywo kosztują zwykle 2000 do 2800 zł.`,
  },
  {
    q: 'Czy jest darmowy kurs maturalny z fizyki?',
    a: 'Za darmo dostajesz trzy rzeczy: planer nauki, który rozkłada 16 działów na dni do matury, moduł „Tutaj zacznij” z lekcjami wprowadzającymi oraz bazę wiedzy z teorią, wzorami i zadaniami z rozwiązaniami do każdego działu. To wystarczy, żeby sprawdzić, czy sposób tłumaczenia Ci odpowiada, zanim zapłacisz za cały kurs.',
  },
  {
    q: 'Czy to kurs na żywo, czy z nagrań?',
    a: `Kurs Pełny to nagrania: ponad ${VIDEO_HOURS} godzin lekcji wideo HD, PDF-y, zadania i quizy dostępne od razu po zakupie. Uczysz się wtedy, kiedy masz czas, i wracasz do każdej lekcji bez limitu. Zajęcia na żywo są w wariancie VIP 1:1 (godzina tygodniowo z Czarkiem) oraz na korepetycjach.`,
  },
  {
    q: 'Czy kurs obejmuje fizykę rozszerzoną w pełnym zakresie?',
    a: 'Tak. Matura z fizyki jest zdawana wyłącznie na poziomie rozszerzonym i kurs przygotowuje właśnie do niego: od kinematyki i dynamiki, przez termodynamikę, elektryczność i magnetyzm, po optykę, fizykę atomową i jądrową. Każdy dział zaczyna się od podstaw, więc nie musisz mieć opanowanego materiału ze szkoły.',
  },
  {
    q: 'Czy kurs nadaje się dla technikum?',
    a: 'Tak. Matura z fizyki jest ta sama dla liceum i technikum, więc program kursu jest identyczny. Lekcje są nagrane, dlatego łatwo pogodzić je z praktykami i egzaminami zawodowymi.',
  },
  {
    q: 'Jak długo mam dostęp do kursu?',
    a: 'Dostęp do wszystkich materiałów masz do końca sesji maturalnej, czyli także w dniach poprawek i w trakcie czekania na wyniki. Nie ma abonamentu ani automatycznych płatności.',
  },
  {
    q: 'Jak działa Gwarancja Dobrego Wyniku?',
    a: 'Jeśli przerobisz co najmniej 90% materiałów kursu, kupisz go najpóźniej 30 dni przed egzaminem, podejdziesz do matury z fizyki i mimo to uzyskasz wynik poniżej 30%, możesz ubiegać się o zwrot ceny kursu. Zgłoszenie wysyłasz mailem w ciągu 7 dni od otrzymania oficjalnego wyniku. Szczegóły są w regulaminie (§9).',
  },
];

// Porównanie form kursu maturalnego: po to, żeby osoba szukająca „kursu
// maturalnego online” wiedziała, co wybiera (i żeby strona odpowiadała także na
// ogólniejsze zapytania o kurs maturalny online / stacjonarny).
const compareRows: { label: string; nagrania: string; zywo: string; stacjonarny: string }[] = [
  {
    label: 'Kiedy się uczysz',
    nagrania: 'Kiedy chcesz, 24/7. Lekcje czekają na platformie.',
    zywo: 'W stałych terminach, zwykle wieczorem w tygodniu.',
    stacjonarny: 'W stałych terminach plus dojazd.',
  },
  {
    label: 'Tempo',
    nagrania: 'Twoje. Trudny dział oglądasz dwa razy, łatwy w tydzień.',
    zywo: 'Tempo grupy. Nieobecność trzeba nadrobić z nagrania.',
    stacjonarny: 'Tempo grupy. Nieobecność przepada.',
  },
  {
    label: 'Powtórka przed maturą',
    nagrania: 'Bez limitu: wracasz do każdej lekcji i zadania.',
    zywo: 'Zależy, czy nagrania są udostępniane i jak długo.',
    stacjonarny: 'Z własnych notatek.',
  },
  {
    label: 'Zadania i arkusze',
    nagrania: 'Zadania z rozwiązaniami krok po kroku, arkusze CKE, quizy.',
    zywo: 'Zadania na zajęciach, część jako praca domowa.',
    stacjonarny: 'Zadania na zajęciach, część jako praca domowa.',
  },
  {
    label: 'Koszt za rok',
    nagrania: `${fullPlan.price} zł jednorazowo (Fizyka Statkiem).`,
    zywo: 'Zwykle 2000 do 2800 zł, często w miesięcznych ratach.',
    stacjonarny: 'Zwykle 2500 do 3500 zł plus dojazdy.',
  },
  {
    label: 'Kontakt z prowadzącym',
    nagrania: 'Mail, a w wariancie VIP 1:1 cotygodniowe zajęcia indywidualne.',
    zywo: 'Na zajęciach, w grupie kilkunastu osób.',
    stacjonarny: 'Na zajęciach, w grupie.',
  },
];

const timeline = [
  {
    when: 'Wrzesień i październik',
    title: 'Najlepszy moment na start',
    text: 'Masz ponad 30 tygodni do matury, czyli mniej niż jeden dział na dwa tygodnie. Starcza czasu na wszystkie 16 działów, powtórki i arkusze na czas.',
  },
  {
    when: 'Listopad do stycznia',
    title: 'Wciąż cały materiał',
    text: 'Planer układa około jednego działu na tydzień. Zaczynasz od działów z największą liczbą punktów na maturze: mechaniki, elektryczności i termodynamiki.',
  },
  {
    when: 'Luty i marzec',
    title: 'Tryb skrócony',
    text: 'Planer pomija działy, które zaznaczysz jako opanowane, i skupia się na tych, które dają najwięcej punktów. Ostatnie 3 tygodnie zostają na arkusze CKE.',
  },
  {
    when: 'Kwiecień',
    title: 'Pojedyncze działy i arkusze',
    text: `Zamiast całego kursu kup działy, które sprawiają Ci problem (${SINGLE_COURSE_PRICE} zł za dział), i rozwiązuj arkusze z bazy wiedzy. Gwarancja Dobrego Wyniku obejmuje zakupy do 30 dni przed egzaminem.`,
  },
];

export default function KursMaturalnyZFizykiPage() {
  const crumbs = [
    { name: 'Start', url: '/' },
    { name: 'Kurs maturalny z fizyki', url: PATH },
  ];

  return (
    <>
      <JsonLd data={[courseLd(), faqLd(faq)!, breadcrumbLd(crumbs)]} />
      <CtaTracker pageType="landing_kurs_maturalny" />

      <PageHero
        eyebrow={`Matura ${MATURA.year} · poziom rozszerzony · online`}
        title={
          <>
            Kurs maturalny z fizyki online - przygotowanie do matury{' '}
            <span className="text-gradient">krok po kroku</span>
          </>
        }
        subtitle={`Wszystkie 16 działów matury rozszerzonej w jednym kursie: lekcje wideo HD, PDF-y z teorią, zadania z rozwiązaniami, arkusze CKE, quizy i planer, który prowadzi Cię dzień po dniu do ${MATURA.examDate}. ${fullPlan.price} zł jednorazowo, bez abonamentu.`}
        crumbs={[{ label: 'Start', href: '/' }, { label: 'Kurs maturalny z fizyki' }]}
      >
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button href="#cennik" variant="gradient" size="lg" data-cta="hero_cennik">
            Zobacz kurs i ceny
          </Button>
          <Button href="/kurs/0" variant="light" size="lg" data-cta="hero_darmowy_modul">
            Wypróbuj za darmo
          </Button>
        </div>
        <p className="mt-4 text-sm text-slate-300/85">
          28/28 absolwentów zdało maturę · Gwarancja Dobrego Wyniku · BLIK, karta, Klarna
        </p>
      </PageHero>

      {/* Odpowiedź wprost */}
      <section className="bg-cloud py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Kurs maturalny z fizyki online w skrócie
            </h2>
            <p className="prose-fs mt-4">
              Fizyka Statkiem to kurs maturalny z fizyki online na poziomie rozszerzonym. Materiał
              matury jest podzielony na {COURSES.length} działów, od kinematyki po fizykę jądrową i
              relatywistykę, i każdy dział przerabiasz tą samą ścieżką: lekcja wideo, teoria w PDF,
              zadania o rosnącej trudności, prawdziwe arkusze CKE i quiz. Kurs jest nagrany (ponad{' '}
              {VIDEO_HOURS} godzin wideo HD), więc zaczynasz od razu po zakupie i uczysz się we
              własnym tempie, a darmowy planer rozkłada naukę na dni do egzaminu. Kurs Pełny
              kosztuje {fullPlan.price} zł jednorazowo, dostęp masz do końca sesji maturalnej.
            </p>
            <div className="mt-8">
              <CourseFactsTable />
            </div>
          </div>
        </Container>
      </section>

      {/* Co dostajesz + ścieżka działu */}
      <section className="bg-white py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Co dostajesz w kursie
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {fullPlan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 rounded-2xl border border-line bg-cloud px-5 py-4 text-sm text-ink"
                >
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                    ✓
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <h3 className="mt-12 font-display text-xl font-extrabold text-ink sm:text-2xl">
              Jak wygląda nauka jednego działu
            </h3>
            <p className="prose-fs mt-3">
              Każdy z {COURSES.length} działów ma tę samą budowę, więc po pierwszym wiesz, czego
              spodziewać się w kolejnych. Trudność rośnie stopniowo: od zrozumienia zjawiska do
              zadań z prawdziwych arkuszy maturalnych.
            </p>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {DZIAL_PATH.map((s, i) => (
                <li
                  key={s.name}
                  className="flex gap-4 rounded-2xl border border-line bg-cloud p-5 shadow-soft"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-500 text-sm font-extrabold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-ink">{s.name}</h4>
                    <p className="mt-1 text-sm text-muted">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-muted">
              Pełną listę zagadnień każdego działu znajdziesz na stronie{' '}
              <Link
                href="/kurs-fizyki-online"
                className="font-semibold text-brand-600 underline underline-offset-4 hover:text-magenta-600"
              >
                program kursu fizyki online
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      <SocialProof />

      {/* Porównanie form */}
      <section className="bg-white py-14 sm:py-20">
        <Container size="wide">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Kurs maturalny online z nagrań, na żywo czy stacjonarny?
            </h2>
            <p className="mt-3 text-muted">
              Wszystkie trzy formy prowadzą do tej samej matury. Różnią się tym, kto ustala tempo,
              ile razy możesz wrócić do materiału i ile to kosztuje.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-5xl overflow-x-auto rounded-3xl border border-line bg-white shadow-soft">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-cloud/60 text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-4 font-bold" scope="col">
                    Kryterium
                  </th>
                  <th className="px-5 py-4 font-bold text-brand-600" scope="col">
                    Kurs online z nagrań
                  </th>
                  <th className="px-5 py-4 font-bold" scope="col">
                    Kurs online na żywo
                  </th>
                  <th className="px-5 py-4 font-bold" scope="col">
                    Kurs stacjonarny
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {compareRows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row" className="px-5 py-4 align-top font-bold text-ink">
                      {r.label}
                    </th>
                    <td className="px-5 py-4 align-top text-ink">{r.nagrania}</td>
                    <td className="px-5 py-4 align-top text-slate">{r.zywo}</td>
                    <td className="px-5 py-4 align-top text-slate">{r.stacjonarny}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-muted">
            Chcesz nagrań i prowadzenia 1:1 naraz? Wariant VIP ({vipPlan.price} zł) łączy cały
            Kurs Pełny z cotygodniową godziną zajęć indywidualnych aż do matury. Miejsc jest{' '}
            {VIP_SEATS}. Więcej w{' '}
            <Link
              href="/blog/kurs-maturalny-z-fizyki-nagrania-czy-na-zywo"
              className="font-semibold text-brand-600 underline underline-offset-4 hover:text-magenta-600"
            >
              porównaniu kursu z nagrań i na żywo
            </Link>
            .
          </p>
        </Container>
      </section>

      {/* Kiedy zacząć */}
      <section className="bg-cloud py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Kiedy zacząć kurs maturalny z fizyki
            </h2>
            <p className="prose-fs mt-4">
              Im wcześniej, tym spokojniej, ale kurs jest zbudowany tak, żeby dało się go zacząć w
              dowolnym momencie roku. Planer liczy dni do {MATURA.examDate} i dopasowuje plan do
              tego, ile czasu zostało.
            </p>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2">
              {timeline.map((t) => (
                <li key={t.when} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-500">{t.when}</p>
                  <h3 className="mt-1 font-extrabold text-ink">{t.title}</h3>
                  <p className="mt-2 text-sm text-slate">{t.text}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Button href="/planer" variant="outline" size="md" data-cta="planer">
                Rozpisz swój plan nauki za darmo
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Program w pigułce */}
      <section className="bg-white py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Program kursu: {COURSES.length} działów matury rozszerzonej
            </h2>
            <p className="prose-fs mt-4">
              Działy są ułożone w kolejności, w jakiej najlepiej je przerabiać: późniejsze korzystają
              z wcześniejszych. Pojedynczy dział możesz też kupić osobno za {SINGLE_COURSE_PRICE} zł.
            </p>
            <ol className="mt-8 grid gap-2 sm:grid-cols-2">
              {COURSES.map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-xl border border-line bg-cloud px-4 py-3 text-sm">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white text-xs font-extrabold text-brand-600 ring-1 ring-line">
                    {c.id}
                  </span>
                  <span className="font-semibold text-ink">{c.title}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <Link href="/kurs-fizyki-online#program" className="text-brand-600 hover:text-magenta-600">
                Pełna lista zagadnień →
              </Link>
              <Link href="/dzialy" className="text-brand-600 hover:text-magenta-600">
                Pojedyncze działy →
              </Link>
              <Link href="/kurs-fizyki-od-podstaw" className="text-brand-600 hover:text-magenta-600">
                Zaczynasz od zera? Kurs od podstaw →
              </Link>
            </p>
          </div>
        </Container>
      </section>

      <Testimonials />

      {/* Cennik */}
      <section id="cennik" className="scroll-mt-20 bg-cloud py-14 sm:py-20">
        <Container size="wide">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Ile kosztuje kurs maturalny z fizyki online
            </h2>
            <p className="mt-3 text-muted">
              Płacisz raz, bez abonamentu. Kurs Pełny to wszystkie {COURSES.length} działów za{' '}
              {fullPlan.price} zł, czyli około {Math.round(fullPlan.price / COURSES.length)} zł za
              dział albo równowartość {Math.round(fullPlan.price / TUTORING_PRICE)} godzin korepetycji.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-4xl">
            <PricingTiers />
          </div>
          <p className="mt-8 text-center text-sm text-muted">
            Płatność jednorazowa · dostęp do końca matury · BLIK, karta, Klarna ·{' '}
            <Link
              href="/cennik"
              className="font-semibold text-brand-600 underline underline-offset-4 hover:text-magenta-600"
            >
              porównanie wariantów w cenniku
            </Link>
          </p>
        </Container>
      </section>

      <Guarantee />

      <FaqSection
        items={faq}
        title="Pytania o kurs maturalny z fizyki"
        subtitle={`Nie ma tu Twojego pytania? Napisz: ${SITE.email}`}
      />

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">Zobacz również</h2>
          <RelatedGrid>
            <RelatedCard
              kicker="Program"
              title="Kurs fizyki online - 16 działów"
              desc="Pełna lista zagadnień każdego działu zwykłym tekstem."
              href="/kurs-fizyki-online"
            />
            <RelatedCard
              kicker="Poradnik"
              title="Jak wybrać kurs maturalny z fizyki"
              desc="Na co patrzeć, rodzaje kursów i czerwone flagi."
              href="/blog/jak-wybrac-kurs-maturalny-z-fizyki"
            />
            <RelatedCard
              kicker="Ceny"
              title="Ile kosztuje kurs maturalny z fizyki"
              desc="Widełki cen kursów wideo i zajęć na żywo w roku 2026/2027."
              href="/blog/ile-kosztuje-kurs-maturalny-z-fizyki"
            />
          </RelatedGrid>
        </div>
      </section>
    </>
  );
}
