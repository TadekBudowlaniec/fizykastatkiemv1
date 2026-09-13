'use client';

import { useEffect, useRef, useState } from 'react';
import type { Lesson } from '@/lib/types';
import { cn } from '@/lib/cn';
import {
  IconArrow,
  IconBook,
  IconCheck,
  IconExternal,
  IconPlay,
  IconSpinner,
} from '@/components/app/CourseIcons';

// Próg auto-zaliczenia: obejrzane ≥ 90% albo zdarzenie „ended" z playera.
const WATCHED_RATIO = 0.9;

/**
 * Lekcja wideo osadzona bezpośrednio w ścieżce działu (bez osobnej zakładki).
 * Player ładuje się dopiero po kliknięciu w okładkę (lżejsza strona), a
 * YouTube jest tylko dyskretnym linkiem „otwórz w nowej karcie".
 *
 * „Obejrzane" liczy się do postępu działu: zalicza się automatycznie
 * (postMessage z iframe YouTube: enablejsapi) albo ręcznie przełącznikiem.
 */
export function CourseVideo({
  lessons,
  watched,
  onToggleWatched,
  onOpenNotes,
}: {
  /** Lekcje z `yt_id_wideo` (co najmniej jedna). */
  lessons: Lesson[];
  /** Obejrzane wideo (yt_id). Bez tych propsów śledzenie jest wyłączone. */
  watched?: Set<string>;
  onToggleWatched?: (ytId: string, done: boolean) => Promise<void>;
  /** Otwiera pełny widok lekcji (notatki markdown pod wideo). */
  onOpenNotes: (lesson: Lesson) => void;
}) {
  const [activeId, setActiveId] = useState(lessons[0]?.video_id);
  const [playing, setPlaying] = useState(false);
  const [poster, setPoster] = useState<'max' | 'hq'>('max');
  const [busy, setBusy] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const active = lessons.find((l) => l.video_id === activeId) ?? lessons[0];
  const ytId = active?.yt_id_wideo ?? '';
  const tracking = !!watched && !!onToggleWatched;
  const isWatched = !!watched?.has(ytId);

  // Zmiana lekcji → nowa okładka, player od nowa.
  useEffect(() => {
    setPlaying(false);
    setPoster('max');
  }, [activeId]);

  // Auto-zaliczenie: subskrybujemy zdarzenia playera (bez ładowania YT API).
  useEffect(() => {
    if (!playing || !ytId || isWatched || !onToggleWatched) return;
    const frame = iframeRef.current;
    if (!frame) return;

    const subscribe = () => {
      frame.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: ytId, channel: 'widget' }),
        'https://www.youtube.com'
      );
    };
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://www.youtube.com' || e.source !== frame.contentWindow)
        return;
      let data: { event?: string; info?: unknown };
      try {
        data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      // Koniec filmu
      if (data.event === 'onStateChange' && data.info === 0) {
        onToggleWatched(ytId, true);
        return;
      }
      // Postęp odtwarzania (currentTime / duration)
      if (data.event === 'infoDelivery' && data.info && typeof data.info === 'object') {
        const info = data.info as { currentTime?: number; duration?: number };
        if (
          typeof info.currentTime === 'number' &&
          typeof info.duration === 'number' &&
          info.duration > 0 &&
          info.currentTime / info.duration >= WATCHED_RATIO
        ) {
          onToggleWatched(ytId, true);
        }
      }
    };

    window.addEventListener('message', onMessage);
    frame.addEventListener('load', subscribe);
    subscribe();
    return () => {
      window.removeEventListener('message', onMessage);
      frame.removeEventListener('load', subscribe);
    };
  }, [playing, ytId, isWatched, onToggleWatched]);

  if (!active) return null;

  const hasNotes = !!active.content && active.content.trim().length > 0;
  const posterUrl =
    poster === 'max'
      ? `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`
      : `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const toggle = async () => {
    if (!onToggleWatched) return;
    setBusy(true);
    try {
      await onToggleWatched(ytId, !isWatched);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl border bg-white shadow-soft transition-colors duration-500',
        isWatched ? 'border-brand-200' : 'border-line'
      )}
    >
      {/* Player / okładka */}
      <div className="relative aspect-video bg-navy-950">
        {playing ? (
          <iframe
            ref={iframeRef}
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&autoplay=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`}
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
            {isWatched && (
              <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-700">
                <IconCheck className="h-3.5 w-3.5" strokeWidth={2.5} /> Obejrzane
              </span>
            )}
          </button>
        )}
      </div>

      {/* Pasek pod playerem */}
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {lessons.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {lessons.map((l, i) => {
              const done = !!l.yt_id_wideo && !!watched?.has(l.yt_id_wideo);
              return (
                <button
                  key={l.video_id}
                  onClick={() => setActiveId(l.video_id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-300',
                    l.video_id === active.video_id
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200'
                      : 'text-muted hover:bg-cloud hover:text-ink'
                  )}
                >
                  {done && <IconCheck className="h-3.5 w-3.5" strokeWidth={2.5} />}
                  {i + 1}. {l.tytul_lekcji}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted">
            {!tracking
              ? 'Obejrzyj lekcję, a potem przejdź dalej.'
              : isWatched
                ? 'Lekcja zaliczona. Możesz do niej wracać w każdej chwili.'
                : 'Zalicza się automatycznie po obejrzeniu — albo odhacz ręcznie.'}
          </p>
        )}

        <div className="flex flex-none flex-wrap items-center gap-x-4 gap-y-2">
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
          {tracking && (
          <button
            onClick={toggle}
            disabled={busy}
            aria-pressed={isWatched}
            className={cn(
              'inline-flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-semibold ring-1 transition-all duration-300 disabled:opacity-60',
              isWatched
                ? 'bg-white text-brand-700 ring-brand-200'
                : 'bg-white text-slate ring-line hover:text-brand-700 hover:ring-brand-300'
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300',
                isWatched
                  ? 'bg-[linear-gradient(135deg,#6b4df6,#f43f8f)] text-white'
                  : 'bg-cloud text-transparent ring-1 ring-line'
              )}
            >
              {busy ? (
                <IconSpinner className="h-3.5 w-3.5 text-brand-400" />
              ) : (
                <IconCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
              )}
            </span>
            {isWatched ? 'Obejrzane' : 'Oznacz jako obejrzane'}
          </button>
          )}
        </div>
      </div>
    </div>
  );
}
