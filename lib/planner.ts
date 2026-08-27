import { COURSES } from '@/lib/courses';
import type { StudyPlan } from '@/lib/types';

export const STUDY_TOPICS = COURSES.map((c) => ({
  id: c.id,
  name: c.title,
}));

const ARKUSZ_DAYS = 21;

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Najbliższa data matury z fizyki: 19 maja (bieżący lub następny rok). */
export function nextExamDate(from = new Date()): Date {
  const year = from.getFullYear();
  let exam = new Date(year, 4, 19);
  if (from >= exam) exam = new Date(year + 1, 4, 19);
  return exam;
}

type PlanRow = Omit<StudyPlan, 'id'>;

/**
 * Generuje plan nauki: rozkłada aktywności nieopanowanych działów na dni robocze,
 * niedziele = dni wolne, ostatnie ~21 dni = arkusze maturalne.
 */
export function generatePlanRows(userId: string, knownTopicIds: number[]): PlanRow[] {
  const known = new Set(knownTopicIds);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = nextExamDate(today);

  // Zbierz kolejne dni od jutra do dnia matury
  const days: Date[] = [];
  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() + 1);
  while (cursor <= exam) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  if (days.length === 0) return [];

  const isSunday = (d: Date) => d.getDay() === 0;
  const workingDays = days.filter((d) => !isSunday(d));
  const restDays = days.filter((d) => isSunday(d));

  const arkuszCount = Math.min(ARKUSZ_DAYS, Math.max(0, workingDays.length - 1));
  const arkuszDays = workingDays.slice(workingDays.length - arkuszCount);
  const studyDays = workingDays.slice(0, workingDays.length - arkuszCount);

  // Kolejka aktywności dla nieopanowanych działów
  type Act = { topic: string; type: string; desc: string };
  const queue: Act[] = [];
  for (const t of STUDY_TOPICS) {
    if (known.has(t.id)) continue;
    queue.push({ topic: t.name, type: 'video', desc: `Obejrzyj lekcje wideo: ${t.name}` });
    queue.push({ topic: t.name, type: 'etap_1', desc: `Przerób PDF - Etap 1: ${t.name}` });
    queue.push({ topic: t.name, type: 'etap_2', desc: `Przerób PDF - Etap 2: ${t.name}` });
    queue.push({ topic: t.name, type: 'etap_3', desc: `Zadania - Etap 3: ${t.name}` });
  }

  const rows: PlanRow[] = [];

  // Dni wolne (niedziele) w obrębie okresu nauki
  const studyRange = studyDays.length ? studyDays[studyDays.length - 1] : exam;
  for (const d of restDays) {
    if (d <= studyRange) {
      rows.push({
        user_id: userId,
        scheduled_date: ymd(d),
        topic_name: 'Odpoczynek',
        activity_type: 'rest',
        description: 'Dzień wolny 🌴 - naładuj baterie.',
        is_completed: false,
      });
    }
  }

  // Rozłóż aktywności na dni nauki
  if (queue.length && studyDays.length) {
    const perDay = Math.ceil(queue.length / studyDays.length);
    let qi = 0;
    for (const d of studyDays) {
      for (let k = 0; k < perDay && qi < queue.length; k++, qi++) {
        const a = queue[qi];
        rows.push({
          user_id: userId,
          scheduled_date: ymd(d),
          topic_name: a.topic,
          activity_type: a.type,
          description: a.desc,
          is_completed: false,
        });
      }
    }
  }

  // Arkusze maturalne na finiszu
  arkuszDays.forEach((d, i) => {
    rows.push({
      user_id: userId,
      scheduled_date: ymd(d),
      topic_name: 'Arkusz maturalny',
      activity_type: 'arkusz',
      description: `Rozwiąż arkusz maturalny #${i + 1} na czas.`,
      is_completed: false,
    });
  });

  return rows;
}

export const activityMeta: Record<string, { icon: string; label: string }> = {
  video: { icon: '🎬', label: 'Wideo' },
  etap_1: { icon: '📘', label: 'Etap 1' },
  etap_2: { icon: '📗', label: 'Etap 2' },
  etap_3: { icon: '🧩', label: 'Etap 3' },
  arkusz: { icon: '📝', label: 'Arkusz' },
  rest: { icon: '🌴', label: 'Wolne' },
};
