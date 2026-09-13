'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

// Próg auto-zaliczenia: obejrzane >= 90% albo zdarzenie „ended" z playera.
const WATCHED_RATIO = 0.9;
const YT_API_SRC = 'https://www.youtube.com/iframe_api';
const YT_API_TIMEOUT = 6000;

// Minimalny typ playera z YouTube IFrame API (bez @types/youtube).
type YTPlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
};
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      width?: string;
      height?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onStateChange?: (e: { data: number }) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: { ENDED: number };
};
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Ładuje YouTube IFrame API raz na stronę. Odrzuca po timeoucie (np. adblock),
// wtedy komponent wraca do zwykłego iframe.
let ytApiPromise: Promise<YTNamespace> | null = null;
function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === 'undefined') return Promise.reject(new Error('ssr'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise<YTNamespace>((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    const timer = window.setTimeout(() => {
      ytApiPromise = null;
      reject(new Error('yt-api-timeout'));
    }, YT_API_TIMEOUT);
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      window.clearTimeout(timer);
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error('yt-api-missing'));
    };
    if (!document.querySelector(`script[src="${YT_API_SRC}"]`)) {
      const s = document.createElement('script');
      s.src = YT_API_SRC;
      s.async = true;
      s.onerror = () => {
        window.clearTimeout(timer);
        ytApiPromise = null;
        reject(new Error('yt-api-error'));
      };
      document.head.appendChild(s);
    }
  });
  return ytApiPromise;
}

/**
 * Lekcja wideo osadzona bezpośrednio w ścieżce działu (bez osobnej zakładki).
 * Desktop: okładka, player ładuje się po kliknięciu. Dotyk: player od razu,
 * bez autoplay (mobilne przeglądarki i tak go blokują, a dwuetapowe
 * okładka -> iframe psuło pierwsze tapnięcie).
 *
 * Player tworzymy przez oficjalne YouTube IFrame API (najbardziej
 * przetestowana ścieżka na mobile); jeśli API nie dojdzie, zwykły iframe.
 * „Obejrzane" liczy się do postępu: automatycznie (koniec / >= 90%) albo ręcznie.
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
  const [touch, setTouch] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTouch(window.matchMedia('(hover: none), (pointer: coarse)').matches);
  }, []);

  const active = lessons.find((l) => l.video_id === activeId) ?? lessons[0];
  const ytId = active?.yt_id_wideo ?? '';
  const tracking = !!watched && !!onToggleWatched;
  const isWatched = !!watched?.has(ytId);
  const showPlayer = playing || touch;
  const autoplay = playing && !touch;

  // Zmiana lekcji: nowa okładka, player od nowa.
  useEffect(() => {
    setPlaying(false);
    setPoster('max');
  }, [activeId]);

  // Auto-zaliczenie: stabilna referencja, żeby nie przebudowywać playera.
  const markWatchedRef = useRef<() => void>(() => {});
  markWatchedRef.current = () => {
    if (ytId && onToggleWatched && !isWatched) onToggleWatched(ytId, true);
  };

  // Tworzenie playera przez YT.Player w elemencie, którego React nie dotyka.
  useEffect(() => {
    if (!showPlayer || !ytId || apiFailed) return;
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let player: YTPlayer | null = null;
    let poll: number | undefined;
    const mount = document.createElement('div');
    host.appendChild(mount);

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return;
        player = new YT.Player(mount, {
          videoId: ytId,
          width: '100%',
          height: '100%',
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            autoplay: autoplay ? 1 : 0,
            origin: window.location.origin,
          },
          events: {
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.ENDED) markWatchedRef.current();
            },
          },
        });
        poll = window.setInterval(() => {
          if (!player) return;
          try {
            const d = player.getDuration();
            const t = player.getCurrentTime();
            if (d > 0 && t / d >= WATCHED_RATIO) markWatchedRef.current();
          } catch {
            /* player jeszcze niegotowy */
          }
        }, 5000);
      })
      .catch(() => {
        if (!cancelled) setApiFailed(true);
      });

    return () => {
      cancelled = true;
      if (poll) window.clearInterval(poll);
      try {
        player?.destroy();
      } catch {
        /* ignoruj */
      }
      host.innerHTML = '';
    };
  }, [showPlayer, ytId, autoplay, apiFailed]);

  const toggle = useCallback(async () => {
    if (!onToggleWatched || !ytId) return;
    setBusy(true);
    try {
      await onToggleWatched(ytId, !isWatched);
    } finally {
      setBusy(false);
    }
  }, [onToggleWatched, ytId, isWatched]);

  if (!active) return null;

  const hasNotes = !!active.content && active.content.trim().length > 0;
  const posterUrl =
    poster === 'max'
      ? `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`
      : `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;

  return (
    <div
      className={cn(
        'rounded-3xl border bg-white shadow-soft transition-colors duration-500',
        isWatched ? 'border-brand-200' : 'border-line'
      )}
    >
      {/* Player / okładka. Bez overflow-hidden na przodkach iframe (Chrome
          Android potrafi nie renderować wideo pod clipem z border-radius). */}
      <div className="relative aspect-video rounded-t-3xl bg-navy-950">
        {showPlayer ? (
          apiFailed ? (
            <iframe
              key={ytId}
              className="yt-frame absolute inset-0 h-full w-full rounded-t-3xl"
              src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1${autoplay ? '&autoplay=1' : ''}`}
              title={active.tytul_lekcji}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <div
              ref={hostRef}
              key={ytId}
              className="yt-host absolute inset-0 rounded-t-3xl"
              aria-label={active.tytul_lekcji}
            />
          )
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex items-center justify-center overflow-hidden rounded-t-3xl"
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
              <span className="mt-0.5 line-clamp-2 font-display text-lg font-extrabold leading-tight text-white sm:text-xl">
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
                : 'Zalicza się automatycznie po obejrzeniu, albo odhacz ręcznie.'}
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
