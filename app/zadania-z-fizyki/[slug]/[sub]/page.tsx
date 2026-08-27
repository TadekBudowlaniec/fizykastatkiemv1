import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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

type Params = { params: Promise<{ slug: string; sub: string }> };

export function generateStaticParams() {
  const out: { slug: string; sub: string }[] = [];
  for (const t of getTopics()) {
    for (const s of t.subtopics ?? []) {
      out.push({ slug: t.slug, sub: s.slug });
    }
  }
  return out;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, sub } = await params;
  const t = getTopic(slug);
  const s = t?.subtopics?.find((x) => x.slug === sub);
  if (!t || !s) return {};
  return {
    title: `${s.name} - zadania z rozwiązaniami | ${t.name}`,
    description: `${s.name}: zadania z fizyki z pełnymi rozwiązaniami krok po kroku. ${
      s.intro ?? ''
    }`.slice(0, 160),
    keywords: `${s.name.toLowerCase()}, ${s.name.toLowerCase()} zadania, zadania z fizyki`,
    alternates: { canonical: `${SITE.url}/zadania-z-fizyki/${t.slug}/${s.slug}/` },
  };
}

export default async function ZadaniaSub({ params }: Params) {
  const { slug, sub } = await params;
  const t = getTopic(slug);
  const s = t?.subtopics?.find((x) => x.slug === sub);
  if (!t || !s) notFound();

  const crumbs = [
    { name: 'Strona główna', url: '/' },
    { name: 'Baza wiedzy', url: '/baza-wiedzy/' },
    { name: `Zadania: ${t.name}`, url: `/zadania-z-fizyki/${t.slug}/` },
    { name: s.name },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs), faqLd(s.faq ?? [])].filter(Boolean) as object[]} />
      <SeoHero
        eyebrow={`${t.name} · zadania`}
        title={`${s.name} - zadania z rozwiązaniami`}
        intro={s.intro}
        crumbs={crumbs}
      />

      <section className="bg-cloud py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="space-y-6">
            {(s.problems ?? []).map((p, i) => (
              <ProblemCard key={i} p={p} n={i + 1} />
            ))}
          </div>

          {s.faq?.length ? (
            <div className="mt-12">
              <SeoFaq faqs={s.faq} />
            </div>
          ) : null}
        </div>
      </section>

      <CtaBand />

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">
            Więcej zadań
          </h2>
          <RelatedGrid>
            {(t.subtopics ?? [])
              .filter((x) => x.slug !== s.slug)
              .map((x) => (
                <RelatedCard
                  key={x.slug}
                  kicker="Zadania"
                  title={x.name}
                  desc={x.intro}
                  href={`/zadania-z-fizyki/${t.slug}/${x.slug}`}
                />
              ))}
            <RelatedCard
              kicker="Teoria"
              title={`${t.name} - teoria`}
              desc={`Wzory i definicje z ${t.dopelniacz}.`}
              href={`/fizyka/${t.slug}`}
            />
          </RelatedGrid>
        </div>
      </section>
    </>
  );
}
