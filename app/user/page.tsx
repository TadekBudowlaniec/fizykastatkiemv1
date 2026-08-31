'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { AppHero } from '@/components/app/AppHero';
import { Container } from '@/components/ui/Container';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/Button';
import { COURSES } from '@/lib/courses';

export default function UserPage() {
  const { user, loading, accessLoading, isAdmin, enrollments, signOut } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  if (loading || (user && accessLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted">
        Ładowanie…
      </div>
    );
  }

  if (!user) {
    return (
      <AppHero title="Twój profil" subtitle="Zaloguj się, aby zobaczyć konto.">
        <div className="mt-6 flex gap-3">
          <Button href="/login" variant="light">
            Zaloguj się
          </Button>
          <Button href="/register" variant="outline" className="border-white/30 text-white hover:bg-white hover:text-navy-900">
            Załóż konto
          </Button>
        </div>
      </AppHero>
    );
  }

  const name =
    (user.user_metadata?.full_name as string) || user.email?.split('@')[0];
  const unlockedCount = isAdmin ? COURSES.length : enrollments.length;

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8 || !/[A-ZĄĆĘŁŃÓŚŹŻ]/.test(next)) {
      setMsg({ type: 'err', text: 'Nowe hasło: min. 8 znaków i wielka litera.' });
      return;
    }
    if (next !== repeat) {
      setMsg({ type: 'err', text: 'Nowe hasła nie są zgodne.' });
      return;
    }
    setSaving(true);
    try {
      const supabase = getSupabaseBrowser();
      // Re-autoryzacja
      const { error: reauth } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: current,
      });
      if (reauth) throw new Error('reauth');
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw error;
      setMsg({ type: 'ok', text: 'Hasło zostało zmienione.' });
      setCurrent('');
      setNext('');
      setRepeat('');
    } catch (err) {
      setMsg({
        type: 'err',
        text:
          err instanceof Error && err.message === 'reauth'
            ? 'Aktualne hasło jest nieprawidłowe.'
            : 'Nie udało się zmienić hasła.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AppHero
        title={`Cześć, ${name}!`}
        subtitle="Zarządzaj kontem i wróć do nauki, kiedy chcesz."
        breadcrumb={[
          { label: 'Start', href: '/' },
          { label: 'Profil', href: '/user' },
        ]}
      />
      <section className="bg-cloud py-14">
        <Container size="narrow">
          <div className="grid gap-6">
            {/* Karta konta */}
            <div className="rounded-3xl border border-line bg-white p-7 shadow-soft">
              <h2 className="text-xl font-extrabold text-ink">Twoje konto</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">E-mail</dt>
                  <dd className="font-medium text-ink">{user.email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Imię</dt>
                  <dd className="font-medium text-ink">{name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Odblokowane działy</dt>
                  <dd className="font-medium text-ink">
                    {unlockedCount} / {COURSES.length}
                    {isAdmin && ' (admin)'}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href="/kurs" variant="gradient" size="sm">
                  Przejdź do kursu
                </Button>
                {unlockedCount === 0 && (
                  <Button href="/cennik" variant="outline" size="sm">
                    Odblokuj kurs
                  </Button>
                )}
                <button
                  onClick={() => signOut()}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-magenta-600"
                >
                  Wyloguj się
                </button>
              </div>
            </div>

            {/* Zmiana hasła */}
            <div className="rounded-3xl border border-line bg-white p-7 shadow-soft">
              <h2 className="text-xl font-extrabold text-ink">Zmiana hasła</h2>
              <form onSubmit={changePassword} className="mt-4 space-y-4">
                <PasswordInput
                  value={current}
                  onChange={setCurrent}
                  placeholder="Aktualne hasło"
                  autoComplete="current-password"
                />
                <PasswordInput
                  value={next}
                  onChange={setNext}
                  placeholder="Nowe hasło"
                  autoComplete="new-password"
                />
                <PasswordInput
                  value={repeat}
                  onChange={setRepeat}
                  placeholder="Powtórz nowe hasło"
                  autoComplete="new-password"
                />
                {msg && (
                  <p
                    className={
                      msg.type === 'ok'
                        ? 'rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700'
                        : 'rounded-lg bg-magenta-500/10 px-3 py-2 text-sm text-magenta-600'
                    }
                  >
                    {msg.text}
                  </p>
                )}
                <Button variant="gradient" disabled={saving}>
                  {saving ? 'Zapisywanie…' : 'Zmień hasło'}
                </Button>
              </form>
            </div>

            <p className="text-center text-sm text-muted">
              Potrzebujesz pomocy?{' '}
              <Link href="/korepetycje" className="font-semibold text-brand-600 underline">
                Sprawdź korepetycje 1:1
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
