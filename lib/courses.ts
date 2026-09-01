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
 * KANONICZNA numeracja działów — MUSI być zgodna z bazą Supabase (course_id)
 * oraz z `courseData` w netlify/functions/create-checkout-session.js.
 * NIE zmieniać kolejności ID bez zmiany w bazie i funkcji Stripe — inaczej
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
// Pakiety cenowe (checkout: full_access -> 17, full_access_live -> 18, vip -> 19)
// Ceny MUSZĄ być zgodne z courseData w create-checkout-session.js (grosze/100):
//   17: reg 699 / promo 599 · 18: reg 947 / promo 847 · 19: reg 1997 / promo 1897
// `price` = cena regularna (pobierana poza promo), `promoPrice` = na /oferta-ratunkowa.
// ---------------------------------------------------------------------------

export type PlanKey = 'full_access' | 'full_access_live' | 'vip';

export type Plan = {
  key: PlanKey;
  name: string;
  subtitle: string;
  priceOld: number;
  price: number;
  promoPrice: number;
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
    price: 699,
    promoPrice: 599,
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
    price: 947,
    promoPrice: 847,
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
    price: 1997,
    promoPrice: 1897,
    accent: 'diamond',
    cta: 'Wybieram Diamond',
    features: [
      'Wszystko z pakietu Gold',
      'Zajęcia indywidualne 1:1 - 1h tygodniowo',
      'Stały kontakt i wsparcie',
      'Plan nauki dopasowany do Twoich braków',
    ],
  },
];

/** Cena pojedynczego działu (zł) */
export const SINGLE_COURSE_PRICE = 49;

/** Cena korepetycji indywidualnych (zł za 60 minut) */
export const TUTORING_PRICE = 100;
