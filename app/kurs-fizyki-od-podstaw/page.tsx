import type { Metadata } from 'next';
import Link from 'next/link';
import {
  SeoHero,
  SeoFaq,
  faqLd,
  JsonLd,
  breadcrumbLd,
  RelatedCard,
  RelatedGrid,
} from '@/components/seo/SeoBits';
import { FullCourseOffer, LeadBox, SeoSalesLayer } from '@/components/seo/SalesBits';
import { COURSES, PLANS, SINGLE_COURSE_PRICE, TUTORING_PRICE } from '@/lib/courses';
import { courseLd, landingOpenGraph, DZIAL_PATH, MATURA } from '@/lib/kurs';
import { getTopic, seoTitle, SITE_UPDATED, type Faq } from '@/lib/seo';
import { SITE } from '@/lib/site';

// Strona pod frazy „kurs fizyki od podstaw” / „fizyka od zera do matury”.
// Inna intencja niż strona główna: czytelnik nie wybiera jeszcze kursu, tylko
// sprawdza, czy z jego poziomu w ogóle da się zdążyć i od czego zacząć.

const fullPlan = PLANS.find((p) => p.key === 'full_access')!;
const PATH = '/kurs-fizyki-od-podstaw/';
const TITLE = 'Kurs fizyki od podstaw - od zera do matury';
const DESC = `Kurs fizyki od podstaw do matury rozszerzonej ${MATURA.year}: każdy z 16 działów zaczyna się od zera - wideo, teoria, proste zadania, potem arkusze CKE. Z planerem.`;

export const metadata: Metadata = {
  title: seoTitle(TITLE),
  description: DESC,
  alternates: { canonical: PATH },
  ...landingOpenGraph(TITLE, DESC, PATH),
};

// Bloki tematyczne w kolejności przerabiania (id działów z lib/courses.ts).
const blocks: { name: string; ids: number[]; why: string }[] = [
  {
    name: 'Mechanika',
    ids: [1, 2, 3, 4],
    why: 'Fundament całej fizyki. Tu uczysz się wektorów, czytania wykresów i układania równań - bez tego kolejne działy są zgadywaniem.',
  },
  {
    name: 'Drgania i fale',
    ids: [5, 6],
    why: 'Korzystają wprost z dynamiki i energii. Te same pojęcia (okres, częstotliwość, długość fali) wrócą potem w optyce.',
  },
  {
    name: 'Ciecze, gazy i ciepło',
    ids: [7, 8],
    why: 'Stosunkowo niezależne od reszty, z powtarzalnymi typami zadań - dobre miejsce na pierwsze pewne punkty.',
  },
  {
    name: 'Pola: grawitacja, elektryczność, magnetyzm',
    ids: [9, 10, 11, 12, 13],
    why: 'Najobszerniejszy blok kursu - pięć działów. Grawitacja i elektrostatyka mają bliźniaczy opis, więc przerabiane po sobie wzajemnie się tłumaczą.',
  },
  {
    name: 'Optyka i fizyka współczesna',
    ids: [14, 15, 16],
    why: 'Na koniec, bo wymagają fal i energii. Zadania są tu krótsze, ale oparte na rozumieniu zjawisk.',
  },
];

const mistakes = [
  {
    t: 'Wkuwanie wzorów zamiast zrozumienia',
    d: 'Na maturze dostajesz kartę wzorów. Punkty są za to, że wiesz, który wzór opisuje sytuację z zadania i dlaczego.',
  },
  {
    t: 'Oglądanie bez rozwiązywania',
    d: 'Po lekcji wideo wszystko wydaje się jasne. Sprawdzianem jest dopiero zadanie zrobione samodzielnie, bez podglądania rozwiązania.',
  },
  {
    t: 'Pomijanie mechaniki',
    d: 'Kuszące, bo „to było w pierwszej klasie”. Braki z kinematyki i dynamiki wracają potem w co drugim dziale.',
  },
  {
    t: 'Arkusze dopiero w ostatnim tygodniu',
    d: 'Pełne arkusze na czas to osobna umiejętność. Zostaw na nie kilka tygodni, nie kilka dni.',
  },
];

const faq: Faq[] = [
  {
    q: 'Czy da się nauczyć fizyki od podstaw do matury rozszerzonej?',
    a: 'Tak. Fizyka w szkole średniej jest ułożona jak schody: kto zacznie od mechaniki i przy każdym dziale rozwiąże zadania samodzielnie, ten dojdzie do poziomu maturalnego. Najtrudniej jest bez planu - dlatego kurs ma stałą ścieżkę w każdym dziale i planer, który rozpisuje naukę na dni.',
  },
  {
    q: 'Od czego zacząć naukę fizyki od zera?',
    a: 'Od kinematyki, a potem dynamiki i energii. Mechanika uczy narzędzi, których używa cała reszta fizyki: wektorów, wykresów, układania równań. Dopiero po niej warto przechodzić do drgań, termodynamiki, elektryczności i optyki.',
  },
  {
    q: 'Ile czasu potrzeba, żeby przygotować się do matury z fizyki od podstaw?',
    a: 'Nie ma jednej liczby - zależy od tego, ile godzin tygodniowo możesz poświęcić i jak mocna jest Twoja matematyka. Im wcześniej zaczniesz, tym mniej materiału przypada na jeden dzień. Darmowy planer pokaże Ci dzienne obciążenie dla Twojej daty startu, zanim cokolwiek kupisz.',
  },
  {
    q: 'Czy kurs od podstaw nie będzie za łatwy na maturę rozszerzoną?',
    a: 'Nie. Od podstaw zaczyna się każdy dział, ale kończy na poziomie egzaminu: Poziom 3 to autorskie zadania maturalne, a Poziom 4 to prawdziwe zadania z arkuszy CKE.',
  },
  {
    q: 'Jaka matematyka jest potrzebna do fizyki?',
    a: 'Przekształcanie wzorów, proporcje, funkcja liniowa i kwadratowa, trygonometria w trójkącie prostokątnym oraz działania na potęgach i notacji wykładniczej. To zakres liceum - nie potrzebujesz pochodnych ani całek.',
  },
  {
    q: 'Co, jeśli utknę na jakimś temacie?',
    a: `Najpierw wróć do lekcji wideo i zadań z Poziomu 1 danego działu. Jeśli to nie wystarczy, możesz umówić korepetycje (${TUTORING_PRICE} zł za 60 minut, online lub w Lublinie) albo wybrać wariant VIP 1:1 z cotygodniowymi zajęciami aż do matury.`,
  },
];

const h2 = 'mb-3 font-display text-2xl font-extrabold text-ink';

export default function KursOdPodstawPage() {
  const crumbs = [
    { name: 'Strona główna', url: '/' },
    { name: 'Kurs fizyki online', url: '/kurs-fizyki-online/' },
    { name: 'Kurs fizyki od podstaw' },
  ];

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Kurs fizyki od podstaw - od zera do matury rozszerzonej',
    inLanguage: 'pl',
    description: DESC,
    author: { '@type': 'Person', '@id': `${SITE.url}/#czarek`, name: SITE.owner },
    publisher: { '@id': `${SITE.url}/#org` },
    about: { '@id': `${SITE.url}/#kurs` },
    mainEntityOfPage: SITE.url + PATH,
    image: `${SITE.url}/images/logo_magenta.png`,
    datePublished: '2026-10-02',
    dateModified: SITE_UPDATED,
  };

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs), courseLd(), article, faqLd(faq)!]} />
      <SeoHero
        eyebrow="Kurs fizyki od podstaw"
        title="Kurs fizyki od podstaw - od zera do matury rozszerzonej"
        intro="Masz braki z pierwszej klasy, zmieniłeś profil albo fizyka w szkole praktycznie nie istniała? Każdy z 16 działów kursu zaczyna się od zera i kończy na zadaniach z arkuszy CKE."
        crumbs={crumbs}
      >
        <Link
          href="#oferta"
          data-cta="hero_oferta"
          className="rounded-full bg-[linear-gradient(120deg,#6b4df6,#a855f7,#f43f8f)] px-6 py-3 font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
        >
          Zobacz kurs
        </Link>
        <Link
          href="/kurs-fizyki-online"
          data-cta="hero_program"
          className="rounded-full bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
        >
          Pełny program 16 działów
        </Link>
      </SeoHero>

      <section className="bg-cloud py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="space-y-10">
            <section>
              <h2 className={h2}>Czy da się nauczyć fizyki od podstaw do matury?</h2>
              <div className="prose-fs">
                <p>
                  Tak - pod warunkiem, że zaczniesz od mechaniki i nie pominiesz zadań. Fizyka w
                  szkole średniej jest ułożona jak schody: każdy dział korzysta z poprzednich,
                  więc największym problemem zwykle nie jest trudność materiału, tylko dziury na
                  niższych stopniach.
                </p>
                <p>
                  Kurs Fizyka Statkiem jest zbudowany właśnie pod taki start. W każdym z{' '}
                  {COURSES.length} działów najpierw oglądasz lekcję, w której temat jest
                  wytłumaczony od zera, potem przerabiasz teorię z prostymi zadaniami, a dopiero
                  na końcu wchodzisz na poziom maturalny. Nie musisz pamiętać niczego z lekcji w
                  szkole - wystarczy matematyka na poziomie liceum.
                </p>
              </div>
            </section>

            <section>
              <h2 className={h2}>Jak kurs prowadzi od zera do poziomu maturalnego</h2>
              <p className="prose-fs">
                Każdy dział przechodzisz w tej samej kolejności. Pierwsze dwa kroki budują
                podstawy, kolejne podnoszą poprzeczkę do poziomu arkusza.
              </p>
              <ol className="mt-5 space-y-3">
                {DZIAL_PATH.map((s, i) => (
                  <li
                    key={s.name}
                    className="flex gap-4 rounded-2xl border border-line bg-white p-5 shadow-soft"
                  >
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-500 text-sm font-extrabold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-ink">{s.name}</h3>
                      <p className="mt-1 text-sm text-muted">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <FullCourseOffer />

            <section>
              <h2 className={h2}>Od czego zacząć: kolejność działów dla początkujących</h2>
              <p className="prose-fs">
                Działy kursu są ponumerowane w kolejności, w jakiej najlepiej je przerabiać.
                Układają się w pięć bloków - przy każdym dziale możesz od razu zajrzeć do darmowej
                teorii.
              </p>
              <div className="mt-5 space-y-4">
                {blocks.map((b, i) => (
                  <div key={b.name} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
                    <h3 className="font-extrabold text-ink">
                      {i + 1}. {b.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted">{b.why}</p>
                    <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                      {b.ids.map((id) => {
                        const c = COURSES.find((x) => x.id === id);
                        if (!c) return null;
                        const cls =
                          'inline-block rounded-full bg-brand-50 px-3 py-1.5 font-semibold text-brand-700 ring-1 ring-brand-100';
                        return (
                          <li key={id}>
                            {getTopic(c.slug) ? (
                              <Link href={`/fizyka/${c.slug}`} className={`${cls} transition hover:bg-brand-100`}>
                                {c.icon} {c.title}
                              </Link>
                            ) : (
                              <span className={cls}>
                                {c.icon} {c.title}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className={h2}>Czego potrzebujesz na start</h2>
              <div className="prose-fs">
                <ul>
                  <li>
                    <strong>Matematyki na poziomie liceum</strong> - przekształcanie wzorów,
                    proporcje, funkcja liniowa i kwadratowa, trygonometria w trójkącie
                    prostokątnym, potęgi i notacja wykładnicza. Szczegóły w artykule{' '}
                    <Link href="/blog/jaka-matematyka-potrzebna-do-fizyki">
                      jaka matematyka jest potrzebna do fizyki
                    </Link>
                    .
                  </li>
                  <li>
                    <strong>Karty wzorów CKE</strong> - ucz się z nią od pierwszego działu, bo tę
                    samą dostaniesz na egzaminie. Zobacz,{' '}
                    <Link href="/blog/karta-wzorow-maturalnych-fizyka">
                      jak korzystać z karty wzorów
                    </Link>
                    .
                  </li>
                  <li>
                    <strong>Planu</strong> - bez niego nauka od zera kończy się na trzecim dziale.{' '}
                    <Link href="/planer">Darmowy planer</Link> rozpisze Ci działy dzień po dniu do
                    matury ({MATURA.examDate}).
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className={h2}>Ile czasu potrzeba, żeby nauczyć się fizyki od zera</h2>
              <div className="prose-fs">
                <p>
                  Uczciwie: nie ma jednej liczby. Zależy to od tego, ile godzin tygodniowo możesz
                  uczyć się fizyki i jak mocna jest Twoja matematyka. Pewne jest jedno - im
                  wcześniej zaczniesz, tym mniej materiału przypada na jeden dzień.
                </p>
                <p>
                  Planer pokazuje dzienne obciążenie dla Twojej daty startu i ostrzega, gdy plan
                  robi się nierealny. Ma trzy tryby: <strong>pełną ścieżkę</strong> (wszystkie
                  kroki działu), <strong>tryb skrócony</strong> (bez arkuszy CKE i quizów) oraz{' '}
                  <strong>tryb ratunkowy</strong> (lekcje wideo i autorskie zadania maturalne) -
                  na sytuację, gdy do matury zostały tygodnie, a nie miesiące.
                </p>
              </div>
            </section>

            <section>
              <h2 className={h2}>Cztery błędy przy nauce fizyki od podstaw</h2>
              <ul className="mt-2 grid gap-3 sm:grid-cols-2">
                {mistakes.map((m) => (
                  <li key={m.t} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
                    <h3 className="font-extrabold text-ink">{m.t}</h3>
                    <p className="mt-1 text-sm text-muted">{m.d}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className={h2}>Ile kosztuje kurs fizyki od podstaw</h2>
              <div className="prose-fs">
                <p>
                  Kurs Pełny - wszystkie {COURSES.length} działów, PDF-y, zadania, quizy i planer -
                  kosztuje <strong>{fullPlan.price} zł jednorazowo</strong>, bez abonamentu. Jeśli
                  chcesz najpierw sprawdzić, czy ten sposób tłumaczenia Ci odpowiada, możesz
                  kupić sam pierwszy dział (kinematykę) za {SINGLE_COURSE_PRICE} zł. Warianty i
                  porównanie znajdziesz w <Link href="/cennik">cenniku</Link>, a całość oferty na
                  stronie <Link href="/">kursu maturalnego z fizyki</Link>.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12">
            <SeoFaq faqs={faq} />
          </div>

          <LeadBox source="kurs-fizyki-od-podstaw" leadSource="planer_squeeze" />
        </div>
      </section>

      <SeoSalesLayer pageType="landing_kurs_od_podstaw" />

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">Zobacz również</h2>
          <RelatedGrid>
            <RelatedCard
              kicker="Program"
              title="Kurs fizyki online - 16 działów"
              desc="Pełna lista zagadnień i ścieżka każdego działu."
              href="/kurs-fizyki-online"
            />
            <RelatedCard
              kicker="Poradnik"
              title="Jak nauczyć się fizyki do matury"
              desc="Plan nauki krok po kroku."
              href="/blog/jak-nauczyc-sie-fizyki-do-matury"
            />
            <RelatedCard
              kicker="Poradnik"
              title="Kiedy zacząć przygotowania do matury z fizyki"
              desc={`Harmonogram do ${MATURA.examDate}.`}
              href="/blog/kiedy-zaczac-przygotowania-do-matury-z-fizyki"
            />
          </RelatedGrid>
        </div>
      </section>
    </>
  );
}
