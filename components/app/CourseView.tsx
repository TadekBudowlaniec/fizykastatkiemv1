'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getLessons, getUserLevels, markLevel, unmarkLevel } from '@/lib/db';
import type { Lesson } from '@/lib/types';
import { getCourse, SINGLE_COURSE_PRICE, PLANS } from '@/lib/courses';
import { AppHero } from '@/components/app/AppHero';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { BuyButton } from '@/components/shop/BuyButton';
import { PdfEtapy } from '@/components/app/PdfEtapy';
import { TaskRunner } from '@/components/app/TaskRunner';
import { LessonView } from '@/components/app/LessonView';
import { cn } from '@/lib/cn';

type Tab = 'lekcje' | 'materialy' | 'zadania';

function lessonIcon(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('wideo') || t.includes('film')) return '🎬';
  if (t.includes('quiz') || t.includes('test') || t.includes('zadan')) return '🧩';
  if (t.includes('planer')) return '🧭';
  if (t.includes('wzor') || t.includes('teori')) return '📘';
  return '📗';
}

export function CourseView({ courseId }: { courseId: number }) {
  const { user, loading, accessLoading, hasAccessToCourse } = useAuth();
  const isStart = courseId === 0;
  const meta = getCourse(courseId);
  const title = isStart ? 'Tutaj zacznij' : meta?.title ?? 'Dział';
  const icon = isStart ? '🚀' : meta?.icon ?? '📗';

  const access = isStart || (!!user && hasAccessToCourse(courseId));

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [tab, setTab] = useState<Tab>('lekcje');
  const [lessonsLoading, setLessonsLoading] = useState(true);

  const loadLessons = useCallback(async () => {
    setLessonsLoading(true);
    try {
      const data = await getLessons(courseId);
      setLessons(data);
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

  // Postęp poziomów (Materiały PDF) — steruje odblokowaniem quizu (zadania).
  const [levels, setLevels] = useState<Set<number>>(new Set());

  const loadLevels = useCallback(async () => {
    if (!user?.id || isStart) return;
    try {
      const rows = await getUserLevels(user.id, courseId);
      setLevels(new Set(rows.map((r) => r.poziom)));
    } catch {
      setLevels(new Set());
    }
  }, [user?.id, isStart, courseId]);

  useEffect(() => {
    if (access && user?.id && !isStart) loadLevels();
  }, [access, user?.id, isStart, loadLevels]);

  const toggleLevel = useCallback(
    async (poziom: number, done: boolean) => {
      if (!user?.id) return;
      // Optymistycznie aktualizujemy UI, potem zapis.
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
        // cofnij przy błędzie
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

  const allLevelsDone = [1, 2, 3, 4].every((p) => levels.has(p));

  // Skrót do lekcji na YouTube (CEL 5) — pierwsze wideo działu.
  const ytId = lessons.find((l) => l.yt_id_wideo)?.yt_id_wideo ?? null;

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

  // Widok pojedynczej lekcji
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
    const modules = [
      { icon: '🎬', label: 'Lekcje wideo HD' },
      { icon: '📄', label: 'PDF-y: teoria, wzory, zadania (3 etapy)' },
      { icon: '🧩', label: 'Quizy sprawdzające' },
      { icon: '✅', label: 'Zadania z rozwiązaniami' },
    ];
    const scope = [...(meta?.basic ?? []), ...(meta?.extended ?? [])];

    return (
      <>
        <AppHero
          title={
            <span className="flex items-center gap-3">
              <span className="text-4xl">{icon}</span> {title}
            </span>
          }
          subtitle="Podgląd struktury działu — odblokuj dostęp, aby zacząć naukę."
          breadcrumb={breadcrumb}
        />
        <section className="bg-cloud py-12 sm:py-14">
          <Container size="wide">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-white shadow-card">
              {/* Podgląd struktury (rozmyty, nieinteraktywny) */}
              <div
                aria-hidden
                className="pointer-events-none select-none p-6 blur-[3px] sm:p-8"
              >
                {/* mock zakładek */}
                <div className="mb-8 inline-flex rounded-full border border-line bg-white p-1 shadow-soft">
                  {['Lekcje', 'Materiały PDF', 'Zadania'].map((t, i) => (
                    <span
                      key={t}
                      className={cn(
                        'rounded-full px-4 py-2.5 text-xs font-semibold sm:text-sm',
                        i === 0
                          ? 'bg-[linear-gradient(120deg,#6b4df6,#f43f8f)] text-white'
                          : 'text-muted'
                      )}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {modules.map((m) => (
                    <div
                      key={m.label}
                      className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft"
                    >
                      <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-brand-50 text-2xl">
                        {m.icon}
                      </span>
                      <span className="font-semibold text-ink">{m.label}</span>
                    </div>
                  ))}
                </div>
                {scope.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-bold uppercase tracking-wide text-muted">
                      W tym dziale przerobisz:
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {scope.slice(0, 10).map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-cloud px-3 py-1.5 text-sm text-slate ring-1 ring-line"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
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
                  Widzisz strukturę działu. Odblokuj, aby zobaczyć lekcje wideo,
                  PDF-y w 3 etapach i zadania z rozwiązaniami.
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

  const tabs: { key: Tab; label: string }[] = isStart
    ? [{ key: 'lekcje', label: 'Lekcje' }]
    : [
        { key: 'lekcje', label: 'Lekcje' },
        { key: 'materialy', label: 'Materiały PDF' },
        { key: 'zadania', label: 'Zadania' },
      ];

  return (
    <>
      <AppHero
        title={
          <span className="flex items-center gap-3">
            <span className="text-4xl">{icon}</span> {title}
          </span>
        }
        subtitle={
          isStart
            ? 'Zacznij tutaj - wprowadzenie do skutecznej nauki fizyki.'
            : 'Wideo, materiały PDF i zadania z rozwiązaniami w jednym miejscu.'
        }
        breadcrumb={breadcrumb}
      />

      <section className="bg-cloud py-12">
        <Container size="wide">
          {/* Skrót do wideo na YouTube — widoczny niezależnie od zakładki (CEL 5) */}
          {ytId && (
            <a
              href={`https://www.youtube.com/watch?v=${ytId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-6 flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-brand-50 text-2xl">
                ▶️
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">
                  Obejrzyj lekcję na YouTube
                </span>
                <span className="block text-sm text-muted">
                  Otwiera się w nowej karcie — odtwarzacz w zakładce „Lekcje” zostaje.
                </span>
              </span>
              <span className="flex-none font-bold text-brand-600">↗</span>
            </a>
          )}

          {/* Zakładki */}
          <div className="mb-8 inline-flex rounded-full border border-line bg-white p-1 shadow-soft">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-2.5 text-xs font-semibold transition-all sm:px-5 sm:text-sm',
                  tab === t.key
                    ? 'bg-[linear-gradient(120deg,#6b4df6,#f43f8f)] text-white shadow-soft'
                    : 'text-muted hover:text-brand-600'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'lekcje' && (
            <div>
              {lessonsLoading ? (
                <p className="text-muted">Ładowanie lekcji…</p>
              ) : lessons.length === 0 ? (
                <p className="rounded-2xl border border-line bg-white p-6 text-muted">
                  Lekcje do tego działu pojawią się wkrótce.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {lessons.map((l) => (
                    <button
                      key={l.video_id}
                      onClick={() => setSelected(l)}
                      className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
                    >
                      <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-brand-50 text-2xl">
                        {lessonIcon(l.tytul_lekcji)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-ink">
                          {l.tytul_lekcji}
                        </span>
                        <span className="text-sm text-brand-600 group-hover:text-magenta-600">
                          Otwórz →
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'materialy' && !isStart && (
            <PdfEtapy
              courseId={courseId}
              hasAccess={access}
              completed={levels}
              onToggleLevel={toggleLevel}
            />
          )}

          {tab === 'zadania' && !isStart && (
            <>
              {/* Miękki gating: quiz zawsze dostępny, tylko zalecenie gdy < 4/4. */}
              {!allLevelsDone && (
                <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-ink">
                    💡 Zalecamy ukończyć wszystkie 4 poziomy z tego działu przed
                    quizem — masz{' '}
                    <strong>
                      {[1, 2, 3, 4].filter((p) => levels.has(p)).length}/4
                    </strong>
                    . Quiz jest dostępny, ale najlepiej działa po materiałach.
                  </p>
                  <button
                    onClick={() => setTab('materialy')}
                    className="whitespace-nowrap rounded-full border-2 border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-white"
                  >
                    Dokończ poziomy →
                  </button>
                </div>
              )}
              <TaskRunner courseId={courseId} />
            </>
          )}
        </Container>
      </section>
    </>
  );
}
