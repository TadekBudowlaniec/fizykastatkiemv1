import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export type Crumb = { label: string; href?: string };

export function PageHero({
  eyebrow,
  title,
  subtitle,
  crumbs,
  children,
  size = 'md',
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  crumbs?: Crumb[];
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const pad =
    size === 'lg'
      ? 'pt-16 pb-24 sm:pt-24 sm:pb-32'
      : size === 'sm'
        ? 'pt-12 pb-14 sm:pt-16 sm:pb-16'
        : 'pt-14 pb-20 sm:pt-20 sm:pb-24';
  return (
    <section
      className={cn(
        'relative overflow-hidden bg-[linear-gradient(160deg,#070b18,#0b1224_55%,#16223f)] text-white',
        pad
      )}
    >
      <div className="aurora left-[-6%] top-[-20%] h-72 w-72 bg-brand-600/45" />
      <div className="aurora right-[-4%] bottom-[-30%] h-72 w-72 bg-magenta-500/30" />
      <div className="bg-grid absolute inset-0" />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        {crumbs && crumbs.length > 0 && (
          <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-slate-400">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {c.href ? (
                  <Link href={c.href} className="hover:text-white">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-slate-300">{c.label}</span>
                )}
                {i < crumbs.length - 1 && (
                  <span className="text-slate-600">/</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-200 ring-1 ring-white/15">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-5 max-w-3xl font-display text-3xl font-extrabold leading-[1.08] sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg text-slate-300/85">{subtitle}</p>
        )}
        {children}
      </div>
    </section>
  );
}
