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
      <div className="aurora left-[-8%] top-[-10%] h-[28rem] w-[28rem] animate-[aurora_18s_ease_infinite] bg-brand-600/50" />
      <div className="aurora right-[-6%] top-[10%] h-[26rem] w-[26rem] animate-[aurora_22s_ease_infinite] bg-magenta-500/35" />
      <div className="aurora bottom-[-20%] left-[30%] h-[24rem] w-[24rem] bg-ocean-500/25" />
      <div className="bg-grid absolute inset-0" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-32 lg:pt-24">
        {/* Copy */}
        <div className="animate-[fadeUp_0.7s_cubic-bezier(0.22,1,0.36,1)_both]">
          <Eyebrow dark>🚢 7 tygodni do matury</Eyebrow>
          <h1 className="mt-5 font-display text-[2.6rem] font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Zdaj maturę z fizyki —{' '}
            <span className="text-gradient">płynąc pod prąd</span> chaosu.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300/85">
            Kompletny kurs online: wideo HD, gotowe PDF-y, setki zadań i
            spersonalizowany planer nauki. Od podstaw do rozszerzenia — krok po
            kroku, aż do wyniku, z którego będziesz dumny.
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

        {/* Visual */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(107,77,246,0.5),transparent_70%)] blur-2xl sm:h-96 sm:w-96" />
          <Image
            src="/images/bialy.svg"
            alt="Statek Fizyka Statkiem"
            width={460}
            height={460}
            priority
            className="relative w-64 animate-[float_8s_ease-in-out_infinite] drop-shadow-[0_30px_60px_rgba(107,77,246,0.45)] sm:w-80 lg:w-[26rem]"
          />

          {/* Floating stat cards */}
          <div className="glass absolute -left-2 top-6 rounded-2xl px-4 py-3 text-left shadow-glow sm:left-0">
            <p className="text-2xl font-extrabold text-white">16</p>
            <p className="text-xs text-slate-300">działów kursu</p>
          </div>
          <div className="glass absolute bottom-8 right-0 rounded-2xl px-4 py-3 text-left shadow-glow-magenta">
            <p className="text-2xl font-extrabold text-white">100%</p>
            <p className="text-xs text-slate-300">zakres matury</p>
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
