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
                  Przerób cały kurs zgodnie z warunkami gwarancji, podejdź do
                  matury z fizyki i — jeśli mimo to uzyskasz wynik{' '}
                  <strong className="text-ink">poniżej 30%</strong> — możesz
                  ubiegać się o <strong className="text-ink">zwrot ceny kursu</strong>.
                  Zgłoszenie w ciągu 7 dni od otrzymania oficjalnego wyniku.
                  Wynik matury potwierdzasz oficjalnym dokumentem z wynikiem
                  egzaminu.
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
