import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';

export function Guarantee() {
  return (
    <section className="bg-cloud py-14">
      <Container>
        <Reveal>
          <div className="border-gradient relative overflow-hidden rounded-3xl bg-white p-6 shadow-card sm:p-10">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              {/* Pieczęć gwarancji */}
              <div className="relative flex h-28 w-28 flex-none items-center justify-center rounded-full bg-[linear-gradient(135deg,#6b4df6,#f43f8f)] text-white shadow-glow ring-4 ring-white">
                <div className="text-center leading-tight">
                  <div className="text-[0.55rem] font-extrabold uppercase tracking-[0.18em]">
                    Gwarancja
                  </div>
                  <div className="my-0.5 text-3xl">🛡️</div>
                  <div className="text-[0.55rem] font-extrabold uppercase tracking-[0.18em]">
                    Dobry wynik
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
                  Gwarancja Dobrego Wyniku
                </h2>
                <p className="mt-2 max-w-2xl text-muted">
                  Jesteśmy pewni, że przy tym systemie osiągniesz dobry wynik -
                  dlatego bierzemy ryzyko na siebie. Jeśli przerobisz cały kurs
                  zgodnie z warunkami gwarancji, podejdziesz do matury z fizyki i
                  mimo to uzyskasz wynik{' '}
                  <strong className="text-ink">poniżej 30%</strong> -{' '}
                  <strong className="text-ink">zwracamy Ci pełny koszt kursu</strong>.
                  Zgłoszenie w ciągu 7 dni od otrzymania oficjalnego wyniku, który
                  potwierdzasz oficjalnym dokumentem z egzaminu.
                </p>
                <p className="mt-2 text-sm text-muted">
                  Szczegółowe warunki w{' '}
                  <a href="/cennik#faq" className="font-semibold text-brand-600 underline underline-offset-2 hover:text-magenta-600">
                    FAQ
                  </a>{' '}
                  i{' '}
                  <a href="/regulamin" className="font-semibold text-brand-600 underline underline-offset-2 hover:text-magenta-600">
                    regulaminie (§9)
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
