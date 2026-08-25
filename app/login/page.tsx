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
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/kurs');
    } catch {
      setError('Nieprawidłowy e-mail lub hasło.');
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
    </AuthCard>
  );
}
