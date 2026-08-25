import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { getCities, getCity, getTopics, plain, type Faq } from '@/lib/seo';
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

type Params = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return getCities().map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { city } = await params;
  const c = getCity(city);
  if (!c) return {};
  return {
    title: `Korepetycje z fizyki online — ${c.name} | matura i liceum`,
    description: `Korepetycje z fizyki online dla uczniów z ${c.locative}. Przygotowanie do matury i poprawa ocen. Indywidualne lekcje 1:1, elastyczne terminy.`,
    keywords: `korepetycje z fizyki ${c.name.toLowerCase()}, fizyka ${c.name.toLowerCase()}, korepetycje fizyka online, matura fizyka ${c.name.toLowerCase()}`,
    alternates: { canonical: `${SITE.url}/korepetycje-z-fizyki/${c.slug}/` },
  };
}

export default async function CityPage({ params }: Params) {
  const { city } = await params;
  const c = getCity(city);
  if (!c) notFound();
  const topics = getTopics();
  const otherCities = getCities().filter((x) => x.slug !== c.slug);
  const dz = (c.dzielnice ?? []).join(', ');

  const crumbs = [
    { name: 'Strona główna', url: '/' },
    { name: 'Korepetycje z fizyki', url: '/korepetycje-z-fizyki/' },
    { name: c.name },
  ];

  const desc = `Korepetycje z fizyki online dla uczniów z ${c.locative}. Przygotowanie do matury i poprawa ocen. Indywidualne lekcje 1:1, elastyczne terminy.`;

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Korepetycje z fizyki online',
    name: `Korepetycje z fizyki online — ${c.name}`,
    description: plain(desc),
    areaServed: { '@type': 'City', name: c.name },
    provider: {
      '@type': 'EducationalOrganization',
      name: SITE.name,
      url: SITE.url,
    },
    audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
    inLanguage: 'pl',
  };

  const faqs: Faq[] = [
    {
      q: `Czy korepetycje z fizyki w ${c.locative} odbywają się online?`,
      a: `Tak. Prowadzimy lekcje online 1:1, więc możesz uczyć się z dowolnej dzielnicy ${
        c.name
      } (np. ${(c.dzielnice ?? [])
        .slice(0, 3)
        .join(', ')}) bez dojazdów — wystarczy komputer i internet.`,
    },
    {
      q: 'Czy przygotujecie mnie do matury z fizyki?',
      a: 'Tak, specjalizujemy się w przygotowaniu do matury z fizyki na poziomie podstawowym i rozszerzonym — od podstaw aż po zadania maturalne CKE.',
    },
    {
      q: 'Ile kosztują korepetycje z fizyki?',
      a: 'Mamy kilka pakietów — od samodzielnego kursu online po indywidualne lekcje live. Szczegóły i ceny znajdziesz na stronie korepetycji.',
    },
    {
      q: 'Od czego zacząć naukę fizyki?',
      a: 'Najlepiej od solidnych podstaw — zajrzyj do naszej Bazy wiedzy z teorią i zadaniami z każdego działu, a na lekcjach uzupełnimy luki.',
    },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs), service, faqLd(faqs)].filter(Boolean) as object[]} />
      <SeoHero
        eyebrow="Korepetycje z fizyki online"
        title={`Korepetycje z fizyki online — ${c.name}`}
        intro={`Uczysz się w ${c.locative} i potrzebujesz wsparcia z fizyki? Prowadzimy indywidualne korepetycje online 1:1 oraz kurs maturalny — bez dojazdów, w dogodnych terminach.`}
        crumbs={crumbs}
      >
        <Link
          href="/korepetycje"
          className="rounded-full bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
        >
          Sprawdź ofertę i ceny →
        </Link>
      </SeoHero>

      <section className="bg-cloud py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 space-y-10 prose-fs">
          <section>
            <h2 className="font-display text-2xl font-extrabold text-ink">
              Korepetycje z fizyki dla uczniów z {c.name}
            </h2>
            <p>{c.akcent}</p>
            <p>
              Naszą metodą uczymy fizyki <strong>prosto i obrazowo</strong> —
              tłumaczymy mechanizm zjawiska, a nie każemy wkuwać wzorów na
              pamięć. Lekcje online sprawdzają się u uczniów z całego {c.name}
              {dz ? ` — od dzielnic takich jak ${dz}` : ''}.
            </p>
          </section>

          {c.uczelnie?.length ? (
            <section>
              <h2 className="font-display text-2xl font-extrabold text-ink">
                Przygotowanie pod uczelnie w {c.locative}
              </h2>
              <p>
                Dobry wynik z fizyki na maturze otwiera drzwi na kierunki
                techniczne lokalnych uczelni:
              </p>
              <ul>
                {c.uczelnie.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2 className="font-display text-2xl font-extrabold text-ink">
              Co zyskujesz?
            </h2>
            <ul>
              <li>
                <strong>Lekcje 1:1</strong> — pełna uwaga nauczyciela skupiona na
                Twoich brakach.
              </li>
              <li>
                <strong>Przygotowanie do matury</strong> — poziom podstawowy i
                rozszerzony, zadania CKE.
              </li>
              <li>
                <strong>Materiały i baza zadań</strong> — dostęp do teorii i
                zadań z rozwiązaniami online.
              </li>
              <li>
                <strong>Elastyczne terminy</strong> — uczysz się wtedy, kiedy Ci
                pasuje, bez dojazdów po {c.locative}.
              </li>
            </ul>
          </section>

          <section className="not-prose">
            <h2 className="mb-4 font-display text-2xl font-extrabold text-ink">
              Materiały do nauki — wszystkie działy fizyki
            </h2>
            <RelatedGrid>
              {topics.slice(0, 12).map((t) => (
                <RelatedCard
                  key={t.slug}
                  kicker="Dział"
                  title={t.name}
                  desc={`Teoria i wzory z ${t.dopelniacz}.`}
                  href={`/fizyka/${t.slug}`}
                />
              ))}
            </RelatedGrid>
          </section>

          <SeoFaq faqs={faqs} />
        </div>
      </section>

      <CtaBand />

      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="mb-5 font-display text-2xl font-extrabold text-ink">
            Korepetycje w innych miastach
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherCities.map((oc) => (
              <Link
                key={oc.slug}
                href={`/korepetycje-z-fizyki/${oc.slug}`}
                className="rounded-full border border-line bg-cloud px-4 py-2 text-sm font-medium text-slate transition hover:border-brand-300 hover:text-brand-700"
              >
                Fizyka {oc.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
