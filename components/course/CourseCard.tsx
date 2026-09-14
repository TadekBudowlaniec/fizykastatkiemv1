import Link from 'next/link';
import type { Course } from '@/lib/courses';
import { SINGLE_COURSE_PRICE } from '@/lib/courses';
import { BuyButton } from '@/components/shop/BuyButton';

/** Zakres działu jako zwarty ciąg zagadnień rozdzielonych kropką. */
function Topics({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <p className="rounded-xl bg-cloud px-4 py-3 text-sm leading-relaxed text-slate">
      {items.map((it, i) => (
        <span key={it}>
          {i > 0 && (
            <span aria-hidden className="mx-1.5 font-bold text-brand-400">
              ·
            </span>
          )}
          {it}
        </span>
      ))}
    </p>
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
  return (
    <article className="group flex flex-col rounded-3xl border border-line bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-card">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f2efff,#ffe6f3)] text-3xl shadow-inner ring-1 ring-brand-100">
          {course.icon}
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-500">
            Dział {course.id}
          </p>
          <h3 className="text-lg font-extrabold leading-tight text-ink">
            {course.title}
          </h3>
        </div>
      </div>

      <div className="flex-1">
        <Topics items={course.topics} />
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        <Link
          href={`/kurs/${course.id}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-brand-200 px-5 py-2.5 text-sm font-semibold text-brand-600 transition-all hover:border-brand-500 hover:bg-brand-50"
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
