import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const items = [
  {
    icon: '🎥',
    title: 'Wideo HD tłumaczone po ludzku',
    desc: 'Każdy temat wytłumaczony od zera, bez zbędnej teorii. Oglądasz, rozumiesz, robisz.',
  },
  {
    icon: '📄',
    title: 'Gotowe PDF-y i wzory',
    desc: 'Teoria, kluczowe wzory i zadania w 3 etapach — do druku i powtórki w każdej chwili.',
  },
  {
    icon: '✅',
    title: 'Zadania z rozwiązaniami',
    desc: 'Setki zadań maturalnych z pełnymi rozwiązaniami krok po kroku i śledzeniem postępów.',
  },
];

export function Toolkit() {
  return (
    <section className="bg-cloud py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Twój zestaw narzędzi"
          title="Wszystko, czego potrzebujesz w jednym miejscu"
          subtitle="Zamiast dziesiątek zakładek i chaosu — jedna platforma, która prowadzi Cię do matury."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {/* Duża karta z planerem */}
          <Reveal className="lg:col-span-1 lg:row-span-2">
            <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card">
              <div className="relative bg-[linear-gradient(160deg,#0b1224,#16223f)] p-6">
                <div className="aurora right-0 top-0 h-40 w-40 bg-brand-500/40" />
                <span className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-200 ring-1 ring-white/15">
                  🧭 Inteligentny nawigator
                </span>
                <Image
                  src="/images/planer.png"
                  alt="Planer nauki do matury"
                  width={520}
                  height={360}
                  className="relative mx-auto mt-5 w-full max-w-xs rounded-xl shadow-glow"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-extrabold text-ink">
                  Spersonalizowany planer do matury
                </h3>
                <p className="mt-2 flex-1 text-muted">
                  Zaznacz, co już umiesz, a planer rozpisze naukę dzień po dniu —
                  aż do 21 dni arkuszy maturalnych na finiszu. Bez zgadywania, co
                  robić dalej.
                </p>
                <Link
                  href="/planer"
                  className="mt-4 inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-magenta-600"
                >
                  Odbierz swój planer →
                </Link>
              </div>
            </article>
          </Reveal>

          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 80}>
              <article className="flex h-full items-start gap-4 rounded-3xl border border-line bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
                <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f2efff,#ffe6f3)] text-3xl ring-1 ring-brand-100">
                  {it.icon}
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-ink">{it.title}</h3>
                  <p className="mt-1.5 text-muted">{it.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
