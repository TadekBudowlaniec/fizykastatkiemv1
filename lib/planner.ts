import { COURSES } from '@/lib/courses';
import type { StudyPlan, UserLevel, UserMaterial } from '@/lib/types';

export const STUDY_TOPICS = COURSES.map((c) => ({
  id: c.id,
  name: c.title,
}));

const ARKUSZ_DAYS = 21;

// ---------------------------------------------------------------------------
// Typy aktywności = kroki ścieżki działu (spójne z panelem kursu):
//   video        obejrzenie lekcji wideo
//   p1:<plik>    jeden plik teorii Poziomu 1 (gdy znamy listę plików)
//   p1           cały Poziom 1 (tylko gdy dział nie ma jeszcze wgranych plików)
//   p2 / p3 / p4 Poziom 2 (dogrzewające), 3 (autorskie maturalne), 4 (arkusz CKE)
//   quiz         quiz sprawdzający działu
//   arkusz       pełny arkusz maturalny na finiszu
//   rest         niedziela
// Typ trzymamy w kolumnie activity_type (tekst); dla plików P1 dopisujemy
// nazwę pliku po dwukropku, żeby dało się zsynchronizować z user_materialy.
// ---------------------------------------------------------------------------

export type ActivityKind =
  | 'video'
  | 'p1'
  | 'p2'
  | 'p3'
  | 'p4'
  | 'quiz'
  | 'arkusz'
  | 'powtorka'
  | 'rest';

export function activityKind(type: string): ActivityKind {
  const base = type.split(':')[0];
  if (
    base === 'video' ||
    base === 'p1' ||
    base === 'p2' ||
    base === 'p3' ||
    base === 'p4' ||
    base === 'quiz' ||
    base === 'arkusz' ||
    base === 'powtorka' ||
    base === 'rest'
  )
    return base;
  // Stare plany (etap_1..3) - traktuj jak poziomy.
  if (base === 'etap_1') return 'p1';
  if (base === 'etap_2') return 'p2';
  if (base === 'etap_3') return 'p3';
  return 'p1';
}

/** Nazwa pliku P1 zakodowana w activity_type („p1:<plik>") albo null. */
export function activityFile(type: string): string | null {
  const i = type.indexOf(':');
  return type.startsWith('p1:') && i > 0 ? type.slice(i + 1) : null;
}

export const activityMeta: Record<
  ActivityKind,
  { icon: string; label: string; short: string }
> = {
  video: { icon: '🎬', label: 'Lekcja wideo', short: 'Wideo' },
  p1: { icon: '📘', label: 'Poziom 1 · Teoria i Rozgrzewka', short: 'Poziom 1' },
  p2: { icon: '📗', label: 'Poziom 2 · Zadania Dogrzewające', short: 'Poziom 2' },
  p3: { icon: '📙', label: 'Poziom 3 · Autorskie Zadania Maturalne', short: 'Poziom 3' },
  p4: { icon: '📕', label: 'Poziom 4 · Arkusz CKE', short: 'Poziom 4' },
  quiz: { icon: '🧩', label: 'Quiz sprawdzający', short: 'Quiz' },
  arkusz: { icon: '📝', label: 'Arkusz maturalny', short: 'Arkusz' },
  powtorka: { icon: '🔁', label: 'Powtórka', short: 'Powtórka' },
  rest: { icon: '🌴', label: 'Dzień wolny', short: 'Wolne' },
};

// Dawne tytuły działów (plany wygenerowane przed zmianą nazw).
const LEGACY_TITLES: Record<string, string> = {
  'Prąd elektryczny': 'Prąd stały',
  'Fizyka jądrowa i relatywistyczna': 'Fizyka jądrowa i relatywistyka',
};

/** ID działu po nazwie tematu z planu (topic_name = tytuł działu). */
export function courseIdForTopic(topicName: string): number | null {
  const title = LEGACY_TITLES[topicName] ?? topicName;
  return COURSES.find((c) => c.title === title)?.id ?? null;
}

function prettyFile(name: string): string {
  return name.replace(/\.pdf$/i, '').replace(/_/g, ' ');
}

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

/** Dzisiejsza data jako YYYY-MM-DD (czas lokalny). */
export function todayYmd(): string {
  return ymd(new Date());
}

// ---------------------------------------------------------------------------
// Tryby planu - ile ścieżki działu wchodzi do planu. Gdy do matury jest mało
// czasu, pełna ścieżka daje nierealną liczbę kroków dziennie.
// ---------------------------------------------------------------------------

export type PlanMode = 'full' | 'short' | 'rescue';

export const PLAN_MODES: {
  key: PlanMode;
  label: string;
  desc: string;
  steps: string;
}[] = [
  {
    key: 'full',
    label: 'Pełna ścieżka',
    desc: 'Wszystko jak w panelu działu: wideo, każdy plik teorii, poziomy 2-4 i quiz.',
    steps: 'wideo · P1 · P2 · P3 · P4 · quiz',
  },
  {
    key: 'short',
    label: 'Tryb skrócony',
    desc: 'Bez arkuszy CKE (Poziom 4) i quizów. Zostaje rdzeń: wideo, teoria i zadania.',
    steps: 'wideo · P1 · P2 · P3',
  },
  {
    key: 'rescue',
    label: 'Tryb ratunkowy',
    desc: 'Tylko wideo i autorskie zadania maturalne. Gdy zostały tygodnie, nie miesiące.',
    steps: 'wideo · P3',
  },
];

/** Powyżej tylu kroków dziennie plan uznajemy za nierealny i ostrzegamy. */
export const LOAD_WARN_PER_DAY = 3;

type Act = { topic: string; type: string; desc: string };

/** Kolejka kroków w kolejności ścieżki działu (jak w panelu kursu). */
function buildQueue(
  knownTopicIds: number[],
  p1Files: Record<number, string[]>,
  mode: PlanMode
): Act[] {
  const known = new Set(knownTopicIds);
  const queue: Act[] = [];
  for (const t of STUDY_TOPICS) {
    if (known.has(t.id)) continue;
    queue.push({ topic: t.name, type: 'video', desc: 'Obejrzyj lekcję wideo działu' });
    if (mode !== 'rescue') {
      const files = p1Files[t.id] ?? [];
      if (files.length) {
        for (const f of files) {
          queue.push({
            topic: t.name,
            type: `p1:${f}`,
            desc: `Teoria: ${prettyFile(f)} (przeczytaj i zrób rozgrzewkę)`,
          });
        }
      } else {
        queue.push({
          topic: t.name,
          type: 'p1',
          desc: 'Poziom 1: przerób wszystkie pliki teorii i rozgrzewkę',
        });
      }
      queue.push({
        topic: t.name,
        type: 'p2',
        desc: 'Poziom 2: rozwiąż zadania dogrzewające, sprawdź z odpowiedziami',
      });
    }
    queue.push({
      topic: t.name,
      type: 'p3',
      desc: 'Poziom 3: autorskie zadania maturalne, potem odpowiedzi',
    });
    if (mode === 'full') {
      queue.push({
        topic: t.name,
        type: 'p4',
        desc: 'Poziom 4: prawdziwe zadania CKE z tego działu',
      });
      queue.push({ topic: t.name, type: 'quiz', desc: 'Quiz sprawdzający działu' });
    }
  }
  return queue;
}

/**
 * Podział dni od jutra do matury: niedziele = wolne, ostatnie ~21 dni
 * roboczych = arkusze, reszta = dni nauki.
 */
function partitionDays(from = new Date()) {
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);
  const exam = nextExamDate(today);

  const days: Date[] = [];
  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() + 1);
  while (cursor <= exam) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const isSunday = (d: Date) => d.getDay() === 0;
  const workingDays = days.filter((d) => !isSunday(d));
  const restDays = days.filter((d) => isSunday(d));
  const arkuszCount = Math.min(ARKUSZ_DAYS, Math.max(0, workingDays.length - 1));
  const arkuszDays = workingDays.slice(workingDays.length - arkuszCount);
  const studyDays = workingDays.slice(0, workingDays.length - arkuszCount);
  return { exam, studyDays, arkuszDays, restDays };
}

/** Obciążenie planu przed wygenerowaniem: kroki, dni nauki, kroki/dzień. */
export function planLoad(
  knownTopicIds: number[],
  p1Files: Record<number, string[]>,
  mode: PlanMode
): {
  steps: number;
  studyDays: number;
  perDay: number;
  topics: number;
  materialDays: number;
  reviewDays: number;
} {
  const queue = buildQueue(knownTopicIds, p1Files, mode);
  const { studyDays } = partitionDays();
  const topics = STUDY_TOPICS.length - new Set(knownTopicIds).size;
  const perDay = studyDays.length ? queue.length / studyDays.length : Infinity;
  // Auto-tempo: materiał zajmuje tyle dni, ile kroków (max = dni nauki);
  // nadmiar dni wypełniają powtórki (zamiast pustych luk).
  const materialDays = Math.min(queue.length, studyDays.length);
  const reviewDays = Math.max(0, studyDays.length - materialDays);
  return {
    steps: queue.length,
    studyDays: studyDays.length,
    perDay,
    topics,
    materialDays,
    reviewDays,
  };
}

/**
 * Generuje plan nauki: kroki ścieżki każdego nieopanowanego działu (w tej
 * samej kolejności co w panelu kursu) rozłożone równomiernie na dni robocze,
 * niedziele = wolne, ostatnie ~21 dni = pełne arkusze maturalne.
 *
 * @param p1Files lista plików Poziomu 1 per dział - każdy plik to osobny
 *   krok; dział bez wgranych materiałów dostaje jeden krok „cały Poziom 1".
 * @param mode zakres ścieżki (patrz PLAN_MODES).
 */
export function generatePlanRows(
  userId: string,
  knownTopicIds: number[],
  p1Files: Record<number, string[]> = {},
  mode: PlanMode = 'full'
): PlanRow[] {
  const { exam, studyDays, arkuszDays, restDays } = partitionDays();
  if (!studyDays.length && !arkuszDays.length && !restDays.length) return [];

  const queue = buildQueue(knownTopicIds, p1Files, mode);
  const rows: PlanRow[] = [];

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

  // Auto-tempo: kroki materiału rozłożone równo na dni nauki, a KAŻDY dzień bez
  // nowego materiału dostaje powtórkę już poznanego działu (spaced repetition).
  // Dzięki temu nie ma pustych dni, nawet gdy kroków jest mniej niż dni.
  if (queue.length && studyDays.length) {
    // 1) Przypisz kroki materiału do dni (równomiernie, jak w panelu kursu).
    const byDay: Act[][] = studyDays.map(() => []);
    queue.forEach((a, i) => {
      const dayIdx = Math.min(
        Math.floor((i * studyDays.length) / queue.length),
        studyDays.length - 1
      );
      byDay[dayIdx].push(a);
    });

    // 2) Przejdź dni po kolei: dzień z materiałem → kroki; dzień pusty → powtórka
    //    działu wprowadzonego już wcześniej (round-robin).
    const introduced: string[] = [];
    let reviewPtr = 0;
    studyDays.forEach((d, idx) => {
      const items = byDay[idx];
      if (items.length) {
        for (const a of items) {
          if (a.topic && !introduced.includes(a.topic)) introduced.push(a.topic);
          rows.push({
            user_id: userId,
            scheduled_date: ymd(d),
            topic_name: a.topic,
            activity_type: a.type,
            description: a.desc,
            is_completed: false,
          });
        }
      } else if (introduced.length) {
        const topic = introduced[reviewPtr % introduced.length];
        reviewPtr += 1;
        rows.push({
          user_id: userId,
          scheduled_date: ymd(d),
          topic_name: topic,
          activity_type: 'powtorka',
          description: `Powtórka: ${topic} — wróć do zadań (Poziom 3) i sprawdź, ile pamiętasz.`,
          is_completed: false,
        });
      }
      // dzień pusty, zanim cokolwiek wprowadzono: pomijamy (dzień 0 zawsze ma materiał).
    });
  }

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

// ---------------------------------------------------------------------------
// Synchronizacja z postępem w kursie (user_levels + user_materialy).
// Kierunek: kurs -> planer (odhaczone w panelu działu = zrobione w planie).
// ---------------------------------------------------------------------------

export type CourseProgress = {
  levels: UserLevel[];
  materialy: UserMaterial[];
};

/** Czy krok planu jest już zaliczony w panelu kursu. */
export function isDoneInCourse(item: StudyPlan, progress: CourseProgress): boolean {
  const courseId = courseIdForTopic(item.topic_name);
  if (!courseId) return false;
  const kind = activityKind(item.activity_type);
  if (kind === 'video') {
    return progress.materialy.some(
      (m) => m.course_id === courseId && m.poziom === 0
    );
  }
  if (kind === 'p1') {
    const file = activityFile(item.activity_type);
    if (!file) return false;
    return progress.materialy.some(
      (m) => m.course_id === courseId && m.poziom === 1 && m.file === file
    );
  }
  if (kind === 'p2' || kind === 'p3' || kind === 'p4') {
    const poziom = Number(kind[1]);
    return progress.levels.some(
      (l) => l.course_id === courseId && l.poziom === poziom
    );
  }
  return false;
}
