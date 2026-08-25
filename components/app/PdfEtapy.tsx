'use client';

import { useState } from 'react';
import { getSecurePdfUrl } from '@/lib/db';

const ETAPY = [
  { n: 1, label: 'Etap 1', desc: 'Teoria i podstawowe wzory' },
  { n: 2, label: 'Etap 2', desc: 'Zadania z rozwiązaniami' },
  { n: 3, label: 'Etap 3', desc: 'Poziom rozszerzony i arkusze' },
];

export function PdfEtapy({
  courseId,
  hasAccess,
}: {
  courseId: number;
  hasAccess: boolean;
}) {
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const open = async (etap: number) => {
    if (!hasAccess) return;
    setLoading(etap);
    setError(null);
    try {
      const url = await getSecurePdfUrl(courseId, etap);
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd pobierania PDF.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {ETAPY.map((e) => (
          <div
            key={e.n}
            className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-soft"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-xl">
                📄
              </span>
              <div>
                <p className="font-extrabold text-ink">{e.label}</p>
                <p className="text-xs text-muted">{e.desc}</p>
              </div>
            </div>
            <button
              onClick={() => open(e.n)}
              disabled={!hasAccess || loading === e.n}
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-[linear-gradient(120deg,#6b4df6,#f43f8f)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {!hasAccess
                ? '🔒 Po zakupie'
                : loading === e.n
                  ? 'Otwieram…'
                  : 'Pobierz PDF'}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-magenta-600">{error}</p>}
    </div>
  );
}
