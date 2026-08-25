import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export function Eyebrow({
  children,
  className,
  dark = false,
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em]',
        dark
          ? 'bg-white/10 text-brand-200 ring-1 ring-white/15'
          : 'bg-brand-50 text-brand-600 ring-1 ring-brand-100',
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  dark = false,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className
      )}
    >
      {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          'text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold leading-[1.08] max-w-3xl',
          dark ? 'text-white' : 'text-ink'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'text-lg max-w-2xl',
            dark ? 'text-slate-300/80' : 'text-muted'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
