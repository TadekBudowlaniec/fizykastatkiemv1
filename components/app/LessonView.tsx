'use client';

import type { Lesson } from '@/lib/types';
import { AppHero } from '@/components/app/AppHero';
import { Container } from '@/components/ui/Container';
import { MarkdownLesson } from '@/components/app/MarkdownLesson';

export function LessonView({
  lesson,
  onBack,
  courseTitle,
}: {
  lesson: Lesson;
  onBack: () => void;
  courseTitle: string;
}) {
  const hasVideo = !!lesson.yt_id_wideo;
  const hasText = !!lesson.content && lesson.content.trim().length > 0;

  return (
    <>
      <AppHero
        title={lesson.tytul_lekcji}
        subtitle={courseTitle}
        breadcrumb={[
          { label: 'Start', href: '/' },
          { label: 'Kurs', href: '/kurs' },
        ]}
      >
        <button
          onClick={onBack}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
        >
          ← Wróć do listy lekcji
        </button>
      </AppHero>

      <section className="bg-cloud py-12">
        <Container size="narrow">
          {hasVideo && (
            <div className="mb-8 overflow-hidden rounded-3xl bg-black shadow-card">
              <div className="relative aspect-video">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${lesson.yt_id_wideo}?rel=0&modestbranding=1`}
                  title={lesson.tytul_lekcji}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {hasText && (
            <article className="rounded-3xl border border-line bg-white p-7 shadow-soft sm:p-9">
              <MarkdownLesson content={lesson.content!} />
            </article>
          )}

          {!hasVideo && !hasText && (
            <p className="rounded-2xl border border-line bg-white p-6 text-muted">
              Ta lekcja nie ma jeszcze treści.
            </p>
          )}

          <div className="mt-8">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-magenta-600"
            >
              ← Wszystkie lekcje działu
            </button>
          </div>
        </Container>
      </section>
    </>
  );
}
