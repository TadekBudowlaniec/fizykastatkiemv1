'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSupabaseBrowser } from '@/lib/supabase/client';
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
type LeadRow = {
  email: string;
  source: string;
  consent_marketing: boolean;
  status: string;
  seq_day_sent: number;
  created_at: string | null;
};
type LeadsData = {
  total: number;
  withConsent: number;
  last30d: number;
  unsubscribed: number;
  totalDays: number;
  totalSent: number;
  completed: number;
  byStage: number[];
  list: LeadRow[];
};
type Stats = {
  enrollments: {
    total: number;
    last30d: number;
    last7d: number;
    byCourse: { course_id: number; count: number }[];
    recent: Recent[];
  };
  leads: LeadsData | { error: string } | null;
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

const SOURCE_LABEL: Record<string, string> = {
  planer_squeeze: 'Planer',
  exit_intent: 'Exit-popup',
};

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

function fmtDay(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

// ── Ikony (inline SVG, bez zależności) ───────────────────────────────────────
type IconName = 'overview' | 'sales' | 'students' | 'mail' | 'refresh' | 'wallet' | 'check' | 'send';
function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  const p: Record<IconName, React.ReactNode> = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    sales: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-4 3 3 5-6" />
      </>
    ),
    students: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    mail: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 6L2 7" />
      </>
    ),
    refresh: (
      <>
        <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
        <path d="M21 3v5h-5" />
      </>
    ),
    wallet: (
      <>
        <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M16 12h.01" />
      </>
    ),
    check: (
      <>
        <path d="M20 6 9 17l-5-5" />
      </>
    ),
    send: (
      <>
        <path d="M22 2 11 13" />
        <path d="M22 2 15 22l-4-9-9-4z" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {p[name]}
    </svg>
  );
}

type Tone = 'brand' | 'green' | 'amber' | 'sky' | 'slate';
const TONES: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  sky: 'bg-sky-50 text-sky-600',
  slate: 'bg-slate-100 text-slate-600',
};

function StatTile({
  label,
  value,
  hint,
  icon,
  tone = 'brand',
}: {
  label: string;
  value: string;
  hint?: string;
  icon: IconName;
  tone?: Tone;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">
          {label}
        </p>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
          <Icon name={icon} className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

function SectionCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-line bg-white shadow-card ${className}`}>
      {children}
    </div>
  );
}

// Pasek postępu sekwencji: X/total wysłanych maili.
function SequenceProgress({ sent, total }: { sent: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-5 rounded-full ${i < sent ? 'bg-brand-500' : 'bg-line'}`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-ink">
        {sent}/{total}
      </span>
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

const NAV: { id: string; label: string; icon: IconName }[] = [
  { id: 'przeglad', label: 'Przegląd', icon: 'overview' },
  { id: 'sprzedaz', label: 'Sprzedaż', icon: 'sales' },
  { id: 'kursanci', label: 'Kursanci', icon: 'students' },
  { id: 'mailing', label: 'Sekwencja mailowa', icon: 'mail' },
];

export default function AdminPage() {
  const { user, loading, isAdmin, accessLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [q, setQ] = useState('');
  const [leadQ, setLeadQ] = useState('');
  const [active, setActive] = useState('przeglad');
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

  const gate = loading || accessLoading;
  const revenue = stats?.revenue;
  const hasRevenue = revenue && !('error' in revenue);
  const leads = stats?.leads;
  const hasLeads = leads && !('error' in leads);
  const leadsData = hasLeads ? (leads as LeadsData) : null;

  const filteredLeads = (leadsData?.list ?? []).filter((l) => {
    if (!leadQ.trim()) return true;
    return l.email.toLowerCase().includes(leadQ.trim().toLowerCase());
  });

  // Lejek: ilu leadów otrzymało co najmniej mail dnia N (kumulatywnie).
  const funnel =
    leadsData?.byStage && leadsData.byStage.length
      ? Array.from({ length: leadsData.totalDays }).map((_, i) => {
          const day = i + 1;
          const reached = leadsData.byStage
            .slice(day)
            .reduce((a, b) => a + b, 0);
          return { day, reached };
        })
      : [];
  const funnelMax = funnel.reduce((m, f) => Math.max(m, f.reached), 0) || 1;

  // --- Bramki dostępu (bez sidebara) ---
  if (gate) {
    return (
      <section className="min-h-[60vh] bg-cloud py-16">
        <Container size="wide">
          <p className="text-muted">Ładowanie…</p>
        </Container>
      </section>
    );
  }
  if (!user) {
    return (
      <section className="min-h-[60vh] bg-cloud py-16">
        <Container size="narrow">
          <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-card">
            <p className="text-lg font-bold text-ink">Musisz być zalogowany</p>
            <div className="mt-4 flex justify-center">
              <Button href="/login" variant="gradient">
                Zaloguj się
              </Button>
            </div>
          </div>
        </Container>
      </section>
    );
  }
  if (!isAdmin) {
    return (
      <section className="min-h-[60vh] bg-cloud py-16">
        <Container size="narrow">
          <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-card">
            <p className="text-lg font-bold text-ink">Brak dostępu</p>
            <p className="mt-1 text-muted">
              Ta strona jest dostępna tylko dla administratorów.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-cloud py-8 sm:py-10 [scroll-behavior:smooth]">
      <Container size="wide">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* ── Sidebar ── */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <div className="mb-4 flex items-center gap-2 px-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
                  <Icon name="overview" className="h-[18px] w-[18px]" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-extrabold text-ink">Panel admina</p>
                  <p className="text-[0.7rem] text-muted">FizykaStatkiem</p>
                </div>
              </div>

              <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                {NAV.map((n) => (
                  <a
                    key={n.id}
                    href={`#${n.id}`}
                    onClick={() => setActive(n.id)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      active === n.id
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-muted hover:bg-cloud hover:text-ink'
                    }`}
                  >
                    <Icon name={n.icon} className="h-[18px] w-[18px]" />
                    {n.label}
                  </a>
                ))}
              </nav>

              <div className="mt-4 border-t border-line pt-4">
                <button
                  onClick={load}
                  disabled={fetching}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-cloud disabled:opacity-60"
                >
                  <Icon name="refresh" className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
                  {fetching ? 'Odświeżanie…' : 'Odśwież'}
                </button>
                {stats && (
                  <p className="mt-2 px-1 text-[0.7rem] text-muted">
                    Aktualne na {fmtDate(stats.generatedAt)}
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* ── Main ── */}
          <div className="min-w-0 space-y-10">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Przegląd */}
            <div id="przeglad" className="scroll-mt-6">
              <h1 className="text-2xl font-extrabold tracking-tight text-ink">Przegląd</h1>
              <p className="mt-1 text-sm text-muted">
                Sprzedaż, dostępy i mailing w jednym miejscu.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatTile
                  icon="wallet"
                  tone="green"
                  label="Przychód (30 dni)"
                  value={hasRevenue ? fmtPln(revenue.last30dNet, revenue.currency) : '—'}
                  hint={
                    hasRevenue
                      ? `${revenue.last30dCount} transakcji`
                      : revenue && 'error' in revenue
                        ? 'Stripe niedostępny'
                        : undefined
                  }
                />
                <StatTile
                  icon="sales"
                  tone="brand"
                  label="Przychód (całość)"
                  value={hasRevenue ? fmtPln(revenue.totalNet, revenue.currency) : '—'}
                  hint="Netto po zwrotach"
                />
                <StatTile
                  icon="check"
                  tone="sky"
                  label="Dostępy (30 dni)"
                  value={stats ? String(stats.enrollments.last30d) : '—'}
                  hint={stats ? `7 dni: ${stats.enrollments.last7d}` : undefined}
                />
                <StatTile
                  icon="mail"
                  tone="amber"
                  label="Leady ze zgodą"
                  value={leadsData ? String(leadsData.withConsent) : '—'}
                  hint={leadsData ? `${leadsData.totalSent} maili wysłanych` : undefined}
                />
              </div>
            </div>

            {/* Sprzedaż */}
            <div id="sprzedaz" className="scroll-mt-6">
              <h2 className="text-xl font-extrabold tracking-tight text-ink">Sprzedaż</h2>
              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <SectionCard className="p-6">
                  <h3 className="mb-4 text-base font-bold text-ink">Dostępy wg działu</h3>
                  {stats && stats.enrollments.byCourse.length > 0 ? (
                    <ul className="divide-y divide-line">
                      {stats.enrollments.byCourse.map((b) => (
                        <li
                          key={b.course_id}
                          className="flex items-center justify-between py-2.5 text-sm"
                        >
                          <span className="truncate pr-3 text-ink">{courseName(b.course_id)}</span>
                          <span className="shrink-0 font-bold text-brand-600">{b.count}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">Brak danych.</p>
                  )}
                </SectionCard>

                <SectionCard className="p-6">
                  <h3 className="mb-4 text-base font-bold text-ink">Ostatnie dostępy</h3>
                  {stats && stats.enrollments.recent.length > 0 ? (
                    <ul className="divide-y divide-line">
                      {stats.enrollments.recent.map((r, i) => (
                        <li
                          key={`${r.user_id}-${r.course_id}-${i}`}
                          className="flex items-center justify-between gap-3 py-2.5 text-sm"
                        >
                          <span className="truncate text-ink">{courseName(r.course_id)}</span>
                          <span className="shrink-0 text-muted">{fmtDate(r.enrolled_at)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">Brak danych.</p>
                  )}
                </SectionCard>
              </div>
            </div>

            {/* Kursanci */}
            <div id="kursanci" className="scroll-mt-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-extrabold tracking-tight text-ink">
                  Kursanci
                  {usersData && (
                    <span className="ml-2 text-sm font-semibold text-muted">
                      {usersData.summary.total} kont · {usersData.summary.paying} z dostępem
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

              <SectionCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-cloud/50 text-xs uppercase tracking-wider text-muted">
                        <th className="px-5 py-3 font-bold">E-mail</th>
                        <th className="px-5 py-3 font-bold">Imię</th>
                        <th className="px-5 py-3 font-bold">Dostępy</th>
                        <th className="px-5 py-3 font-bold">Rejestracja</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.slice(0, 200).map((u) => (
                          <tr key={u.id} className="transition hover:bg-cloud/60">
                            <td className="px-5 py-3">
                              <span className="text-ink">{u.email}</span>
                              {u.is_admin && (
                                <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[0.7rem] font-bold text-brand-600">
                                  admin
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-muted">{u.full_name || '—'}</td>
                            <td className="px-5 py-3">
                              <span className={u.courses > 0 ? 'font-bold text-brand-600' : 'text-muted'}>
                                {u.courses}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-muted">{fmtDate(u.created_at)}</td>
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
              </SectionCard>
            </div>

            {/* Sekwencja mailowa */}
            <div id="mailing" className="scroll-mt-6">
              <h2 className="text-xl font-extrabold tracking-tight text-ink">Sekwencja mailowa</h2>
              <p className="mt-1 text-sm text-muted">
                5-dniowa sekwencja powitalna (Resend). „Wysłane" = maile już nadane do danego leada.
              </p>

              {!leadsData ? (
                <div className="mt-5 rounded-2xl border border-line bg-white p-6 text-muted shadow-card">
                  {leads && 'error' in leads
                    ? 'Brak dostępu do tabeli email_subscribers.'
                    : 'Brak danych o leadach.'}
                </div>
              ) : (
                <>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatTile
                      icon="mail"
                      tone="brand"
                      label="Leady łącznie"
                      value={String(leadsData.total)}
                      hint={`+${leadsData.last30d} w 30 dni`}
                    />
                    <StatTile
                      icon="send"
                      tone="sky"
                      label="Maili wysłanych"
                      value={String(leadsData.totalSent)}
                      hint="Suma z całej sekwencji"
                    />
                    <StatTile
                      icon="check"
                      tone="green"
                      label="Ukończyli 5/5"
                      value={String(leadsData.completed)}
                      hint="Cała sekwencja"
                    />
                    <StatTile
                      icon="students"
                      tone="amber"
                      label="Wypisani"
                      value={String(leadsData.unsubscribed)}
                    />
                  </div>

                  {/* Lejek dni */}
                  <SectionCard className="mt-6 p-6">
                    <h3 className="mb-4 text-base font-bold text-ink">
                      Zasięg sekwencji (ilu leadów dostało mail danego dnia)
                    </h3>
                    <ul className="space-y-2.5">
                      {funnel.map((f) => (
                        <li key={f.day} className="flex items-center gap-3 text-sm">
                          <span className="w-16 shrink-0 font-semibold text-ink">Dzień {f.day}</span>
                          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cloud">
                            <div
                              className="h-full rounded-full bg-brand-500 transition-all"
                              style={{ width: `${(f.reached / funnelMax) * 100}%` }}
                            />
                          </div>
                          <span className="w-10 shrink-0 text-right font-bold text-ink">
                            {f.reached}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </SectionCard>

                  {/* Tabela leadów */}
                  <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-ink">
                      Leady w sekwencji
                      <span className="ml-2 text-sm font-semibold text-muted">
                        {filteredLeads.length}
                        {leadsData.list.length >= 500 ? ' (ostatnie 500)' : ''}
                      </span>
                    </h3>
                    <input
                      value={leadQ}
                      onChange={(e) => setLeadQ(e.target.value)}
                      placeholder="Szukaj po e-mailu"
                      className="w-full max-w-xs rounded-full border border-line bg-white px-4 py-2 text-sm text-ink shadow-soft focus:border-brand-400 focus:outline-none"
                    />
                  </div>

                  <SectionCard className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-line bg-cloud/50 text-xs uppercase tracking-wider text-muted">
                            <th className="px-5 py-3 font-bold">E-mail</th>
                            <th className="px-5 py-3 font-bold">Źródło</th>
                            <th className="px-5 py-3 font-bold">Zgoda</th>
                            <th className="px-5 py-3 font-bold">Postęp (wysłane)</th>
                            <th className="px-5 py-3 font-bold">Status</th>
                            <th className="px-5 py-3 font-bold">Zapis</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {filteredLeads.length > 0 ? (
                            filteredLeads.map((l) => {
                              const unsub = l.status === 'unsubscribed';
                              return (
                                <tr key={l.email} className="transition hover:bg-cloud/60">
                                  <td className="px-5 py-3 text-ink">{l.email}</td>
                                  <td className="px-5 py-3">
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.7rem] font-semibold text-slate-600">
                                      {SOURCE_LABEL[l.source] || l.source}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3">
                                    {l.consent_marketing ? (
                                      <span className="text-emerald-600" title="Zgoda marketingowa">
                                        ✓ tak
                                      </span>
                                    ) : (
                                      <span className="text-muted" title="Brak zgody — nie dostaje maili">
                                        — nie
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3">
                                    {l.consent_marketing && !unsub ? (
                                      <SequenceProgress sent={l.seq_day_sent} total={leadsData.totalDays} />
                                    ) : (
                                      <span className="text-xs text-muted">—</span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3">
                                    {unsub ? (
                                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[0.7rem] font-bold text-red-600">
                                        wypisany
                                      </span>
                                    ) : l.consent_marketing && l.seq_day_sent >= leadsData.totalDays ? (
                                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.7rem] font-bold text-emerald-600">
                                        ukończona
                                      </span>
                                    ) : l.consent_marketing ? (
                                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[0.7rem] font-bold text-brand-600">
                                        w trakcie
                                      </span>
                                    ) : (
                                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.7rem] font-bold text-slate-500">
                                        tylko planer
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3 text-muted">{fmtDay(l.created_at)}</td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-5 py-6 text-center text-muted">
                                Brak leadów.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </SectionCard>
                </>
              )}

              {/* Ruch na stronie */}
              <div className="mt-6 rounded-2xl border border-dashed border-line bg-white/60 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  Ruch na stronie
                </p>
                <h3 className="mt-1 text-base font-bold text-ink">Statystyki wejść</h3>
                <p className="mt-1 text-sm text-muted">
                  Wejścia, źródła i sesje śledzi GA4 — najlepsze narzędzie do ruchu.
                </p>
                <div className="mt-3">
                  <Button href="https://analytics.google.com/" variant="outline" size="sm">
                    Otwórz GA4 →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
