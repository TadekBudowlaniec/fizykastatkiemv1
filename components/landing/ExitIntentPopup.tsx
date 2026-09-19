'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { SITE } from '@/lib/site';

const SUPPRESS_KEY = 'exitIntentSeenAt';
const SUPPRESS_MS = 7 * 24 * 60 * 60 * 1000; // 7 dni
const MOBILE_DELAY_MS = 25000; // fallback dla dotyku (brak mouseleave)

// Strony apki / auth / checkoutu — tam popup się NIE pokazuje.
const BLOCKED_PREFIXES = [
  '/kurs',
  '/planer',
  '/admin',
  '/login',
  '/register',
  '/user',
  '/cennik',
  '/sukces',
  '/oferta-ratunkowa',
  '/polityka-prywatnosci',
  '/regulamin',
];

function isBlocked(pathname: string): boolean {
  return BLOCKED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
}

function recentlySuppressed(): boolean {
  try {
    const raw = window.localStorage.getItem(SUPPRESS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < SUPPRESS_MS;
  } catch {
    return false;
  }
}

function markSuppressed() {
  try {
    window.localStorage.setItem(SUPPRESS_KEY, String(Date.now()));
  } catch {
    /* prywatne okno / zablokowany storage — trudno, pokaże się następnym razem */
  }
}

// GA4 event (gtag ładowany w layout) — bezpieczny no-op gdy brak gtag.
function track(event: string) {
  try {
    (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.(
      'event',
      event
    );
  } catch {
    /* ignore */
  }
}

export function ExitIntentPopup() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>(
    'idle'
  );
  const shownRef = useRef(false);

  const close = useCallback(() => setOpen(false), []);

  // --- Detekcja intencji wyjścia ---
  useEffect(() => {
    if (loading || user) return; // tylko niezalogowani
    if (isBlocked(pathname)) return;
    if (recentlySuppressed()) return;

    function trigger() {
      if (shownRef.current) return;
      shownRef.current = true;
      markSuppressed(); // od razu, żeby nie wyskakiwał wielokrotnie
      setOpen(true);
      track('exit_popup_shown');
      cleanup();
    }

    function onMouseOut(e: MouseEvent) {
      // kursor opuszcza okno górą (w stronę paska kart/adresu)
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    }

    const isTouch = window.matchMedia('(hover: none)').matches;
    let timer: number | undefined;

    function cleanup() {
      document.removeEventListener('mouseout', onMouseOut);
      if (timer) window.clearTimeout(timer);
    }

    if (isTouch) {
      timer = window.setTimeout(trigger, MOBILE_DELAY_MS);
    } else {
      document.addEventListener('mouseout', onMouseOut);
    }

    return cleanup;
  }, [user, loading, pathname]);

  // Blokada scrolla tła + zamykanie ESC gdy otwarte
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const supabase = getSupabaseBrowser();
      window.localStorage.setItem('squeezeMagicEmail', email);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${SITE.url}/planer` },
      });
      if (error) throw error;
      // zapis leada + ew. start sekwencji (Resend, tylko przy zgodzie) — niezależnie od wysyłki linku
      void fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent, source: 'exit_intent' }),
      }).catch(() => {});
      track('exit_popup_submit');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Odbierz darmowy planer nauki"
    >
      {/* Tło */}
      <button
        aria-label="Zamknij"
        onClick={close}
        className="absolute inset-0 cursor-default bg-navy-950/70 backdrop-blur-sm"
      />

      {/* Karta */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-7 shadow-2xl sm:p-8">
        <button
          aria-label="Zamknij"
          onClick={close}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-cloud hover:text-ink"
        >
          ✕
        </button>

        {status === 'sent' ? (
          <div className="py-4 text-center">
            <p className="text-3xl">✉️</p>
            <p className="mt-2 text-lg font-bold text-ink">
              Sprawdź skrzynkę!
            </p>
            <p className="mt-1 text-muted">
              Wysłaliśmy link do Twojego planera nauki.
            </p>
            <button
              onClick={close}
              className="mt-5 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-cloud"
            >
              Zamknij
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-500">
              Zaczekaj chwilę
            </p>
            <h3 className="mt-1 text-2xl font-extrabold text-ink">
              Zanim wyjdziesz — odbierz planer nauki 🧭
            </h3>
            <p className="mt-2 text-muted">
              Darmowy plan przygotowań do matury z fizyki, który ułożył naukę już
              28 maturzystom — plus darmowy 5-dniowy mini-kurs mailowy. Zajmie Ci
              minutę, a oszczędzi tygodnie chaosu.
            </p>

            <form onSubmit={submit} className="mt-5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Twój adres e-mail"
                className="w-full rounded-full border border-line bg-white px-5 py-3.5 text-ink placeholder:text-muted focus:border-brand-400 focus:outline-none"
              />
              {status === 'error' && (
                <p className="mt-2 text-sm text-magenta-600">
                  Nie udało się wysłać. Sprawdź adres i spróbuj ponownie.
                </p>
              )}

              <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-cloud/60 p-3.5 text-xs text-muted transition hover:border-brand-400/50">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-brand-500"
                />
                <span>
                  <span className="font-semibold text-ink">
                    Tak, chcę też darmowy 5-dniowy mini-kurs mailowy
                  </span>{' '}
                  — konkretne wskazówki do matury z fizyki i info o kursie. Zgodę
                  wycofasz jednym kliknięciem. Szczegóły w{' '}
                  <a href="/polityka-prywatnosci" className="underline hover:text-ink">
                    polityce prywatności
                  </a>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="mt-4 w-full rounded-full bg-[linear-gradient(120deg,#6b4df6,#a855f7,#f43f8f)] bg-[length:200%_200%] px-7 py-3.5 font-semibold text-white shadow-glow transition-all duration-300 hover:bg-[position:100%_0] disabled:opacity-60"
              >
                {status === 'loading' ? 'Wysyłam…' : 'Odbierz planer za darmo'}
              </button>
            </form>

            <p className="mt-3 text-center text-xs text-muted">
              Planer dostajesz tak czy siak. Mini-kurs mailowy — tylko za zgodą,
              wypiszesz się jednym kliknięciem.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
