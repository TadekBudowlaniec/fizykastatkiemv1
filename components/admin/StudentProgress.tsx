'use client';

import { useEffect, useState } from 'react';
import { postAdmin } from '@/components/admin/adminApi';
import { COURSES } from '@/lib/courses';
import { cn } from '@/lib/cn';

type FileRow = { name: string; done: boolean; completed_at: string | null; missing: boolean };
type CourseProgress = {
  course_id: number;
  hasAccess: boolean;
  enrolled_at: string | null;
  videos: { total: number; done: number };
  p1: { total: number; done: number; files: FileRow[] };
  levels: Record<string, string | null>;
  steps: { done: number; total: number; pct: number };
  quiz: {
    total: number;
    answered: number;
    good: number;
    bad: number;
    skip: number;
    score: number | null;
    lastAt: string | null;
  };
  lastActivity: string | null;
};
type Progress = {
  user: {
    id: string;
    email: string;
    full_name: string | null;
    is_admin: boolean;
    created_at: string | null;
    last_sign_in_at: string | null;
  };
  enrollments: { course_id: number; enrolled_at: string | null }[];
  courses: CourseProgress[];
  summary: {
    steps: { done: number; total: number; pct: number };
    videos: { done: number; total: number };
    files: { done: number; total: number };
    levels: { done: number; total: number };
    quiz: {
      answered: number;
      total: number;
      good: number;
      bad: number;
      skip: number;
      score: number | null;
    };
    coursesWithAccess: number;
    coursesStarted: number;
    coursesDone: number;
    lastActivity: string | null;
  };
};

const COURSE_NAME = new Map<number, string>(COURSES.map((c) => [c.id, c.title]));
const LEVEL_NAME: Record<string, string> = {
  '2': 'P2 Zadania dogrzewające',
  '3': 'P3 Zadania maturalne',
  '4': 'P4 Arkusze CKE',
};

function fmt(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function Bar({ pct, className }: { pct: number; className?: string }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-line', className)}>
      <div
        className="h-full rounded-full bg-brand-500 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-cloud/40 p-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-ink">{value}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

function ScoreChip({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-muted">brak wyniku</span>;
  const tone =
    score >= 80
      ? 'bg-emerald-50 text-emerald-700'
      : score >= 60
        ? 'bg-brand-50 text-brand-700'
        : 'bg-red-50 text-red-600';
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', tone)}>{score}%</span>
  );
}

function CourseRow({ c }: { c: CourseProgress }) {
  const [open, setOpen] = useState(false);
  const name = COURSE_NAME.get(c.course_id) ?? `Dział #${c.course_id}`;
  return (
    <li className="px-4 py-3.5 sm:px-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 text-left"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
          {c.course_id}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-ink">{name}</span>
            {!c.hasAccess && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-bold text-slate-500">
                bez dostępu
              </span>
            )}
            <span className="ml-auto text-xs font-bold text-ink">
              {c.steps.done}/{c.steps.total} kroków · {c.steps.pct}%
            </span>
          </span>
          <Bar pct={c.steps.pct} className="mt-2" />
          <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            <span>
              Wideo {c.videos.done}/{c.videos.total}
            </span>
            <span>
              Pliki P1 {c.p1.done}/{c.p1.total}
            </span>
            <span>
              Poziomy 2–4 {Object.values(c.levels).filter((v) => v !== null).length}/3
            </span>
            <span className="inline-flex items-center gap-1">
              Quiz <ScoreChip score={c.quiz.score} />
              <span>
                ({c.quiz.good}✓ {c.quiz.bad}✗ {c.quiz.skip}⏭ z {c.quiz.total})
              </span>
            </span>
          </span>
        </span>
        <span className="mt-1 text-muted" aria-hidden>
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open && (
        <div className="mt-3 grid gap-3 pl-11 text-sm sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">
              Pliki Poziomu 1
            </p>
            {c.p1.files.length === 0 ? (
              <p className="text-xs text-muted">Brak plików w buckecie.</p>
            ) : (
              <ul className="space-y-1">
                {c.p1.files.map((f) => (
                  <li key={f.name} className="flex items-start gap-2 text-xs">
                    <span className={f.done ? 'text-emerald-600' : 'text-line'}>
                      {f.done ? '✓' : '○'}
                    </span>
                    <span className={cn('min-w-0 break-all', f.done ? 'text-ink' : 'text-muted')}>
                      {f.name.replace(/\.pdf$/i, '')}
                      {f.missing && ' (plik już nie istnieje)'}
                    </span>
                    {f.completed_at && (
                      <span className="ml-auto shrink-0 text-muted">{fmt(f.completed_at)}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                Poziomy 2–4
              </p>
              <ul className="space-y-1 text-xs">
                {(['2', '3', '4'] as const).map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span className={c.levels[p] !== null ? 'text-emerald-600' : 'text-line'}>
                      {c.levels[p] !== null ? '✓' : '○'}
                    </span>
                    <span className={c.levels[p] !== null ? 'text-ink' : 'text-muted'}>
                      {LEVEL_NAME[p]}
                    </span>
                    {c.levels[p] && <span className="ml-auto text-muted">{fmt(c.levels[p])}</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-xs text-muted">
              <p>Dostęp od: {fmt(c.enrolled_at)}</p>
              <p>Ostatni quiz: {fmt(c.quiz.lastAt)}</p>
              <p>Ostatnia aktywność: {fmt(c.lastActivity)}</p>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

export function StudentProgress({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [data, setData] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    postAdmin<Progress>('/.netlify/functions/admin-user-progress', { userId })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Błąd.'));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const s = data?.summary;
  const u = data?.user;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-navy-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Postęp kursanta"
    >
      {/* max-h: 92vh jako fallback w klasie, 92dvh inline (telefon: vh liczy pasek
          przeglądarki, dvh nie). Treść: min-h-0 + flex-1, inaczej w kolumnie flex
          nie skurczy się poniżej własnej wysokości i overflow-hidden obcina dół. */}
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-card sm:rounded-3xl"
        style={{ maxHeight: '92dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="break-all text-base font-extrabold text-ink">{u?.email ?? 'Ładowanie…'}</p>
            {u && (
              <p className="mt-0.5 text-xs text-muted">
                {u.full_name || 'bez imienia'} · rejestracja {fmt(u.created_at)} · ostatnie logowanie{' '}
                {fmt(u.last_sign_in_at)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full bg-cloud px-3 py-1.5 text-xs font-semibold text-slate hover:bg-brand-50 hover:text-brand-700"
          >
            Zamknij
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>
          )}
          {!data && !error && <p className="text-sm text-muted">Wczytuję postęp…</p>}
          {data && s && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Tile
                  label="Postęp ogółem"
                  value={`${s.steps.pct}%`}
                  hint={`${s.steps.done} z ${s.steps.total} kroków`}
                />
                <Tile
                  label="Odhaczone pliki"
                  value={`${s.files.done}/${s.files.total}`}
                  hint={`wideo ${s.videos.done}/${s.videos.total} · poziomy ${s.levels.done}/${s.levels.total}`}
                />
                <Tile
                  label="Wynik quizów"
                  value={s.quiz.score === null ? '—' : `${s.quiz.score}%`}
                  hint={`${s.quiz.good} dobrze · ${s.quiz.bad} źle · ${s.quiz.skip} pominięte`}
                />
                <Tile
                  label="Działy"
                  value={`${s.coursesDone}/${s.coursesWithAccess}`}
                  hint={`ukończone / z dostępem · ${s.coursesStarted} zaczętych`}
                />
              </div>
              <p className="mt-3 text-xs text-muted">
                Ostatnia aktywność w kursie: {fmt(s.lastActivity)}
              </p>

              <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
                {data.courses.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-muted">
                    Brak dostępów i brak zapisanego postępu.
                  </li>
                ) : (
                  data.courses.map((c) => <CourseRow key={c.course_id} c={c} />)
                )}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
