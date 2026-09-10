import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';

// Wyniki maturalne AUTORA kursu (Czarka) — prawdziwe. Prezentowane osobno
// i jasno oznaczone; NIE mylić z wynikami uczniów ani ze zdawalnością absolwentów.
const wynikiCzarka = [
  { val: '82%', lbl: 'Fizyka rozszerzona' },
  { val: '92%', lbl: 'Matematyka rozszerzona' },
  { val: '100%', lbl: 'Matematyka podstawowa' },
];

export function AuthorAuthority() {
  return (
    <section className="bg-white py-14 sm:py-24">
      <Container>
        <Reveal>
          <div className="grid items-center gap-10 rounded-3xl border border-line bg-cloud p-8 shadow-soft sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative mx-auto flex max-w-xs justify-center">
              <div className="absolute h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(107,77,246,0.25),transparent_70%)] blur-2xl" />
              <Image
                src="/images/bialy.svg"
                alt="Cezary Prusak — twórca kursu Fizyka Statkiem"
                width={320}
                height={320}
                className="relative w-48 sm:w-56"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-500">
                Kto prowadzi kurs
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                Cezary Prusak
              </h2>
              <p className="mt-3 text-muted">
                Uczę fizyki tak, żebyś zrozumiał mechanizm zjawiska — nie wkuwał
                wzorów. Ten sam system, którym sam zdałem maturę, przełożyłem na
                kompletny kurs krok po kroku.
              </p>

              <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted">
                Wyniki Czarka z matury:
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {wynikiCzarka.map((w) => (
                  <div
                    key={w.lbl}
                    className="rounded-2xl border border-line bg-white p-4 text-center shadow-soft"
                  >
                    <span className="block font-display text-2xl font-extrabold text-brand-600">
                      {w.val}
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {w.lbl}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-7">
                <Button href="/o-mnie" variant="outline" size="md">
                  Poznaj Czarka →
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
