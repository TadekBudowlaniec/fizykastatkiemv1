import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { getTopics, getTopic } from '@/lib/seo';
import {
  SeoHero,
  RelatedCard,
  RelatedGrid,
  ProblemCard,
  SeoFaq,
  faqLd,
  CtaBand,
  JsonLd,
  breadcrumbLd,
} from '@/components/seo/SeoBits';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getTopics().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const t = getTopic(slug);
  if (!t) return {};
  return {
    title: `Zadania z ${t.dopelniacz} z rozwiązaniami`,
    description: `Zadania z ${t.dopelniacz} z pełnymi rozwiązaniami krok po kroku. ${t.name} — przykłady na poziomie liceum i matury.`,
    keywords: `zadania z ${t.dopelniacz}, ${t.name.toLowerCase()} zadania, zadania z fizyki, rozwiązania`,
    alternates: { canonical: `${SITE.url}/zadania-z-fizyki/${t.slug}/` },
  };
}

export default async function ZadaniaHub({ params }: Params) {
  const { slug } = await params;
  const t = getTopic(slug);
  if (!t) notFound();
  const subs = t.subtopics ?? [];
  const crumbs = [
    { name: 'Strona główna', url: '/' },
    { name: 'Baza wiedzy', url: '/baza-wiedzy/' },
    { name: `Zadania: ${t.name}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <SeoHero
        eyebrow="Zadania z rozwiązaniami"
        title={`Zadania z ${t.dopelniacz} — rozwiązania krok po kroku`}
        intro={t.intro}
        crumbs={crumbs}
      >
        <Link
          href={`/fizyka/${t.slug}`}
          className="rounded-full bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
        >
          📖 Powtórz teorię
        </Link>
      </SeoHero>

      {subs.length ? (
        <section className="bg-cloud py-12 sm:py-14">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">
              Kategorie zadań
            </h2>
            <RelatedGrid>
              {subs.map((s) => (
                <RelatedCard
                  key={s.slug}
                  kicker="Zestaw zadań"
                  title={s.name}
                  desc={s.intro || `Zadania: ${s.name}.`}
                  href={`/zadania-z-fizyki/${t.slug}/${s.slug}`}
                />
              ))}
            </RelatedGrid>
          </div>
        </section>
      ) : null}

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">
            Przykładowe zadania z rozwiązaniami
          </h2>
          <div className="space-y-8">
            {subs.map((s) =>
              s.problems && s.problems[0] ? (
                <div key={s.slug}>
                  <h3 className="mb-3 text-lg font-bold text-brand-700">
                    {s.name}
                  </h3>
                  <ProblemCard p={s.problems[0]} />
                  <Link
                    href={`/zadania-z-fizyki/${t.slug}/${s.slug}`}
                    className="mt-3 inline-block font-semibold text-brand-600 hover:text-magenta-600"
                  >
                    Więcej zadań: {s.name} →
                  </Link>
                </div>
              ) : null
            )}
          </div>

          {t.faqTeoria?.length ? (
            <div className="mt-12">
              <SeoFaq faqs={t.faqTeoria} />
            </div>
          ) : null}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
