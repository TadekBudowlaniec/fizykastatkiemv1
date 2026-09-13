'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';

export function SuccessClient() {
  const { user, refreshAccess, hasAnyAccess, sendMagicLink } = useAuth();
  const [status, setStatus] = useState<'checking' | 'active' | 'pending'>(
    'checking'
  );

  // --- Gość: logowanie linkiem na e-mail użyty przy zakupie ---
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Prefill e-maila, jeśli gość podał go wcześniej (formularz planera).
  useEffect(() => {
    try {
      const e = window.localStorage.getItem('squeezeMagicEmail');
      if (e) setEmail(e);
    } catch {
      /* localStorage niedostępny */
    }
  }, []);

  const sendLoginLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      await sendMagicLink(email);
    } catch {
      /* neutralnie - konto opłaconego gościa i tak istnieje */
    } finally {
      setSent(true);
      setSending(false);
    }
  };

  // Promocja zużyta - wyczyść znacznik (raz)
  useEffect(() => {
    try {
      window.localStorage.removeItem('promoStartedAt');
    } catch {
      /* localStorage niedostępny - bez znaczenia */
    }
  }, []);

  // Poll dostępu - webhook (zwłaszcza async/Klarna) może chwilę zająć.
  // NIE twierdzimy „aktywowano", dopóki dostęp realnie się nie pojawi.
  useEffect(() => {
    if (!user) return; // gość dostaje instrukcję o mailu poniżej
    if (hasAnyAccess) {
      setStatus('active');
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const MAX = 8; // ~1.5s + 7×2s ≈ 17s

    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        await refreshAccess();
      } catch {
        /* ignoruj - spróbujemy ponownie */
      }
      if (cancelled) return;
      if (attempts >= MAX) {
        setStatus('pending');
        return;
      }
      timer = setTimeout(poll, 2000);
    };
    timer = setTimeout(poll, 1500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [user, hasAnyAccess, refreshAccess]);

  return (
    <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#070b18,#0b1224_55%,#16223f)] px-5 py-20 text-center text-white">
      <div className="aurora left-1/4 top-1/4 h-80 w-80 animate-[aurora_18s_ease_infinite] bg-brand-600/45" />
      <div className="aurora bottom-1/4 right-1/4 h-80 w-80 animate-[aurora_22s_ease_infinite] bg-magenta-500/35" />
      <div className="bg-grid absolute inset-0" />

      <div className="relative max-w-lg">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6b4df6,#f43f8f)] text-5xl shadow-glow">
          ✅
        </div>
        <h1 className="mt-7 font-display text-3xl font-extrabold sm:text-4xl">
          Dziękujemy za zakup!
        </h1>

        {user ? (
          <>
            <p className="mt-4 text-lg text-slate-300/85">
              {status === 'active'
                ? 'Twój dostęp został aktywowany. Miłej nauki - płyniemy po Twój wynik!'
                : status === 'pending'
                  ? 'Płatność potwierdzona! Aktywacja dostępu może potrwać chwilę - odśwież stronę za moment albo wejdź do kursu, dostęp pojawi się automatycznie.'
                  : 'Aktywujemy Twój dostęp do kursu…'}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button href="/kurs" variant="gradient" size="lg">
                Przejdź do kursu
              </Button>
              <Button
                href="/user"
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white hover:text-navy-900"
              >
                Mój profil
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-5">
            <p className="text-lg text-slate-300/85">
              Płatność potwierdzona! Aby wejść na kurs, zaloguj się linkiem -
              wyślemy go na e-mail użyty przy zakupie.
            </p>

            {sent ? (
              <div className="mx-auto mt-6 max-w-md rounded-2xl border border-ocean-400/30 bg-ocean-400/10 p-5 text-left">
                <p className="font-semibold text-white">
                  ✉️ Wysłaliśmy link do logowania na <b>{email}</b>.
                </p>
                <p className="mt-1 text-sm text-slate-300/85">
                  Kliknij link w mailu (sprawdź też SPAM) - <b>zalogujemy Cię
                  automatycznie i przeniesiemy prosto do kursu</b>. Dostęp jest
                  już przypisany do tego adresu.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-3 text-sm font-semibold text-brand-300 underline underline-offset-4 hover:text-white"
                >
                  Nie dostałeś maila? Wyślij ponownie
                </button>
              </div>
            ) : (
              <form
                onSubmit={sendLoginLink}
                className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="E-mail użyty przy zakupie"
                  className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 px-5 py-3.5 text-white placeholder:text-slate-400 backdrop-blur transition focus:border-brand-400 focus:bg-white/15 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="whitespace-nowrap rounded-full bg-[linear-gradient(120deg,#6b4df6,#a855f7,#f43f8f)] px-7 py-3.5 font-semibold text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {sending ? 'Wysyłam…' : 'Wyślij link'}
                </button>
              </form>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                href="/login"
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white hover:text-navy-900"
              >
                Wolę zalogować się hasłem
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
