import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const problems = [
  {
    icon: '🧭',
    title: 'Nie wiesz, od czego zacząć',
    desc: 'Materiału jest ogrom, a Ty tracisz czas na zastanawianie się, czego uczyć się dalej.',
  },
  {
    icon: '🗂️',
    title: 'Nauka z przypadkowych źródeł',
    desc: 'Filmiki z YouTube, luźne notatki, różne książki - brakuje jednego spójnego planu.',
  },
  {
    icon: '📉',
    title: 'Teoria nie przekłada się na zadania',
    desc: 'Rozumiesz wzór, ale przy arkuszu maturalnym i tak nie wiesz, jak go użyć.',
  },
  {
    icon: '😰',
    title: 'Stres przed arkuszami',
    desc: 'Im bliżej matury, tym więcej chaosu - zamiast spokojnej, zaplanowanej powtórki.',
  },
];

export function ProblemSection() {
  return (
    <section className="bg-white py-14 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Znasz to?"
          title="Fizyka do matury potrafi przytłoczyć"
          subtitle="Najczęściej problemem nie jest brak zdolności, tylko brak systemu i planu."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p, i) => (
            <Reveal key={p.title} delay={(i % 4) * 70}>
              <div className="h-full rounded-3xl border border-line bg-cloud p-6 shadow-soft">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl ring-1 ring-brand-100">
                  {p.icon}
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-ink">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
