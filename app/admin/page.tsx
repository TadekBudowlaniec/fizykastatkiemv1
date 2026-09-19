'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { AppHero } from '@/components/app/AppHero';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { COURSES } from '@/lib/courses';

type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  courses: number;
  created_at: string | null;
};
type UsersResponse = {
  users: AdminUser[];
  summary: { total: number; paying: number };
  generatedAt: string;
};

type Recent = { user_id: string; course_id: number; enrolled_at: string | null };
type Stats = {
  enrollments: {
    total: number;
    last30d: number;
    last7d: number;
    byCourse: { course_id: number; count: number }[];
    recent: Recent[];
  };
  leads:
    | { total: number; withConsent: number; last30d: number; unsubscribed: number }
    | { error: string }
    | null;
  revenue:
    | { currency: string; totalNet: number; last30dNet: number; last30dCount: number }
    | { error: string }
    | null;
  generatedAt: string;
};

const COURSE_NAME = new Map<number, string>([
  ...COURSES.map((c) => [c.id, c.title] as [number, string]),
  [17, 'Wszystkie materiały (pełny dostęp)'],
]);

function courseName(id: number): string {
  return COURSE_NAME.get(id) ?? `Dział #${id}`;
}

function fmtPln(v: number, currency = 'PLN'): string {
  try {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `${v} ${currency}`;
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-card">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-2 text-3xl font-extrabold text-ink">{value}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

async function postAdmin<T>(path: string): Promise<T> {
  const supabase = getSupabaseBrowser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Brak sesji.');
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Błąd ${res.status}`);
  }
  return (await res.json()) as T;
}

export default function AdminPage() {
  const { user, loading, isAdmin, accessLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  const load = useCallback(async () => {
    setFetching(true);
    setError(null);
    const [s, u] = await Promise.allSettled([
      postAdmin<Stats>('/.netlify/functions/admin-stats'),
      postAdmin<UsersResponse>('/.netlify/functions/admin-users'),
    ]);
    if (s.status === 'fulfilled') setStats(s.value);
    if (u.status === 'fulfilled') setUsersData(u.value);
    if (s.status === 'rejected' && u.status === 'rejected') {
      setError(
        s.reason instanceof Error ? s.reason.message : 'Nie udało się wczytać danych.'
      );
    }
    setFetching(false);
  }, []);

  useEffect(() => {
    if (user && isAdmin) load();
  }, [user, isAdmin, load]);

  const filteredUsers = (usersData?.users ?? []).filter((u) => {
    if (!q.trim()) return true;
    const needle = q.trim().toLowerCase();
    return (
      u.email.toLowerCase().includes(needle) ||
      (u.full_name ?? '').toLowerCase().includes(needle)
    );
  });

  // --- Bramka dostępu ---
  const gate = loading || accessLoading;
  const revenue = stats?.revenue;
  const hasRevenue = revenue && !('error' in revenue);
  const leads = stats?.leads;
  const hasLeads = leads && !('error' in leads);

  return (
    <>
      <AppHero
        title="Panel admina"
        subtitle="Sprzedaż, dostępy i — wkrótce — leady oraz mailing."
        breadcrumb={[
          { label: 'Start', href: '/' },
          { label: 'Admin', href: '/admin' },
        ]}
      />

      <section className="bg-cloud py-14">
        <Container size="wide">
          {gate ? (
            <p className="text-muted">Ładowanie…</p>
          ) : !user ? (
            <div className="rounded-3xl border border-line bg-white p-8 text-center shadow-card">
              <p className="text-lg font-bold text-ink">Musisz być zalogowany</p>
              <div className="mt-4 flex justify-center">
                <Button href="/login" variant="gradient">
                  Zaloguj się
                </Button>
              </div>
            </div>
          ) : !isAdmin ? (
            <div className="rounded-3xl border border-line bg-white p-8 text-center shadow-card">
              <p className="text-lg font-bold text-ink">Brak dostępu</p>
              <p className="mt-1 text-muted">
                Ta strona jest dostępna tylko dla administratorów.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-xl font-extrabold text-ink">Sprzedaż</h2>
                <button
                  onClick={load}
                  disabled={fetching}
                  className="cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-card disabled:opacity-60"
                >
                  {fetching ? 'Odświeżanie…' : 'Odśwież'}
                </button>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Kafelki */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile
                  label="Przychód (30 dni)"
                  value={
                    hasRevenue ? fmtPln(revenue.last30dNet, revenue.currency) : '—'
                  }
                  hint={
                    hasRevenue
                      ? `${revenue.last30dCount} transakcji`
                      : revenue && 'error' in revenue
                        ? 'Stripe niedostępny'
                        : undefined
                  }
                />
                <StatTile
                  label="Przychód (całość)"
                  value={hasRevenue ? fmtPln(revenue.totalNet, revenue.currency) : '—'}
                  hint="Netto po zwrotach (Stripe)"
                />
                <StatTile
                  label="Nadane dostępy (30 dni)"
                  value={stats ? String(stats.enrollments.last30d) : '—'}
                  hint={stats ? `7 dni: ${stats.enrollments.last7d}` : undefined}
                />
                <StatTile
                  label="Dostępy łącznie"
                  value={stats ? String(stats.enrollments.total) : '—'}
                  hint="Wiersze enrollments"
                />
              </div>

              {/* Podział wg działu + ostatnie */}
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-line bg-white p-6 shadow-card">
                  <h3 className="mb-4 text-lg font-bold text-ink">
                    Dostępy wg działu
                  </h3>
                  {stats && stats.enrollments.byCourse.length > 0 ? (
                    <ul className="divide-y divide-line">
                      {stats.enrollments.byCourse.map((b) => (
                        <li
                          key={b.course_id}
                          className="flex items-center justify-between py-2.5 text-sm"
                        >
                          <span className="text-ink">{courseName(b.course_id)}</span>
                          <span className="font-bold text-brand-600">{b.count}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">Brak danych.</p>
                  )}
                </div>

                <div className="rounded-3xl border border-line bg-white p-6 shadow-card">
                  <h3 className="mb-4 text-lg font-bold text-ink">
                    Ostatnie dostępy
                  </h3>
                  {stats && stats.enrollments.recent.length > 0 ? (
                    <ul className="divide-y divide-line">
                      {stats.enrollments.recent.map((r, i) => (
                        <li
                          key={`${r.user_id}-${r.course_id}-${i}`}
                          className="flex items-center justify-between gap-3 py-2.5 text-sm"
                        >
                          <span className="truncate text-ink">
                            {courseName(r.course_id)}
                          </span>
                          <span className="shrink-0 text-muted">
                            {fmtDate(r.enrolled_at)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">Brak danych.</p>
                  )}
                </div>
              </div>

              {/* Kursanci */}
              <div className="mt-10 mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-extrabold text-ink">
                  Kursanci
                  {usersData && (
                    <span className="ml-2 text-sm font-semibold text-muted">
                      {usersData.summary.total} kont · {usersData.summary.paying} z
                      dostępem
                    </span>
                  )}
                </h2>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Szukaj: e-mail lub imię"
                  className="w-full max-w-xs rounded-full border border-line bg-white px-4 py-2 text-sm text-ink shadow-soft focus:border-brand-400 focus:outline-none"
                />
              </div>

              <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
                        <th className="px-5 py-3 font-bold">E-mail</th>
                        <th className="px-5 py-3 font-bold">Imię</th>
                        <th className="px-5 py-3 font-bold">Dostępy</th>
                        <th className="px-5 py-3 font-bold">Rejestracja</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.slice(0, 200).map((u) => (
                          <tr key={u.id} className="hover:bg-cloud/60">
                            <td className="px-5 py-3">
                              <span className="text-ink">{u.email}</span>
                              {u.is_admin && (
                                <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[0.7rem] font-bold text-brand-600">
                                  admin
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-muted">
                              {u.full_name || '—'}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={
                                  u.courses > 0
                                    ? 'font-bold text-brand-600'
                                    : 'text-muted'
                                }
                              >
                                {u.courses}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-muted">
                              {fmtDate(u.created_at)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-5 py-6 text-center text-muted">
                            {usersData ? 'Brak wyników.' : 'Ładowanie…'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length > 200 && (
                  <p className="border-t border-line px-5 py-3 text-xs text-muted">
                    Pokazano pierwsze 200 z {filteredUsers.length}. Zawęź wyszukiwanie.
                  </p>
                )}
              </div>

              {/* Leady i mailing */}
              <h2 className="mt-10 mb-4 text-xl font-extrabold text-ink">
                Leady i mailing
              </h2>
              {hasLeads ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatTile label="Leady łącznie" value={String(leads.total)} />
                  <StatTile
                    label="Ze zgodą (do Brevo)"
                    value={String(leads.withConsent)}
                    hint="Trafiają do sekwencji"
                  />
                  <StatTile
                    label="Nowe leady (30 dni)"
                    value={String(leads.last30d)}
                  />
                  <StatTile
                    label="Wypisani"
                    value={String(leads.unsubscribed)}
                  />
                </div>
              ) : (
                <div className="rounded-3xl border border-line bg-white p-6 text-muted shadow-card">
                  {leads && 'error' in leads
                    ? 'Brak dostępu do tabeli email_subscribers.'
                    : 'Brak danych o leadach.'}
                </div>
              )}

              {/* Ruch na stronie */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-dashed border-line bg-white/60 p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">
                    Ruch na stronie
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-ink">Statystyki wejść</h3>
                  <p className="mt-1 text-sm text-muted">
                    Wejścia, źródła i sesje śledzi GA4 — najlepsze narzędzie do ruchu.
                  </p>
                  <div className="mt-3">
                    <Button
                      href="https://analytics.google.com/"
                      variant="outline"
                      size="sm"
                    >
                      Otwórz GA4 →
                    </Button>
                  </div>
                </div>
              </div>

              {stats && (
                <p className="mt-6 text-xs text-muted">
                  Zaktualizowano: {fmtDate(stats.generatedAt)}
                </p>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  );
}
