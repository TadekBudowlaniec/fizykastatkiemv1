import Image from 'next/image';
import Link from 'next/link';
import { SqueezeForm } from './SqueezeForm';
import { Eyebrow } from '@/components/ui/SectionHeading';

const trust = [
  { icon: '🎓', label: '2000+ maturzystów' },
  { icon: '⭐', label: '4.9/5 średnia ocen' },
  { icon: '🛡️', label: 'Gwarancja zdanej matury' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(160deg,#070b18_0%,#0b1224_45%,#16223f_100%)] text-white">
      {/* Aurora glow */}
      <div className="aurora left-[-8%] top-[-10%] h-[30rem] w-[30rem] animate-[aurora_18s_ease_infinite] bg-brand-600/45" />
      <div className="aurora right-[-4%] top-[6%] h-[28rem] w-[28rem] animate-[aurora_22s_ease_infinite] bg-magenta-500/30" />
      <div className="aurora bottom-[-25%] left-[28%] h-[24rem] w-[24rem] bg-ocean-500/20" />
      {/* delikatna winieta u góry */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(107,77,246,0.18),transparent)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-28 lg:pt-20">
        {/* Copy */}
        <div className="animate-[fadeUp_0.7s_cubic-bezier(0.22,1,0.36,1)_both]">
          <Eyebrow dark>🚢 Kurs maturalny z fizyki - matura 2027</Eyebrow>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-[3.4rem]">
            Kurs maturalny z fizyki{' '}
            <span className="text-gradient">online</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300/85">
            Kompletny kurs maturalny z fizyki na poziomie rozszerzonym: 16 działów
            wideo HD, gotowe PDF-y, setki zadań CKE i spersonalizowany planer
            nauki. Od podstaw do rozszerzenia — bez stresu i chaosu, krok po
            kroku aż do wyniku, z którego będziesz dumny.
          </p>

          <div className="mt-8">
            <SqueezeForm />
          </div>

          <p className="mt-3 text-sm text-slate-400">
            Wolisz zacząć od razu?{' '}
            <Link
              href="/cennik"
              className="font-semibold text-brand-300 underline underline-offset-4 transition-colors hover:text-magenta-400"
            >
              Zobacz pakiety kursu →
            </Link>
          </p>

          <ul className="mt-8 flex flex-wrap gap-2.5">
            {trust.map((t) => (
              <li
                key={t.label}
                className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-200"
              >
                <span>{t.icon}</span>
                {t.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Visual - statek w reflektorze */}
        <div className="relative hidden md:block">
          <div className="relative mx-auto aspect-square w-full max-w-[24rem] lg:max-w-[26rem]">
            {/* koncentryczne pierścienie */}
            <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
            <div className="absolute inset-[9%] rounded-full border border-white/[0.09]" />
            <div className="absolute inset-[19%] rounded-full border border-white/[0.05]" />

            {/* poświata za statkiem */}
            <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(139,107,255,0.55),rgba(244,63,143,0.18)_52%,transparent_72%)] blur-2xl" />

            {/* statek */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/images/bialy.svg"
                alt="Statek Fizyka Statkiem"
                width={460}
                height={460}
                priority
                className="w-[70%] animate-[float_8s_ease-in-out_infinite] drop-shadow-[0_24px_60px_rgba(107,77,246,0.55)]"
              />
            </div>

            {/* karty statystyk - solidne, czytelne */}
            <div className="absolute left-0 top-[14%] rounded-2xl bg-navy-800/90 px-4 py-3 text-left shadow-glow ring-1 ring-white/10 backdrop-blur-sm">
              <p className="text-2xl font-extrabold text-white">16</p>
              <p className="text-xs text-slate-300">działów kursu</p>
            </div>
            <div className="absolute bottom-[12%] right-0 rounded-2xl bg-navy-800/90 px-4 py-3 text-left shadow-glow-magenta ring-1 ring-white/10 backdrop-blur-sm">
              <p className="text-2xl font-extrabold text-white">100%</p>
              <p className="text-xs text-slate-300">zakres matury</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="relative -mb-px">
        <svg
          className="block h-[60px] w-full sm:h-[90px]"
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="#f6f8ff"
            d="M0,48 C240,90 480,90 720,60 C960,30 1200,10 1440,40 L1440,90 L0,90 Z"
          />
        </svg>
      </div>
    </section>
  );
}
