'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';

export function SuccessClient() {
  const { user, refreshAccess } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        await refreshAccess();
      } finally {
        setChecked(true);
      }
    }, 2000);
    // Promocja zużyta - wyczyść znacznik
    window.localStorage.removeItem('promoStartedAt');
    return () => clearTimeout(t);
  }, [refreshAccess]);

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
          <p className="mt-4 text-lg text-slate-300/85">
            {checked
              ? 'Twój dostęp został aktywowany. Miłej nauki - płyniemy po Twój wynik!'
              : 'Aktywujemy Twój dostęp do kursu…'}
          </p>
        ) : (
          <p className="mt-4 text-lg text-slate-300/85">
            Wysłaliśmy na Twój e-mail link do logowania i aktywacji dostępu.
            Sprawdź skrzynkę (także folder SPAM), zaloguj się i zaczynamy!
          </p>
        )}

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
      </div>
    </section>
  );
}
