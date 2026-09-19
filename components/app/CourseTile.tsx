'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import type { Course } from '@/lib/courses';
import { cn } from '@/lib/cn';

// Kafelek działu w panelu /kurs. Na telefonie 2 w rzędzie (ikona nad tytułem),
// od sm poziomo z większą ikoną.
export function CourseTile({ course }: { course: Course }) {
  const { user, hasAccessToCourse } = useAuth();
  const unlocked = !!user && hasAccessToCourse(course.id);

  return (
    <Link
      href={unlocked ? `/kurs/${course.id}` : `/cennik`}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-3.5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card sm:p-5',
        unlocked ? 'border-brand-200' : 'border-line'
      )}
    >
      <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <span
          className={cn(
            'flex h-10 w-10 flex-none items-center justify-center rounded-xl text-xl ring-1 sm:h-12 sm:w-12 sm:text-2xl',
            unlocked
              ? 'bg-[linear-gradient(135deg,#f2efff,#ffe6f3)] ring-brand-100'
              : 'bg-cloud ring-line grayscale'
          )}
        >
          {course.icon}
        </span>
        <div className="min-w-0">
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-brand-500 sm:text-[0.7rem]">
            Dział {course.id}
          </p>
          <h3 className="line-clamp-3 text-sm font-extrabold leading-tight text-ink [overflow-wrap:anywhere] sm:line-clamp-none sm:truncate sm:text-base">
            {course.title}
          </h3>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between pt-3 sm:pt-4">
        {unlocked ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 sm:text-sm">
            Otwórz lekcje →
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted sm:text-sm">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M10 1a4 4 0 0 0-4 4v2H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1V5a4 4 0 0 0-4-4Zm2 6V5a2 2 0 1 0-4 0v2h4Z"
                clipRule="evenodd"
              />
            </svg>
            Odblokuj
          </span>
        )}
      </div>

      {!unlocked && (
        <span className="absolute right-3 top-3 rounded-full bg-navy-900/5 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-muted">
          🔒
        </span>
      )}
    </Link>
  );
}
