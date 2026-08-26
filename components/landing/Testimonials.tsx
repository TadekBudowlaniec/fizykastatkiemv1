'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const SUPA =
  'https://kldekjrpottsqebueojg.supabase.co/storage/v1/object/public/opinie';

const reviews = [
  {
    name: 'Nadia',
    role: 'Matura rozszerzona',
    initials: 'N',
    color: 'from-brand-500 to-brand-700',
    image: `${SUPA}/Nadia.png`,
    text: 'Z fizyki byłam zielona, a dzięki kursowi ogarnęłam całą mechanikę i elektryczność. Planer trzymał mnie w ryzach do samego końca.',
  },
  {
    name: 'Filip',
    role: 'Matura 2025',
    initials: 'F',
    color: 'from-ocean-500 to-brand-600',
    image: `${SUPA}/Filip.jpg`,
    text: 'Filmiki tłumaczą wszystko prościej niż w szkole. Zadania z rozwiązaniami to złoto — w końcu wiedziałem, gdzie robię błędy.',
  },
  {
    name: 'Daria',
    role: 'Matura rozszerzona',
    initials: 'D',
    color: 'from-magenta-500 to-brand-600',
    image: `${SUPA}/Daria.jpg`,
    text: 'Najlepsza inwestycja przed maturą. PDF-y wydrukowane, obejrzane wideo, arkusze rozwiązane — i wynik, o jakim marzyłam.',
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-amber-400" aria-label="5 na 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  const [zoom, setZoom] = useState<string | null>(null);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(null);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [zoom]);

  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Owoce współpracy"
          title="Prawdziwe wiadomości od naszych uczniów"
          subtitle="Screeny prosto z telefonu — kliknij, aby powiększyć i przeczytać."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={i * 90}>
              <figure className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-cloud shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
                {/* Screen z telefonu */}
                <button
                  onClick={() => setZoom(r.image)}
                  className="group relative block h-72 w-full overflow-hidden bg-[linear-gradient(160deg,#0b1224,#16223f)]"
                  aria-label={`Powiększ opinię: ${r.name}`}
                >
                  <Image
                    src={r.image}
                    alt={`Opinia od ucznia: ${r.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy-900 shadow-soft backdrop-blur">
                    🔍 Powiększ
                  </span>
                </button>

                <div className="flex flex-1 flex-col p-6">
                  <Stars />
                  <blockquote className="mt-3 flex-1 text-sm text-slate">
                    „{r.text}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${r.color} text-sm font-bold text-white`}
                    >
                      {r.initials}
                    </span>
                    <span>
                      <span className="block font-bold text-ink">{r.name}</span>
                      <span className="block text-xs text-muted">{r.role}</span>
                    </span>
                    <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-brand-600">
                      ✓ zweryfikowana
                    </span>
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* Lightbox */}
      {zoom && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setZoom(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoom}
            alt="Opinia ucznia — powiększenie"
            className="max-h-[90vh] max-w-[92vw] rounded-2xl shadow-2xl sm:max-w-md"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setZoom(null)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white ring-1 ring-white/25 transition hover:bg-white/25"
            aria-label="Zamknij"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
