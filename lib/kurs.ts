// Jedno źródło faktów o kursie dla stron sprzedażowych pod frazy „kurs maturalny
// z fizyki” / „kurs fizyki online” (strona główna, /kurs-fizyki-online,
// /kurs-fizyki-od-podstaw). Te same zdania czytają ludzie, Google i silniki AI,
// więc liczby i nazwy muszą być wszędzie identyczne - stąd jeden plik.
import { COURSES, PLANS, SINGLE_COURSE_PRICE, VIP_SEATS } from '@/lib/courses';
import { SITE } from '@/lib/site';

const fullPlan = PLANS.find((p) => p.key === 'full_access')!;
const vipPlan = PLANS.find((p) => p.key === 'vip')!;

/** Najbliższa sesja maturalna, do której przygotowuje kurs (komunikat CKE z 20.08.2026).
 *  Po maturze 2027 podbić ręcznie razem z Hero i tytułem strony głównej. */
export const MATURA = {
  year: 2027,
  examDate: '19 maja 2027',
  extraDate: '11 czerwca 2027',
  resultsDate: '9 lipca 2027',
} as const;

/** Łączny czas lekcji wideo w kursie - „ponad 30 godzin” (potwierdzone przez właściciela 10.2026). */
export const VIDEO_HOURS = 30;

/** Ścieżka każdego działu - ta sama kolejność co w panelu kursu i planerze. */
export const DZIAL_PATH: { name: string; desc: string }[] = [
  {
    name: 'Lekcja wideo',
    desc: 'Temat wytłumaczony od zera: skąd bierze się zjawisko, jakie wzory je opisują i kiedy których używać.',
  },
  {
    name: 'Poziom 1 - teoria i rozgrzewka',
    desc: 'PDF-y z teorią i wzorami oraz proste zadania, które sprawdzają, czy rozumiesz podstawy.',
  },
  {
    name: 'Poziom 2 - zadania dogrzewające',
    desc: 'Zadania łączące kilka wzorów - uczysz się układać rozwiązanie, a nie zgadywać.',
  },
  {
    name: 'Poziom 3 - autorskie zadania maturalne',
    desc: 'Zadania w stylu arkusza: wykresy, analiza tekstu, uzasadnienia, obliczenia wieloetapowe.',
  },
  {
    name: 'Poziom 4 - arkusze CKE',
    desc: 'Prawdziwe zadania z arkuszy maturalnych CKE z danego działu.',
  },
  {
    name: 'Quiz',
    desc: 'Szybkie sprawdzenie, czy dział jest opanowany, zanim przejdziesz dalej.',
  },
];

export type CourseFact = { label: string; value: string };

/** „Kurs w pigułce” - krótkie, samodzielne zdania (każde da się zacytować osobno). */
export const COURSE_FACTS: CourseFact[] = [
  {
    label: 'Poziom',
    value: 'Matura z fizyki na poziomie rozszerzonym - pełny zakres wymagań CKE.',
  },
  {
    label: 'Zakres',
    value: `${COURSES.length} działów: od kinematyki po fizykę jądrową i relatywistykę (mechanika, termodynamika, elektromagnetyzm, optyka, fizyka współczesna).`,
  },
  {
    label: 'Forma',
    value:
      `Kurs online z nagrań: ponad ${VIDEO_HOURS} godzin lekcji wideo HD, PDF-y z teorią i wzorami, zadania z rozwiązaniami i quizy. Uczysz się we własnym tempie, bez stałych godzin zajęć.`,
  },
  {
    label: 'Ścieżka działu',
    value:
      'Lekcja wideo → teoria i rozgrzewka → zadania dogrzewające → autorskie zadania maturalne → arkusze CKE → quiz.',
  },
  {
    label: 'Planer',
    value:
      'Darmowy planer rozpisuje naukę dzień po dniu do matury i pomija działy, które już umiesz.',
  },
  {
    label: 'Dostęp',
    value: 'Od razu po zakupie, do końca sesji maturalnej.',
  },
  {
    label: 'Cena',
    value: `${fullPlan.name}: ${fullPlan.price} zł jednorazowo (bez abonamentu). ${vipPlan.name} z cotygodniowymi zajęciami indywidualnymi: ${vipPlan.price} zł (${VIP_SEATS} miejsc). Pojedynczy dział: ${SINGLE_COURSE_PRICE} zł.`,
  },
  {
    label: 'Gwarancja',
    value:
      'Gwarancja Dobrego Wyniku: zwrot ceny kursu, jeśli po przerobieniu co najmniej 90% materiałów uzyskasz na maturze mniej niż 30% (warunki w regulaminie, §9).',
  },
  {
    label: 'Prowadzący',
    value: `${SITE.owner} („${SITE.ownerAlias}”) - fizykę rozszerzoną na maturze zdał na 82%, uczy fizyki i matematyki.`,
  },
  {
    label: 'Wyniki',
    value: '28 z 28 absolwentów kursu zdało maturę (100% zdawalności).',
  },
  {
    label: 'Termin matury',
    value: `Matura z fizyki ${MATURA.year}: ${MATURA.examDate} (termin główny).`,
  },
];

/**
 * JSON-LD kursu (schema.org/Course) ze stałym @id - ten sam węzeł na stronie
 * głównej i na stronach programu, żeby Google i silniki AI widziały jeden kurs,
 * a nie kilka podobnych.
 */
export function courseLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${SITE.url}/#kurs`,
    name: 'Fizyka Statkiem - Kurs maturalny z fizyki online',
    alternateName: ['Kurs maturalny z fizyki', 'Kurs fizyki online do matury rozszerzonej'],
    url: `${SITE.url}/`,
    description: `Kurs maturalny z fizyki online na poziomie rozszerzonym: ${COURSES.length} działów, ponad ${VIDEO_HOURS} godzin wideo HD, PDF-y, zadania na wzór CKE, quizy i planer nauki. Przygotowuje do matury ${MATURA.year}.`,
    inLanguage: 'pl',
    provider: {
      '@type': 'EducationalOrganization',
      '@id': `${SITE.url}/#org`,
      name: SITE.name,
      url: SITE.url,
    },
    // Pola, które Google (rich result „Course”) i silniki AI czytają najchętniej:
    // poziom, czego uczy, dla kogo, program.
    educationalLevel: 'Szkoła średnia - matura rozszerzona z fizyki',
    about: ['Fizyka', 'Matura z fizyki', 'Fizyka rozszerzona'],
    coursePrerequisites:
      'Brak - każdy dział zaczyna się od podstaw. Przydaje się matematyka na poziomie liceum.',
    teaches: COURSES.map((c) => c.title),
    syllabusSections: COURSES.map((c) => ({
      '@type': 'Syllabus',
      name: `Dział ${c.id}: ${c.title}`,
      description: c.topics.join('; '),
    })),
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
      audienceType: 'Maturzyści zdający fizykę na poziomie rozszerzonym',
    },
    isAccessibleForFree: false,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      inLanguage: 'pl',
      // Wymagane przez Google do rich resultu „Course info”. Podajemy sam czas
      // lekcji wideo (dolna granica) - czasu na zadania nie da się uczciwie oszacować.
      courseWorkload: `PT${VIDEO_HOURS}H`,
      instructor: { '@id': `${SITE.url}/#czarek` },
    },
    offers: PLANS.map((p) => ({
      '@type': 'Offer',
      name: p.name,
      category: 'Kurs online',
      priceCurrency: 'PLN',
      price: String(p.price),
      availability: 'https://schema.org/InStock',
      url: `${SITE.url}/cennik/`,
      priceValidUntil: '2026-12-31',
    })),
  };
}

/**
 * Metadata stron docelowych kursu. Jawne `openGraph` zastępuje cały obiekt
 * z layoutu, więc obraz trzeba podać ponownie (wzór: app/blog/[slug]/page.tsx).
 */
export function landingOpenGraph(title: string, description: string, path: string) {
  return {
    openGraph: {
      type: 'website' as const,
      locale: 'pl_PL',
      siteName: SITE.name,
      title,
      description,
      url: `${SITE.url}${path}`,
      images: [
        {
          url: `${SITE.url}/opengraph-image/`,
          width: 1200,
          height: 630,
          alt: 'Fizyka Statkiem - kurs maturalny z fizyki online',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [`${SITE.url}/twitter-image/`],
    },
  };
}
