'use client';

import { useEffect, useState } from 'react';

const PROMO_MS = 60 * 60 * 1000; // 60 minut

export function PromoCountdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    let startedAt = Number(window.localStorage.getItem('promoStartedAt'));
    if (!startedAt || Number.isNaN(startedAt)) {
      startedAt = Date.now();
      window.localStorage.setItem('promoStartedAt', String(startedAt));
    }

    const tick = () => {
      const remaining = startedAt + PROMO_MS - Date.now();
      setLeft(remaining > 0 ? remaining : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (left === null) return null;

  const totalSec = Math.floor(left / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  const expired = left <= 0;

  return (
    <div className="mx-auto mt-6 inline-flex items-center gap-3 rounded-full border border-magenta-400/40 bg-magenta-500/10 px-6 py-3 backdrop-blur">
      <span className="text-sm font-semibold text-slate-200">
        {expired ? 'Promocja wygasła' : 'Oferta wygasa za:'}
      </span>
      {!expired && (
        <strong className="font-display text-2xl font-extrabold tabular-nums text-white">
          {mm}:{ss}
        </strong>
      )}
    </div>
  );
}
