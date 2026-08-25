'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthCard } from '@/components/auth/AuthCard';
import { PasswordInput, inputClass } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={cn('flex items-center gap-2', ok ? 'text-brand-600' : 'text-muted')}>
      <span>{ok ? '✓' : '○'}</span>
      {children}
    </li>
  );
}

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const hasLen = password.length >= 8;
  const hasUpper = /[A-ZĄĆĘŁŃÓŚŹŻ]/.test(password);
  const matches = repeat.length > 0 && password === repeat;
  const valid = hasLen && hasUpper && matches && !!email && !!name;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setError('Uzupełnij poprawnie wszystkie pola.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUp(email, password, name);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error && /registered|exists/i.test(err.message)
          ? 'Konto z tym adresem już istnieje. Zaloguj się.'
          : 'Nie udało się założyć konta. Spróbuj ponownie.'
      );
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthCard
        title="Sprawdź skrzynkę ✉️"
        subtitle="Wysłaliśmy link potwierdzający rejestrację na Twój adres e-mail."
        footer={
          <>
            Potwierdziłeś już konto?{' '}
            <Link href="/login" className="font-semibold text-brand-300 underline">
              Zaloguj się
            </Link>
          </>
        }
      >
        <p className="text-center text-muted">
          Kliknij link w wiadomości, aby aktywować konto i rozpocząć naukę.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Załóż konto"
      subtitle="Zacznij naukę i odbierz swój planer do matury."
      footer={
        <>
          Masz już konto?{' '}
          <Link href="/login" className="font-semibold text-brand-300 underline">
            Zaloguj się
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate">Imię</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jak masz na imię?"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate">E-mail</label>
          <input
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
          <label className="mb-1.5 block text-sm font-semibold text-slate">Hasło</label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="Utwórz hasło"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate">Powtórz hasło</label>
          <PasswordInput
            value={repeat}
            onChange={setRepeat}
            autoComplete="new-password"
            placeholder="Powtórz hasło"
          />
        </div>

        <ul className="space-y-1 rounded-xl bg-cloud px-4 py-3 text-sm">
          <Rule ok={hasLen}>Minimum 8 znaków</Rule>
          <Rule ok={hasUpper}>Przynajmniej jedna wielka litera</Rule>
          <Rule ok={matches}>Hasła są zgodne</Rule>
        </ul>

        {error && (
          <p className="rounded-lg bg-magenta-500/10 px-3 py-2 text-sm text-magenta-600">
            {error}
          </p>
        )}

        <Button size="lg" className="w-full" variant="gradient" disabled={!valid || loading}>
          {loading ? 'Zakładanie konta…' : 'Załóż konto'}
        </Button>
      </form>
    </AuthCard>
  );
}
