import Link from 'next/link';
import type { Course } from '@/lib/courses';
import { SINGLE_COURSE_PRICE } from '@/lib/courses';
import { BuyButton } from '@/components/shop/BuyButton';
import { cn } from '@/lib/cn';

/** Zakres działu: domyślnie zwinięty, rozwija się po kliknięciu. */
function Topics({ items, className }: { items: string[]; className?: string }) {
  if (!items.length) return null;
  return (
    <details
      className={cn(
        'group/details rounded-xl bg-cloud px-4 py-2.5 [&_summary::-webkit-details-marker]:hidden',
        className
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate">
        Zakres działu
        <svg
          className="h-4 w-4 text-muted transition-transform group-open/details:rotate-180"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z"
            clipRule="evenodd"
          />
        </svg>
      </summary>
      <ul className="mt-2.5 space-y-1.5 text-sm text-muted">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-400" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function CourseCard({
  course,
  showBuy = true,
}: {
  course: Course;
  /** false = tryb „program” (bez przycisku zakupu pojedynczego działu). */
  showBuy?: boolean;
}) {
  // Tryb „program" (landing) na telefonie jest kompaktowy: 2 karty w rzędzie,
  // ikona nad tytułem, zakres działu dopiero od sm. Tryb sklepowy (/dzialy)
  // zostaje w jednej kolumnie z pełną treścią.
  const compact = !showBuy;
  return (
    <article
      className={cn(
        'group flex h-full flex-col rounded-3xl border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-card',
        compact ? 'p-4 sm:p-6' : 'p-5 sm:p-6'
      )}
    >
      <div
        className={cn(
          'mb-4 flex gap-3',
          compact ? 'flex-col items-start sm:flex-row sm:items-center' : 'items-center'
        )}
      >
        <span
          className={cn(
            'flex flex-none items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f2efff,#ffe6f3)] shadow-inner ring-1 ring-brand-100',
            compact ? 'h-11 w-11 text-2xl sm:h-14 sm:w-14 sm:text-3xl' : 'h-14 w-14 text-3xl'
          )}
        >
          {course.icon}
        </span>
        <div className="min-w-0">
          <p className="text-[0.7rem] font-bold uppercase tracking-wider text-brand-500 sm:text-xs">
            Dział {course.id}
          </p>
          <h3
            className={cn(
              'font-extrabold leading-tight text-ink [overflow-wrap:anywhere]',
              compact ? 'text-[0.95rem] sm:text-lg' : 'text-lg'
            )}
          >
            {course.title}
          </h3>
        </div>
      </div>

      <div className="flex-1">
        <Topics items={course.topics} className={compact ? 'hidden sm:block' : undefined} />
      </div>

      <div className="mt-4 flex flex-col gap-2.5 sm:mt-5">
        <Link
          href={`/kurs/${course.id}`}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-brand-200 font-semibold text-brand-600 transition-all hover:border-brand-500 hover:bg-brand-50',
            compact ? 'px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm' : 'px-5 py-2.5 text-sm'
          )}
        >
          Zobacz lekcje
        </Link>
        {showBuy && (
          <BuyButton courseId={course.id} variant="gradient" size="sm">
            Kup dział · {SINGLE_COURSE_PRICE} zł
          </BuyButton>
        )}
      </div>
    </article>
  );
}
