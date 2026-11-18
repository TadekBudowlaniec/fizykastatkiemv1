// Ręczne tytuły i opisy (meta) dla stron z dużą liczbą wyświetleń i niskim CTR.
// Źródło: Google Search Console + Bing Webmaster (Windsor.ai), ostatnie 30 dni do 2026-11-18.
// Zmieniają tylko <title> i meta description - nagłówki H1 na stronach zostają bez zmian.
// Klucz = ścieżka kanoniczna (z końcowym ukośnikiem).

export type MetaOverride = { title?: string; description?: string };

export const META_OVERRIDES: Record<string, MetaOverride> = {
  // 718 wyśw., poz. 7,8, CTR 0,8%. Fraza „dział mechaniki opisujący ruch” = 87 wyśw.
  '/fizyka/kinematyka/': {
    title: 'Kinematyka - dział mechaniki opisujący ruch: wzory i zadania',
    description:
      'Kinematyka to dział mechaniki opisujący ruch ciał bez badania jego przyczyn. Prędkość, przyspieszenie, rzuty i wykresy - wzory i zadania z rozwiązaniami do matury.',
  },
  // 979 wyśw., poz. 8, CTR 0,5%. W Bingu wygrywa „prawo coulomba zadania”.
  '/fizyka/elektrostatyka/': {
    title: 'Elektrostatyka - prawo Coulomba, wzory i zadania do matury',
    description:
      'Elektrostatyka w pigułce: prawo Coulomba, natężenie i potencjał pola, kondensatory. Wszystkie wzory w jednym miejscu + zadania z rozwiązaniami krok po kroku.',
  },
  // 841 wyśw., poz. 8,5, CTR 0,1%.
  '/fizyka/termodynamika/': {
    title: 'Termodynamika - zasady, bilans cieplny i wzory do matury',
    description:
      'Zasady termodynamiki, ciepło właściwe, bilans cieplny i przemiany fazowe. Wzory z wyjaśnieniem i zadania z rozwiązaniami - wszystko, czego potrzebujesz do matury.',
  },
  // 326 wyśw., poz. 8,2. Pytania typu „przeciwdziała ruchowi pojęcie fizyczne” (tarcie).
  '/fizyka/dynamika/': {
    title: 'Dynamika - zasady Newtona, tarcie i wzory (matura z fizyki)',
    description:
      'Trzy zasady dynamiki Newtona, siła tarcia przeciwdziałająca ruchowi, równia pochyła i siła dośrodkowa. Wzory, definicje i zadania z rozwiązaniami do matury.',
  },
  // 303 wyśw., poz. 6,4, CTR 2,6% - dokładamy frazę „wzory”.
  '/fizyka/optyka-falowa/': {
    title: 'Optyka falowa - wzory: interferencja, dyfrakcja, polaryzacja',
    description:
      'Optyka falowa: interferencja, doświadczenie Younga, siatka dyfrakcyjna i polaryzacja (prawo Malusa). Wszystkie wzory + zadania z rozwiązaniami do matury.',
  },
  '/matura-z-fizyki/kinematyka/': {
    title: 'Kinematyka na maturze z fizyki rozszerzonej - zadania CKE',
  },
  '/matura-z-fizyki/optyka-falowa/': {
    title: 'Optyka falowa na maturze z fizyki - wzory i typowe zadania',
  },
  '/zadania-z-fizyki/optyka-falowa/polaryzacja-swiatla/': {
    title: 'Prawo Malusa i polaryzacja światła - zadania z rozwiązaniami',
  },
  '/zadania-z-fizyki/optyka-geometryczna/prawo-zalamania/': {
    title: 'Prawo Snelliusa (prawo załamania) - zadania z rozwiązaniami',
  },
  // 100 wyśw., poz. 5,9, 0 kliknięć.
  '/blog/fizyka-rozszerzona-czy-warto/': {
    title: 'Czy warto zdawać fizykę rozszerzoną? Szczera odpowiedź (2027)',
    description:
      'Czy fizyka rozszerzona się opłaca? Ile punktów daje w rekrutacji, ile pracy wymaga i dla kogo ma sens. Konkretne za i przeciw od nauczyciela fizyki.',
  },
  // „kurs przygotowawczy do matury z fizyki” - poz. 22.
  '/blog/jak-wybrac-kurs-maturalny-z-fizyki/': {
    title: 'Kurs przygotowawczy do matury z fizyki - jak wybrać dobry?',
    description:
      'Jak wybrać kurs przygotowawczy do matury z fizyki? Zakres CKE, wideo, zadania, wsparcie, gwarancja i cena - lista kryteriów i czerwonych flag przed zakupem.',
  },
};

export function metaOverride(path: string): MetaOverride {
  return META_OVERRIDES[path] ?? {};
}
