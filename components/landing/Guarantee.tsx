import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';

export function Guarantee() {
  return (
    <section className="bg-cloud py-14">
      <Container>
        <Reveal>
          <div className="border-gradient relative overflow-hidden rounded-3xl bg-white p-8 shadow-card sm:p-10">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <div className="flex h-20 w-20 flex-none items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6b4df6,#f43f8f)] text-4xl shadow-glow">
                🛡️
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
                  Gwarancja Zdanej Matury
                </h2>
                <p className="mt-2 max-w-2xl text-muted">
                  Przerób cały kurs, rozwiąż zadania i zdawaj według planera.
                  Jeśli mimo to nie zdasz matury - dostajesz{' '}
                  <strong className="text-ink">
                    kolejny rok dostępu za darmo
                  </strong>
                  . Bierzemy odpowiedzialność za Twój wynik.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
