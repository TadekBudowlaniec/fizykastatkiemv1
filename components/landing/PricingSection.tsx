import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PricingTiers } from '@/components/shop/PricingTiers';

export function PricingSection() {
  return (
    <section id="cennik" className="scroll-mt-20 bg-white py-14 sm:py-24">
      <Container size="wide">
        <SectionHeading
          eyebrow="Oferta"
          title="Wybierz sposób przygotowania do matury"
          subtitle="Dwie proste opcje: przerób kurs samodzielnie albo daj się poprowadzić Czarkowi indywidualnie aż do matury."
        />

        <div className="mx-auto mt-14 max-w-4xl">
          <PricingTiers />
        </div>

        {/* Uzasadnienie różnicy: VIP to nie „więcej funkcji”, tylko czas
            i indywidualne prowadzenie człowieka. */}
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-cloud p-5">
            <p className="font-bold text-ink">Kurs Pełny</p>
            <p className="mt-1 text-sm text-muted">
              Samodzielna nauka według gotowego systemu - całość materiału,
              planer i zadania w Twoich rękach.
            </p>
          </div>
          <div className="rounded-2xl border border-magenta-200 bg-magenta-50/50 p-5">
            <p className="font-bold text-ink">VIP 1:1</p>
            <p className="mt-1 text-sm text-muted">
              System <strong>plus człowiek</strong>, który prowadzi Cię przez
              cały proces. Nie musisz sam układać przygotowań - robi to z Tobą
              Czarek, aż do egzaminu.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          Płatność jednorazowa · dostęp do końca matury · BLIK, karta, Klarna.
        </p>

        <p className="mt-3 text-center text-sm text-muted">
          Potrzebujesz tylko jednego działu zamiast całego kursu?{' '}
          <Link
            href="/dzialy"
            className="font-semibold text-brand-600 underline underline-offset-4 hover:text-magenta-600"
          >
            Zobacz pojedyncze działy →
          </Link>
        </p>
      </Container>
    </section>
  );
}
