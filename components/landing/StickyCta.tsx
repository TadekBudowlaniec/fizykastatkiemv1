'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

// Przyklejony pasek CTA na mobile — pojawia się po zescrollowaniu poniżej Hero.
// Zawsze widoczny przycisk zakupu na długim landingu = wyższa konwersja.
export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-[400] transition-transform duration-300 lg:hidden',
        show ? 'translate-y-0' : 'translate-y-[130%]'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-3 mb-3 flex items-center justify-between gap-3 rounded-2xl bg-navy-900/95 p-3 pl-4 shadow-glow ring-1 ring-white/10 backdrop-blur">
        <div className="min-w-0 text-white">
          <p className="text-sm font-bold leading-tight">Kurs Pełny</p>
          <p className="text-xs text-slate-300">od 828 zł · płatność jednorazowa</p>
        </div>
        <Link
          href="/cennik"
          className="whitespace-nowrap rounded-full bg-[linear-gradient(120deg,#6b4df6,#f43f8f)] px-5 py-3 text-sm font-bold text-white shadow-glow transition active:scale-95"
        >
          Zobacz kurs →
        </Link>
      </div>
    </div>
  );
}
