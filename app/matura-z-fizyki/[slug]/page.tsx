import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { getTopics, getTopic, topicsBySlug, plain, SEO_PUBLISHED, seoModified } from '@/lib/seo';
import { MathContent } from '@/components/seo/MathContent';
import {
  SeoHero,
  RelatedCard,
  RelatedGrid,
  FormulaGrid,
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
    t.metaMatura ||
    `${t.name} na maturze z fizyki: wymagania CKE, typowe zadania i strategia. Poziom rozszerzony.`;
  return {
    title: `Matura z fizyki: ${t.name} - wymagania i zadania`,
    description: desc,
    keywords: `matura ${t.name.toLowerCase()}, ${t.name.toLowerCase()} matura, matura z fizyki, fizyka rozszerzona`,
    alternates: { canonical: `${SITE.url}/matura-z-fizyki/${t.slug}/` },
  };
}

export default async function MaturaPage({ params }: Params) {
  const { slug } = await params;
  const t = getTopic(slug);
  if (!t) notFound();
  const bySlug = topicsBySlug();
  const mi = t.maturaInfo ?? {};
  const canonical = `/matura-z-fizyki/${t.slug}/`;
  const crumbs = [
    { name: 'Strona główna', url: '/' },
    { name: 'Baza wiedzy', url: '/baza-wiedzy/' },
    { name: `Matura: ${t.name}` },
  ];

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Matura z fizyki: ${t.name}`,
    inLanguage: 'pl',
    description: plain(t.metaMatura || t.intro),
    author: { '@type': 'Organization', name: SITE.name },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/images/logo_magenta.png` },
    },
    mainEntityOfPage: SITE.url + canonical,
    image: `${SITE.url}/images/logo_magenta.png`,
    datePublished: SEO_PUBLISHED,
    dateModified: seoModified(),
  };

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs), article, faqLd(t.faqMatura ?? [])].filter(Boolean) as object[]} />
      <SeoHero
        eyebrow="Matura z fizyki"
        title={`Matura z fizyki: ${t.name}`}
        intro={mi.zakres || t.intro}
        crumbs={crumbs}
      >
        <Link
          href="/oferta-ratunkowa"
          className="rounded-full bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
        >
          ⚓ Kurs maturalny
        </Link>
      </SeoHero>

      <section className="bg-cloud py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 space-y-12">
          <section>
            <h2 className="mb-3 font-display text-2xl font-extrabold text-ink">
              Jak {t.name.toLowerCase()} pojawia się na maturze?
            </h2>
            {mi.html ? (
              <MathContent html={mi.html} />
            ) : (
              <p className="prose-fs">{t.intro}</p>
            )}
            <p className="prose-fs mt-3">
              <strong>Poziom:</strong> {mi.poziom || 'rozszerzony'}.
            </p>
          </section>

          {mi.typoweZadania?.length ? (
            <section>
              <h2 className="mb-4 font-display text-2xl font-extrabold text-ink">
                Typowe zadania maturalne
              </h2>
              <ul className="space-y-2">
                {mi.typoweZadania.map((z, i) => (
                  <li
                    key={i}
                    className="flex gap-3 rounded-xl border border-line bg-white p-4 text-slate shadow-soft"
                  >
                    <span className="mt-1 h-2 w-2 flex-none rounded-full bg-brand-400" />
                    {z}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {mi.strategia?.length ? (
            <section>
              <h2 className="mb-4 font-display text-2xl font-extrabold text-ink">
                Strategia na egzaminie
              </h2>
              <ol className="space-y-2">
                {mi.strategia.map((s, i) => (
                  <li key={i} className="flex gap-3 prose-fs">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {t.formulas?.length ? (
            <section>
              <h2 className="mb-5 font-display text-2xl font-extrabold text-ink">
                Najważniejsze wzory
              </h2>
              <FormulaGrid formulas={t.formulas} />
            </section>
          ) : null}

          {t.faqMatura?.length ? <SeoFaq faqs={t.faqMatura} /> : null}
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
              kicker="Teoria i wzory"
              title={`${t.name} - teoria`}
              desc={`Definicje, prawa i wzory z ${t.dopelniacz}.`}
              href={`/fizyka/${t.slug}`}
            />
            <RelatedCard
              kicker="Zadania"
              title={`Zadania z ${t.dopelniacz}`}
              desc="Rozwiązania krok po kroku."
              href={`/zadania-z-fizyki/${t.slug}`}
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
