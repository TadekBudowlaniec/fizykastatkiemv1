'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  getStudyPlan,
  deleteStudyPlan,
  insertStudyPlan,
  setPlanItemCompleted,
  listMaterialy,
  getAllUserLevels,
  getAllUserMaterialy,
} from '@/lib/db';
import {
  STUDY_TOPICS,
  generatePlanRows,
  activityMeta,
  activityKind,
  courseIdForTopic,
  isDoneInCourse,
  nextExamDate,
  type CourseProgress,
} from '@/lib/planner';
import type { StudyPlan } from '@/lib/types';
import { AppHero } from '@/components/app/AppHero';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { SqueezeForm } from '@/components/landing/SqueezeForm';
import { IconArrow, IconCheck } from '@/components/app/CourseIcons';
import { cn } from '@/lib/cn';

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function todayYmd(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Struktura każdego działu w planie (spójna z panelem kursu).
const PATH_STEPS = [
  { icon: '🎬', label: 'Lekcja wideo' },
  { icon: '📘', label: 'Poziom 1 · teoria (plik po pliku)' },
  { icon: '📗', label: 'Poziom 2 · zadania dogrzewające' },
  { icon: '📙', label: 'Poziom 3 · autorskie zadania maturalne' },
  { icon: '📕', label: 'Poziom 4 · arkusz CKE' },
  { icon: '🧩', label: 'Quiz sprawdzający' },
];

export default function PlanerPage() {
  const { user, loading, hasAccessToCourse } = useAuth();
  const [plan, setPlan] = useState<StudyPlan[]>([]);
  const [phase, setPhase] = useState<'loading' | 'config' | 'plan'>('loading');
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [synced, setSynced] = useState(0); // ile kroków odhaczył postęp z kursu

  // Synchronizacja kurs -> planer: kroki zaliczone w panelu działu odhaczamy tu.
  const syncWithCourse = useCallback(
    async (rows: StudyPlan[], uid: string): Promise<StudyPlan[]> => {
      let progress: CourseProgress;
      try {
        const [levels, materialy] = await Promise.all([
          getAllUserLevels(uid).catch(() => []),
          getAllUserMaterialy(uid).catch(() => []),
        ]);
        progress = { levels, materialy };
      } catch {
        return rows;
      }
      const toMark = rows.filter(
        (r) => !r.is_completed && isDoneInCourse(r, progress)
      );
      if (!toMark.length) return rows;
      await Promise.all(
        toMark.map((r) => setPlanItemCompleted(r.id, true).catch(() => {}))
      );
      setSynced(toMark.length);
      const ids = new Set(toMark.map((r) => r.id));
      return rows.map((r) => (ids.has(r.id) ? { ...r, is_completed: true } : r));
    },
    []
  );

  const load = useCallback(async () => {
    if (!user) return;
    setPhase('loading');
    const rows = await getStudyPlan(user.id);
    if (rows.length) {
      setPlan(await syncWithCourse(rows, user.id));
      setPhase('plan');
    } else {
      setPhase('config');
    }
  }, [user, syncWithCourse]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const toggleKnown = (id: number) => {
    setKnown((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const generate = async () => {
    if (!user) return;
    setBusy(true);
    try {
      // Pliki Poziomu 1 znamy tylko dla działów z dostępem (get-materialy-url).
      const withAccess = STUDY_TOPICS.filter(
        (t) => !known.has(t.id) && hasAccessToCourse(t.id)
      );
      const p1Files: Record<number, string[]> = {};
      await Promise.all(
        withAccess.map(async (t) => {
          try {
            const files = await listMaterialy(t.id, 1);
            if (files.length) p1Files[t.id] = files.map((f) => f.name);
          } catch {
            /* brak listy - Poziom 1 jako jeden krok */
          }
        })
      );

      const rows = generatePlanRows(user.id, [...known], p1Files);
      await deleteStudyPlan(user.id);
      await insertStudyPlan(rows);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await deleteStudyPlan(user.id);
      setPlan([]);
      setKnown(new Set());
      setSynced(0);
      setPhase('config');
    } finally {
      setBusy(false);
    }
  };

  const toggleDone = async (item: StudyPlan) => {
    const val = !item.is_completed;
    setPlan((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, is_completed: val } : p))
    );
    try {
      await setPlanItemCompleted(item.id, val);
    } catch {
      setPlan((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, is_completed: !val } : p))
      );
    }
  };

  const today = todayYmd();
  const exam = nextExamDate();
  const examStr = exam.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const daysLeft = Math.max(
    0,
    Math.round((exam.getTime() - new Date(today + 'T00:00:00').getTime()) / 86400000)
  );

  // Grupowanie planu po dacie.
  const byDate = useMemo(() => {
    const m = new Map<string, StudyPlan[]>();
    for (const item of plan) {
      const arr = m.get(item.scheduled_date) ?? [];
      arr.push(item);
      m.set(item.scheduled_date, arr);
    }
    return m;
  }, [plan]);

  const steps = plan.filter((p) => p.activity_type !== 'rest');
  const doneCount = steps.filter((p) => p.is_completed).length;
  const pct = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;
  const topicsInPlan = new Set(
    steps.filter((p) => courseIdForTopic(p.topic_name)).map((p) => p.topic_name)
  ).size;

  // Pierwszy dzień z niezrobionym krokiem (dziś lub później) - „skocz do dziś".
  const nextDate =
    [...byDate.keys()].find(
      (d) => d >= today && (byDate.get(d) ?? []).some((i) => !i.is_completed)
    ) ?? null;

  // --- Niezalogowany ---
  if (!loading && !user) {
    return (
      <AppHero
        title="Twój planer nauki do matury 🧭"
        subtitle="Podaj e-mail - wyślemy Ci magiczny link, który otworzy Twój spersonalizowany planer."
        breadcrumb={[
          { label: 'Start', href: '/' },
          { label: 'Planer', href: '/planer' },
        ]}
      >
        <div className="mt-7">
          <SqueezeForm />
        </div>
        <p className="mt-4 text-sm text-slate-400">
          Masz już konto?{' '}
          <a href="/login" className="text-brand-300 underline">
            Zaloguj się
          </a>
          .
        </p>
      </AppHero>
    );
  }

  return (
    <>
      <AppHero
        title="Twój planer nauki 🧭"
        subtitle={`Cel: matura z fizyki - ${examStr}. Krok po kroku, aż do wyniku.`}
        breadcrumb={[
          { label: 'Start', href: '/' },
          { label: 'Planer', href: '/planer' },
        ]}
      >
        {phase === 'plan' && (
          <div className="glass mt-7 max-w-md rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-200">
                Postęp planu
              </span>
              <span className="font-display text-lg font-extrabold text-white">
                {pct}%
              </span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#6b4df6,#a855f7,#f43f8f)] transition-[width] duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2.5 text-sm text-slate-300/85">
              {doneCount} z {steps.length} kroków · {topicsInPlan}{' '}
              {topicsInPlan === 1 ? 'dział' : 'działów'} · {daysLeft} dni do matury
            </p>
          </div>
        )}
      </AppHero>

      <section className="bg-cloud py-10 sm:py-14">
        <Container size="narrow">
          {phase === 'loading' && <p className="text-muted">Ładowanie planera…</p>}

          {/* Konfiguracja */}
          {phase === 'config' && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-500">
                  Krok 1
                </p>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                  Zaznacz, co już umiesz
                </h2>
                <p className="mt-2 text-muted">
                  Opanowane działy pominiemy. Resztę rozpiszemy dzień po dniu
                  według ścieżki z kursu.
                </p>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {STUDY_TOPICS.map((t) => {
                    const on = known.has(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggleKnown(t.id)}
                        aria-pressed={on}
                        className={cn(
                          'flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold ring-1 transition-all duration-300',
                          on
                            ? 'bg-brand-50 text-brand-700 ring-brand-200'
                            : 'bg-white text-slate ring-line hover:text-ink hover:ring-brand-300'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-6 w-6 flex-none items-center justify-center rounded-full transition-all duration-300',
                            on
                              ? 'bg-[linear-gradient(135deg,#6b4df6,#f43f8f)] text-white'
                              : 'bg-cloud text-transparent ring-1 ring-line'
                          )}
                        >
                          <IconCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </span>
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-500">
                  Jak wygląda plan
                </p>
                <h2 className="mt-2 font-display text-xl font-extrabold text-ink">
                  Każdy dział = ta sama ścieżka co w kursie
                </h2>
                <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                  {PATH_STEPS.map((s, i) => (
                    <li
                      key={s.label}
                      className="flex items-center gap-3 rounded-2xl bg-cloud px-4 py-2.5 text-sm text-slate"
                    >
                      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-white text-base ring-1 ring-line">
                        {s.icon}
                      </span>
                      <span>
                        <span className="mr-1.5 font-bold text-brand-600">{i + 1}.</span>
                        {s.label}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-sm text-muted">
                  Niedziele są wolne, a ostatnie 3 tygodnie przed maturą to pełne
                  arkusze na czas. Kroki odhaczone w panelu działu zaliczają się w
                  planie automatycznie.
                </p>
                <div className="mt-6">
                  <Button variant="gradient" size="lg" onClick={generate} disabled={busy}>
                    {busy ? 'Generuję plan…' : 'Wygeneruj mój plan'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Plan */}
          {phase === 'plan' && (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-extrabold text-ink">
                  Twój harmonogram
                </h2>
                <div className="flex items-center gap-2">
                  {nextDate && (
                    <a
                      href={`#dzien-${nextDate}`}
                      className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                    >
                      Skocz do dziś
                    </a>
                  )}
                  <button
                    onClick={reset}
                    disabled={busy}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:text-magenta-600"
                  >
                    Zresetuj plan
                  </button>
                </div>
              </div>

              {synced > 0 && (
                <p className="mb-5 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
                  Odhaczyliśmy {synced}{' '}
                  {synced === 1 ? 'krok' : synced < 5 ? 'kroki' : 'kroków'} na
                  podstawie Twojego postępu w kursie.
                </p>
              )}

              <div className="space-y-4">
                {[...byDate.entries()].map(([date, items]) => {
                  const isToday = date === today;
                  const isPast = date < today;
                  const allDone = items.every(
                    (i) => i.is_completed || i.activity_type === 'rest'
                  );
                  const restOnly = items.every((i) => i.activity_type === 'rest');
                  return (
                    <div
                      key={date}
                      id={`dzien-${date}`}
                      className={cn(
                        'scroll-mt-28 overflow-hidden rounded-3xl border bg-white shadow-soft transition-colors',
                        isToday
                          ? 'border-brand-300'
                          : allDone && !restOnly
                            ? 'border-brand-200'
                            : 'border-line',
                        isPast && !allDone && 'border-magenta-500/30'
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-between gap-3 border-b border-line px-5 py-3',
                          isToday ? 'bg-brand-50' : 'bg-cloud/70'
                        )}
                      >
                        <p className="font-bold capitalize text-ink">{formatDate(date)}</p>
                        {isToday ? (
                          <span className="rounded-full bg-[linear-gradient(120deg,#6b4df6,#f43f8f)] px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-white">
                            Dziś
                          </span>
                        ) : allDone && !restOnly ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700">
                            <IconCheck className="h-3.5 w-3.5" strokeWidth={2.5} /> Zrobione
                          </span>
                        ) : isPast ? (
                          <span className="text-xs font-bold text-magenta-600">Zaległe</span>
                        ) : null}
                      </div>
                      <ul className="divide-y divide-line">
                        {items.map((item) => {
                          const kind = activityKind(item.activity_type);
                          const meta = activityMeta[kind];
                          const rest = kind === 'rest';
                          const courseId = courseIdForTopic(item.topic_name);
                          return (
                            <li
                              key={item.id}
                              className="flex items-center gap-3 px-4 py-3 sm:px-5"
                            >
                              {rest ? (
                                <span className="flex h-8 w-8 flex-none items-center justify-center text-xl">
                                  {meta.icon}
                                </span>
                              ) : (
                                <button
                                  onClick={() => toggleDone(item)}
                                  aria-pressed={item.is_completed}
                                  aria-label={
                                    item.is_completed ? 'Cofnij' : 'Oznacz jako zrobione'
                                  }
                                  className={cn(
                                    'flex h-8 w-8 flex-none items-center justify-center rounded-full ring-2 transition-all duration-300',
                                    item.is_completed
                                      ? 'bg-[linear-gradient(135deg,#6b4df6,#f43f8f)] text-white ring-transparent'
                                      : 'bg-white text-transparent ring-line hover:text-brand-300 hover:ring-brand-300'
                                  )}
                                >
                                  <IconCheck className="h-4 w-4" strokeWidth={2.5} />
                                </button>
                              )}
                              <div className="min-w-0 flex-1">
                                {!rest && (
                                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-brand-500">
                                    <span>
                                      {meta.icon} {meta.short}
                                    </span>
                                    {courseId && (
                                      <span className="normal-case tracking-normal text-muted">
                                        · {item.topic_name}
                                      </span>
                                    )}
                                  </p>
                                )}
                                <p
                                  className={cn(
                                    'text-sm leading-snug',
                                    item.is_completed
                                      ? 'text-muted line-through'
                                      : 'text-ink'
                                  )}
                                >
                                  {item.description}
                                </p>
                              </div>
                              {courseId && !item.is_completed && (
                                <Link
                                  href={`/kurs/${courseId}`}
                                  className="hidden flex-none items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 sm:inline-flex"
                                >
                                  Otwórz dział <IconArrow className="h-3.5 w-3.5" />
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
