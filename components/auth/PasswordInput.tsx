'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

export function PasswordInput({
  value,
  onChange,
  placeholder = 'Hasło',
  autoComplete = 'current-password',
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  id?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className={cn(
          'w-full rounded-xl border border-line bg-white px-4 py-3 pr-12 text-ink',
          'transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100'
        )}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-muted hover:text-brand-600"
        aria-label={show ? 'Ukryj hasło' : 'Pokaż hasło'}
      >
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
}

export const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-ink transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100';
