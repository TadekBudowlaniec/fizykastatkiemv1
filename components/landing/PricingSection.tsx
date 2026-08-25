import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PricingTiers } from '@/components/shop/PricingTiers';

export function PricingSection() {
  return (
    <section id="cennik" className="bg-white py-20 sm:py-24">
      <Container size="wide">
        <SectionHeading
          eyebrow="Oferta"
          title="Wybierz pakiet i płyń po swój wynik"
          subtitle="Najpierw złap całość, potem dopracuj szczegóły. Trzy poziomy wsparcia — od samodzielnej nauki po VIP 1:1."
        />
        <div className="mx-auto mt-14 max-w-5xl">
          <PricingTiers />
        </div>
        <p className="mt-8 text-center text-sm text-muted">
          Płatność jednorazowa · dostęp do końca matury · BLIK, karta, Klarna.
        </p>
      </Container>
    </section>
  );
}
