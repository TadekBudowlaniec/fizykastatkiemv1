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

// Slug bazy wiedzy dla każdego działu (do linkowania kurs -> treść SEO)
const COURSE_SLUGS = [
  'kinematyka',
  'dynamika',
  'praca-moc-energia',
  'ruch-obrotowy',
  'drgania-harmoniczne',
  'grawitacja',
  'hydrostatyka',
  'termodynamika',
  'elektrostatyka',
  'prad-elektryczny',
  'magnetyzm',
  'indukcja-elektromagnetyczna',
  'fale-mechaniczne',
  'optyka-falowa',
  'fizyka-atomowa',
  'fizyka-jadrowa',
];

/**
 * 16 działów kursu. ID nadawane po kolejności 1..16 — naprawia bug z oryginału,
 * gdzie Grawitacja i Elektrostatyka miały ten sam buyAccess('9').
 */
export const COURSES: Course[] = (rawCourses as Omit<Course, 'slug'>[]).map(
  (c, i) => ({ ...c, id: i + 1, slug: COURSE_SLUGS[i] })
);

export function getCourse(id: number): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

// ---------------------------------------------------------------------------
// Pakiety cenowe (checkout: full_access -> 17, full_access_live -> 18, vip -> 19)
// ---------------------------------------------------------------------------

export type PlanKey = 'full_access' | 'full_access_live' | 'vip';

export type Plan = {
  key: PlanKey;
  name: string;
  subtitle: string;
  priceOld: number;
  price: number;
  featured?: boolean;
  badge?: string;
  accent: 'silver' | 'gold' | 'diamond';
  features: string[];
  cta: string;
};

export const PLANS: Plan[] = [
  {
    key: 'full_access',
    name: 'Silver',
    subtitle: 'Kurs Samodzielny',
    priceOld: 1999,
    price: 599,
    accent: 'silver',
    cta: 'Wybieram Silver',
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
    key: 'full_access_live',
    name: 'Gold',
    subtitle: 'Kurs + Live',
    priceOld: 2789,
    price: 847,
    featured: true,
    badge: 'Najpopularniejszy',
    accent: 'gold',
    cta: 'Wybieram Gold',
    features: [
      'Wszystko z pakietu Silver',
      'Live grupowy 2h co 2 tygodnie',
      'Zadawanie pytań na żywo',
      'Nagrania z live’ów do odtworzenia',
    ],
  },
  {
    key: 'vip',
    name: 'Diamond',
    subtitle: 'Kurs VIP 1:1',
    priceOld: 3499,
    price: 1897,
    accent: 'diamond',
    cta: 'Wybieram Diamond',
    features: [
      'Wszystko z pakietu Gold',
      'Zajęcia indywidualne 1:1 — 1h tygodniowo',
      'Stały kontakt i wsparcie',
      'Plan nauki dopasowany do Twoich braków',
    ],
  },
];

/** Cena pojedynczego działu (zł) */
export const SINGLE_COURSE_PRICE = 49;
