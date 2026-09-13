'use client';

import { useEffect, useState } from 'react';
import type { Lesson } from '@/lib/types';
import { cn } from '@/lib/cn';
import {
  IconArrow,
  IconBook,
  IconExternal,
  IconPlay,
} from '@/components/app/CourseIcons';

/**
 * Lekcja wideo osadzona bezpośrednio w ścieżce działu (bez osobnej zakładki).
 * Player ładuje się dopiero po kliknięciu w okładkę (lżejsza strona), a
 * YouTube jest tylko dyskretnym linkiem „otwórz w nowej karcie".
 */
export function CourseVideo({
  lessons,
  onOpenNotes,
}: {
  /** Lekcje z `yt_id_wideo` (co najmniej jedna). */
  lessons: Lesson[];
  /** Otwiera pełny widok lekcji (notatki markdown pod wideo). */
  onOpenNotes: (lesson: Lesson) => void;
}) {
  const [activeId, setActiveId] = useState(lessons[0]?.video_id);
  const [playing, setPlaying] = useState(false);
  const [poster, setPoster] = useState<'max' | 'hq'>('max');

  const active = lessons.find((l) => l.video_id === activeId) ?? lessons[0];
  const ytId = active?.yt_id_wideo ?? '';

  // Zmiana lekcji → nowa okładka, player od nowa.
  useEffect(() => {
    setPlaying(false);
    setPoster('max');
  }, [activeId]);

  if (!active) return null;

  const hasNotes = !!active.content && active.content.trim().length > 0;
  const posterUrl =
    poster === 'max'
      ? `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`
      : `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
      {/* Player / okładka */}
      <div className="relative aspect-video bg-navy-950">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&autoplay=1`}
            title={active.tytul_lekcji}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex items-center justify-center"
            aria-label={`Odtwórz: ${active.tytul_lekcji}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterUrl}
              alt=""
              onError={() => poster === 'max' && setPoster('hq')}
              className="absolute inset-0 h-full w-full object-cover opacity-90 transition-all duration-700 group-hover:scale-[1.02] group-hover:opacity-100"
            />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,24,0)_40%,rgba(7,11,24,0.7))]" />
            <span className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-[0_20px_50px_-12px_rgba(107,77,246,0.7)] transition-all duration-300 group-hover:scale-105 group-hover:bg-white">
              <IconPlay className="ml-1 h-8 w-8" />
            </span>
            <span className="absolute bottom-5 left-6 right-6 text-left">
              <span className="block text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-200">
                Lekcja wideo
              </span>
              <span className="mt-0.5 block truncate font-display text-lg font-extrabold text-white sm:text-xl">
                {active.tytul_lekcji}
              </span>
            </span>
          </button>
        )}
      </div>

      {/* Pasek pod playerem */}
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {lessons.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {lessons.map((l, i) => (
              <button
                key={l.video_id}
                onClick={() => setActiveId(l.video_id)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-300',
                  l.video_id === active.video_id
                    ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200'
                    : 'text-muted hover:bg-cloud hover:text-ink'
                )}
              >
                {i + 1}. {l.tytul_lekcji}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Obejrzyj lekcję, a potem przejdź do materiałów poniżej.
          </p>
        )}

        <div className="flex flex-none items-center gap-4">
          {hasNotes && (
            <button
              onClick={() => onOpenNotes(active)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-magenta-600"
            >
              <IconBook className="h-4 w-4" /> Notatki
              <IconArrow className="h-3.5 w-3.5" />
            </button>
          )}
          <a
            href={`https://www.youtube.com/watch?v=${ytId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-700"
          >
            YouTube <IconExternal className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
