'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getLessons } from '@/lib/db';
import type { Lesson } from '@/lib/types';
import { getCourse } from '@/lib/courses';
import { AppHero } from '@/components/app/AppHero';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
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
  const { user, loading, hasAccessToCourse } = useAuth();
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

  if (loading) {
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

  // Brak dostępu (dla działów 1-16)
  if (!access) {
    return (
      <>
        <AppHero
          title={
            <span className="flex items-center gap-3">
              <span className="text-4xl">{icon}</span> {title}
            </span>
          }
          subtitle="Ten dział jest zablokowany. Odblokuj go w pakiecie albo pojedynczo."
          breadcrumb={breadcrumb}
        />
        <section className="bg-cloud py-14">
          <Container size="narrow">
            <div className="rounded-3xl border border-brand-100 bg-white p-8 text-center shadow-card">
              <p className="text-5xl">🔒</p>
              <h2 className="mt-3 text-2xl font-extrabold text-ink">
                Odblokuj dział „{title}”
              </h2>
              <p className="mx-auto mt-2 max-w-md text-muted">
                Zyskaj dostęp do lekcji wideo, PDF-ów w 3 etapach oraz zadań z
                rozwiązaniami. Kup cały pakiet lub ten dział osobno.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button href="/cennik" variant="gradient" size="lg">
                  Zobacz pakiety
                </Button>
                {!user && (
                  <Button href="/login" variant="outline" size="lg">
                    Mam już dostęp - zaloguj
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
          {/* Zakładki */}
          <div className="mb-8 inline-flex rounded-full border border-line bg-white p-1 shadow-soft">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'rounded-full px-5 py-2.5 text-sm font-semibold transition-all',
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
            <PdfEtapy courseId={courseId} hasAccess={access} />
          )}

          {tab === 'zadania' && !isStart && <TaskRunner courseId={courseId} />}
        </Container>
      </section>
    </>
  );
}
