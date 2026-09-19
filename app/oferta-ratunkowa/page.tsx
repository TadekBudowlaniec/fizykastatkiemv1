import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PricingTiers } from '@/components/shop/PricingTiers';
import { PLANS } from '@/lib/courses';
import { SITE } from '@/lib/site';
import { JsonLd, breadcrumbLd } from '@/components/seo/SeoBits';

export const metadata: Metadata = {
  title: 'Pakiet Ratunkowy - ostatnia prosta przed maturą',
  description:
    'Nadrób zaległości z fizyki przed maturą. Wybierz Pakiet Ratunkowy i uratuj swój wynik - nawet jeśli zaczynasz późno.',
  alternates: { canonical: '/oferta-ratunkowa/' },
  // Strona promocyjna z paskiem „Sukces! link leci na maila” - nie ma sensu
  // jako landing z Google (dubluje /cennik). Zostaje dostępna z linków.
  robots: { index: false, follow: true },
};

const ofertaJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Pakiety Ratunkowe kursu maturalnego z fizyki (promocja)',
    itemListElement: PLANS.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: `Kurs maturalny z fizyki - ${p.name}`,
        description: p.features.join('. ') + '.',
        brand: { '@type': 'Brand', name: SITE.name },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'PLN',
          price: String(p.price),
          availability: 'https://schema.org/InStock',
          url: `${SITE.url}/oferta-ratunkowa/`,
          priceValidUntil: '2026-12-31',
        },
      },
    })),
  },
  breadcrumbLd([
    { name: 'Start', url: '/' },
    { name: 'Oferta Ratunkowa', url: '/oferta-ratunkowa/' },
  ]),
];

export default function OfertaRatunkowaPage() {
  return (
    <div className="relative overflow-hidden bg-[linear-gradient(160deg,#070b18,#0b1224_50%,#16223f)] text-white">
      <JsonLd data={ofertaJsonLd} />
      {/* Orby */}
      <div className="aurora left-[-8%] top-[6%] h-80 w-80 animate-[aurora_18s_ease_infinite] bg-brand-600/45" />
      <div className="aurora right-[-6%] top-[30%] h-72 w-72 animate-[aurora_22s_ease_infinite] bg-magenta-500/40" />
      <div className="aurora bottom-[6%] left-[35%] h-72 w-72 bg-ocean-500/25" />
      <div className="bg-grid absolute inset-0" />

      {/* Pasek sukcesu */}
      <div className="relative border-b border-white/10 bg-ocean-400/10 py-3 text-center text-sm text-ocean-300 backdrop-blur">
        ✔ Sukces! Link do Twojego darmowego planera leci na maila (sprawdź
        skrzynkę i folder SPAM).
      </div>

      <Container className="relative py-14 text-center sm:py-20">
        <span className="inline-flex animate-[pulseGlow_2.5s_ease-in-out_infinite] items-center rounded-full bg-magenta-500 px-5 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-white shadow-glow-magenta">
          Ostatnia szansa
        </span>

        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl">
          Pakiet Ratunkowy
          <br />
          <span className="text-gradient">na ostatniej prostej przed maturą</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300/85">
          Zostało mało czasu do matury? Nadrób fizykę z gotowym systemem -
          kompletny materiał, planer nauki i (w VIP) indywidualne prowadzenie 1:1
          aż do egzaminu.
        </p>

        {/* Oferta */}
        <div className="mt-16">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
            Wybierz swój wariant
          </h2>
          <div className="mx-auto mt-10 max-w-4xl text-left">
            <PricingTiers />
          </div>
          <p className="mt-8 text-sm text-slate-400">
            Objęte <strong className="text-slate-200">Gwarancją Dobrego Wyniku</strong> -
            szczegóły w regulaminie.
          </p>
        </div>
      </Container>
    </div>
  );
}
