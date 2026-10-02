import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { FaqSection, type FaqItem } from '@/components/ui/Faq';
import { PricingTiers } from '@/components/shop/PricingTiers';
import { CourseFactsTable } from '@/components/landing/CourseFacts';
import { JsonLd, breadcrumbLd, faqLd, RelatedCard, RelatedGrid } from '@/components/seo/SeoBits';
import { CtaTracker } from '@/components/seo/SeoClient';
import { COURSES, PLANS, SINGLE_COURSE_PRICE, TUTORING_PRICE } from '@/lib/courses';
import { courseLd, landingOpenGraph, DZIAL_PATH, MATURA, VIDEO_HOURS } from '@/lib/kurs';
import { getTopic, seoTitle } from '@/lib/seo';
import { SITE } from '@/lib/site';

// Strona programu kursu pod frazy „kurs fizyki online” / „kurs z fizyki” /
// „kurs fizyka program”. Frazę „kurs maturalny z fizyki” trzyma strona główna -
// tutaj jest to, czego tam nie ma: pełny sylabus zwykłym tekstem.

const fullPlan = PLANS.find((p) => p.key === 'full_access')!;
const PATH = '/kurs-fizyki-online/';
const TITLE = 'Kurs fizyki online - program 16 działów do matury';
const DESC = `Kurs fizyki online do matury rozszerzonej: pełny program 16 działów z listą zagadnień, ścieżka od lekcji wideo po arkusze CKE. ${fullPlan.price} zł jednorazowo.`;

export const metadata: Metadata = {
  title: seoTitle(TITLE),
  description: DESC,
  alternates: { canonical: PATH },
  ...landingOpenGraph(TITLE, DESC, PATH),
};

const faq: FaqItem[] = [
  {
    q: 'Czy kurs fizyki online wystarczy, żeby przygotować się do matury rozszerzonej?',
    a: `Tak, jeśli przerabiasz go systematycznie. Kurs obejmuje pełny zakres wymagań CKE (16 działów), a każdy dział prowadzi od lekcji wideo przez zadania o rosnącej trudności do prawdziwych zadań z arkuszy. Gdy utkniesz na konkretnym temacie, możesz dołożyć korepetycje (${TUTORING_PRICE} zł za 60 minut) albo wybrać wariant VIP 1:1 z cotygodniowymi zajęciami.`,
  },
  {
    q: 'Ile czasu zajmuje przerobienie całego kursu fizyki?',
    a: 'To zależy od tego, ile już umiesz i ile zostało do matury. Darmowy planer rozkłada 16 działów na dni do egzaminu, pomija działy, które zaznaczysz jako opanowane, i rezerwuje ostatnie 3 tygodnie na arkusze rozwiązywane na czas. Gdy czasu jest mało, proponuje skrócony tryb planu.',
  },
  {
    q: 'W jakiej kolejności przerabiać działy?',
    a: 'Po kolei, od działu 1 do 16: mechanika (kinematyka, dynamika, energia, bryła sztywna), drgania i fale, hydrostatyka i termodynamika, grawitacja, elektryczność i magnetyzm, optyka, na końcu fizyka atomowa i jądrowa. Późniejsze działy korzystają z wcześniejszych - ruch drgający z dynamiki, a magnetyzm z ruchu po okręgu.',
  },
  {
    q: 'Czy mogę sprawdzić kurs przed zakupem?',
    a: `Tak. Za darmo dostępne są: planer nauki, moduł „Tutaj zacznij” z lekcjami wprowadzającymi oraz baza wiedzy z teorią, wzorami i zadaniami z rozwiązaniami. Możesz też kupić jeden dział za ${SINGLE_COURSE_PRICE} zł zamiast całego kursu.`,
  },
  {
    q: 'Czy to kurs fizyki także dla technikum?',
    a: 'Tak. Matura z fizyki jest ta sama dla liceum i technikum, więc program kursu jest identyczny. Lekcje są nagrane, dlatego łatwo pogodzić je z praktykami i egzaminami zawodowymi.',
  },
  {
    q: 'Czy kurs obejmuje fizykę na poziomie podstawowym?',
    a: 'Matura z fizyki jest zdawana wyłącznie na poziomie rozszerzonym, dlatego kurs przygotowuje właśnie do niego. Każdy dział zaczyna się jednak od podstaw, więc nie musisz mieć opanowanego materiału z lekcji w szkole.',
  },
  {
    q: 'Czy ten kurs nadaje się na studia albo dla ucznia szkoły podstawowej?',
    a: 'Kurs jest zbudowany pod maturę rozszerzoną. Studentom pierwszego roku pomoże powtórzyć fizykę ze szkoły średniej, ale nie obejmuje materiału akademickiego. Uczniom szkoły podstawowej i osobom, które potrzebują pomocy z bieżącym materiałem szkolnym, lepiej posłużą korepetycje.',
  },
];

const forWho = [
  'Zdajesz maturę rozszerzoną z fizyki i chcesz przerobić cały materiał w jednym miejscu, zamiast składać go z wielu źródeł.',
  'Jesteś w 2. lub 3. klasie liceum albo technikum i chcesz zacząć wcześniej, dział po dziale.',
  'Poprawiasz wynik matury i potrzebujesz uporządkowanej powtórki z zadaniami z arkuszy.',
  'Masz zaległości z konkretnych działów - wtedy możesz kupić tylko te działy.',
];

const notForWho = [
  'Szukasz kursu fizyki akademickiej (studia) - tu jest zakres szkoły średniej.',
  'Potrzebujesz zajęć na żywo w grupie o stałej godzinie - kurs to nagrania; na żywo są zajęcia VIP 1:1 i korepetycje.',
];

export default function KursFizykiOnlinePage() {
  const crumbs = [
    { name: 'Start', url: '/' },
    { name: 'Kurs fizyki online', url: PATH },
  ];

  const syllabusLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Program kursu fizyki online - 16 działów',
    numberOfItems: COURSES.length,
    itemListElement: COURSES.map((c) => ({
      '@type': 'ListItem',
      position: c.id,
      name: c.title,
      description: c.topics.join('; '),
    })),
  };

  return (
    <>
      <JsonLd data={[courseLd(), syllabusLd, faqLd(faq)!, breadcrumbLd(crumbs)]} />
      <CtaTracker pageType="landing_kurs_online" />

      <PageHero
        eyebrow={`Program kursu · matura ${MATURA.year}`}
        title={
          <>
            Kurs fizyki online - program{' '}
            <span className="text-gradient">16 działów</span> do matury rozszerzonej
          </>
        }
        subtitle="Cały zakres matury z fizyki rozpisany na 16 działów. Każdy przerabiasz tą samą ścieżką: lekcja wideo, teoria, zadania o rosnącej trudności, arkusze CKE i quiz. Poniżej pełna lista zagadnień."
        crumbs={[{ label: 'Start', href: '/' }, { label: 'Kurs fizyki online' }]}
      >
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button href="#cennik" variant="gradient" size="lg" data-cta="hero_cennik">
            Zobacz ceny kursu
          </Button>
          <Button href="#program" variant="light" size="lg" data-cta="hero_program">
            Przejdź do programu
          </Button>
        </div>
      </PageHero>

      {/* Odpowiedź wprost + fakty */}
      <section className="bg-cloud py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Czym jest kurs fizyki online Fizyka Statkiem
            </h2>
            <p className="prose-fs mt-4">
              Fizyka Statkiem to kurs fizyki online przygotowujący do matury na poziomie
              rozszerzonym. Składa się z {COURSES.length} działów, które pokrywają pełny zakres
              wymagań CKE - od kinematyki po fizykę jądrową i relatywistykę. Kurs jest nagrany:
              ponad {VIDEO_HOURS} godzin lekcji wideo, PDF-y, zadania i quizy dostajesz od razu po zakupie i przerabiasz we
              własnym tempie. Kurs Pełny kosztuje {fullPlan.price} zł jednorazowo, a dostęp trwa do
              końca sesji maturalnej.
            </p>
            <div className="mt-8">
              <CourseFactsTable />
            </div>
          </div>
        </Container>
      </section>

      {/* Ścieżka jednego działu */}
      <section className="bg-white py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Jak wygląda nauka jednego działu
            </h2>
            <p className="prose-fs mt-4">
              Każdy z {COURSES.length} działów ma tę samą budowę, więc po pierwszym wiesz, czego
              się spodziewać w kolejnych. Trudność rośnie stopniowo - od zrozumienia zjawiska do
              zadań z prawdziwych arkuszy.
            </p>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2">
              {DZIAL_PATH.map((s, i) => (
                <li
                  key={s.name}
                  className="flex gap-4 rounded-2xl border border-line bg-cloud p-5 shadow-soft"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-500 text-sm font-extrabold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-ink">{s.name}</h3>
                    <p className="mt-1 text-sm text-muted">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* Pełny program */}
      <section id="program" className="scroll-mt-20 bg-cloud py-14 sm:py-20">
        <Container size="wide">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Program kursu fizyki: 16 działów i lista zagadnień
            </h2>
            <p className="mt-3 text-muted">
              Działy są ułożone w kolejności, w jakiej najlepiej je przerabiać. Przy każdym
              znajdziesz link do darmowej teorii z bazy wiedzy - możesz sprawdzić, jak tłumaczymy
              dany temat, zanim kupisz kurs.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {COURSES.map((c) => {
              const topic = getTopic(c.slug);
              return (
                <article
                  key={c.id}
                  id={`dzial-${c.id}`}
                  className="scroll-mt-24 rounded-3xl border border-line bg-white p-6 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f2efff,#ffe6f3)] text-2xl ring-1 ring-brand-100">
                      {c.icon}
                    </span>
                    <h3 className="text-lg font-extrabold leading-tight text-ink">
                      <span className="block text-xs font-bold uppercase tracking-wider text-brand-500">
                        Dział {c.id}
                      </span>
                      {c.title}
                    </h3>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-sm text-slate">
                    {c.topics.map((t) => (
                      <li key={t} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-400" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  {topic && (
                    <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-4 text-sm font-semibold">
                      <Link href={`/fizyka/${topic.slug}`} className="text-brand-600 hover:text-magenta-600">
                        Teoria i wzory
                      </Link>
                      <Link
                        href={`/zadania-z-fizyki/${topic.slug}`}
                        className="text-brand-600 hover:text-magenta-600"
                      >
                        Zadania z rozwiązaniami
                      </Link>
                      <Link
                        href={`/matura-z-fizyki/${topic.slug}`}
                        className="text-brand-600 hover:text-magenta-600"
                      >
                        {c.title} na maturze
                      </Link>
                    </p>
                  )}
                </article>
              );
            })}
          </div>

          <p className="mt-8 text-center text-sm text-muted">
            Potrzebujesz tylko wybranych działów?{' '}
            <Link
              href="/dzialy"
              className="font-semibold text-brand-600 underline underline-offset-4 hover:text-magenta-600"
            >
              Pojedynczy dział kosztuje {SINGLE_COURSE_PRICE} zł →
            </Link>
          </p>
        </Container>
      </section>

      {/* Dla kogo */}
      <section className="bg-white py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Dla kogo jest ten kurs fizyki
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl border border-brand-100 bg-brand-50/50 p-6">
                <h3 className="font-extrabold text-ink">Kurs jest dla Ciebie, jeśli:</h3>
                <ul className="mt-3 space-y-2.5 text-sm text-slate">
                  {forWho.map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <span className="font-bold text-brand-600">✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-line bg-cloud p-6">
                <h3 className="font-extrabold text-ink">Lepiej wybierz coś innego, jeśli:</h3>
                <ul className="mt-3 space-y-2.5 text-sm text-slate">
                  {notForWho.map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <span className="font-bold text-muted">-</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-slate">
                  Zaczynasz fizykę od zera? Zobacz{' '}
                  <Link
                    href="/kurs-fizyki-od-podstaw"
                    className="font-semibold text-brand-600 underline underline-offset-4 hover:text-magenta-600"
                  >
                    kurs fizyki od podstaw
                  </Link>
                  . Wolisz pracę 1:1? Sprawdź{' '}
                  <Link
                    href="/korepetycje"
                    className="font-semibold text-brand-600 underline underline-offset-4 hover:text-magenta-600"
                  >
                    korepetycje z fizyki
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Cennik */}
      <section id="cennik" className="scroll-mt-20 bg-cloud py-14 sm:py-20">
        <Container size="wide">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Ile kosztuje kurs fizyki online
            </h2>
            <p className="mt-3 text-muted">
              Płacisz raz - bez abonamentu. Kurs Pełny to wszystkie {COURSES.length} działów za{' '}
              {fullPlan.price} zł, czyli ok. {Math.round(fullPlan.price / COURSES.length)} zł za
              dział.
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

      <FaqSection
        items={faq}
        title="Pytania o kurs fizyki online"
        subtitle={`Nie ma tu Twojego pytania? Napisz: ${SITE.email}`}
      />

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">Zobacz również</h2>
          <RelatedGrid>
            <RelatedCard
              kicker="Oferta"
              title="Kurs maturalny z fizyki"
              desc="Strona główna kursu: opinie, gwarancja i warianty."
              href="/"
            />
            <RelatedCard
              kicker="Start od zera"
              title="Kurs fizyki od podstaw"
              desc="Jak przejść od braków do matury rozszerzonej."
              href="/kurs-fizyki-od-podstaw"
            />
            <RelatedCard
              kicker="Poradnik"
              title="Ile kosztuje kurs maturalny z fizyki"
              desc="Ceny kursów wideo i zajęć na żywo - porównanie."
              href="/blog/ile-kosztuje-kurs-maturalny-z-fizyki"
            />
          </RelatedGrid>
        </div>
      </section>
    </>
  );
}
