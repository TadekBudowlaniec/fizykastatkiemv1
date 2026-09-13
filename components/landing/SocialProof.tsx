import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';

// Główny proof rezultatu - osobny punkt od opinii (opinie: komponent Testimonials).
// Bez gwiazdek, bez średniej ocen, bez AggregateRating.
export function SocialProof() {
  return (
    <section className="bg-cloud py-14 sm:py-20">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-5xl font-extrabold text-gradient sm:text-6xl">
              100% zdawalności
            </p>
            <p className="mt-3 text-lg font-semibold text-ink">
              28/28 naszych absolwentów zdało maturę.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
