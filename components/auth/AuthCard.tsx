import type { ReactNode } from 'react';

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#070b18,#0f1b36)] px-5 py-16">
      <div className="aurora left-[10%] top-[6%] h-72 w-72 bg-brand-600/40" />
      <div className="aurora bottom-[6%] right-[10%] h-72 w-72 bg-magenta-500/30" />
      <div className="relative w-full max-w-md">
        <div className="rounded-3xl bg-white p-8 shadow-glow sm:p-10">
          <h1 className="text-center font-display text-2xl font-extrabold text-ink sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-muted">{subtitle}</p>
          )}
          <div className="mt-7">{children}</div>
        </div>
        {footer && (
          <p className="mt-5 text-center text-sm text-slate-300/80">{footer}</p>
        )}
      </div>
    </section>
  );
}
