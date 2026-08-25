import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { getPosts, plain } from '@/lib/seo';
import {
  SeoHero,
  RelatedCard,
  RelatedGrid,
  CtaBand,
  JsonLd,
  breadcrumbLd,
} from '@/components/seo/SeoBits';

const desc =
  'Blog Fizyka Statkiem: jak uczyć się fizyki do matury, jak korzystać z karty wzorów, najczęstsze błędy maturalne i kierunki studiów wymagające fizyki.';

export const metadata: Metadata = {
  title: 'Blog o fizyce i maturze — porady i plany nauki',
  description: desc,
  keywords:
    'blog fizyka, nauka fizyki, matura z fizyki porady, jak uczyć się fizyki',
  alternates: { canonical: `${SITE.url}/blog/` },
};

export default function BlogHub() {
  const posts = getPosts();
  const crumbs = [
    { name: 'Strona główna', url: '/' },
    { name: 'Blog' },
  ];

  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog o fizyce i maturze',
    inLanguage: 'pl',
    description: plain(desc),
    isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
    url: `${SITE.url}/blog/`,
  };
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: plain(p.title),
      url: `${SITE.url}/blog/${p.slug}/`,
    })),
  };

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs), collection, itemList]} />
      <SeoHero
        eyebrow="Blog"
        title="Blog o fizyce i maturze"
        intro="Praktyczne poradniki dla maturzystów: jak zaplanować naukę, jak czytać kartę wzorów, gdzie najczęściej traci się punkty i jakie studia wymagają fizyki."
        crumbs={crumbs}
      />

      <section className="bg-cloud py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">
            📝 Najnowsze artykuły
          </h2>
          <RelatedGrid>
            {posts.map((p) => (
              <RelatedCard
                key={p.slug}
                kicker="Artykuł"
                title={p.title}
                desc={p.excerpt}
                href={`/blog/${p.slug}`}
              />
            ))}
          </RelatedGrid>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
