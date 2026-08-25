'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Renderuje zaufaną treść HTML (nasze pliki seo/content/*.json) i uruchamia
 * KaTeX auto-render dla delimiterów $$…$$ (display), \(…\) oraz $…$ (inline).
 *
 * Treść jest wstrzykiwana już na serwerze (SSG) — dzięki temu jest widoczna
 * dla robotów wyszukiwarek. KaTeX dokłada renderowanie wzorów po stronie klienta.
 */
export function MathContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('katex/contrib/auto-render');
        if (cancelled || !ref.current) return;
        mod.default(ref.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false,
        });
      } catch {
        /* KaTeX niedostępny — treść zostaje w formie tekstowej */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [html]);

  return (
    <div
      ref={ref}
      className={cn('prose-fs', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
