import rawCourses from './data/courses.json';

export type Course = {
  id: number;
  icon: string;
  title: string;
  basic: string[];
  extended: string[];
  /** slug działu w bazie wiedzy SEO (/fizyka/<slug>/) do cross-linkowania */
  slug: string;
};

/**
 * KANONICZNA numeracja działów - MUSI być zgodna z bazą Supabase (course_id)
 * oraz z `courseData` w netlify/functions/create-checkout-session.js.
 * NIE zmieniać kolejności ID bez zmiany w bazie i funkcji Stripe - inaczej
 * użytkownik kupuje/otwiera inny dział niż widzi.
 * (tytuł musi dokładnie odpowiadać tytułowi w data/courses.json)
 */
const CANONICAL: { title: string; id: number; slug: string }[] = [
  { title: 'Kinematyka', id: 1, slug: 'kinematyka' },
  { title: 'Dynamika', id: 2, slug: 'dynamika' },
  { title: 'Praca, moc, energia', id: 3, slug: 'praca-moc-energia' },
  { title: 'Bryła sztywna', id: 4, slug: 'ruch-obrotowy' },
  { title: 'Ruch drgający', id: 5, slug: 'drgania-harmoniczne' },
  { title: 'Fale mechaniczne', id: 6, slug: 'fale-mechaniczne' },
  { title: 'Hydrostatyka', id: 7, slug: 'hydrostatyka' },
  { title: 'Termodynamika', id: 8, slug: 'termodynamika' },
  { title: 'Grawitacja i astronomia', id: 9, slug: 'grawitacja' },
  { title: 'Elektrostatyka', id: 10, slug: 'elektrostatyka' },
  { title: 'Prąd elektryczny', id: 11, slug: 'prad-elektryczny' },
  { title: 'Magnetyzm', id: 12, slug: 'magnetyzm' },
  { title: 'Indukcja elektromagnetyczna', id: 13, slug: 'indukcja-elektromagnetyczna' },
  { title: 'Fale elektromagnetyczne i optyka', id: 14, slug: 'optyka-falowa' },
  { title: 'Fizyka atomowa', id: 15, slug: 'fizyka-atomowa' },
  { title: 'Fizyka jądrowa i relatywistyczna', id: 16, slug: 'fizyka-jadrowa' },
];

type RawCourse = { icon: string; title: string; basic: string[]; extended: string[] };

/** 16 działów kursu z poprawnym (kanonicznym) ID, posortowane rosnąco po ID. */
export const COURSES: Course[] = (rawCourses as RawCourse[])
  .map((c) => {
    const canon = CANONICAL.find((x) => x.title === c.title);
    return {
      id: canon?.id ?? 0,
      icon: c.icon,
      title: c.title,
      basic: c.basic,
      extended: c.extended,
      slug: canon?.slug ?? '',
    };
  })
  .filter((c) => c.id > 0)
  .sort((a, b) => a.id - b.id);

export function getCourse(id: number): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

// ---------------------------------------------------------------------------
// Pakiety cenowe - dwa warianty głównej oferty (checkout: full_access -> 17, vip -> 19).
// Pakiet Gold (live) WYCOFANY (restrukturyzacja oferty 2026-09) - nie przywracać.
// Ceny MUSZĄ być zgodne z courseData w create-checkout-session.js (grosze/100):
//   17: 828 zł (Kurs Pełny) · 19: 3497 zł (VIP 1:1) · dział: 177 zł
// Bez sztucznych cen przekreślonych i bez fałszywej promocji - cena = wartość.
// ---------------------------------------------------------------------------

export type PlanKey = 'full_access' | 'vip';

export type Plan = {
  key: PlanKey;
  name: string;
  subtitle: string;
  price: number;
  featured?: boolean;
  badge?: string;
  /** Realny limit miejsc (tylko VIP 1:1) - wynika z możliwości prowadzenia 1:1. */
  seats?: number;
  /** Prawdziwa kotwica wartości pod ceną (nie sztuczna przekreślona cena). */
  anchor?: string;
  accent: 'full' | 'vip';
  features: string[];
  cta: string;
};

export const PLANS: Plan[] = [
  {
    key: 'full_access',
    name: 'Kurs Pełny',
    subtitle: 'Samodzielna nauka według gotowego systemu',
    price: 828,
    featured: true,
    accent: 'full',
    anchor: '16 działów osobno to 2 832 zł - w kursie ~52 zł za dział.',
    cta: 'Wybieram Kurs Pełny',
    features: [
      'Dostęp do wszystkich 16 działów kursu wideo HD',
      'Gotowe PDF-y z teorią, zadaniami i wzorami',
      'Quizy sprawdzające wiedzę po każdym dziale',
      'Spersonalizowany planer nauki do matury',
      'Moduł „Tutaj zacznij”',
      'Gwarancja Zdanej Matury',
    ],
  },
  {
    key: 'vip',
    name: 'VIP 1:1',
    subtitle: 'Diamond - Czarek prowadzi Cię indywidualnie aż do matury',
    price: 3497,
    seats: 6,
    badge: 'Tylko 6 miejsc',
    accent: 'vip',
    anchor: 'Zawiera cały Kurs Pełny (828 zł) + cotygodniowe 1:1 z Czarkiem aż do matury.',
    cta: 'Wybieram VIP 1:1',
    features: [
      'Cały Kurs Pełny (16 działów, PDF-y, zadania, planer)',
      'Indywidualne prowadzenie 1:1 z Czarkiem',
      '1 godzina zajęć tygodniowo - aż do matury',
      'Plan pracy dopasowany do Twoich braków i potrzeb',
      'Stały kontakt i wsparcie między zajęciami',
      'Gwarancja Zdanej Matury',
    ],
  },
];

/**
 * Realny limit miejsc VIP 1:1 - wynika z możliwości prowadzenia klientów 1:1.
 * NIE jest sztucznym scarcity; komunikować wyłącznie jako prawdziwy limit.
 */
export const VIP_SEATS = 6;

/** Cena pojedynczego działu (zł) - oferta poboczna na /dzialy */
export const SINGLE_COURSE_PRICE = 177;

/** Cena korepetycji indywidualnych (zł za 60 minut) */
export const TUTORING_PRICE = 100;
