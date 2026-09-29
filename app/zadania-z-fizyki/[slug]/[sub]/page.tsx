import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE } from '@/lib/site';
import { getTopics, getTopic, seoTitle, clipDesc, courseForTopic } from '@/lib/seo';
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
import { TopicOffer, MaturaPath, LeadBox, SeoSalesLayer } from '@/components/seo/SalesBits';

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
    // Bez „| Dział” - nazwa działu jest w opisie i okruszkach; tytuł ma
    // zmieścić frazę „zadania z rozwiązaniami” w limicie SERP.
    title: seoTitle(`${s.name} - zadania z rozwiązaniami`),
    description: clipDesc(
      `${s.name} (${t.name}): zadania z fizyki z pełnymi rozwiązaniami krok po kroku. ${s.intro ?? ''}`
    ),
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
          <MaturaPath slug={t.slug} name={t.name} />
          <div className="space-y-6">
            {(s.problems ?? []).map((p, i) => (
              <div key={i}>
                <ProblemCard p={p} n={i + 1} />
                {/* Oferta po 2. zadaniu - moment, w którym czytelnik sprawdza, czy „umie” */}
                {i === Math.min(1, (s.problems?.length ?? 1) - 1) ? (
                  <TopicOffer
                    slug={t.slug}
                    heading={`Utknąłeś na zadaniu? Zobacz ${t.dopelniacz} wytłumaczone na wideo`}
                    lead="Rozwiązanie na kartce nie zawsze wystarcza. W dziale kursu każdy typ zadania przerabiasz krok po kroku na wideo, a potem ćwiczysz na zadaniach typu CKE."
                  />
                ) : null}
              </div>
            ))}
          </div>

          {s.faq?.length ? (
            <div className="mt-12">
              <SeoFaq faqs={s.faq} />
            </div>
          ) : null}

          {s.problems?.length ? null : <TopicOffer slug={t.slug} />}
          <LeadBox source={`zadania/${t.slug}/${s.slug}`} />
        </div>
      </section>

      <CtaBand course={courseForTopic(t.slug)} />
      <SeoSalesLayer slug={t.slug} pageType="zadania_podtemat" />

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
