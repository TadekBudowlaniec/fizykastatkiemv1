import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { CourseCard } from '@/components/course/CourseCard';
import { COURSES, SINGLE_COURSE_PRICE, PLANS } from '@/lib/courses';
import { SITE } from '@/lib/site';
import { JsonLd, breadcrumbLd } from '@/components/seo/SeoBits';

const fullPlan = PLANS.find((p) => p.key === 'full_access')!;

export const metadata: Metadata = {
  title: 'Pojedyncze działy z fizyki',
  description: `Kup pojedynczy dział kursu maturalnego z fizyki za ${SINGLE_COURSE_PRICE} zł - wideo HD, PDF-y i zadania z rozwiązaniami. Uzupełnij braki punktowo lub weź cały Kurs Pełny.`,
  alternates: { canonical: '/dzialy/' },
};

const dzialyLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Pojedyncze działy kursu maturalnego z fizyki',
    itemListElement: COURSES.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: `Fizyka - dział ${c.id}: ${c.title}`,
        brand: { '@type': 'Brand', name: SITE.name },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'PLN',
          price: String(SINGLE_COURSE_PRICE),
          availability: 'https://schema.org/InStock',
          url: `${SITE.url}/dzialy/`,
        },
      },
    })),
  },
  breadcrumbLd([
    { name: 'Start', url: '/' },
    { name: 'Pojedyncze działy', url: '/dzialy/' },
  ]),
];

export default function DzialyPage() {
  return (
    <>
      <JsonLd data={dzialyLd} />
      <PageHero
        eyebrow="Pojedyncze działy"
        title={
          <>
            Uzupełnij braki{' '}
            <span className="text-gradient">punktowo</span>
          </>
        }
        subtitle={`Nie potrzebujesz całego kursu? Kup sam dział, który sprawia Ci problem - za ${SINGLE_COURSE_PRICE} zł dostajesz wideo HD, PDF-y i zadania z rozwiązaniami.`}
        crumbs={[{ label: 'Start', href: '/' }, { label: 'Pojedyncze działy' }]}
      />

      <section className="bg-cloud py-14 sm:py-20">
        <Container size="wide">
          {/* Kotwica decyzji: cały kurs jest wyraźnie korzystniejszy niż 16 działów osobno. */}
          <div className="mx-auto mb-10 max-w-3xl rounded-3xl border border-brand-100 bg-white p-6 text-center shadow-soft">
            <p className="text-muted">
              Planujesz przerobić więcej niż kilka działów?{' '}
              <strong className="text-ink">
                Kurs Pełny ({fullPlan.price} zł)
              </strong>{' '}
              to wszystkie 16 działów, planer i Gwarancja Zdanej Matury - taniej
              niż kupując działy pojedynczo.
            </p>
            <Link
              href="/cennik"
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-[linear-gradient(120deg,#6b4df6,#f43f8f)] px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
            >
              Zobacz Kurs Pełny →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {COURSES.map((c) => (
              <CourseCard key={c.id} course={c} showBuy />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
