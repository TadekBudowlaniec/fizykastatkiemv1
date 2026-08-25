'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  getTasks,
  getTaskImages,
  getUserTasks,
  upsertUserTask,
  resetCourseTasks,
} from '@/lib/db';
import type { Task, UserTask, UserTaskStatus } from '@/lib/types';
import { MarkdownLesson } from '@/components/app/MarkdownLesson';
import { Button } from '@/components/ui/Button';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function parseOptions(options: Task['options']): string[] {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  try {
    const p = JSON.parse(options);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function correctIndex(solution: string | null, len: number): number {
  if (!solution) return -1;
  const s = solution.trim();
  if (/^[a-fA-F]$/.test(s)) return s.toUpperCase().charCodeAt(0) - 65;
  const n = Number(s);
  if (Number.isNaN(n)) return -1;
  if (n >= 0 && n < len) return n; // 0-based
  if (n >= 1 && n <= len) return n - 1; // 1-based
  return -1;
}

function isImageUrl(s: string): boolean {
  return /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(s.trim());
}

export function TaskRunner({ courseId }: { courseId: number }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState<Map<number, UserTaskStatus>>(new Map());
  const [current, setCurrent] = useState<Task | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [phase, setPhase] = useState<'loading' | 'running' | 'summary' | 'empty'>('loading');

  // stan bieżącego zadania
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const pickNext = useCallback(
    (all: Task[], prog: Map<number, UserTaskStatus>) => {
      const unsolved = all.filter((t) => !prog.has(t.id));
      if (unsolved.length === 0) {
        setPhase('summary');
        setCurrent(null);
        return;
      }
      const next = unsolved[Math.floor(Math.random() * unsolved.length)];
      setCurrent(next);
      setPicked(null);
      setRevealed(false);
    },
    []
  );

  const load = useCallback(async () => {
    if (!user) return;
    setPhase('loading');
    const all = await getTasks(courseId);
    if (all.length === 0) {
      setPhase('empty');
      return;
    }
    const ut = await getUserTasks(user.id, all.map((t) => t.id));
    const prog = new Map<number, UserTaskStatus>();
    ut.forEach((u: UserTask) => prog.set(u.task_id, u.status));
    setTasks(all);
    setProgress(prog);
    if (prog.size >= all.length) {
      setPhase('summary');
    } else {
      setPhase('running');
      pickNext(all, prog);
    }
  }, [user, courseId, pickNext]);

  useEffect(() => {
    load();
  }, [load]);

  // wczytaj obrazki bieżącego zadania
  useEffect(() => {
    if (!current) {
      setImages([]);
      return;
    }
    getTaskImages(current.id)
      .then((imgs) => setImages(imgs.map((i) => i.image_url)))
      .catch(() => setImages([]));
  }, [current]);

  const record = async (status: UserTaskStatus) => {
    if (!current || !user) return;
    const nextProg = new Map(progress);
    nextProg.set(current.id, status);
    setProgress(nextProg);
    try {
      await upsertUserTask(user.id, current.id, status);
    } catch {
      /* zapis nieudany — kontynuuj lokalnie */
    }
    pickNext(tasks, nextProg);
  };

  const restart = async () => {
    if (!user) return;
    setPhase('loading');
    try {
      await resetCourseTasks(user.id, tasks.map((t) => t.id));
    } catch {
      /* ignoruj */
    }
    const prog = new Map<number, UserTaskStatus>();
    setProgress(prog);
    setPhase('running');
    pickNext(tasks, prog);
  };

  if (phase === 'loading') {
    return <p className="text-muted">Ładowanie zadań…</p>;
  }
  if (phase === 'empty') {
    return (
      <p className="rounded-2xl border border-line bg-white p-5 text-muted">
        Zadania do tego działu pojawią się wkrótce.
      </p>
    );
  }

  const total = tasks.length;
  const done = progress.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const counts = { good: 0, bad: 0, skip: 0 };
  progress.forEach((s) => {
    counts[s]++;
  });

  if (phase === 'summary') {
    const scored = counts.good + counts.bad;
    const score = scored ? Math.round((counts.good / scored) * 100) : 0;
    return (
      <div className="rounded-3xl border border-line bg-white p-7 text-center shadow-soft">
        <p className="text-5xl">{score >= 60 ? '🎉' : '💪'}</p>
        <h3 className="mt-3 text-2xl font-extrabold text-ink">
          Wynik: {score}%
        </h3>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
          <span className="rounded-full bg-brand-50 px-4 py-2 font-semibold text-brand-700">
            ✅ Dobrze: {counts.good}
          </span>
          <span className="rounded-full bg-magenta-500/10 px-4 py-2 font-semibold text-magenta-600">
            ❌ Źle: {counts.bad}
          </span>
          <span className="rounded-full bg-cloud px-4 py-2 font-semibold text-muted">
            ⏭️ Pominięte: {counts.skip}
          </span>
        </div>
        <div className="mt-6">
          <Button variant="gradient" onClick={restart}>
            Rozpocznij ponownie
          </Button>
        </div>
      </div>
    );
  }

  // phase === 'running'
  if (!current) return null;
  const isClosed = current.type === 'closed';
  const options = isClosed ? parseOptions(current.options) : [];
  const correct = isClosed ? correctIndex(current.solution, options.length) : -1;

  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-7">
      {/* Pasek postępu */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>Postęp</span>
          <span className="font-semibold text-ink">
            {done} / {total}
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cloud">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#6b4df6,#f43f8f)] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Treść zadania */}
      <div className="text-ink">
        <MarkdownLesson content={current.content} />
      </div>
      {images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt="Ilustracja zadania"
              className="max-h-64 rounded-xl border border-line"
            />
          ))}
        </div>
      )}

      {/* Zamknięte */}
      {isClosed ? (
        <div className="mt-5 space-y-2.5">
          {options.map((opt, i) => {
            const chosen = picked === i;
            const showState = picked !== null;
            const isRight = i === correct;
            return (
              <button
                key={i}
                disabled={picked !== null}
                onClick={() => setPicked(i)}
                className={[
                  'flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all',
                  !showState && 'border-line hover:border-brand-300 hover:bg-brand-50/50',
                  showState && isRight && 'border-brand-500 bg-brand-50',
                  showState && chosen && !isRight && 'border-magenta-500 bg-magenta-500/10',
                  showState && !chosen && !isRight && 'border-line opacity-60',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-cloud text-sm font-bold text-slate">
                  {LETTERS[i]}
                </span>
                <span className="flex-1">{opt}</span>
                {showState && isRight && <span>✅</span>}
                {showState && chosen && !isRight && <span>❌</span>}
              </button>
            );
          })}

          {picked !== null && (
            <div className="pt-3">
              <Button
                variant="gradient"
                onClick={() => record(picked === correct ? 'good' : 'bad')}
              >
                Następne zadanie →
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Otwarte */
        <div className="mt-5">
          {!revealed ? (
            <Button variant="outline" onClick={() => setRevealed(true)}>
              Pokaż odpowiedź
            </Button>
          ) : (
            <div className="rounded-2xl bg-cloud p-5">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-600">
                Rozwiązanie
              </p>
              {current.solution && isImageUrl(current.solution) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.solution}
                  alt="Rozwiązanie"
                  className="max-h-96 rounded-xl border border-line"
                />
              ) : (
                <MarkdownLesson content={current.solution ?? 'Brak rozwiązania.'} />
              )}
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-slate">
                  Jak Ci poszło?
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => record('good')}
                    className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
                  >
                    ✅ Dobrze
                  </button>
                  <button
                    onClick={() => record('bad')}
                    className="rounded-full bg-magenta-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-magenta-600"
                  >
                    ❌ Źle
                  </button>
                  <button
                    onClick={() => record('skip')}
                    className="rounded-full bg-cloud px-5 py-2.5 text-sm font-semibold text-slate hover:bg-line"
                  >
                    ⏭️ Pomiń
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
