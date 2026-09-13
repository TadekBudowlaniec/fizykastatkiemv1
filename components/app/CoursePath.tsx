'use client';

import { useState } from 'react';
import { getMaterialyUrl, getSecurePdfUrl } from '@/lib/db';
import type { MaterialFile } from '@/lib/types';
import { cn } from '@/lib/cn';
import {
  IconCheck,
  IconDoc,
  IconExternal,
  IconSpinner,
} from '@/components/app/CourseIcons';

// 4 poziomy ścieżki. P1–P3 = bucket „materialy-pdf" (get-materialy-url),
// P4 = dawny Etap 3 (get-pdf-url). Poziom 1 liczy się PER PLIK (każda teoria
// osobno), poziomy 2–4 jako całość.
export const LEVELS = [
  {
    poziom: 1,
    title: 'Teoria i Rozgrzewka',
    desc: 'Zaczynamy spokojnie — teoria, wzory i pierwsze proste zadania, żeby wskoczyć w temat bez stresu. Każdy plik to jeden podrozdział; odhaczaj po kolei.',
    source: 'materialy' as const,
  },
  {
    poziom: 2,
    title: 'Zadania Dogrzewające',
    desc: 'Utrwalamy podstawy. Rozwiąż zadania, a dopiero potem sprawdź się uczciwie w pliku z odpowiedziami.',
    source: 'materialy' as const,
  },
  {
    poziom: 3,
    title: 'Autorskie Zadania Maturalne',
    desc: 'Mój własny zestaw w klimacie matury — trudniej niż w rozgrzewce. Zadania i odpowiedzi osobno.',
    source: 'materialy' as const,
  },
  {
    poziom: 4,
    title: 'Prawdziwe zadania maturalne CKE',
    desc: 'Realne arkusze CKE wybrane pod ten dział. To, co faktycznie potrafi wpaść na maturze.',
    source: 'etap3' as const,
  },
];

export function prettyName(name: string): string {
  const base = name.replace(/\.pdf$/i, '');
  if (/^zadania$/i.test(base)) return 'Zadania';
  if (/^odpowiedzi$/i.test(base)) return 'Odpowiedzi';
  return base.replace(/_/g, ' ');
}

// Krótki opis pod nazwą pliku — „landing" opisujący każdy plik.
function fileSubtitle(poziom: number, name: string): string {
  const base = name.replace(/\.pdf$/i, '');
  if (/^zadania$/i.test(base))
    return poziom === 2
      ? 'Zestaw zadań utrwalających — rozwiąż samodzielnie'
      : 'Zadania w formule maturalnej — z pełnym rozumowaniem';
  if (/^odpowiedzi$/i.test(base))
    return 'Otwórz dopiero po rozwiązaniu — sprawdź i popraw błędy';
  return 'Teoria, wzory i zadania rozgrzewkowe';
}

type Props = {
  courseId: number;
  hasAccess: boolean;
  files: Record<number, MaterialFile[]>;
  filesLoading: boolean;
  /** Ukończone pliki Poziomu 1 (nazwy). */
  doneFiles: Set<string>;
  /** Ukończone poziomy 2..4. */
  doneLevels: Set<number>;
  onToggleFile: (file: string, done: boolean) => Promise<void>;
  onToggleLevel: (poziom: number, done: boolean) => Promise<void>;
};

export function CoursePath({
  courseId,
  hasAccess,
  files,
  filesLoading,
  doneFiles,
  doneLevels,
  onToggleFile,
  onToggleLevel,
}: Props) {
  const [opening, setOpening] = useState<string | null>(null); // „poziom:plik"
  const [busy, setBusy] = useState<string | null>(null); // „poziom" lub „1:plik"
  const [error, setError] = useState<string | null>(null);

  const open = async (poziom: number, file: string) => {
    const key = `${poziom}:${file}`;
    setOpening(key);
    setError(null);
    try {
      const url =
        poziom === 4
          ? await getSecurePdfUrl(courseId, 3)
          : await getMaterialyUrl(courseId, poziom, file);
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      setError(
        poziom === 4
          ? 'Arkusz CKE dla tego działu będzie wkrótce dostępny.'
          : e instanceof Error
            ? e.message
            : 'Błąd pobierania PDF.'
      );
    } finally {
      setOpening(null);
    }
  };

  const toggleFile = async (file: string) => {
    const key = `1:${file}`;
    setBusy(key);
    try {
      await onToggleFile(file, !doneFiles.has(file));
    } finally {
      setBusy(null);
    }
  };

  const toggleLevel = async (poziom: number) => {
    setBusy(String(poziom));
    try {
      await onToggleLevel(poziom, !doneLevels.has(poziom));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <ol className="space-y-6">
        {LEVELS.map((lvl, idx) => {
          const isP1 = lvl.poziom === 1;
          const lvlFiles: MaterialFile[] =
            lvl.source === 'etap3'
              ? [{ name: 'Arkusz CKE.pdf' }]
              : files[lvl.poziom] ?? [];
          const p1Done = isP1
            ? lvlFiles.filter((f) => doneFiles.has(f.name)).length
            : 0;
          const isDone = isP1
            ? lvlFiles.length > 0 && p1Done === lvlFiles.length
            : doneLevels.has(lvl.poziom);
          const isLast = idx === LEVELS.length - 1;
          const loading = filesLoading && lvl.source !== 'etap3';

          return (
            <li
              key={lvl.poziom}
              id={`poziom-${lvl.poziom}`}
              className="relative flex gap-5 scroll-mt-28"
            >
              {/* Oś ścieżki (desktop) */}
              <div className="hidden w-11 flex-none flex-col items-center sm:flex">
                <LevelBadge n={lvl.poziom} done={isDone} />
                {!isLast && (
                  <span
                    aria-hidden
                    className={cn(
                      'mt-3 w-px flex-1 rounded-full transition-colors duration-500',
                      isDone ? 'bg-brand-300' : 'bg-line'
                    )}
                  />
                )}
              </div>

              {/* Karta poziomu */}
              <section
                className={cn(
                  'min-w-0 flex-1 overflow-hidden rounded-3xl border bg-white shadow-soft transition-all duration-500',
                  isDone ? 'border-brand-200' : 'border-line'
                )}
              >
                <header className="flex items-start gap-4 px-5 pt-5 sm:px-7 sm:pt-6">
                  <span className="sm:hidden">
                    <LevelBadge n={lvl.poziom} done={isDone} small />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-500">
                      Poziom {lvl.poziom}
                    </p>
                    <h3 className="mt-0.5 font-display text-xl font-extrabold text-ink sm:text-[1.35rem]">
                      {lvl.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-[0.93rem] leading-relaxed text-muted">
                      {lvl.desc}
                    </p>
                  </div>
                  <StatusChip
                    done={isDone}
                    label={
                      isP1 && lvlFiles.length > 0
                        ? `${p1Done}/${lvlFiles.length}`
                        : undefined
                    }
                  />
                </header>

                {/* Pliki */}
                <ul className="mt-5 divide-y divide-line border-t border-line px-5 sm:px-7">
                  {loading ? (
                    <li className="flex items-center gap-3 py-4 text-sm text-muted">
                      <IconSpinner className="h-4 w-4" /> Wczytuję pliki…
                    </li>
                  ) : lvlFiles.length === 0 ? (
                    <li className="py-4 text-sm text-muted">
                      Materiały tego poziomu pojawią się wkrótce.
                    </li>
                  ) : (
                    lvlFiles.map((f) => {
                      const key = `${lvl.poziom}:${f.name}`;
                      const fileDone = isP1 ? doneFiles.has(f.name) : isDone;
                      return (
                        <li
                          key={f.name}
                          className="group flex items-center gap-3.5 py-3.5 sm:gap-4"
                        >
                          <span
                            className={cn(
                              'flex h-10 w-10 flex-none items-center justify-center rounded-xl transition-colors duration-300',
                              fileDone
                                ? 'bg-brand-50 text-brand-600'
                                : 'bg-cloud text-slate group-hover:bg-foam group-hover:text-brand-600'
                            )}
                          >
                            <IconDoc className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                'truncate font-semibold transition-colors',
                                fileDone ? 'text-muted' : 'text-ink'
                              )}
                            >
                              {lvl.source === 'etap3'
                                ? 'Arkusz CKE'
                                : prettyName(f.name)}
                            </p>
                            <p className="truncate text-xs text-muted">
                              {lvl.source === 'etap3'
                                ? 'Zadania z prawdziwych arkuszy, dobrane pod ten dział'
                                : fileSubtitle(lvl.poziom, f.name)}
                            </p>
                          </div>
                          <button
                            onClick={() => open(lvl.poziom, f.name)}
                            disabled={!hasAccess || opening === key}
                            className="inline-flex flex-none items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-700 transition-all duration-300 hover:bg-brand-100 disabled:cursor-wait disabled:opacity-60"
                          >
                            {opening === key ? (
                              <IconSpinner className="h-3.5 w-3.5" />
                            ) : (
                              <IconExternal className="h-3.5 w-3.5" />
                            )}
                            <span className="hidden sm:inline">Otwórz</span>
                          </button>
                          {isP1 && (
                            <CheckToggle
                              done={fileDone}
                              busy={busy === `1:${f.name}`}
                              onClick={() => toggleFile(f.name)}
                              title={
                                fileDone
                                  ? 'Cofnij ukończenie'
                                  : 'Oznacz jako przerobione'
                              }
                            />
                          )}
                        </li>
                      );
                    })
                  )}
                </ul>

                {/* Stopka: ukończenie całego poziomu (P2–P4) */}
                {!isP1 && (
                  <footer className="flex flex-col gap-3 border-t border-line bg-cloud/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <p className="text-sm text-muted">
                      {isDone
                        ? 'Poziom zaliczony. Możesz cofnąć, jeśli chcesz wrócić.'
                        : 'Przerobiłeś wszystkie pliki? Odhacz cały poziom.'}
                    </p>
                    <button
                      onClick={() => toggleLevel(lvl.poziom)}
                      disabled={busy === String(lvl.poziom)}
                      aria-pressed={isDone}
                      className={cn(
                        'inline-flex items-center gap-2.5 self-start rounded-full py-1.5 pl-1.5 pr-4 text-sm font-semibold ring-1 transition-all duration-300 disabled:opacity-60 sm:self-auto',
                        isDone
                          ? 'bg-white text-brand-700 ring-brand-200'
                          : 'bg-white text-slate ring-line hover:text-brand-700 hover:ring-brand-300'
                      )}
                    >
                      <CheckDot done={isDone} />
                      {isDone ? 'Poziom ukończony' : 'Oznacz poziom jako ukończony'}
                    </button>
                  </footer>
                )}
              </section>
            </li>
          );
        })}
      </ol>

      {error && (
        <p className="mt-4 rounded-xl bg-magenta-500/5 px-4 py-3 text-sm text-magenta-600 ring-1 ring-magenta-500/15">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------- drobne elementy ----------

function LevelBadge({
  n,
  done,
  small,
}: {
  n: number;
  done: boolean;
  small?: boolean;
}) {
  return (
    <span
      className={cn(
        'flex flex-none items-center justify-center rounded-2xl font-display font-extrabold transition-all duration-500',
        small ? 'h-10 w-10 text-base' : 'h-11 w-11 text-lg',
        done
          ? 'bg-[linear-gradient(135deg,#6b4df6,#f43f8f)] text-white shadow-[0_10px_24px_-10px_rgba(107,77,246,0.7)]'
          : 'bg-white text-brand-700 ring-1 ring-line'
      )}
    >
      {done ? <IconCheck className="h-5 w-5" strokeWidth={2.5} /> : n}
    </span>
  );
}

function StatusChip({ done, label }: { done: boolean; label?: string }) {
  if (done)
    return (
      <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
        <IconCheck className="h-3.5 w-3.5" strokeWidth={2.5} /> Ukończone
      </span>
    );
  if (label)
    return (
      <span className="inline-flex flex-none items-center rounded-full bg-cloud px-3 py-1 text-xs font-bold text-muted ring-1 ring-line">
        {label}
      </span>
    );
  return null;
}

function CheckDot({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300',
        done
          ? 'bg-[linear-gradient(135deg,#6b4df6,#f43f8f)] text-white'
          : 'bg-cloud text-transparent ring-1 ring-line'
      )}
    >
      <IconCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
    </span>
  );
}

function CheckToggle({
  done,
  busy,
  onClick,
  title,
}: {
  done: boolean;
  busy: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      aria-pressed={done}
      title={title}
      className={cn(
        'flex h-8 w-8 flex-none items-center justify-center rounded-full ring-2 transition-all duration-300 disabled:opacity-60',
        done
          ? 'bg-[linear-gradient(135deg,#6b4df6,#f43f8f)] text-white ring-transparent shadow-[0_8px_18px_-8px_rgba(107,77,246,0.7)]'
          : 'bg-white text-transparent ring-line hover:text-brand-300 hover:ring-brand-300'
      )}
    >
      {busy ? (
        <IconSpinner className="h-4 w-4 text-brand-400" />
      ) : (
        <IconCheck className="h-4 w-4" strokeWidth={2.5} />
      )}
    </button>
  );
}
