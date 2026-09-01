import { Hero } from '@/components/landing/Hero';
import { StatsBar } from '@/components/landing/StatsBar';
import { Guarantee } from '@/components/landing/Guarantee';
import { Toolkit } from '@/components/landing/Toolkit';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Testimonials } from '@/components/landing/Testimonials';
import { CourseCatalog } from '@/components/landing/CourseCatalog';
import { PricingSection } from '@/components/landing/PricingSection';
import { FaqSection, type FaqItem } from '@/components/ui/Faq';
import { FinalCta } from '@/components/landing/FinalCta';
import { SITE } from '@/lib/site';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kurs maturalny z fizyki online — matura rozszerzona',
  description:
    'Kurs maturalny z fizyki online (poziom rozszerzony): 16 działów wideo HD, PDF-y, setki zadań CKE i planer nauki. Gwarancja zdanej matury. Od 49 zł za dział.',
  alternates: { canonical: '/' },
};

const faq: FaqItem[] = [
  {
    q: 'Dla kogo jest kurs?',
    a: 'Dla maturzystów zdających fizykę na poziomie rozszerzonym oraz dla uczniów, którzy chcą nadrobić zaległości w trakcie roku.',
  },
  {
    q: 'Jak długo mam dostęp do kursu?',
    a: 'Dostęp masz do końca sesji maturalnej. W pakietach Gold i Diamond dochodzą dodatkowo zajęcia na żywo i wsparcie 1:1.',
  },
  {
    q: 'Czy mogę kupić tylko jeden dział?',
    a: 'Tak. Jeśli chcesz uzupełnić konkretny temat, możesz kupić pojedynczy dział zamiast całego pakietu.',
  },
  {
    q: 'Jak wygląda gwarancja?',
    a: 'Jeśli przerobisz cały kurs zgodnie z planerem i nie zdasz matury, otrzymasz kolejny rok dostępu za darmo.',
  },
  {
    q: 'Jakie są formy płatności?',
    a: 'Płatność jest jednorazowa i bezpieczna przez Stripe - obsługujemy BLIK, karty płatnicze oraz Klarna.',
  },
];

const courseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Fizyka Statkiem — Kurs maturalny z fizyki online',
  description: SITE.description,
  inLanguage: 'pl',
  provider: {
    '@type': 'EducationalOrganization',
    '@id': `${SITE.url}/#org`,
    name: SITE.name,
    url: SITE.url,
  },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'online',
    inLanguage: 'pl',
    instructor: { '@id': `${SITE.url}/#czarek` },
  },
  offers: {
    '@type': 'Offer',
    category: 'Kurs online',
    priceCurrency: 'PLN',
    price: '699',
    availability: 'https://schema.org/InStock',
    url: `${SITE.url}/cennik/`,
    priceValidUntil: '2026-12-31',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <StatsBar />
      <Guarantee />
      <Toolkit />
      <HowItWorks />
      <CourseCatalog />
      <Testimonials />
      <PricingSection />
      <FaqSection
        items={faq}
        subtitle="Nie znalazłeś odpowiedzi? Napisz do nas - pomożemy wybrać najlepszą ścieżkę."
      />
      <FinalCta />
    </>
  );
}
