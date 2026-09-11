'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';

const SUPA =
  'https://kldekjrpottsqebueojg.supabase.co/storage/v1/object/public/opinie';

// Realne, zanonimizowane screeny opinii (za zgodą) — te same pliki co na stronie
// głównej. Aby podmienić/dodać: wgraj obraz do bucketu Supabase `opinie` i zmień `image`.
const proofs = [
  {
    score: '🏆 94%',
    subject: 'Fizyka rozsz.',
    image: `${SUPA}/Nadia.png`,
    quote: 'Hejj, super poszło, 94%! Mega dzięki za pomoc ❤️',
    author: 'Nadia',
    role: 'Matura rozszerzona',
  },
  {
    score: '⏱️ 1 mc',
    subject: 'Po 10 latach',
    image: `${SUPA}/Filip.jpg`,
    quote:
      'Jak na tak krótki czas przygotowania, wynik jest lepszy, niż się spodziewałem. (Niecały miesiąc nauki)',
    author: 'Filip, 28 lat',
    role: 'Matura rozszerzona',
  },
  {
    score: '📈 ~90%',
    subject: 'Matma podst.',
    image: `${SUPA}/Daria.jpg`,
    quote:
      'Córka wróciła zadowolona. Z tego co policzyła, powinna mieć 90%. Poszła na egzamin naprawdę spokojna.',
    author: 'Mama Darii',
    role: 'Matura rozszerzona',
  },
];

export function OpinieKorepetycje() {
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
    <>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {proofs.map((p, i) => (
          <Reveal key={p.author} delay={i * 90}>
            <figure className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-cloud shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
              {/* Screen z telefonu */}
              <button
                onClick={() => setZoom(p.image)}
                className="group relative block h-64 w-full overflow-hidden bg-[linear-gradient(160deg,#0b1224,#16223f)]"
                aria-label={`Powiększ opinię: ${p.author}`}
              >
                <Image
                  src={p.image}
                  alt={`Opinia: ${p.author}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-extrabold text-brand-600 shadow-soft backdrop-blur">
                  {p.score}
                </span>
                <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy-900 shadow-soft backdrop-blur">
                  🔍 Powiększ
                </span>
              </button>

              <div className="flex flex-1 flex-col p-6">
                <span className="self-start rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-600">
                  {p.subject}
                </span>
                <blockquote className="mt-3 flex-1 text-sm text-slate">
                  „{p.quote}”
                </blockquote>
                <figcaption className="mt-5 border-t border-line pt-4">
                  <span className="block font-bold text-ink">{p.author}</span>
                  <span className="block text-sm text-muted">{p.role}</span>
                </figcaption>
              </div>
            </figure>
          </Reveal>
        ))}
      </div>

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
            alt="Opinia ucznia - powiększenie"
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
    </>
  );
}
