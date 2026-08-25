import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const steps = [
  {
    n: '01',
    title: 'Odbierz planer nauki',
    desc: 'Zaznacz, co już umiesz. Planer rozpisze Ci naukę dzień po dniu aż do matury.',
  },
  {
    n: '02',
    title: 'Ucz się z wideo i PDF',
    desc: 'Oglądaj lekcje, drukuj materiały, utrwalaj wzory. Wszystko w jednym miejscu.',
  },
  {
    n: '03',
    title: 'Rozwiązuj i zdaj',
    desc: 'Trenuj na setkach zadań i arkuszach maturalnych. Śledź postęp i pnij się w górę.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Jak to działa"
          title="Trzy kroki do zdanej matury"
          subtitle="Prosty system, który nie pozwoli Ci utknąć."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="relative h-full rounded-3xl border border-line bg-cloud p-7 shadow-soft">
                <span className="font-display text-5xl font-extrabold text-transparent [-webkit-text-stroke:2px_rgba(107,77,246,0.35)]">
                  {s.n}
                </span>
                <h3 className="mt-3 text-xl font-extrabold text-ink">
                  {s.title}
                </h3>
                <p className="mt-2 text-muted">{s.desc}</p>
                {i < steps.length - 1 && (
                  <span className="absolute right-6 top-8 hidden text-2xl text-brand-200 md:block">
                    →
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
