import Link from 'next/link';
import type { Course } from '@/lib/courses';
import { SINGLE_COURSE_PRICE } from '@/lib/courses';
import { BuyButton } from '@/components/shop/BuyButton';

function Scope({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <details className="group/details rounded-xl bg-cloud px-4 py-2.5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate">
        {label}
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

export function CourseCard({ course }: { course: Course }) {
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

      <div className="flex-1 space-y-2">
        <Scope label="Zakres podstawowy" items={course.basic} />
        <Scope label="Zakres rozszerzony" items={course.extended} />
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        <Link
          href={`/kurs/${course.id}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-brand-200 px-5 py-2.5 text-sm font-semibold text-brand-600 transition-all hover:border-brand-500 hover:bg-brand-50"
        >
          Zobacz lekcje
        </Link>
        <BuyButton courseId={course.id} variant="gradient" size="sm">
          Kup dział · {SINGLE_COURSE_PRICE} zł
        </BuyButton>
      </div>
    </article>
  );
}
