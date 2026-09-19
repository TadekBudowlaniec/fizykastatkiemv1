'use client';

import { useEffect, useState } from 'react';
import { nextExamDate } from '@/lib/planner';

// Prawdziwy, dynamiczny licznik tygodni do najbliższej matury z fizyki (19 maja).
// Liczony po stronie klienta (zależny od bieżącej daty) - brak sztucznego FOMO,
// brak zaszytej liczby. Renderuje się dopiero po hydracji, żeby nie było
// niezgodności SSR.
export function MaturaCountdown() {
  const [info, setInfo] = useState<{ weeks: number; year: number } | null>(null);

  useEffect(() => {
    const now = new Date();
    const exam = nextExamDate(now);
    const weeks = Math.max(
      0,
      Math.ceil((exam.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000))
    );
    setInfo({ weeks, year: exam.getFullYear() });
  }, []);

  if (!info) return null;

  return (
    <p className="mt-4 inline-flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm leading-snug text-slate-200 sm:items-center sm:rounded-full sm:py-1.5">
      <span aria-hidden>⏳</span>
      <span>
        Do matury z fizyki (19 maja {info.year}) zostało{' '}
        <strong className="whitespace-nowrap font-bold text-white">~{info.weeks} tyg.</strong>
      </span>
    </p>
  );
}
