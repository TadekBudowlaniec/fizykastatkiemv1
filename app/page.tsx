import { Hero } from '@/components/landing/Hero';
import { StatsBar } from '@/components/landing/StatsBar';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { Toolkit } from '@/components/landing/Toolkit';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { CourseCatalog } from '@/components/landing/CourseCatalog';
import { SocialProof } from '@/components/landing/SocialProof';
import { Testimonials } from '@/components/landing/Testimonials';
import { KursVsKorepetycje } from '@/components/landing/KursVsKorepetycje';
import { Guarantee } from '@/components/landing/Guarantee';
import { PricingSection } from '@/components/landing/PricingSection';
import { CourseFacts } from '@/components/landing/CourseFacts';
import { FaqSection, type FaqItem } from '@/components/ui/Faq';
import { FinalCta } from '@/components/landing/FinalCta';
import { StickyCta } from '@/components/landing/StickyCta';
import { PLANS, SINGLE_COURSE_PRICE, VIP_SEATS, TUTORING_PRICE } from '@/lib/courses';
import { courseLd, landingOpenGraph, MATURA } from '@/lib/kurs';
import type { Metadata } from 'next';

const fullPlan = PLANS.find((p) => p.key === 'full_access')!;
const vipPlan = PLANS.find((p) => p.key === 'vip')!;

const TITLE = `Kurs maturalny z fizyki online - matura ${MATURA.year} | Fizyka Statkiem`;
const DESC = `Kurs maturalny z fizyki online do matury ${MATURA.year} (rozszerzony): 16 działów wideo, PDF-y, zadania CKE i planer. ${fullPlan.price} zł jednorazowo, 28/28 zdało maturę.`;

export const metadata: Metadata = {
  // Szablon „%s | Fizyka Statkiem” z layoutu NIE działa na page.tsx tego
  // samego segmentu (root) - markę trzeba dopisać jawnie.
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: '/' },
  ...landingOpenGraph(TITLE, DESC, '/'),
};

// Pytania brzmią tak, jak wpisuje się je w wyszukiwarkę / zadaje asystentowi AI;
// każda odpowiedź jest samodzielna (da się ją zacytować bez reszty strony).
const faq: FaqItem[] = [
  {
    q: 'Dla kogo jest kurs maturalny z fizyki?',
    a: 'Dla maturzystów zdających fizykę na poziomie rozszerzonym (liceum i technikum) oraz dla uczniów, którzy chcą nadrobić zaległości w trakcie roku. Każdy dział zaczyna się od podstaw, więc kurs sprawdzi się też, gdy fizykę zaczynasz praktycznie od zera.',
  },
  {
    q: 'Ile kosztuje kurs maturalny z fizyki?',
    a: `Kurs Pełny kosztuje ${fullPlan.price} zł - płacisz raz, bez abonamentu, i masz wszystkie 16 działów do końca sesji maturalnej. VIP 1:1 z cotygodniowymi zajęciami indywidualnymi kosztuje ${vipPlan.price} zł, a pojedynczy dział ${SINGLE_COURSE_PRICE} zł.`,
  },
  {
    q: 'Czy to kurs na żywo, czy z nagrań?',
    a: `Kurs Pełny to nagrania wideo HD, PDF-y, zadania i quizy dostępne od razu po zakupie - uczysz się wtedy, kiedy masz czas, i wracasz do lekcji bez limitu. Zajęcia na żywo są w wariancie VIP 1:1 (godzina tygodniowo z Czarkiem) oraz na korepetycjach (${TUTORING_PRICE} zł za 60 minut).`,
  },
  {
    q: `Czy kurs przygotowuje do matury ${MATURA.year}?`,
    a: `Tak. Kurs obejmuje pełny zakres wymagań CKE z fizyki na poziomie rozszerzonym, a w każdym dziale kończysz na prawdziwych zadaniach z arkuszy CKE. Matura z fizyki w ${MATURA.year} roku odbędzie się ${MATURA.examDate}; planer rozpisze Ci naukę dzień po dniu do tej daty.`,
  },
  {
    q: 'Jak długo mam dostęp do kursu?',
    a: 'Dostęp do materiałów masz do końca sesji maturalnej.',
  },
  {
    q: 'Czym różni się Kurs Pełny od VIP 1:1?',
    a: `Kurs Pełny (${fullPlan.price} zł) to samodzielna nauka według gotowego systemu - wszystkie 16 działów, PDF-y, zadania, quizy i planer. VIP 1:1 (${vipPlan.price} zł) to cały Kurs Pełny plus indywidualne prowadzenie 1:1 z Czarkiem: 1 godzina tygodniowo aż do matury, z planem pod Twoje braki. VIP ma realnie tylko ${VIP_SEATS} miejsc, bo każde oznacza indywidualną pracę.`,
  },
  {
    q: 'Czy mogę kupić tylko jeden dział?',
    a: `Tak. Jeśli chcesz uzupełnić konkretny temat, możesz kupić pojedynczy dział za ${SINGLE_COURSE_PRICE} zł zamiast całego kursu - pełną listę znajdziesz na stronie „Pojedyncze działy”.`,
  },
  {
    q: 'Jak działa Gwarancja Dobrego Wyniku?',
    a: 'Jeśli przerobisz cały kurs zgodnie z warunkami gwarancji (co najmniej 90% materiałów, zakup najpóźniej 30 dni przed egzaminem), podejdziesz do matury z fizyki i mimo to uzyskasz wynik poniżej 30%, możesz ubiegać się o zwrot ceny kursu. Zgłoszenie wysyłasz na nasz e-mail w ciągu 7 dni od otrzymania oficjalnego wyniku, dołączając oficjalny dokument z wynikiem egzaminu. Zgłoszenie (w tym postępy w kursie) podlega weryfikacji zgodnie z regulaminem (§9).',
  },
  {
    q: 'Jakie są formy płatności?',
    a: 'Płatność jest jednorazowa i bezpieczna przez Stripe - obsługujemy BLIK, karty płatnicze oraz Klarna.',
  },
];

const courseJsonLd = courseLd();

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
      <KursVsKorepetycje />
      <Guarantee />
      <PricingSection />
      <CourseFacts />
      <FaqSection
        items={faq}
        subtitle="Nie znalazłeś odpowiedzi? Napisz do nas - pomożemy wybrać najlepszą ścieżkę."
      />
      <FinalCta />
      <StickyCta />
    </>
  );
}
