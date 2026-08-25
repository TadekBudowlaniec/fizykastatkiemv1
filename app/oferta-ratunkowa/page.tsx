import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PricingTiers } from '@/components/shop/PricingTiers';
import { PromoCountdown } from '@/components/shop/PromoCountdown';

export const metadata: Metadata = {
  title: 'Pakiet Ratunkowy — 7 tygodni do matury',
  description:
    'Ostatnia szansa przed maturą z fizyki. Wybierz Pakiet Ratunkowy i uratuj swój wynik w ostatnich tygodniach nauki.',
  alternates: { canonical: '/oferta-ratunkowa' },
};

export default function OfertaRatunkowaPage() {
  return (
    <div className="relative overflow-hidden bg-[linear-gradient(160deg,#070b18,#0b1224_50%,#16223f)] text-white">
      {/* Orby */}
      <div className="aurora left-[-8%] top-[6%] h-80 w-80 animate-[aurora_18s_ease_infinite] bg-brand-600/45" />
      <div className="aurora right-[-6%] top-[30%] h-72 w-72 animate-[aurora_22s_ease_infinite] bg-magenta-500/40" />
      <div className="aurora bottom-[6%] left-[35%] h-72 w-72 bg-ocean-500/25" />
      <div className="bg-grid absolute inset-0" />

      {/* Pasek sukcesu */}
      <div className="relative border-b border-white/10 bg-ocean-400/10 py-3 text-center text-sm text-ocean-300 backdrop-blur">
        ✔ Sukces! Link do Twojego darmowego planera leci na maila (sprawdź
        skrzynkę i folder SPAM).
      </div>

      <Container className="relative py-14 text-center sm:py-20">
        <span className="inline-flex animate-[pulseGlow_2.5s_ease-in-out_infinite] items-center rounded-full bg-magenta-500 px-5 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-white shadow-glow-magenta">
          Ostatnia szansa
        </span>

        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl">
          Pakiet Ratunkowy
          <br />
          <span className="text-gradient">na 7 tygodni przed maturą</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300/85">
          Obejrzyj krótkie wideo i dowiedz się, jak w ostatnich tygodniach
          uratować wynik z fizyki.
        </p>

        {/* Placeholder VSL */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-navy-900/60 shadow-glow">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(120deg,#6b4df6,#f43f8f)] text-2xl shadow-glow">
                ▶
              </span>
              <p className="text-slate-300">
                Tutaj pojawi się wideo sprzedażowe (VSL)
              </p>
            </div>
          </div>
        </div>

        {/* Oferta */}
        <div className="mt-16">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
            Wybierz swój Pakiet Ratunkowy
          </h2>
          <PromoCountdown />
          <div className="mx-auto mt-10 max-w-5xl text-left">
            <PricingTiers />
          </div>
          <p className="mt-8 text-sm text-slate-400">
            30-dniowa gwarancja zwrotu pieniędzy. Bez ryzyka.
          </p>
        </div>
      </Container>
    </div>
  );
}
