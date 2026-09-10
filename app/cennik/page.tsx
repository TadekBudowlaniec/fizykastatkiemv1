import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { PricingTiers } from '@/components/shop/PricingTiers';
import { FaqSection, type FaqItem } from '@/components/ui/Faq';
import { PLANS, SINGLE_COURSE_PRICE, VIP_SEATS } from '@/lib/courses';
import { SITE } from '@/lib/site';
import { JsonLd, breadcrumbLd, faqLd } from '@/components/seo/SeoBits';

const fullPlan = PLANS.find((p) => p.key === 'full_access')!;
const vipPlan = PLANS.find((p) => p.key === 'vip')!;

export const metadata: Metadata = {
  title: 'Cennik kursu fizyki',
  description:
    'Cennik kursu maturalnego z fizyki: Kurs Pełny (828 zł) i VIP 1:1 z indywidualnym prowadzeniem (3497 zł, tylko 6 miejsc). Płatność jednorazowa — BLIK, karta, Klarna.',
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
    q: 'Czym różni się Kurs Pełny od VIP 1:1?',
    a: `Kurs Pełny (${fullPlan.price} zł) to kompletny, samodzielny kurs: wszystkie 16 działów, PDF-y, zadania, quizy i planer. VIP 1:1 (${vipPlan.price} zł) obejmuje cały Kurs Pełny oraz indywidualne prowadzenie 1:1 z Czarkiem — 1 godzina tygodniowo aż do matury, z planem dopasowanym do Twoich braków. VIP ma realnie tylko ${VIP_SEATS} miejsc, bo każde oznacza indywidualną pracę.`,
  },
  {
    q: 'Czy mogę kupić tylko jeden dział?',
    a: `Tak. Jeśli chcesz uzupełnić konkretny temat, kupisz pojedynczy dział za ${SINGLE_COURSE_PRICE} zł zamiast całego kursu. Pełną listę znajdziesz na stronie „Pojedyncze działy”.`,
  },
  {
    q: 'Jak działa Gwarancja Zdanej Matury?',
    a: 'Jeśli przerobisz cały kurs zgodnie z warunkami gwarancji (co najmniej 90% materiałów, zakup najpóźniej 30 dni przed egzaminem), podejdziesz do matury z fizyki i mimo to uzyskasz wynik poniżej 30%, możesz ubiegać się o zwrot ceny kursu. Zgłoszenie wysyłasz na nasz e-mail w ciągu 7 dni od otrzymania oficjalnego wyniku, dołączając oficjalny dokument z wynikiem egzaminu. Zgłoszenie (w tym postępy w kursie) podlega weryfikacji zgodnie z regulaminem (§9).',
  },
  {
    q: 'Czy dostanę fakturę?',
    a: 'Tak, po zakupie możesz poprosić o fakturę, pisząc na nasz adres e-mail.',
  },
];

// Tabela porównawcza: Kurs Pełny vs VIP 1:1 (f = Kurs Pełny, v = VIP 1:1).
const compare = [
  { label: '16 działów wideo HD', f: true, v: true },
  { label: 'PDF-y: teoria, wzory, zadania', f: true, v: true },
  { label: 'Zadania z rozwiązaniami i quizy', f: true, v: true },
  { label: 'Spersonalizowany planer nauki', f: true, v: true },
  { label: 'Moduł „Tutaj zacznij”', f: true, v: true },
  { label: 'Gwarancja Zdanej Matury', f: true, v: true },
  { label: 'Indywidualne prowadzenie 1:1 z Czarkiem', f: false, v: true },
  { label: '1 godzina zajęć tygodniowo — aż do matury', f: false, v: true },
  { label: 'Plan pracy pod Twoje braki', f: false, v: true },
  { label: 'Stały kontakt i wsparcie między zajęciami', f: false, v: true },
];

const pakietyLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Warianty kursu maturalnego z fizyki',
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
            Wybierz sposób przygotowania do{' '}
            <span className="text-gradient">matury</span>
          </>
        }
        subtitle="Dwie proste opcje: samodzielny Kurs Pełny albo VIP 1:1 z indywidualnym prowadzeniem przez Czarka. Płatność jednorazowa, dostęp do końca matury."
        crumbs={[{ label: 'Start', href: '/' }, { label: 'Cennik' }]}
      />

      <section className="bg-cloud py-16 sm:py-20">
        <Container size="wide">
          <div className="mx-auto max-w-4xl">
            <PricingTiers />
          </div>
          <p className="mt-8 text-center text-sm text-muted">
            Płatność jednorazowa · dostęp do końca matury · BLIK, karta, Klarna.
          </p>
        </Container>
      </section>

      {/* Tabela porównawcza */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <h2 className="text-center text-2xl font-extrabold text-ink sm:text-3xl">
            Kurs Pełny czy VIP 1:1?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
            Oba warianty zawierają cały kurs. VIP dokłada to, czego nie da żaden
            zestaw materiałów — człowieka, który prowadzi Cię aż do matury.
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="py-4 pr-4 font-semibold text-muted">Co zawiera</th>
                  <th className="px-3 py-4 text-center font-extrabold text-ink">
                    Kurs Pełny
                    <span className="block text-xs font-semibold text-muted">
                      {fullPlan.price} zł
                    </span>
                  </th>
                  <th className="px-3 py-4 text-center font-extrabold text-magenta-600">
                    VIP 1:1
                    <span className="block text-xs font-semibold text-muted">
                      {vipPlan.price} zł · tylko {VIP_SEATS} miejsc
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {compare.map((row) => (
                  <tr key={row.label} className="border-b border-line/70">
                    <td className="py-3.5 pr-4 text-slate">{row.label}</td>
                    <td className="px-3 text-center text-lg"><Cell on={row.f} /></td>
                    <td className="px-3 text-center text-lg"><Cell on={row.v} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* Pojedynczy dział — dyskretny link, nie główna karta cennika */}
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
                zadaniami za {SINGLE_COURSE_PRICE} zł.
              </p>
            </div>
            <Link
              href="/dzialy"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-brand-200 px-6 py-3 text-sm font-semibold text-brand-600 transition-all hover:border-brand-500 hover:bg-brand-50"
            >
              Zobacz pojedyncze działy →
            </Link>
          </div>
        </Container>
      </section>

      <FaqSection
        id="faq"
        items={faq}
        title="Pytania o płatności i gwarancję"
        subtitle="Masz inne pytanie? Napisz do nas - pomożemy dobrać wariant."
      />
    </>
  );
}
