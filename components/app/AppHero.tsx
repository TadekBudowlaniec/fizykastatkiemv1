import Link from 'next/link';
import type { ReactNode } from 'react';

export function AppHero({
  title,
  subtitle,
  breadcrumb,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumb?: { label: string; href: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(160deg,#070b18,#0f1b36)] text-white">
      <div className="aurora left-[-6%] top-[-40%] h-72 w-72 bg-brand-600/45" />
      <div className="aurora right-[-4%] bottom-[-50%] h-72 w-72 bg-magenta-500/30" />
      <div className="bg-grid absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        {breadcrumb && (
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-slate-400">
            {breadcrumb.map((b, i) => (
              <span key={b.href} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-slate-600">/</span>}
                <Link href={b.href} className="hover:text-white">
                  {b.label}
                </Link>
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-lg text-slate-300/85">{subtitle}</p>
        )}
        {children}
      </div>
    </section>
  );
}
