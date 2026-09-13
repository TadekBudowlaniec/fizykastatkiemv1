'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthCard } from '@/components/auth/AuthCard';
import { PasswordInput, inputClass } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, sendMagicLink, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);

  const sendLink = async () => {
    if (!email) {
      setError('Podaj e-mail powyżej - wyślemy link do logowania.');
      return;
    }
    setError(null);
    setInfo(null);
    setLinkLoading(true);
    try {
      await sendMagicLink(email);
    } catch {
      /* neutralnie - nie zdradzamy, czy konto istnieje */
    } finally {
      setInfo(
        `Jeśli konto z adresem ${email} istnieje, wysłaliśmy link do logowania. Sprawdź skrzynkę (także SPAM).`
      );
      setLinkLoading(false);
    }
  };

  const forgotPassword = async () => {
    if (!email) {
      setError('Podaj e-mail powyżej - wyślemy link do zresetowania hasła.');
      return;
    }
    setError(null);
    setInfo(null);
    try {
      await resetPassword(email);
    } catch {
      /* neutralnie */
    } finally {
      setInfo(
        `Jeśli konto z adresem ${email} istnieje, wysłaliśmy link do zresetowania hasła. Sprawdź skrzynkę (także SPAM).`
      );
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/kurs');
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      let msg = 'Nie udało się zalogować. Spróbuj ponownie.';
      if (/invalid login credentials/i.test(raw)) {
        msg = 'Nieprawidłowy e-mail lub hasło.';
      } else if (/email not confirmed/i.test(raw)) {
        msg =
          'Twój adres e-mail nie jest jeszcze potwierdzony. Sprawdź skrzynkę (także SPAM) i kliknij link aktywacyjny.';
      } else if (/failed to fetch|network/i.test(raw)) {
        msg = 'Problem z połączeniem. Sprawdź internet i spróbuj ponownie.';
      } else if (raw) {
        msg = raw;
      }
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Zaloguj się"
      subtitle="Wróć na pokład i kontynuuj naukę."
      footer={
        <>
          Nie masz konta?{' '}
          <Link href="/register" className="font-semibold text-brand-300 underline">
            Załóż konto
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ty@przyklad.pl"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate">
            Hasło
          </label>
          <PasswordInput id="password" value={password} onChange={setPassword} />
        </div>

        {error && (
          <p className="rounded-lg bg-magenta-500/10 px-3 py-2 text-sm text-magenta-600">
            {error}
          </p>
        )}

        <Button size="lg" className="w-full" variant="gradient">
          {loading ? 'Logowanie…' : 'Zaloguj się'}
        </Button>
      </form>

      {info && (
        <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
          {info}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-line" /> lub <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={sendLink}
        disabled={linkLoading}
        className="mt-4 w-full rounded-full border-2 border-brand-200 px-5 py-3 text-sm font-semibold text-brand-600 transition hover:border-brand-500 hover:bg-brand-50 disabled:opacity-60"
      >
        {linkLoading ? 'Wysyłanie…' : '✉️ Zaloguj przez link (bez hasła)'}
      </button>

      <button
        type="button"
        onClick={forgotPassword}
        className="mt-3 block w-full text-center text-sm font-semibold text-muted underline underline-offset-4 hover:text-brand-600"
      >
        Nie pamiętam hasła
      </button>
    </AuthCard>
  );
}
