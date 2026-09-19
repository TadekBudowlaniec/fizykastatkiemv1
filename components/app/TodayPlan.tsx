'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  getDuePlanItems,
  setPlanItemCompleted,
  getAllUserLevels,
  getAllUserMaterialy,
} from '@/lib/db';
import {
  activityKind,
  activityMeta,
  courseIdForTopic,
  isDoneInCourse,
  todayYmd,
} from '@/lib/planner';
import type { StudyPlan } from '@/lib/types';
import { IconArrow, IconCheck } from '@/components/app/CourseIcons';
import { cn } from '@/lib/cn';

/**
 * „Dziś w planie" - kroki z planera na dziś (+ zaległe) z odhaczaniem.
 * Bez courseId: wszystkie działy (dashboard /kurs). Z courseId: tylko ten
 * dział (panel /kurs/[id]); wtedy karta znika, gdy nie ma nic do zrobienia.
 *
 * Kroki zaliczone w kursie (user_levels / user_materialy) są odhaczane
 * automatycznie; `refreshKey` wymusza ponowną synchronizację (np. po
 * odhaczeniu pliku w panelu działu).
 */
export function TodayPlan({
  courseId,
  refreshKey = 0,
}: {
  courseId?: number;
  refreshKey?: number;
}) {
  const { user } = useAuth();
  const [items, setItems] = useState<StudyPlan[] | null>(null); // null = ładowanie
  const [hasPlan, setHasPlan] = useState(false);
  const [showOverdue, setShowOverdue] = useState(false);
  const today = todayYmd();

  const load = useCallback(async () => {
    if (!user?.id) return;
    const uid = user.id;
    let rows: StudyPlan[] = [];
    try {
      rows = await getDuePlanItems(uid, today);
    } catch {
      setItems([]);
      return;
    }
    setHasPlan(rows.length > 0);
    // Sync kurs -> planer (tylko dla kroków, które tu pokazujemy).
    try {
      const [levels, materialy] = await Promise.all([
        getAllUserLevels(uid).catch(() => []),
        getAllUserMaterialy(uid).catch(() => []),
      ]);
      const progress = { levels, materialy };
      const toMark = rows.filter(
        (r) => !r.is_completed && isDoneInCourse(r, progress)
      );
      if (toMark.length) {
        await Promise.all(
          toMark.map((r) => setPlanItemCompleted(r.id, true).catch(() => {}))
        );
        const ids = new Set(toMark.map((r) => r.id));
        rows = rows.map((r) => (ids.has(r.id) ? { ...r, is_completed: true } : r));
      }
    } catch {
      /* bez synchronizacji */
    }
    setItems(rows);
  }, [user?.id, today]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const toggle = async (item: StudyPlan) => {
    const val = !item.is_completed;
    setItems((prev) =>
      prev ? prev.map((p) => (p.id === item.id ? { ...p, is_completed: val } : p)) : prev
    );
    try {
      await setPlanItemCompleted(item.id, val);
    } catch {
      setItems((prev) =>
        prev
          ? prev.map((p) => (p.id === item.id ? { ...p, is_completed: !val } : p))
          : prev
      );
    }
  };

  const { todayItems, overdue } = useMemo(() => {
    const all = (items ?? []).filter((i) => {
      if (activityKind(i.activity_type) === 'rest') return false;
      if (courseId === undefined) return true;
      return courseIdForTopic(i.topic_name) === courseId;
    });
    return {
      todayItems: all.filter((i) => i.scheduled_date === today),
      overdue: all.filter((i) => i.scheduled_date < today && !i.is_completed),
    };
  }, [items, courseId, today]);

  if (!user) return null;
  if (items === null) return null; // ładowanie - bez migotania

  const done = todayItems.filter((i) => i.is_completed).length;
  const total = todayItems.length;
  const scoped = courseId !== undefined;

  // Panel działu: nic dziś i nic zaległego -> nie pokazujemy karty.
  if (scoped && total === 0 && overdue.length === 0) return null;

  return (
    <section
      className={cn(
        'rounded-3xl border bg-white shadow-soft',
        total > 0 && done === total ? 'border-brand-200' : 'border-line'
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-500">
            Dziś w planie
          </p>
          <h3 className="mt-0.5 font-display text-lg font-extrabold text-ink">
            {!hasPlan
              ? 'Nie masz jeszcze planu nauki'
              : total === 0
                ? scoped
                  ? 'Dziś nic z tego działu'
                  : 'Dziś nic nie zaplanowano'
                : done === total
                  ? 'Wszystko na dziś zrobione'
                  : `${done} z ${total} ${total === 1 ? 'kroku' : 'kroków'}`}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {total > 0 && (
            <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-cloud sm:block">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#6b4df6,#f43f8f)] transition-[width] duration-500"
                style={{ width: `${total ? (done / total) * 100 : 0}%` }}
              />
            </div>
          )}
          <Link
            href="/planer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition hover:text-magenta-600"
          >
            {hasPlan ? 'Planer' : 'Ustaw planer'} <IconArrow className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {total > 0 && (
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {todayItems.map((item) => (
            <Row key={item.id} item={item} scoped={scoped} onToggle={toggle} />
          ))}
        </ul>
      )}

      {overdue.length > 0 && (
        <div className={cn('border-t border-line', total === 0 && 'mt-4')}>
          <button
            onClick={() => setShowOverdue((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-semibold text-magenta-600 transition hover:bg-cloud/70 sm:px-6"
          >
            <span>
              Zaległe: {overdue.length}{' '}
              {overdue.length === 1 ? 'krok' : overdue.length < 5 ? 'kroki' : 'kroków'}
            </span>
            <span className="text-xs text-muted">{showOverdue ? 'Ukryj' : 'Pokaż'}</span>
          </button>
          {showOverdue && (
            <ul className="divide-y divide-line border-t border-line">
              {overdue.map((item) => (
                <Row key={item.id} item={item} scoped={scoped} onToggle={toggle} overdue />
              ))}
            </ul>
          )}
        </div>
      )}

      {!hasPlan && (
        <p className="px-5 pb-5 pt-2 text-sm text-muted sm:px-6">
          Planer rozpisze ścieżkę każdego działu dzień po dniu aż do matury, a to,
          co odhaczysz w kursie, zaliczy się w nim automatycznie.
        </p>
      )}
      {hasPlan && total === 0 && overdue.length === 0 && (
        <p className="px-5 pb-5 pt-2 text-sm text-muted sm:px-6">
          Możesz wyprzedzić plan albo naładować baterie.
        </p>
      )}
      {(total > 0 || overdue.length > 0) && <div className="h-2" />}
    </section>
  );
}

function Row({
  item,
  scoped,
  overdue,
  onToggle,
}: {
  item: StudyPlan;
  scoped: boolean;
  overdue?: boolean;
  onToggle: (item: StudyPlan) => void;
}) {
  const kind = activityKind(item.activity_type);
  const meta = activityMeta[kind];
  const cid = courseIdForTopic(item.topic_name);
  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <button
        onClick={() => onToggle(item)}
        aria-pressed={item.is_completed}
        aria-label={item.is_completed ? 'Cofnij' : 'Oznacz jako zrobione'}
        className={cn(
          'flex h-8 w-8 flex-none items-center justify-center rounded-full ring-2 transition-all duration-300',
          item.is_completed
            ? 'bg-[linear-gradient(135deg,#6b4df6,#f43f8f)] text-white ring-transparent'
            : 'bg-white text-transparent ring-line hover:text-brand-300 hover:ring-brand-300'
        )}
      >
        <IconCheck className="h-4 w-4" strokeWidth={2.5} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 text-[0.7rem] font-bold uppercase tracking-wider text-brand-500">
          <span>
            {meta.icon} {meta.short}
          </span>
          {!scoped && cid && (
            <span className="normal-case tracking-normal text-muted">· {item.topic_name}</span>
          )}
          {overdue && (
            <span className="normal-case tracking-normal text-magenta-600">
              · {new Date(item.scheduled_date + 'T00:00:00').toLocaleDateString('pl-PL', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          )}
        </p>
        <p
          className={cn(
            'text-sm leading-snug',
            item.is_completed ? 'text-muted line-through' : 'text-ink'
          )}
        >
          {item.description}
        </p>
      </div>
      {!scoped && cid && !item.is_completed && (
        <Link
          href={`/kurs/${cid}`}
          aria-label={`Otwórz dział: ${item.topic_name}`}
          className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-cloud text-brand-700 transition hover:bg-brand-50 sm:h-auto sm:w-auto sm:gap-1 sm:bg-transparent sm:px-3 sm:py-1.5 sm:text-xs sm:font-semibold"
        >
          <span className="hidden sm:inline">Otwórz</span>
          <IconArrow className="h-3.5 w-3.5" />
        </Link>
      )}
    </li>
  );
}
