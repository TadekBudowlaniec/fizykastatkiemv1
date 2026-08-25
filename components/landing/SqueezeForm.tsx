'use client';

import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { SITE } from '@/lib/site';

export function SqueezeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>(
    'idle'
  );
  const [msg, setMsg] = useState('');

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
      setStatus('sent');
      setMsg('Sprawdź skrzynkę — wysłaliśmy link do Twojego planera nauki.');
    } catch {
      setStatus('error');
      setMsg('Nie udało się wysłać. Sprawdź adres e-mail i spróbuj ponownie.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-ocean-400/30 bg-ocean-400/10 p-5 text-center backdrop-blur">
        <p className="text-2xl">✉️</p>
        <p className="mt-1 font-semibold text-white">{msg}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Twój adres e-mail"
          className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 px-5 py-3.5 text-white placeholder:text-slate-400 backdrop-blur transition focus:border-brand-400 focus:bg-white/15 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="whitespace-nowrap rounded-full bg-[linear-gradient(120deg,#6b4df6,#a855f7,#f43f8f)] bg-[length:200%_200%] px-7 py-3.5 font-semibold text-white shadow-glow transition-all duration-300 hover:bg-[position:100%_0] hover:-translate-y-0.5 disabled:opacity-60"
        >
          {status === 'loading' ? 'Wysyłam…' : 'Odbierz planer'}
        </button>
      </div>
      {status === 'error' && (
        <p className="mt-2 text-sm text-magenta-400">{msg}</p>
      )}
      <p className="mt-2.5 text-xs text-slate-400">
        Bez spamu. Darmowy planer nauki do matury + dostęp do modułu „Tutaj
        zacznij”.
      </p>
    </form>
  );
}
