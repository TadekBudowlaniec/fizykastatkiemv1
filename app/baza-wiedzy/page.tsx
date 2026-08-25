import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { getTopics, plain } from '@/lib/seo';
import {
  SeoHero,
  RelatedCard,
  RelatedGrid,
  CtaBand,
  JsonLd,
  breadcrumbLd,
} from '@/components/seo/SeoBits';

const desc =
  'Darmowa baza wiedzy z fizyki: teoria, wzory i zadania z rozwiązaniami ze wszystkich działów — od kinematyki po fizykę jądrową. Idealne na maturę.';

export const metadata: Metadata = {
  title: 'Baza wiedzy z fizyki — teoria, wzory i zadania z rozwiązaniami',
  description: desc,
  alternates: { canonical: `${SITE.url}/baza-wiedzy/` },
};

export default function BazaWiedzy() {
  const topics = getTopics();
  const crumbs = [
    { name: 'Strona główna', url: '/' },
    { name: 'Baza wiedzy' },
  ];

  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Baza wiedzy z fizyki',
    inLanguage: 'pl',
    description: plain(desc),
    isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
    url: `${SITE.url}/baza-wiedzy/`,
  };

  const groups = [
    {
      title: '📖 Teoria i wzory',
      kicker: 'Teoria',
      href: (s: string) => `/fizyka/${s}`,
      desc: (d: string) => `Teoria i wzory z ${d}.`,
    },
    {
      title: '✍️ Zadania z rozwiązaniami',
      kicker: 'Zadania',
      href: (s: string) => `/zadania-z-fizyki/${s}`,
      desc: () => 'Rozwiązania krok po kroku.',
    },
    {
      title: '🎓 Matura z fizyki',
      kicker: 'Matura',
      href: (s: string) => `/matura-z-fizyki/${s}`,
      desc: () => 'Wymagania CKE i typowe zadania.',
    },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs), collection]} />
      <SeoHero
        eyebrow="Baza wiedzy"
        title="Baza wiedzy z fizyki — teoria, wzory i zadania"
        intro="Wszystko, czego potrzebujesz do nauki fizyki w jednym miejscu: przejrzysta teoria, komplet wzorów i setki zadań z rozwiązaniami krok po kroku. Idealne do powtórki przed maturą."
        crumbs={crumbs}
      />

      {groups.map((g) => (
        <section key={g.title} className="bg-cloud py-12 sm:py-14">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">
              {g.title}
            </h2>
            <RelatedGrid>
              {topics.map((t) => (
                <RelatedCard
                  key={t.slug}
                  kicker={g.kicker}
                  title={t.name}
                  desc={g.desc(t.dopelniacz)}
                  href={g.href(t.slug)}
                />
              ))}
            </RelatedGrid>
          </div>
        </section>
      ))}

      <CtaBand />
    </>
  );
}
