'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  getStudyPlan,
  deleteStudyPlan,
  insertStudyPlan,
  setPlanItemCompleted,
} from '@/lib/db';
import {
  STUDY_TOPICS,
  generatePlanRows,
  activityMeta,
  nextExamDate,
} from '@/lib/planner';
import type { StudyPlan } from '@/lib/types';
import { AppHero } from '@/components/app/AppHero';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { SqueezeForm } from '@/components/landing/SqueezeForm';
import { cn } from '@/lib/cn';

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function PlanerPage() {
  const { user, loading } = useAuth();
  const [plan, setPlan] = useState<StudyPlan[]>([]);
  const [phase, setPhase] = useState<'loading' | 'config' | 'plan'>('loading');
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setPhase('loading');
    const rows = await getStudyPlan(user.id);
    if (rows.length) {
      setPlan(rows);
      setPhase('plan');
    } else {
      setPhase('config');
    }
  }, [user]);

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
      const rows = generatePlanRows(user.id, [...known]);
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
      // rollback
      setPlan((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, is_completed: !val } : p))
      );
    }
  };

  // --- Niezalogowany ---
  if (!loading && !user) {
    return (
      <AppHero
        title="Twój planer nauki do matury 🧭"
        subtitle="Podaj e-mail — wyślemy Ci magiczny link, który otworzy Twój spersonalizowany planer."
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

  const exam = nextExamDate();
  const examStr = exam.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // grupowanie planu po dacie
  const byDate = new Map<string, StudyPlan[]>();
  for (const item of plan) {
    const arr = byDate.get(item.scheduled_date) ?? [];
    arr.push(item);
    byDate.set(item.scheduled_date, arr);
  }
  const doneCount = plan.filter((p) => p.is_completed).length;
  const pct = plan.length ? Math.round((doneCount / plan.length) * 100) : 0;

  return (
    <>
      <AppHero
        title="Twój planer nauki 🧭"
        subtitle={`Cel: matura z fizyki — ${examStr}. Krok po kroku, aż do wyniku.`}
        breadcrumb={[
          { label: 'Start', href: '/' },
          { label: 'Planer', href: '/planer' },
        ]}
      >
        {phase === 'plan' && (
          <div className="mt-6 max-w-md">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Ukończono</span>
              <span className="font-semibold text-white">
                {doneCount} / {plan.length}
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#6b4df6,#f43f8f)] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </AppHero>

      <section className="bg-cloud py-12">
        <Container size="narrow">
          {phase === 'loading' && <p className="text-muted">Ładowanie planera…</p>}

          {/* Konfiguracja */}
          {phase === 'config' && (
            <div className="rounded-3xl border border-line bg-white p-7 shadow-card">
              <h2 className="text-2xl font-extrabold text-ink">
                Zaznacz, co już umiesz
              </h2>
              <p className="mt-1 text-muted">
                Pominiemy opanowane działy i skupimy plan na tym, co zostało do
                zrobienia.
              </p>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {STUDY_TOPICS.map((t) => {
                  const on = known.has(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleKnown(t.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all',
                        on
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-line bg-white text-slate hover:border-brand-200'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 flex-none items-center justify-center rounded-md border-2 text-xs text-white',
                          on ? 'border-brand-500 bg-brand-500' : 'border-line'
                        )}
                      >
                        {on && '✓'}
                      </span>
                      {t.name}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6">
                <Button variant="gradient" size="lg" onClick={generate} disabled={busy}>
                  {busy ? 'Generuję plan…' : 'Wygeneruj mój plan'}
                </Button>
              </div>
            </div>
          )}

          {/* Plan */}
          {phase === 'plan' && (
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-ink">Twój harmonogram</h2>
                <button
                  onClick={reset}
                  disabled={busy}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-magenta-600"
                >
                  ↺ Zresetuj plan
                </button>
              </div>

              <div className="space-y-4">
                {[...byDate.entries()].map(([date, items]) => (
                  <div
                    key={date}
                    className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft"
                  >
                    <div className="border-b border-line bg-cloud px-5 py-3">
                      <p className="font-bold capitalize text-ink">
                        {formatDate(date)}
                      </p>
                    </div>
                    <ul className="divide-y divide-line">
                      {items.map((item) => {
                        const meta = activityMeta[item.activity_type] ?? {
                          icon: '•',
                          label: '',
                        };
                        const rest = item.activity_type === 'rest';
                        return (
                          <li
                            key={item.id}
                            className="flex items-center gap-3 px-5 py-3.5"
                          >
                            {!rest ? (
                              <button
                                onClick={() => toggleDone(item)}
                                className={cn(
                                  'flex h-6 w-6 flex-none items-center justify-center rounded-md border-2 text-xs text-white transition',
                                  item.is_completed
                                    ? 'border-brand-500 bg-brand-500'
                                    : 'border-line hover:border-brand-400'
                                )}
                                aria-label="Oznacz jako zrobione"
                              >
                                {item.is_completed && '✓'}
                              </button>
                            ) : (
                              <span className="text-xl">{meta.icon}</span>
                            )}
                            <span
                              className={cn(
                                'flex-1 text-sm',
                                item.is_completed
                                  ? 'text-muted line-through'
                                  : 'text-slate'
                              )}
                            >
                              {!rest && <span className="mr-1.5">{meta.icon}</span>}
                              {item.description}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
