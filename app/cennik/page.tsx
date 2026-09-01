import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { PricingTiers } from '@/components/shop/PricingTiers';
import { FaqSection, type FaqItem } from '@/components/ui/Faq';
import { Button } from '@/components/ui/Button';
import { PLANS, SINGLE_COURSE_PRICE } from '@/lib/courses';
import { SITE } from '@/lib/site';
import { JsonLd, breadcrumbLd, faqLd } from '@/components/seo/SeoBits';

export const metadata: Metadata = {
  title: 'Cennik kursu fizyki',
  description:
    'Wybierz pakiet kursu fizyki do matury: Silver, Gold lub Diamond. Płatność jednorazowa, BLIK, karta i Klarna. Pojedyncze działy już od 49 zł.',
  alternates: { canonical: '/cennik/' },
};

const faq: FaqItem[] = [
  {
    q: 'Czy płatność jest jednorazowa?',
    a: 'Tak. Płacisz raz i masz dostęp do materiałów do końca sesji maturalnej - bez abonamentu i ukrytych opłat.',
  },
  {
    q: 'Jakie formy płatności obsługujecie?',
    a: 'Płatności realizuje Stripe - obsługujemy BLIK, karty płatnicze (Visa, Mastercard) oraz Klarna.',
  },
  {
    q: 'Czym różnią się pakiety?',
    a: 'Silver to samodzielny kurs z pełnymi materiałami. Gold dokłada zajęcia na żywo co 2 tygodnie. Diamond to dodatkowo cotygodniowe zajęcia indywidualne 1:1.',
  },
  {
    q: 'Czy mogę kupić tylko jeden dział?',
    a: `Tak. Jeśli chcesz uzupełnić konkretny temat, kupisz pojedynczy dział za ${SINGLE_COURSE_PRICE} zł zamiast całego pakietu.`,
  },
  {
    q: 'Czy dostanę fakturę?',
    a: 'Tak, po zakupie możesz poprosić o fakturę, pisząc na nasz adres e-mail.',
  },
];

const compare = [
  { label: '16 działów wideo HD', s: true, g: true, d: true },
  { label: 'PDF-y: teoria, wzory, zadania', s: true, g: true, d: true },
  { label: 'Zadania z rozwiązaniami i quizy', s: true, g: true, d: true },
  { label: 'Planer nauki do matury', s: true, g: true, d: true },
  { label: 'Gwarancja Zdanej Matury', s: true, g: true, d: true },
  { label: 'Live grupowy co 2 tygodnie', s: false, g: true, d: true },
  { label: 'Nagrania z live’ów', s: false, g: true, d: true },
  { label: 'Zajęcia indywidualne 1:1', s: false, g: false, d: true },
  { label: 'Plan pod Twoje braki', s: false, g: false, d: true },
];

const pakietyLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Pakiety kursu maturalnego z fizyki',
  itemListElement: PLANS.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Product',
      name: `Kurs maturalny z fizyki — ${p.name}`,
      description: p.features.join('. ') + '.',
      brand: { '@type': 'Brand', name: SITE.name },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'PLN',
        price: String(p.price),
        availability: 'https://schema.org/InStock',
        url: `${SITE.url}/cennik/`,
      },
    },
  })),
};

const cennikJsonLd = [
  pakietyLd,
  faqLd(faq),
  breadcrumbLd([
    { name: 'Start', url: '/' },
    { name: 'Cennik', url: '/cennik/' },
  ]),
];

function Cell({ on }: { on: boolean }) {
  return on ? (
    <span className="text-brand-500">✓</span>
  ) : (
    <span className="text-slate-300">-</span>
  );
}

export default function CennikPage() {
  return (
    <>
      <JsonLd data={cennikJsonLd} />
      <PageHero
        eyebrow="Oferta"
        title={
          <>
            Wybierz pakiet i płyń po swój <span className="text-gradient">wynik</span>
          </>
        }
        subtitle="Trzy poziomy wsparcia - od samodzielnej nauki po VIP 1:1. Płatność jednorazowa, dostęp do końca matury."
        crumbs={[{ label: 'Start', href: '/' }, { label: 'Cennik' }]}
      />

      <section className="bg-cloud py-16 sm:py-20">
        <Container size="wide">
          <PricingTiers />
          <p className="mt-8 text-center text-sm text-muted">
            Płatność jednorazowa · dostęp do końca matury · BLIK, karta, Klarna.
          </p>
        </Container>
      </section>

      {/* Tabela porównawcza */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <h2 className="text-center text-2xl font-extrabold text-ink sm:text-3xl">
            Porównanie pakietów
          </h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="py-4 pr-4 font-semibold text-muted">Co zawiera</th>
                  <th className="px-3 py-4 text-center font-extrabold text-ink">Silver</th>
                  <th className="px-3 py-4 text-center font-extrabold text-brand-600">Gold</th>
                  <th className="px-3 py-4 text-center font-extrabold text-magenta-600">Diamond</th>
                </tr>
              </thead>
              <tbody>
                {compare.map((row) => (
                  <tr key={row.label} className="border-b border-line/70">
                    <td className="py-3.5 pr-4 text-slate">{row.label}</td>
                    <td className="px-3 text-center text-lg"><Cell on={row.s} /></td>
                    <td className="px-3 text-center text-lg"><Cell on={row.g} /></td>
                    <td className="px-3 text-center text-lg"><Cell on={row.d} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* Pojedynczy dział */}
      <section className="bg-cloud py-14">
        <Container>
          <div className="border-gradient flex flex-col items-center gap-5 rounded-3xl bg-white p-8 text-center shadow-card sm:flex-row sm:text-left">
            <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f2efff,#ffe6f3)] text-3xl ring-1 ring-brand-100">
              🎯
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-extrabold text-ink">
                Potrzebujesz tylko jednego działu?
              </h3>
              <p className="mt-1 text-muted">
                Uzupełnij braki punktowo - pojedynczy dział z wideo, PDF-ami i
                zadaniami za jedyne {SINGLE_COURSE_PRICE} zł.
              </p>
            </div>
            <Button href="/kurs" variant="outline" size="lg">
              Zobacz działy
            </Button>
          </div>
        </Container>
      </section>

      <FaqSection
        items={faq}
        title="Pytania o płatności"
        subtitle="Masz inne pytanie? Napisz do nas - pomożemy dobrać pakiet."
      />
    </>
  );
}
