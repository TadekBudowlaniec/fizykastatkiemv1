'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PRIMARY_NAV, SITE } from '@/lib/site';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export function Header() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-[500] transition-all duration-300',
        scrolled
          ? 'bg-navy-950/95 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/5'
          : 'bg-navy-950'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <Image
            src="/images/magenta_statek.png"
            alt=""
            width={40}
            height={40}
            className="h-9 w-9 transition-transform group-hover:scale-110"
            priority
          />
          <span className="font-display text-lg font-extrabold tracking-tight text-white sm:text-xl">
            Fizyka<span className="text-gradient">Statkiem</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {PRIMARY_NAV.map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(l.href + '/');
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Auth area (desktop) */}
        <div className="hidden items-center gap-2 lg:flex">
          {!loading && user ? (
            <>
              <Button href="/kurs" variant="ghost" size="sm" className="text-slate-100 hover:text-white hover:bg-white/10">
                Mój kurs
              </Button>
              <Button href="/user" variant="light" size="sm">
                Profil
              </Button>
              <button
                onClick={() => signOut()}
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:text-white"
              >
                Wyloguj
              </button>
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm" className="text-slate-100 hover:text-white hover:bg-white/10">
                Zaloguj
              </Button>
              <Button href="/cennik" variant="gradient" size="sm">
                Zacznij teraz
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white ring-1 ring-white/15 transition hover:bg-white/10 lg:hidden"
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className="relative block h-4 w-5">
            <span className={cn('absolute left-0 h-0.5 w-5 rounded bg-current transition-all', open ? 'top-1.5 rotate-45' : 'top-0')} />
            <span className={cn('absolute left-0 top-1.5 h-0.5 w-5 rounded bg-current transition-all', open && 'opacity-0')} />
            <span className={cn('absolute left-0 h-0.5 w-5 rounded bg-current transition-all', open ? 'top-1.5 -rotate-45' : 'top-3')} />
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden border-t border-white/5 bg-navy-950/95 backdrop-blur-xl transition-[max-height] duration-300 lg:hidden',
          open ? 'max-h-[520px]' : 'max-h-0'
        )}
      >
        <div className="flex flex-col gap-1 px-5 py-4">
          {PRIMARY_NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl px-4 py-3 text-base font-semibold text-slate-200 hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-white/5 pt-3">
            {!loading && user ? (
              <>
                <Button href="/kurs" variant="light">Mój kurs</Button>
                <Button href="/user" variant="ghost" className="text-slate-200 hover:bg-white/5 hover:text-white">Profil</Button>
                <button onClick={() => signOut()} className="rounded-full px-4 py-3 text-sm font-semibold text-slate-400 hover:text-white">Wyloguj się</button>
              </>
            ) : (
              <>
                <Button href="/login" variant="ghost" className="text-slate-200 hover:bg-white/5 hover:text-white">Zaloguj się</Button>
                <Button href="/cennik" variant="gradient">Zacznij teraz</Button>
              </>
            )}
          </div>
          <a href={`mailto:${SITE.email}`} className="px-4 py-3 text-sm text-slate-400">{SITE.email}</a>
        </div>
      </div>
    </header>
  );
}
