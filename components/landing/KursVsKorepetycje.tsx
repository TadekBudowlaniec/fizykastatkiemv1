import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PLANS, TUTORING_PRICE } from '@/lib/courses';

const fullPrice = PLANS.find((p) => p.key === 'full_access')!.price;
const vipPrice = PLANS.find((p) => p.key === 'vip')!.price;
// Ile godzin korepetycji „kosztuje" cały kurs (uczciwe porównanie wartości).
const hours = Math.floor(fullPrice / TUTORING_PRICE); // 828 / 100 = 8

export function KursVsKorepetycje() {
  return (
    <section className="bg-white py-14 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Policzmy to na spokojnie"
          title="Kurs czy korepetycje?"
          subtitle="Obie drogi działają — zależy, czego potrzebujesz. A najlepiej łączyć jedno z drugim."
        />

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
          <Reveal>
            <article className="flex h-full flex-col rounded-3xl border-2 border-brand-200 bg-brand-50/40 p-7 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
                Kurs Pełny · {fullPrice} zł
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-ink">
                Komplet do matury, w Twoim tempie
              </h3>
              <p className="mt-2 flex-1 text-muted">
                Wszystkie 16 działów, PDF-y, zadania na wzór CKE, quizy i planer —
                uczysz się kiedy chcesz, wracasz do materiału bez limitu.
              </p>
              <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-brand-700 ring-1 ring-brand-100">
                To mniej niż {hours} godzin korepetycji — a dostajesz cały
                materiał do matury <strong>plus Gwarancję Dobrego Wyniku</strong>.
              </p>
            </article>
          </Reveal>

          <Reveal delay={90}>
            <article className="flex h-full flex-col rounded-3xl border border-line bg-cloud p-7 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                Korepetycje 1:1 · {TUTORING_PRICE} zł / 60 min
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-ink">
                Punktowa pomoc pod konkretny problem
              </h3>
              <p className="mt-2 flex-1 text-muted">
                Żywy człowiek, indywidualne tempo, rozbrajanie konkretnych braków.
                Świetne, gdy utknąłeś na jednym temacie — najlepiej jako
                uzupełnienie kursu.
              </p>
              <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate ring-1 ring-line">
                Elastyczne, ale rozliczane za godzinę — komplet materiału do
                matury wychodzi drożej niż jeden kurs.
              </p>
            </article>
          </Reveal>
        </div>

        {/* Punchline: VIP łączy oba */}
        <div className="mx-auto mt-8 flex max-w-4xl flex-col items-center gap-4 rounded-3xl bg-[linear-gradient(120deg,#6b4df6,#f43f8f)] p-7 text-center text-white sm:flex-row sm:text-left">
          <p className="flex-1 text-lg font-semibold">
            Chcesz jedno i drugie? <strong>VIP 1:1 ({vipPrice} zł)</strong> to cały
            Kurs Pełny <strong>plus</strong> cotygodniowe prowadzenie 1:1 z Czarkiem
            aż do matury.
          </p>
          <Link
            href="#vip"
            className="whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-bold text-navy-900 shadow-soft transition hover:-translate-y-0.5"
          >
            Zobacz VIP 1:1 →
          </Link>
        </div>
      </Container>
    </section>
  );
}
