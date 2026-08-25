import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const reviews = [
  {
    name: 'Nadia',
    role: 'Matura rozszerzona',
    initials: 'N',
    color: 'from-brand-500 to-brand-700',
    text: 'Z fizyki byłam zielona, a dzięki kursowi ogarnęłam całą mechanikę i elektryczność. Planer trzymał mnie w ryzach do samego końca.',
  },
  {
    name: 'Filip',
    role: 'Matura 2025',
    initials: 'F',
    color: 'from-ocean-500 to-brand-600',
    text: 'Filmiki tłumaczą wszystko prościej niż w szkole. Zadania z rozwiązaniami to złoto — w końcu wiedziałem, gdzie robię błędy.',
  },
  {
    name: 'Daria',
    role: 'Matura rozszerzona',
    initials: 'D',
    color: 'from-magenta-500 to-brand-600',
    text: 'Najlepsza inwestycja przed maturą. PDF-y wydrukowane, obejrzane wideo, arkusze rozwiązane — i wynik, o jakim marzyłam.',
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-amber-400" aria-label="5 na 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Opinie uczniów"
          title="Dołączasz do tysięcy zdanych matur"
          subtitle="Prawdziwe historie uczniów, którzy przepłynęli maturę razem z nami."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={i * 90}>
              <figure className="flex h-full flex-col rounded-3xl border border-line bg-cloud p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
                <Stars />
                <blockquote className="mt-4 flex-1 text-slate">
                  „{r.text}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${r.color} font-bold text-white`}
                  >
                    {r.initials}
                  </span>
                  <span>
                    <span className="block font-bold text-ink">{r.name}</span>
                    <span className="block text-sm text-muted">{r.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
