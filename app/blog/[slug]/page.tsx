import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import {
  getPosts,
  getPost,
  postsBySlug,
  topicsBySlug,
  plain,
} from '@/lib/seo';
import { MathContent } from '@/components/seo/MathContent';
import {
  SeoHero,
  RelatedCard,
  RelatedGrid,
  SeoFaq,
  faqLd,
  CtaBand,
  JsonLd,
  breadcrumbLd,
} from '@/components/seo/SeoBits';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  const desc = p.metaDesc || p.excerpt;
  return {
    title: p.title,
    description: desc,
    keywords: p.keywords,
    alternates: { canonical: `${SITE.url}/blog/${p.slug}/` },
    openGraph: { type: 'article', title: p.title, description: desc },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  const posts = postsBySlug();
  const topics = topicsBySlug();
  const canonical = `/blog/${p.slug}/`;

  const crumbs = [
    { name: 'Strona główna', url: '/' },
    { name: 'Blog', url: '/blog/' },
    { name: p.title },
  ];

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: plain(p.title),
    inLanguage: 'pl',
    description: plain(p.metaDesc || p.excerpt),
    author: { '@type': 'Organization', name: SITE.name },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/images/logo_magenta.png` },
    },
    mainEntityOfPage: SITE.url + canonical,
  };

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs), article, faqLd(p.faq ?? [])].filter(Boolean) as object[]} />
      <SeoHero
        eyebrow="Blog"
        title={p.title}
        intro={p.intro}
        crumbs={crumbs}
      >
        <Link
          href="/baza-wiedzy"
          className="rounded-full bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
        >
          📖 Baza wiedzy
        </Link>
      </SeoHero>

      <section className="bg-cloud py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="space-y-8">
            {(p.sections ?? []).map((s, i) => (
              <section key={i} id={`sek-${i}`}>
                <h2 className="mb-3 font-display text-2xl font-extrabold text-ink">
                  {s.heading}
                </h2>
                <MathContent html={s.html} />
              </section>
            ))}
          </div>

          {p.faq?.length ? (
            <div className="mt-12">
              <SeoFaq faqs={p.faq} />
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
            {(p.related ?? []).map((sl) => {
              const rp = posts[sl];
              return rp ? (
                <RelatedCard
                  key={sl}
                  kicker="Artykuł"
                  title={rp.title}
                  desc={rp.excerpt}
                  href={`/blog/${rp.slug}`}
                />
              ) : null;
            })}
            {(p.relatedTopics ?? []).map((sl) => {
              const t = topics[sl];
              return t ? (
                <RelatedCard
                  key={sl}
                  kicker="Baza wiedzy"
                  title={t.name}
                  desc={`Teoria i wzory z ${t.dopelniacz}.`}
                  href={`/fizyka/${t.slug}`}
                />
              ) : null;
            })}
          </RelatedGrid>
        </div>
      </section>
    </>
  );
}
