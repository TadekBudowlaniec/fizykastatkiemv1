'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  getLessons,
  getUserLevels,
  markLevel,
  unmarkLevel,
  listMaterialy,
  getUserMaterialy,
  markMaterial,
  unmarkMaterial,
} from '@/lib/db';
import type { Lesson, MaterialFile } from '@/lib/types';
import { getCourse, SINGLE_COURSE_PRICE, PLANS } from '@/lib/courses';
import { AppHero } from '@/components/app/AppHero';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { BuyButton } from '@/components/shop/BuyButton';
import { CoursePath, LEVELS } from '@/components/app/CoursePath';
import { CourseVideo } from '@/components/app/CourseVideo';
import { TaskRunner } from '@/components/app/TaskRunner';
import { LessonView } from '@/components/app/LessonView';
import {
  IconArrow,
  IconBook,
  IconCheck,
  IconPlay,
  IconTarget,
} from '@/components/app/CourseIcons';
import { cn } from '@/lib/cn';

// Poziomy liczone jako całość (Poziom 1 liczy się per plik).
const WHOLE_LEVELS = [2, 3, 4];

// Fallback, gdy tabela user_materialy nie istnieje jeszcze w Supabase
// (patrz supabase/user-materialy.sql) — postęp plików trzymamy lokalnie.
function localKey(userId: string, courseId: number, scope = 'materialy') {
  return `fs.${scope}.${userId}.${courseId}`;
}
function readLocal(userId: string, courseId: number, scope?: string): Set<string> {
  try {
    const raw = localStorage.getItem(localKey(userId, courseId, scope));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}
function writeLocal(
  userId: string,
  courseId: number,
  files: Set<string>,
  scope?: string
) {
  try {
    localStorage.setItem(
      localKey(userId, courseId, scope),
      JSON.stringify([...files])
    );
  } catch {
    /* ignoruj */
  }
}

export function CourseView({ courseId }: { courseId: number }) {
  const { user, loading, accessLoading, hasAccessToCourse } = useAuth();
  const isStart = courseId === 0;
  const meta = getCourse(courseId);
  const title = isStart ? 'Tutaj zacznij' : meta?.title ?? 'Dział';
  const icon = isStart ? '🚀' : meta?.icon ?? '📗';

  const access = isStart || (!!user && hasAccessToCourse(courseId));

  // ---------- Lekcje ----------
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  const loadLessons = useCallback(async () => {
    setLessonsLoading(true);
    try {
      setLessons(await getLessons(courseId));
    } catch {
      setLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (access) loadLessons();
    else setLessonsLoading(false);
  }, [access, loadLessons]);

  const videoLessons = useMemo(
    () => lessons.filter((l) => !!l.yt_id_wideo),
    [lessons]
  );
  // Lekcje tekstowe bez wideo (np. „Tutaj zacznij") — otwierane w LessonView.
  const textLessons = useMemo(
    () =>
      lessons.filter(
        (l) => !l.yt_id_wideo && !!l.content && l.content.trim().length > 0
      ),
    [lessons]
  );

  // ---------- Pliki poziomów (P1 zmienna liczba, P2/P3 stałe) ----------
  const [files, setFiles] = useState<Record<number, MaterialFile[]>>({});
  const [filesLoading, setFilesLoading] = useState(true);

  useEffect(() => {
    if (!access || isStart) {
      setFilesLoading(false);
      return;
    }
    let cancelled = false;
    setFilesLoading(true);
    Promise.all([
      listMaterialy(courseId, 1).catch(() => []),
      listMaterialy(courseId, 2).catch(() => []),
      listMaterialy(courseId, 3).catch(() => []),
    ]).then(([p1, p2, p3]) => {
      if (cancelled) return;
      setFiles({ 1: p1, 2: p2, 3: p3 });
      setFilesLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [access, isStart, courseId]);

  // ---------- Postęp: poziomy 2–4 (user_levels) ----------
  const [levels, setLevels] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!access || !user?.id || isStart) return;
    getUserLevels(user.id, courseId)
      .then((rows) => setLevels(new Set(rows.map((r) => r.poziom))))
      .catch(() => setLevels(new Set()));
  }, [access, user?.id, isStart, courseId]);

  const toggleLevel = useCallback(
    async (poziom: number, done: boolean) => {
      if (!user?.id) return;
      setLevels((prev) => {
        const next = new Set(prev);
        if (done) next.add(poziom);
        else next.delete(poziom);
        return next;
      });
      try {
        if (done) await markLevel(user.id, courseId, poziom);
        else await unmarkLevel(user.id, courseId, poziom);
      } catch {
        setLevels((prev) => {
          const next = new Set(prev);
          if (done) next.delete(poziom);
          else next.add(poziom);
          return next;
        });
      }
    },
    [user?.id, courseId]
  );

  // ---------- Postęp: pliki Poziomu 1 + wideo (user_materialy, fallback local) ----------
  // poziom 1 = plik PDF, poziom 0 = obejrzane wideo (file = yt_id).
  const [doneFiles, setDoneFiles] = useState<Set<string>>(new Set());
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const watchedRef = useRef(watched);
  watchedRef.current = watched;
  const [filesBackend, setFilesBackend] = useState<'db' | 'local'>('db');

  useEffect(() => {
    if (!access || !user?.id || isStart) return;
    const uid = user.id;
    // Wideo: najpierw stan lokalny (działa też przed migracją check 0..4),
    // potem nadpisujemy tym, co jest w bazie (jeśli tabela odpowiada).
    setWatched(readLocal(uid, courseId, 'video'));
    getUserMaterialy(uid, courseId)
      .then((rows) => {
        setFilesBackend('db');
        setDoneFiles(
          new Set(rows.filter((r) => r.poziom === 1).map((r) => r.file))
        );
        const vid = rows.filter((r) => r.poziom === 0).map((r) => r.file);
        if (vid.length) setWatched((prev) => new Set([...prev, ...vid]));
      })
      .catch(() => {
        setFilesBackend('local');
        setDoneFiles(readLocal(uid, courseId));
      });
  }, [access, user?.id, isStart, courseId]);

  const toggleFile = useCallback(
    async (file: string, done: boolean) => {
      if (!user?.id) return;
      const uid = user.id;
      const apply = (set: Set<string>, add: boolean) => {
        const next = new Set(set);
        if (add) next.add(file);
        else next.delete(file);
        return next;
      };
      setDoneFiles((prev) => {
        const next = apply(prev, done);
        if (filesBackend === 'local') writeLocal(uid, courseId, next);
        return next;
      });
      if (filesBackend === 'local') return;
      try {
        if (done) await markMaterial(uid, courseId, 1, file);
        else await unmarkMaterial(uid, courseId, 1, file);
      } catch {
        // Brak tabeli / błąd zapisu → przełącz na tryb lokalny, nie cofaj UI.
        setFilesBackend('local');
        setDoneFiles((prev) => {
          writeLocal(uid, courseId, prev);
          return prev;
        });
      }
    },
    [user?.id, courseId, filesBackend]
  );

  // Obejrzane wideo — zapis do user_materialy (poziom 0); przy błędzie (np.
  // stary check 1..4 przed migracją) zostaje lokalnie, UI się nie cofa.
  const toggleWatched = useCallback(
    async (ytId: string, done: boolean) => {
      if (!user?.id) return;
      const uid = user.id;
      // Auto-zaliczenie z playera może strzelać wielokrotnie — zapisujemy raz.
      if (done && watchedRef.current.has(ytId)) return;
      const next = new Set(watchedRef.current);
      if (done) next.add(ytId);
      else next.delete(ytId);
      watchedRef.current = next;
      setWatched(next);
      writeLocal(uid, courseId, next, 'video');
      try {
        if (done) await markMaterial(uid, courseId, 0, ytId);
        else await unmarkMaterial(uid, courseId, 0, ytId);
      } catch {
        /* zostaje w localStorage */
      }
    },
    [user?.id, courseId]
  );

  // ---------- Zbiorczy postęp działu ----------
  const p1Files = files[1] ?? [];
  const p1Done = p1Files.filter((f) => doneFiles.has(f.name)).length;
  const wholeDone = WHOLE_LEVELS.filter((p) => levels.has(p)).length;
  const videosDone = videoLessons.filter(
    (l) => !!l.yt_id_wideo && watched.has(l.yt_id_wideo)
  ).length;
  const allVideosDone =
    videoLessons.length > 0 && videosDone === videoLessons.length;
  const totalSteps = videoLessons.length + p1Files.length + WHOLE_LEVELS.length;
  const doneSteps = videosDone + p1Done + wholeDone;
  const pct = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;
  const allDone = !filesLoading && totalSteps > 0 && doneSteps === totalSteps;

  // ---------- Boczna nawigacja: aktywna sekcja ----------
  const [activeSection, setActiveSection] = useState<string>('wideo');
  const hasVideo = videoLessons.length > 0;

  useEffect(() => {
    if (!access || isStart || typeof IntersectionObserver === 'undefined')
      return;
    const ids = [
      ...(hasVideo ? ['wideo'] : []),
      ...LEVELS.map((l) => `poziom-${l.poziom}`),
      'quiz',
    ];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [access, isStart, hasVideo, filesLoading, lessonsLoading]);

  // ---------- Walidacja / ładowanie ----------
  const valid = isStart || (courseId >= 1 && courseId <= 16 && meta);

  if (!valid) {
    return (
      <AppHero title="Nie znaleziono działu" subtitle="Ten dział nie istnieje.">
        <div className="mt-6">
          <Button href="/kurs" variant="light">
            Wróć do kursu
          </Button>
        </div>
      </AppHero>
    );
  }

  // Czekamy aż znamy sesję ORAZ (dla zalogowanego) wczytamy jego dostęp —
  // inaczej płacący user zobaczyłby na chwilę ekran „zablokowane".
  if (loading || (!isStart && !!user && accessLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted">
        Ładowanie…
      </div>
    );
  }

  if (selected) {
    return (
      <LessonView lesson={selected} onBack={() => setSelected(null)} courseTitle={title} />
    );
  }

  const breadcrumb = [
    { label: 'Start', href: '/' },
    { label: 'Kurs', href: '/kurs' },
    { label: title, href: `/kurs/${courseId}` },
  ];

  // Brak dostępu (dla działów 1-16) — podgląd struktury działu (przyciemniony,
  // z kłódką) + bezpośrednie CTA zakupu. UWAGA: podgląd korzysta wyłącznie z
  // PUBLICZNYCH danych działu (zakres z courses.json) — NIE ładujemy lekcji z
  // bazy, żeby nie wyciekły video_id niezalogowanym.
  if (!access) {
    const fullPrice = PLANS.find((p) => p.key === 'full_access')?.price ?? 828;
    const scope = [...(meta?.basic ?? []), ...(meta?.extended ?? [])];

    return (
      <>
        <AppHero
          title={
            <span className="flex items-center gap-3">
              <span className="text-4xl">{icon}</span> {title}
            </span>
          }
          subtitle="Podgląd ścieżki działu — odblokuj dostęp, aby zacząć naukę."
          breadcrumb={breadcrumb}
        />
        <section className="bg-cloud py-12 sm:py-14">
          <Container size="wide">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-white shadow-card">
              {/* Podgląd ścieżki (rozmyty, nieinteraktywny) */}
              <div
                aria-hidden
                className="pointer-events-none select-none p-6 blur-[3px] sm:p-8"
              >
                <div className="mb-6 aspect-[21/9] rounded-2xl bg-navy-900" />
                <ol className="space-y-3">
                  {LEVELS.map((l) => (
                    <li
                      key={l.poziom}
                      className="flex items-center gap-4 rounded-2xl border border-line p-4"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white font-display font-extrabold text-brand-700 ring-1 ring-line">
                        {l.poziom}
                      </span>
                      <span className="font-semibold text-ink">{l.title}</span>
                    </li>
                  ))}
                </ol>
                {scope.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {scope.slice(0, 10).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-cloud px-3 py-1.5 text-sm text-slate ring-1 ring-line"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Nakładka z kłódką + CTA zakupu */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-white/50 via-white/80 to-white/95 p-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6b4df6,#f43f8f)] text-3xl text-white shadow-glow">
                  🔒
                </span>
                <h2 className="text-2xl font-extrabold text-ink">
                  Odblokuj dostęp do działu „{title}”
                </h2>
                <p className="mx-auto max-w-md text-muted">
                  Lekcja wideo, 4 poziomy materiałów PDF (od teorii po arkusze
                  CKE) i quiz sprawdzający — w jednej ścieżce.
                </p>
                <div className="mt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
                  <BuyButton courseId={courseId} variant="gradient" size="lg">
                    Odblokuj ten dział · {SINGLE_COURSE_PRICE} zł
                  </BuyButton>
                  <BuyButton courseId="full_access" variant="outline" size="lg">
                    Odblokuj pełny kurs · {fullPrice} zł
                  </BuyButton>
                </div>
                {!user && (
                  <Button href="/login" variant="ghost" size="sm">
                    Mam już dostęp - zaloguj się
                  </Button>
                )}
              </div>
            </div>
          </Container>
        </section>
      </>
    );
  }

  // ---------- „Tutaj zacznij" — tylko lekcje tekstowe/wideo ----------
  if (isStart) {
    return (
      <>
        <AppHero
          title={
            <span className="flex items-center gap-3">
              <span className="text-4xl">{icon}</span> {title}
            </span>
          }
          subtitle="Zacznij tutaj - wprowadzenie do skutecznej nauki fizyki."
          breadcrumb={breadcrumb}
        />
        <section className="bg-cloud py-10 sm:py-14">
          <Container>
            {lessonsLoading ? (
              <p className="text-muted">Ładowanie…</p>
            ) : lessons.length === 0 ? (
              <EmptyCard>Lekcje pojawią się wkrótce.</EmptyCard>
            ) : (
              <div className="space-y-8">
                {hasVideo && (
                  <CourseVideo lessons={videoLessons} onOpenNotes={setSelected} />
                )}
                {textLessons.length > 0 && (
                  <LessonRows lessons={textLessons} onOpen={setSelected} />
                )}
              </div>
            )}
          </Container>
        </section>
      </>
    );
  }

  // ---------- Dział 1–16: jedna długa ścieżka ----------
  const navItems: { id: string; label: string; meta?: string; done?: boolean }[] =
    [
      ...(hasVideo
        ? [{ id: 'wideo', label: 'Lekcja wideo', done: allVideosDone }]
        : []),
      ...LEVELS.map((l) => {
        const isP1 = l.poziom === 1;
        const done = isP1
          ? p1Files.length > 0 && p1Done === p1Files.length
          : levels.has(l.poziom);
        return {
          id: `poziom-${l.poziom}`,
          label: l.title,
          meta: isP1 && p1Files.length ? `${p1Done}/${p1Files.length}` : undefined,
          done,
        };
      }),
      { id: 'quiz', label: 'Quiz sprawdzający' },
    ];

  return (
    <>
      <AppHero
        title={
          <span className="flex items-center gap-3">
            <span className="text-4xl">{icon}</span> {title}
          </span>
        }
        subtitle="Wideo, cztery poziomy materiałów i quiz — jedna ścieżka, krok po kroku."
        breadcrumb={breadcrumb}
      >
        {/* Postęp działu — w hero, żeby był widoczny od razu (także mobile) */}
        <div className="glass mt-7 max-w-md rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-200">
              Postęp działu
            </span>
            <span className="font-display text-lg font-extrabold text-white">
              {filesLoading ? '—' : `${pct}%`}
            </span>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#6b4df6,#a855f7,#f43f8f)] transition-[width] duration-700 ease-out"
              style={{ width: `${filesLoading ? 0 : pct}%` }}
            />
          </div>
          <p className="mt-2.5 text-sm text-slate-300/85">
            {filesLoading
              ? 'Wczytuję ścieżkę…'
              : allDone
                ? 'Cały dział przerobiony — czas na quiz.'
                : `${doneSteps} z ${totalSteps} kroków · wideo, każdy plik teorii i poziomy 2–4`}
          </p>
        </div>
      </AppHero>

      <section className="bg-cloud py-10 sm:py-14">
        <Container size="wide">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
            {/* Główna kolumna */}
            <div className="space-y-12 sm:space-y-14">
              {/* 1. Wideo */}
              {!lessonsLoading && (hasVideo || textLessons.length > 0) && (
                <section id="wideo" className="scroll-mt-28">
                  <SectionHead
                    icon={<IconPlay className="h-4 w-4" />}
                    eyebrow="Krok 1"
                    title="Obejrzyj lekcję"
                    desc="Cały dział wyjaśniony od zera. Możesz wracać do wideo w trakcie przerabiania materiałów."
                  />
                  <div className="mt-6 space-y-4">
                    {hasVideo && (
                      <CourseVideo
                        lessons={videoLessons}
                        watched={watched}
                        onToggleWatched={toggleWatched}
                        onOpenNotes={setSelected}
                      />
                    )}
                    {textLessons.length > 0 && (
                      <LessonRows lessons={textLessons} onOpen={setSelected} />
                    )}
                  </div>
                </section>
              )}

              {/* 2. Ścieżka materiałów */}
              <section className="scroll-mt-28">
                <SectionHead
                  icon={<IconBook className="h-4 w-4" />}
                  eyebrow={hasVideo ? 'Krok 2' : 'Krok 1'}
                  title="Przerób materiały"
                  desc="Cztery poziomy — od teorii, przez zadania dogrzewające i maturalne, aż po prawdziwe arkusze CKE. Odhaczaj, co masz za sobą."
                />
                <div className="mt-6">
                  <CoursePath
                    courseId={courseId}
                    hasAccess={access}
                    files={files}
                    filesLoading={filesLoading}
                    doneFiles={doneFiles}
                    doneLevels={levels}
                    onToggleFile={toggleFile}
                    onToggleLevel={toggleLevel}
                  />
                </div>
              </section>

              {/* 3. Quiz */}
              <section id="quiz" className="scroll-mt-28">
                <SectionHead
                  icon={<IconTarget className="h-4 w-4" />}
                  eyebrow="Na koniec"
                  title="Sprawdź się"
                  desc={
                    allDone
                      ? 'Ścieżka przerobiona w całości — teraz quiz pokaże, ile faktycznie zostało w głowie.'
                      : `Quiz jest dostępny od razu, ale najlepiej działa po materiałach — masz ${doneSteps} z ${totalSteps} kroków.`
                  }
                />
                <div className="mt-6">
                  <TaskRunner courseId={courseId} />
                </div>
              </section>
            </div>

            {/* Boczna nawigacja (desktop) */}
            <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
              <nav className="rounded-3xl border border-line bg-white p-3 shadow-soft">
                <p className="px-3 pb-2 pt-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
                  Twoja ścieżka
                </p>
                <ol className="space-y-0.5">
                  {navItems.map((it) => {
                    const active = activeSection === it.id;
                    return (
                      <li key={it.id}>
                        <a
                          href={`#${it.id}`}
                          className={cn(
                            'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-300',
                            active
                              ? 'bg-brand-50 text-brand-700'
                              : 'text-slate hover:bg-cloud hover:text-ink'
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-5 w-5 flex-none items-center justify-center rounded-full transition-all duration-300',
                              it.done
                                ? 'bg-[linear-gradient(135deg,#6b4df6,#f43f8f)] text-white'
                                : active
                                  ? 'bg-white text-transparent ring-2 ring-brand-400'
                                  : 'bg-white text-transparent ring-1 ring-line'
                            )}
                          >
                            <IconCheck className="h-3 w-3" strokeWidth={3} />
                          </span>
                          <span className="min-w-0 flex-1 truncate">{it.label}</span>
                          {it.meta && !it.done && (
                            <span className="flex-none text-xs font-bold text-muted">
                              {it.meta}
                            </span>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-2 border-t border-line px-3 pb-1 pt-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="uppercase tracking-[0.14em] text-muted">Postęp</span>
                    <span className="text-brand-700">{filesLoading ? '—' : `${pct}%`}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cloud">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#6b4df6,#f43f8f)] transition-[width] duration-700 ease-out"
                      style={{ width: `${filesLoading ? 0 : pct}%` }}
                    />
                  </div>
                </div>
              </nav>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}

// ---------- drobne elementy ----------

function SectionHead({
  icon,
  eyebrow,
  title,
  desc,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-500">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </span>
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-2xl font-extrabold text-ink sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{desc}</p>
    </div>
  );
}

function EmptyCard({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-line bg-white p-6 text-muted">
      {children}
    </p>
  );
}

/** Lekcje tekstowe (markdown bez wideo) jako minimalistyczne wiersze. */
function LessonRows({
  lessons,
  onOpen,
}: {
  lessons: Lesson[];
  onOpen: (l: Lesson) => void;
}) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
      {lessons.map((l) => (
        <li key={l.video_id}>
          <button
            onClick={() => onOpen(l)}
            className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-cloud sm:px-6"
          >
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-cloud text-slate transition-colors group-hover:bg-foam group-hover:text-brand-600">
              <IconBook className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-ink">
                {l.tytul_lekcji}
              </span>
              <span className="block text-xs text-muted">Lekcja do przeczytania</span>
            </span>
            <IconArrow className="h-4 w-4 flex-none text-muted transition-all group-hover:translate-x-0.5 group-hover:text-brand-600" />
          </button>
        </li>
      ))}
    </ul>
  );
}
