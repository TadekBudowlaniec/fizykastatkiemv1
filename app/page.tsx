import { Hero } from '@/components/landing/Hero';
import { StatsBar } from '@/components/landing/StatsBar';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { Toolkit } from '@/components/landing/Toolkit';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { CourseCatalog } from '@/components/landing/CourseCatalog';
import { SocialProof } from '@/components/landing/SocialProof';
import { Testimonials } from '@/components/landing/Testimonials';
import { Guarantee } from '@/components/landing/Guarantee';
import { PricingSection } from '@/components/landing/PricingSection';
import { FaqSection, type FaqItem } from '@/components/ui/Faq';
import { FinalCta } from '@/components/landing/FinalCta';
import { StickyCta } from '@/components/landing/StickyCta';
import { PLANS, SINGLE_COURSE_PRICE, VIP_SEATS } from '@/lib/courses';
import { SITE } from '@/lib/site';
import type { Metadata } from 'next';

const fullPlan = PLANS.find((p) => p.key === 'full_access')!;
const vipPlan = PLANS.find((p) => p.key === 'vip')!;

export const metadata: Metadata = {
  title: 'Kurs maturalny z fizyki online — matura rozszerzona',
  description:
    'Kurs maturalny z fizyki online (poziom rozszerzony): 16 działów wideo HD, PDF-y, zadania na wzór CKE i planer nauki. 100% zdawalności — 28/28 absolwentów zdało maturę. Gwarancja Zdanej Matury.',
  alternates: { canonical: '/' },
};

const faq: FaqItem[] = [
  {
    q: 'Dla kogo jest kurs?',
    a: 'Dla maturzystów zdających fizykę na poziomie rozszerzonym oraz dla uczniów, którzy chcą nadrobić zaległości w trakcie roku.',
  },
  {
    q: 'Jak długo mam dostęp do kursu?',
    a: 'Dostęp do materiałów masz do końca sesji maturalnej.',
  },
  {
    q: 'Czym różni się Kurs Pełny od VIP 1:1?',
    a: `Kurs Pełny (${fullPlan.price} zł) to samodzielna nauka według gotowego systemu — wszystkie 16 działów, PDF-y, zadania, quizy i planer. VIP 1:1 (${vipPlan.price} zł) to cały Kurs Pełny plus indywidualne prowadzenie 1:1 z Czarkiem: 1 godzina tygodniowo aż do matury, z planem pod Twoje braki. VIP ma realnie tylko ${VIP_SEATS} miejsc, bo każde oznacza indywidualną pracę.`,
  },
  {
    q: 'Czy mogę kupić tylko jeden dział?',
    a: `Tak. Jeśli chcesz uzupełnić konkretny temat, możesz kupić pojedynczy dział za ${SINGLE_COURSE_PRICE} zł zamiast całego kursu — pełną listę znajdziesz na stronie „Pojedyncze działy”.`,
  },
  {
    q: 'Jak działa Gwarancja Zdanej Matury?',
    a: 'Jeśli przerobisz cały kurs zgodnie z warunkami gwarancji (co najmniej 90% materiałów, zakup najpóźniej 30 dni przed egzaminem), podejdziesz do matury z fizyki i mimo to uzyskasz wynik poniżej 30%, możesz ubiegać się o zwrot ceny kursu. Zgłoszenie wysyłasz na nasz e-mail w ciągu 7 dni od otrzymania oficjalnego wyniku, dołączając oficjalny dokument z wynikiem egzaminu. Zgłoszenie (w tym postępy w kursie) podlega weryfikacji zgodnie z regulaminem (§9).',
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
    price: String(fullPlan.price),
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
      <ProblemSection />
      <Toolkit />
      <HowItWorks />
      <CourseCatalog />
      <SocialProof />
      <Testimonials />
      <Guarantee />
      <PricingSection />
      <FaqSection
        items={faq}
        subtitle="Nie znalazłeś odpowiedzi? Napisz do nas - pomożemy wybrać najlepszą ścieżkę."
      />
      <FinalCta />
      <StickyCta />
    </>
  );
}
