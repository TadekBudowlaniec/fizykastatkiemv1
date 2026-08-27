import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { getTopics, getTopic, topicsBySlug, plain } from '@/lib/seo';
import { MathContent } from '@/components/seo/MathContent';
import {
  SeoHero,
  RelatedCard,
  RelatedGrid,
  FormulaGrid,
  DefinitionList,
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
  const desc =
    t.metaTeoria ||
    `${t.name}: teoria, wzory i definicje. Wytłumaczenie krok po kroku dla licealistów i maturzystów.`;
  return {
    title: `${t.name} - teoria, wzory i definicje | Fizyka`,
    description: desc,
    keywords: `${t.name.toLowerCase()}, ${t.name.toLowerCase()} wzory, ${t.name.toLowerCase()} teoria, fizyka, matura`,
    alternates: { canonical: `${SITE.url}/fizyka/${t.slug}/` },
  };
}

export default async function TeoriaPage({ params }: Params) {
  const { slug } = await params;
  const t = getTopic(slug);
  if (!t) notFound();
  const bySlug = topicsBySlug();

  const canonical = `/fizyka/${t.slug}/`;
  const crumbs = [
    { name: 'Strona główna', url: '/' },
    { name: 'Baza wiedzy', url: '/baza-wiedzy/' },
    { name: `${t.name} - teoria` },
  ];

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${t.name} - teoria i wzory`,
    inLanguage: 'pl',
    description: plain(t.metaTeoria || t.intro),
    author: { '@type': 'Organization', name: SITE.name },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE.url}/images/logo_magenta.png`,
      },
    },
    mainEntityOfPage: SITE.url + canonical,
  };

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs), article, faqLd(t.faqTeoria ?? [])].filter(Boolean) as object[]} />
      <SeoHero
        eyebrow="Teoria fizyki"
        title={`${t.name} - teoria, wzory i definicje`}
        intro={t.intro}
        crumbs={crumbs}
      >
        <Link
          href={`/zadania-z-fizyki/${t.slug}`}
          className="rounded-full bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
        >
          Przejdź do zadań →
        </Link>
      </SeoHero>

      <section className="bg-cloud py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="space-y-8">
            {(t.theory ?? []).map((s, i) => (
              <section key={i} id={`sek-${i}`}>
                <h2 className="mb-3 font-display text-2xl font-extrabold text-ink">
                  {s.heading}
                </h2>
                <MathContent html={s.html} />
              </section>
            ))}
          </div>

          {t.formulas?.length ? (
            <div className="mt-12">
              <h2 className="mb-5 font-display text-2xl font-extrabold text-ink">
                Najważniejsze wzory
              </h2>
              <FormulaGrid formulas={t.formulas} />
            </div>
          ) : null}

          {t.definitions?.length ? (
            <div className="mt-12">
              <h2 className="mb-5 font-display text-2xl font-extrabold text-ink">
                Kluczowe pojęcia
              </h2>
              <DefinitionList defs={t.definitions} />
            </div>
          ) : null}

          {t.faqTeoria?.length ? (
            <div className="mt-12">
              <SeoFaq faqs={t.faqTeoria} />
            </div>
          ) : null}
        </div>
      </section>

      <CtaBand />

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">
            Zobacz również
          </h2>
          <RelatedGrid>
            <RelatedCard
              kicker="Zadania"
              title={`Zadania z ${t.dopelniacz}`}
              desc="Rozwiązania krok po kroku."
              href={`/zadania-z-fizyki/${t.slug}`}
            />
            <RelatedCard
              kicker="Matura"
              title={`${t.name} na maturze`}
              desc="Wymagania CKE i typowe zadania."
              href={`/matura-z-fizyki/${t.slug}`}
            />
            {(t.related ?? []).map((sl) => {
              const rt = bySlug[sl];
              return rt ? (
                <RelatedCard
                  key={sl}
                  kicker="Powiązany dział"
                  title={rt.name}
                  desc={`Przejdź do teorii ${rt.dopelniacz}.`}
                  href={`/fizyka/${rt.slug}`}
                />
              ) : null;
            })}
          </RelatedGrid>
        </div>
      </section>
    </>
  );
}
