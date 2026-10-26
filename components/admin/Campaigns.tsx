'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { postAdmin } from '@/components/admin/adminApi';
import { cn } from '@/lib/cn';

/**
 * Sekcja „Kampanie" w panelu admina: podgląd maila z kodu, test na siebie,
 * liczenie odbiorców, wysyłka teraz albo na zaplanowaną datę, historia zleceń.
 * Backend: netlify/functions/admin-campaigns.js (wszystko po bramce is_admin).
 */

type Campaign = { slug: string; subject: string; preheader: string; ctaLabel: string; ctaUrl: string };
type RunStatus = 'scheduled' | 'queued' | 'running' | 'done' | 'failed' | 'cancelled';
/** Powody pominięcia + wielkość puli. Stare zlecenia (sprzed kont) nie mają leads/accounts. */
type Skipped = {
  total: number;
  leads?: number;
  accounts?: number;
  alreadySent: number;
  buyers: number;
  unfinished: number;
};
type Run = {
  id: string;
  campaign: string;
  scheduled_at: string;
  skip_unfinished: boolean;
  include_accounts?: boolean;
  status: RunStatus;
  created_at: string;
  created_by: string | null;
  started_at: string | null;
  finished_at: string | null;
  sent: number;
  failed: number;
  remaining: number;
  skipped: Skipped | null;
  error: string | null;
};
type Overview = {
  campaigns: Campaign[];
  runs: Run[];
  daysToMatura: number;
  cronSecretSet: boolean;
  adminEmail: string | null;
  now: string;
};
type Count = {
  willSend: number;
  bySource: { lead: number; account: number };
  skipped: Skipped;
  sample: string[];
};

const ENDPOINT = '/.netlify/functions/admin-campaigns';
const OPEN: RunStatus[] = ['scheduled', 'queued', 'running'];

const STATUS_LABEL: Record<RunStatus, string> = {
  scheduled: 'Zaplanowana',
  queued: 'Startuje',
  running: 'Wysyła się',
  done: 'Wysłana',
  failed: 'Błąd',
  cancelled: 'Odwołana',
};
const STATUS_TONE: Record<RunStatus, string> = {
  scheduled: 'bg-brand-50 text-brand-700',
  queued: 'bg-amber-50 text-amber-700',
  running: 'bg-amber-50 text-amber-700',
  done: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-600',
  cancelled: 'bg-slate-100 text-slate-500',
};

function fmt(iso: string | null | undefined): string {
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

/** Wartość dla <input type="datetime-local"> w czasie lokalnym przeglądarki. */
function toLocalInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function defaultSchedule(): string {
  // Jutro o 17:00 czasu lokalnego - sensowny punkt startu do edycji.
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(17, 0, 0, 0);
  return toLocalInput(d);
}

const BTN =
  'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
const BTN_OUTLINE = cn(BTN, 'border-2 border-brand-500 text-brand-600 hover:bg-brand-500 hover:text-white');
const BTN_GHOST = cn(BTN, 'bg-cloud text-slate hover:bg-brand-50 hover:text-brand-700');
const BTN_PRIMARY = cn(BTN, 'bg-brand-500 text-white hover:bg-brand-600');
const BTN_DANGER = cn(BTN, 'bg-red-50 text-red-600 hover:bg-red-100');

function StatusChip({ status }: { status: RunStatus }) {
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', STATUS_TONE[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function PreviewModal({
  subject,
  preheader,
  html,
  onClose,
}: {
  subject: string;
  preheader: string;
  html: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-navy-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Podgląd maila"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-card sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Temat</p>
            <p className="text-base font-extrabold text-ink">{subject}</p>
            <p className="mt-1 text-xs text-muted">Preheader: {preheader}</p>
          </div>
          <button type="button" onClick={onClose} className={cn(BTN_GHOST, 'shrink-0 px-3 py-1.5 text-xs')}>
            Zamknij
          </button>
        </div>
        <iframe
          title="Podgląd maila"
          srcDoc={html}
          sandbox=""
          className="h-[70vh] w-full bg-white"
        />
      </div>
    </div>
  );
}

export function Campaigns() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>('');
  const [skipUnfinished, setSkipUnfinished] = useState(true);
  const [includeAccounts, setIncludeAccounts] = useState(true);
  const [count, setCount] = useState<Count | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  const [preview, setPreview] = useState<{ subject: string; preheader: string; html: string } | null>(null);
  const [when, setWhen] = useState<string>(defaultSchedule);
  const [confirmNow, setConfirmNow] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await postAdmin<Overview>(ENDPOINT, { action: 'overview' });
      setData(d);
      setError(null);
      setSlug((s) => s || (d.campaigns[0] ? d.campaigns[0].slug : ''));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się wczytać kampanii.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Gdy coś się wysyła, odświeżamy historię co 15 s, żeby widzieć wynik.
  const hasOpen = !!data?.runs.some((r) => OPEN.includes(r.status));
  const loadRef = useRef(load);
  loadRef.current = load;
  useEffect(() => {
    if (!hasOpen) return;
    const id = window.setInterval(() => loadRef.current(), 15000);
    return () => window.clearInterval(id);
  }, [hasOpen]);

  // Zmiana kampanii/opcji unieważnia policzonych odbiorców.
  useEffect(() => {
    setCount(null);
    setConfirmNow(false);
  }, [slug, skipUnfinished, includeAccounts]);

  const campaign = data?.campaigns.find((c) => c.slug === slug) || null;
  const openRun = data?.runs.find((r) => r.campaign === slug && OPEN.includes(r.status)) || null;

  async function run<T>(key: string, fn: () => Promise<T>, onOk?: (r: T) => void) {
    setBusy(key);
    setNotice(null);
    try {
      const r = await fn();
      onOk?.(r);
    } catch (e) {
      setNotice({ tone: 'err', text: e instanceof Error ? e.message : 'Błąd.' });
    } finally {
      setBusy(null);
    }
  }

  const doPreview = () =>
    run('preview', () => postAdmin<{ subject: string; preheader: string; html: string }>(ENDPOINT, { action: 'preview', slug }), setPreview);

  const doTest = () =>
    run(
      'test',
      () => postAdmin<{ to: string; subject: string }>(ENDPOINT, { action: 'test', slug }),
      (r) => setNotice({ tone: 'ok', text: `Mail testowy poszedł na ${r.to}. Sprawdź skrzynkę (także „Oferty" i spam).` })
    );

  const doCount = () =>
    run('count', () => postAdmin<Count>(ENDPOINT, { action: 'count', slug, skipUnfinished, includeAccounts }), setCount);

  const doSchedule = () =>
    run(
      'schedule',
      () =>
        postAdmin<{ runs: Run[]; run: Run }>(ENDPOINT, {
          action: 'schedule',
          slug,
          skipUnfinished,
          includeAccounts,
          scheduledAt: new Date(when).toISOString(),
        }),
      (r) => {
        setData((d) => (d ? { ...d, runs: r.runs } : d));
        setNotice({ tone: 'ok', text: `Zaplanowano na ${fmt(r.run.scheduled_at)}. Wysyłka ruszy do 5 minut po tej godzinie.` });
      }
    );

  const doSendNow = () =>
    run(
      'sendNow',
      () => postAdmin<{ runs: Run[] }>(ENDPOINT, { action: 'sendNow', slug, skipUnfinished, includeAccounts }),
      (r) => {
        setData((d) => (d ? { ...d, runs: r.runs } : d));
        setConfirmNow(false);
        setNotice({ tone: 'ok', text: 'Wysyłka ruszyła w tle. Wynik pojawi się w historii poniżej i jako push.' });
      }
    );

  const doCancel = (runId: string) =>
    run(
      `cancel-${runId}`,
      () => postAdmin<{ runs: Run[] }>(ENDPOINT, { action: 'cancel', runId }),
      (r) => {
        setData((d) => (d ? { ...d, runs: r.runs } : d));
        setNotice({ tone: 'ok', text: 'Zlecenie odwołane.' });
      }
    );

  if (error) {
    return (
      <div className="mt-5 rounded-2xl border border-line bg-white p-5 text-sm text-red-600 shadow-card sm:p-6">
        {error}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="mt-5 rounded-2xl border border-line bg-white p-5 text-sm text-muted shadow-card sm:p-6">
        Ładowanie kampanii…
      </div>
    );
  }

  return (
    <>
      {!data.cronSecretSet && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          W Netlify brakuje zmiennej CRON_SECRET. Bez niej panel nie uruchomi wysyłki.
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-6 lg:grid-cols-5">
        {/* Lewa kolumna: wybór kampanii i akcje */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6 lg:col-span-3">
          <h3 className="mb-3 text-base font-bold text-ink">Kampania</h3>
          <div className="space-y-2">
            {data.campaigns.map((c) => (
              <label
                key={c.slug}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition',
                  c.slug === slug ? 'border-brand-500 bg-brand-50/50' : 'border-line hover:bg-cloud/60'
                )}
              >
                <input
                  type="radio"
                  name="campaign"
                  className="mt-1 accent-brand-500"
                  checked={c.slug === slug}
                  onChange={() => setSlug(c.slug)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{c.subject}</span>
                  <span className="block text-xs text-muted">{c.preheader}</span>
                  <span className="mt-1 block text-[0.7rem] text-muted">
                    slug: <code>{c.slug}</code> · CTA „{c.ctaLabel}"
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            Treść maili jest w kodzie (CAMPAIGNS w mailer.js). Dni do matury w temacie liczą się w dniu
            wysyłki, dziś: {data.daysToMatura}.
          </p>

          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted">Odbiorcy</p>
          <p className="mt-1 text-xs text-muted">
            Mail idzie tylko do osób bez dostępu do żadnego kursu. Kursanci z wykupionym dostępem są
            pomijani zawsze.
          </p>
          <label className="mt-3 flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="mt-1 accent-brand-500"
              checked={includeAccounts}
              onChange={(e) => setIncludeAccounts(e.target.checked)}
            />
            <span>
              Dołącz konta bez kursu
              <span className="block text-xs text-muted">
                Zarejestrowani na platformie, którzy nic nie kupili i nie ma ich w bazie leadów.
                Bez tej opcji wysyłamy tylko do leadów ze zgodą (zapis po planer / exit-popup).
              </span>
            </span>
          </label>
          <label className="mt-3 flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="mt-1 accent-brand-500"
              checked={skipUnfinished}
              onChange={(e) => setSkipUnfinished(e.target.checked)}
            />
            <span>
              Pomiń leady w trakcie sekwencji powitalnej
              <span className="block text-xs text-muted">
                Żeby nikt nie dostał dwóch maili jednego dnia. Dotyczy tylko leadów z bazy mailingowej.
              </span>
            </span>
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={BTN_GHOST} disabled={!campaign || !!busy} onClick={doPreview}>
              {busy === 'preview' ? 'Ładuję…' : 'Podgląd maila'}
            </button>
            <button type="button" className={BTN_GHOST} disabled={!campaign || !!busy} onClick={doTest}>
              {busy === 'test' ? 'Wysyłam…' : `Test do mnie${data.adminEmail ? ` (${data.adminEmail})` : ''}`}
            </button>
            <button type="button" className={BTN_OUTLINE} disabled={!campaign || !!busy} onClick={doCount}>
              {busy === 'count' ? 'Liczę…' : 'Policz odbiorców'}
            </button>
          </div>

          {count && (
            <div className="mt-4 rounded-xl border border-line bg-cloud/40 p-3 text-sm">
              <p className="text-ink">
                Dostanie <strong>{count.willSend}</strong> {count.willSend === 1 ? 'osoba' : 'osób'}:{' '}
                {count.bySource.lead} z bazy leadów
                {includeAccounts ? ` i ${count.bySource.account} z kont bez kursu` : ''}.
              </p>
              <ul className="mt-1 text-xs text-muted">
                <li>
                  Pula: {count.skipped.leads ?? count.skipped.total} leadów ze zgodą
                  {includeAccounts ? ` + ${count.skipped.accounts ?? 0} kont bez kursu` : ''}
                </li>
                <li>Pominięci kursanci z dostępem: {count.skipped.buyers}</li>
                <li>Już dostali tę kampanię: {count.skipped.alreadySent}</li>
                <li>W trakcie sekwencji powitalnej: {count.skipped.unfinished}</li>
              </ul>
              {count.sample.length > 0 && (
                <p className="mt-1 break-all text-xs text-muted">
                  Np. {count.sample.join(', ')}
                  {count.willSend > count.sample.length ? '…' : ''}
                </p>
              )}
            </div>
          )}

          {notice && (
            <p
              className={cn(
                'mt-4 rounded-xl p-3 text-sm',
                notice.tone === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              )}
            >
              {notice.text}
            </p>
          )}
        </div>

        {/* Prawa kolumna: wysyłka */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-6 lg:col-span-2">
          <h3 className="mb-3 text-base font-bold text-ink">Wysyłka</h3>

          {openRun ? (
            <div className="rounded-xl border border-line bg-cloud/40 p-3 text-sm">
              <p className="flex items-center gap-2 text-ink">
                <StatusChip status={openRun.status} />
                <span>{fmt(openRun.scheduled_at)}</span>
              </p>
              <p className="mt-1 text-xs text-muted">
                {openRun.status === 'scheduled'
                  ? 'Ta kampania ma zaplanowaną wysyłkę. Odwołaj ją, żeby ustawić inną godzinę.'
                  : 'Ta kampania właśnie się wysyła.'}
              </p>
              {openRun.status === 'scheduled' && (
                <button
                  type="button"
                  className={cn(BTN_DANGER, 'mt-3')}
                  disabled={!!busy}
                  onClick={() => doCancel(openRun.id)}
                >
                  {busy === `cancel-${openRun.id}` ? 'Odwołuję…' : 'Odwołaj zaplanowaną wysyłkę'}
                </button>
              )}
            </div>
          ) : (
            <>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                Zaplanuj na (czas polski)
              </label>
              <input
                type="datetime-local"
                value={when}
                min={toLocalInput(new Date())}
                onChange={(e) => setWhen(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500"
              />
              <button
                type="button"
                className={cn(BTN_PRIMARY, 'mt-3 w-full')}
                disabled={!campaign || !!busy || !when}
                onClick={doSchedule}
              >
                {busy === 'schedule' ? 'Planuję…' : 'Zaplanuj wysyłkę'}
              </button>
              <p className="mt-2 text-xs text-muted">
                Cron sprawdza zlecenia co 5 minut, więc wysyłka rusza najpóźniej 5 minut po wybranej
                godzinie. Do startu możesz ją odwołać.
              </p>

              <div className="my-4 flex items-center gap-3 text-xs text-muted">
                <span className="h-px flex-1 bg-line" />
                albo
                <span className="h-px flex-1 bg-line" />
              </div>

              {!confirmNow ? (
                <button
                  type="button"
                  className={cn(BTN_OUTLINE, 'w-full')}
                  disabled={!campaign || !!busy}
                  onClick={() => setConfirmNow(true)}
                >
                  Wyślij teraz
                </button>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
                  <p className="font-semibold text-amber-800">
                    Na pewno wysłać teraz{count ? ` do ${count.willSend} osób` : ''}?
                  </p>
                  {!count && (
                    <p className="mt-1 text-xs text-amber-700">
                      Nie policzyłeś jeszcze odbiorców. Lepiej najpierw kliknij „Policz odbiorców".
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button type="button" className={BTN_PRIMARY} disabled={!!busy} onClick={doSendNow}>
                      {busy === 'sendNow' ? 'Uruchamiam…' : 'Tak, wyślij'}
                    </button>
                    <button type="button" className={BTN_GHOST} disabled={!!busy} onClick={() => setConfirmNow(false)}>
                      Anuluj
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Historia */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-card sm:mt-6">
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <h3 className="text-base font-bold text-ink">Historia wysyłek</h3>
          <button type="button" className={cn(BTN_GHOST, 'px-3 py-1.5 text-xs')} onClick={load}>
            Odśwież
          </button>
        </div>
        {data.runs.length === 0 ? (
          <p className="border-t border-line px-4 py-6 text-center text-sm text-muted">
            Jeszcze nic nie zaplanowano ani nie wysłano.
          </p>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {data.runs.map((r) => (
              <li key={r.id} className="px-4 py-3.5 text-sm sm:px-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StatusChip status={r.status} />
                  <span className="font-semibold text-ink">{r.campaign}</span>
                  <span className="text-muted">{fmt(r.scheduled_at)}</span>
                  {r.include_accounts === false && (
                    <span className="text-xs text-muted">tylko leady z bazy</span>
                  )}
                  {r.skip_unfinished && (
                    <span className="text-xs text-muted">bez leadów w sekwencji</span>
                  )}
                  {r.status === 'scheduled' && (
                    <button
                      type="button"
                      className={cn(BTN_DANGER, 'ml-auto px-3 py-1 text-xs')}
                      disabled={!!busy}
                      onClick={() => doCancel(r.id)}
                    >
                      Odwołaj
                    </button>
                  )}
                </div>
                {(r.status === 'done' || r.status === 'failed') && (
                  <p className="mt-1 text-xs text-muted">
                    Wysłano {r.sent}, błędów {r.failed}
                    {r.remaining > 0 ? `, zostało ${r.remaining}` : ''}
                    {r.skipped && r.skipped.leads !== undefined
                      ? ` · pula: leady ${r.skipped.leads}, konta bez kursu ${r.skipped.accounts ?? 0}`
                      : ''}
                    {r.skipped
                      ? ` · pominięto: kursanci ${r.skipped.buyers}, już mieli ${r.skipped.alreadySent}, w sekwencji ${r.skipped.unfinished}`
                      : ''}
                    {r.finished_at ? ` · zakończono ${fmt(r.finished_at)}` : ''}
                  </p>
                )}
                {r.error && <p className="mt-1 text-xs text-red-600">{r.error}</p>}
                {r.created_by && (
                  <p className="mt-0.5 text-[0.7rem] text-muted">
                    zlecił {r.created_by} · {fmt(r.created_at)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {preview && (
        <PreviewModal
          subject={preview.subject}
          preheader={preview.preheader}
          html={preview.html}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
