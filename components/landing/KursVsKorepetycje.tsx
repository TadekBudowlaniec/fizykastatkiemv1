import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PLANS, TUTORING_PRICE } from '@/lib/courses';

const fullPrice = PLANS.find((p) => p.key === 'full_access')!.price;
const vipPrice = PLANS.find((p) => p.key === 'vip')!.price;
// Równowartość ilu godzin korepetycji to cały kurs (uczciwe porównanie wartości).
// 828 / 100 = ~8 h — używamy „równowartość zaledwie", bo to nieco ponad 8 h.
const hours = Math.round(fullPrice / TUTORING_PRICE); // 828 / 100 -> 8

export function KursVsKorepetycje() {
  return (
    <section className="bg-cloud py-14 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Policzmy to na spokojnie"
          title="Kurs czy korepetycje?"
          subtitle="Obie drogi działają — zależy, czego potrzebujesz. Najlepiej łączyć jedno z drugim."
        />

        <div className="relative mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Kurs Pełny */}
          <Reveal>
            <article className="flex h-full flex-col rounded-3xl border border-line bg-white p-7 shadow-soft">
              <span className="self-start rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-600">
                Kurs Pełny · {fullPrice} zł
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-ink">
                Komplet do matury, w Twoim tempie
              </h3>
              <p className="mt-2 text-muted">
                Wszystkie 16 działów, PDF-y, zadania na wzór CKE, quizy i planer —
                uczysz się kiedy chcesz i wracasz do materiału bez limitu.
              </p>
              <div className="mt-auto pt-5">
                <p className="border-t border-line pt-4 text-sm text-slate">
                  <span className="font-bold text-brand-600">
                    To równowartość zaledwie {hours} godzin korepetycji
                  </span>{' '}
                  — a masz cały materiał do matury plus Gwarancję Dobrego Wyniku.
                </p>
                <Link
                  href="#cennik"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(120deg,#6b4df6,#f43f8f)] px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5"
                >
                  Wybieram Kurs
                </Link>
              </div>
            </article>
          </Reveal>

          {/* Korepetycje 1:1 */}
          <Reveal delay={90}>
            <article className="flex h-full flex-col rounded-3xl border border-line bg-white p-7 shadow-soft">
              <span className="self-start rounded-full bg-cloud px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate ring-1 ring-line">
                Korepetycje 1:1 · {TUTORING_PRICE} zł / 60 min
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-ink">
                Punktowa pomoc pod konkretny problem
              </h3>
              <p className="mt-2 text-muted">
                Żywy człowiek i indywidualne tempo — rozbrajanie konkretnych
                braków. Świetne, gdy utknąłeś na jednym temacie; najlepiej jako
                uzupełnienie kursu.
              </p>
              <div className="mt-auto pt-5">
                <p className="border-t border-line pt-4 text-sm text-slate">
                  Elastyczne, ale rozliczane za godzinę — przerabianie całego
                  materiału od zera pochłonie znacznie więcej budżetu niż gotowy
                  kurs.
                </p>
                <Link
                  href="/korepetycje"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full border-2 border-brand-200 px-5 py-3 text-sm font-bold text-brand-600 transition-all hover:border-brand-500 hover:bg-brand-50"
                >
                  Zapisz się na lekcję
                </Link>
              </div>
            </article>
          </Reveal>

          {/* Znaczek „vs" między kartami (desktop) */}
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-sm font-extrabold uppercase text-ink shadow-card ring-1 ring-line md:flex"
          >
            vs
          </span>
        </div>

        {/* Punchline — premium (navy), spokojny zamiast krzykliwego gradientu */}
        <Reveal>
          <div className="mx-auto mt-6 flex max-w-4xl flex-col items-center gap-5 rounded-3xl bg-[linear-gradient(150deg,#0b1224,#16223f)] p-7 text-center text-white sm:flex-row sm:text-left">
            <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6b4df6,#f43f8f)] text-2xl shadow-glow">
              👑
            </span>
            <p className="flex-1 text-base leading-relaxed text-slate-200 sm:text-lg">
              Chcesz jedno i drugie?{' '}
              <strong className="font-bold text-white">
                VIP 1:1 ({vipPrice} zł)
              </strong>{' '}
              to cały Kurs Pełny <strong className="text-white">plus</strong>{' '}
              cotygodniowe prowadzenie 1:1 z Czarkiem aż do matury.
            </p>
            <Link
              href="#vip"
              className="whitespace-nowrap rounded-full bg-[linear-gradient(120deg,#6b4df6,#a855f7,#f43f8f)] px-6 py-3.5 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5"
            >
              Zobacz VIP 1:1 →
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
