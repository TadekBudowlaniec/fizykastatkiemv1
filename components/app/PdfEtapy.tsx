'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  listMaterialy,
  getMaterialyUrl,
  getSecurePdfUrl,
} from '@/lib/db';
import type { MaterialFile } from '@/lib/types';
import { cn } from '@/lib/cn';

// Kolory marki (wg wytycznych): witekpurple + zadaniebg.
const WITEK = '#5a2896';
const ZADANIEBG = '#d1c4e9';

// 4 poziomy. P1–P3 = nowy bucket „materialy-pdf" (Netlify get-materialy-url),
// P4 = dawny Etap 3 (stary mechanizm get-pdf-url), tylko przemianowany.
const LEVELS = [
  {
    poziom: 1,
    title: 'Teoria i Rozgrzewka',
    desc: 'Zaczynamy na spokojnie — teoria, wzory i pierwsze proste zadania, żeby wskoczyć w temat bez stresu. Podrozdziałów jest tyle, ile trzeba dla tego działu.',
    source: 'materialy' as const,
  },
  {
    poziom: 2,
    title: 'Zadania Dogrzewające',
    desc: 'Utrwalamy podstawy. Rozwiąż zadania, a potem sprawdź się uczciwie w osobnym pliku z odpowiedziami.',
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

function prettyName(name: string): string {
  const base = name.replace(/\.pdf$/i, '');
  if (/^zadania$/i.test(base)) return 'Zadania';
  if (/^odpowiedzi$/i.test(base)) return 'Odpowiedzi';
  return base.replace(/_/g, ' '); // podkreślenia → spacje (ładniejsze etykiety)
}

export function PdfEtapy({
  courseId,
  hasAccess,
  completed,
  onToggleLevel,
}: {
  courseId: number;
  hasAccess: boolean;
  /** Zbiór ukończonych poziomów (1..4) tego działu. */
  completed: Set<number>;
  /** Przełącza ukończenie poziomu (zapis do user_levels po stronie CourseView). */
  onToggleLevel: (poziom: number, done: boolean) => Promise<void>;
}) {
  // Pliki dla poziomów z nowego bucketu (P1 zmienna liczba, P2/P3 stałe).
  const [files, setFiles] = useState<Record<number, MaterialFile[]>>({});
  const [filesLoading, setFilesLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null); // klucz „poziom:plik"
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const loadFiles = useCallback(async () => {
    if (!hasAccess) return;
    setFilesLoading(true);
    try {
      const [p1, p2, p3] = await Promise.all([
        listMaterialy(courseId, 1).catch(() => []),
        listMaterialy(courseId, 2).catch(() => []),
        listMaterialy(courseId, 3).catch(() => []),
      ]);
      setFiles({ 1: p1, 2: p2, 3: p3 });
    } finally {
      setFilesLoading(false);
    }
  }, [courseId, hasAccess]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const openMaterial = async (poziom: number, file: string) => {
    const key = `${poziom}:${file}`;
    setOpening(key);
    setError(null);
    try {
      const url = await getMaterialyUrl(courseId, poziom, file);
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd pobierania PDF.');
    } finally {
      setOpening(null);
    }
  };

  const openEtap3 = async () => {
    const key = '4:etap3';
    setOpening(key);
    setError(null);
    try {
      const url = await getSecurePdfUrl(courseId, 3);
      window.open(url, '_blank', 'noopener');
    } catch {
      setError('Poziom 4 dla tego działu będzie wkrótce dostępny.');
    } finally {
      setOpening(null);
    }
  };

  const toggle = async (poziom: number) => {
    setToggling(poziom);
    try {
      await onToggleLevel(poziom, !completed.has(poziom));
    } finally {
      setToggling(null);
    }
  };

  const doneCount = [1, 2, 3, 4].filter((p) => completed.has(p)).length;

  return (
    <div>
      {/* Wskaźnik postępu */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide" style={{ color: WITEK }}>
            Postęp działu
          </p>
          <p className="text-lg font-extrabold text-ink">
            {doneCount}/4 poziomy ukończone
          </p>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((p) => (
            <span
              key={p}
              className="h-2.5 w-12 rounded-full"
              style={{ background: completed.has(p) ? WITEK : ZADANIEBG }}
              aria-hidden
            />
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {LEVELS.map((lvl) => {
          const isDone = completed.has(lvl.poziom);
          const lvlFiles = lvl.source === 'etap3' ? null : files[lvl.poziom] ?? [];
          return (
            <section
              key={lvl.poziom}
              className={cn(
                'overflow-hidden rounded-3xl border bg-white shadow-soft transition-shadow',
                isDone ? 'border-transparent shadow-card' : 'border-line'
              )}
              style={isDone ? { boxShadow: `0 0 0 2px ${WITEK}` } : undefined}
            >
              {/* Nagłówek poziomu */}
              <div
                className="flex items-center gap-4 p-5"
                style={{ background: `linear-gradient(120deg, ${ZADANIEBG}55, transparent)` }}
              >
                <span
                  className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl text-lg font-extrabold text-white"
                  style={{ background: WITEK }}
                >
                  {lvl.poziom}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: WITEK }}>
                    Poziom {lvl.poziom}
                  </p>
                  <h3 className="text-lg font-extrabold text-ink">{lvl.title}</h3>
                </div>
                {isDone && (
                  <span className="ml-auto flex-none rounded-full bg-white px-3 py-1 text-xs font-bold" style={{ color: WITEK }}>
                    ✓ ukończone
                  </span>
                )}
              </div>

              <div className="p-5 pt-3">
                <p className="text-sm text-muted">{lvl.desc}</p>

                {/* Pliki */}
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {lvl.source === 'etap3' ? (
                    <button
                      onClick={openEtap3}
                      disabled={!hasAccess || opening === '4:etap3'}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ background: `linear-gradient(120deg, ${WITEK}, #f43f8f)` }}
                    >
                      📄 {opening === '4:etap3' ? 'Otwieram…' : 'Pobierz arkusz CKE'}
                    </button>
                  ) : filesLoading ? (
                    <p className="text-sm text-muted">Wczytuję pliki…</p>
                  ) : lvlFiles && lvlFiles.length > 0 ? (
                    lvlFiles.map((f) => {
                      const key = `${lvl.poziom}:${f.name}`;
                      return (
                        <button
                          key={f.name}
                          onClick={() => openMaterial(lvl.poziom, f.name)}
                          disabled={!hasAccess || opening === key}
                          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ background: `linear-gradient(120deg, ${WITEK}, #f43f8f)` }}
                        >
                          📄 {opening === key ? 'Otwieram…' : prettyName(f.name)}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted">
                      Materiały tego poziomu pojawią się wkrótce.
                    </p>
                  )}
                </div>

                {/* Oznacz jako ukończone */}
                <label className="mt-5 inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={isDone}
                    disabled={toggling === lvl.poziom}
                    onChange={() => toggle(lvl.poziom)}
                    className="h-5 w-5 rounded border-line accent-[#5a2896]"
                  />
                  {isDone ? 'Poziom ukończony' : 'Oznacz jako ukończone'}
                </label>
              </div>
            </section>
          );
        })}
      </div>

      {error && <p className="mt-4 text-sm text-magenta-600">{error}</p>}
    </div>
  );
}
