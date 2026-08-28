import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { getCities } from '@/lib/seo';
import {
  SeoHero,
  RelatedCard,
  RelatedGrid,
  CtaBand,
  JsonLd,
  breadcrumbLd,
} from '@/components/seo/SeoBits';

const desc =
  'Korepetycje z fizyki online w całej Polsce. Indywidualne lekcje 1:1, przygotowanie do matury rozszerzonej. Wybierz swoje miasto.';

export const metadata: Metadata = {
  title: 'Korepetycje z fizyki online - cała Polska | matura i liceum',
  description: desc,
  keywords: 'korepetycje z fizyki online, korepetycje fizyka, matura fizyka',
  alternates: { canonical: `${SITE.url}/korepetycje-z-fizyki/` },
};

export default function KorepetycjeHub() {
  const cities = getCities();
  const crumbs = [
    { name: 'Strona główna', url: '/' },
    { name: 'Korepetycje z fizyki' },
  ];

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <SeoHero
        eyebrow="Korepetycje z fizyki online"
        title="Korepetycje z fizyki online - cała Polska"
        intro="Uczymy fizyki online w całym kraju. Indywidualne lekcje 1:1, kurs maturalny i baza zadań z rozwiązaniami. Wybierz swoje miasto albo od razu sprawdź ofertę."
        crumbs={crumbs}
      />

      <section className="bg-cloud py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">
            Wybierz swoje miasto
          </h2>
          <RelatedGrid>
            {cities.map((c) => (
              <RelatedCard
                key={c.slug}
                kicker="Miasto"
                title={`Fizyka ${c.name}`}
                desc={`Korepetycje z fizyki online dla uczniów z ${c.locative}.`}
                href={`/korepetycje-z-fizyki/${c.slug}`}
              />
            ))}
          </RelatedGrid>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
