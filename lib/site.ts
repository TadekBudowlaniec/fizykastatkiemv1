export const SITE = {
  name: 'Fizyka Statkiem',
  shortName: 'Fizyka Statkiem',
  url: 'https://fizykastatkiem.pl',
  email: 'fizykastatkiem@gmail.com',
  description:
    'Kursy fizyki online do matury: mechanika, termodynamika, elektromagnetyzm, optyka i fizyka współczesna. Wideo HD, PDF-y, zadania i planer nauki.',
  ogImage: '/images/logo_magenta.png',
  socials: {
    instagram: 'https://instagram.com/fizykastatkiem',
    facebook: 'https://facebook.com/fizykastatkiem',
    tiktok: 'https://tiktok.com/@fizykastatkiem',
  },
} as const;

/** Publiczne (bezpieczne) klucze — fallback, gdy brak zmiennych env. */
export const PUBLIC_ENV = {
  supabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://kldekjrpottsqebueojg.supabase.co',
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZGVranJwb3R0c3FlYnVlb2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTc4NTcsImV4cCI6MjA2NzYzMzg1N30.aYCWfbhliWM3yQRyZUDL59IgMOWklwa0ZA4QOSdyLh0',
  stripePublishableKey:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    'pk_live_51RVvveJLuu6b086bkMWivsLTKUamDhivaYv3ObKeMpV2kHSjCKuYE3sijENdGWISCsVBz3RI40MgYX0P1jhL2ICz00B2VbJDF3',
};

export type NavLink = { label: string; href: string };

export const PRIMARY_NAV: NavLink[] = [
  { label: 'Kurs', href: '/kurs' },
  { label: 'Cennik', href: '/cennik' },
  { label: 'Korepetycje', href: '/korepetycje' },
  { label: 'Baza wiedzy', href: '/baza-wiedzy' },
  { label: 'Blog', href: '/blog' },
];
