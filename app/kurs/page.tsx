'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { AppHero } from '@/components/app/AppHero';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { CourseTile } from '@/components/app/CourseTile';
import { COURSES } from '@/lib/courses';

export default function DashboardPage() {
  const { user, loading, isAdmin, enrollments } = useAuth();

  const unlocked = isAdmin ? COURSES.length : enrollments.length;
  const pct = Math.round((unlocked / COURSES.length) * 100);

  return (
    <>
      <AppHero
        title="Twój kurs fizyki"
        subtitle={
          user
            ? 'Wybierz dział i kontynuuj naukę. Twój postęp zapisuje się automatycznie.'
            : 'Zaloguj się, aby odblokować swoje działy i śledzić postęp.'
        }
        breadcrumb={[
          { label: 'Start', href: '/' },
          { label: 'Kurs', href: '/kurs' },
        ]}
      >
        {user && (
          <div className="mt-6 max-w-md">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Odblokowane działy</span>
              <span className="font-semibold text-white">
                {unlocked} / {COURSES.length}
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#6b4df6,#f43f8f)] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
        {!loading && !user && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/login" variant="light">Zaloguj się</Button>
            <Button href="/cennik" variant="gradient">Wybierz pakiet</Button>
          </div>
        )}
      </AppHero>

      <section className="bg-cloud py-14">
        <Container size="wide">
          {/* Szybki dostęp: Tutaj zacznij + Planer */}
          <div className="mb-10 grid gap-5 md:grid-cols-2">
            <Link
              href="/kurs/0"
              className="group relative overflow-hidden rounded-3xl bg-[linear-gradient(150deg,#0b1224,#16223f)] p-7 text-white shadow-card"
            >
              <div className="aurora right-0 top-0 h-40 w-40 bg-brand-500/40" />
              <p className="relative text-xs font-bold uppercase tracking-wider text-brand-200">
                Zacznij tutaj
              </p>
              <h3 className="relative mt-1 text-2xl font-extrabold">
                Moduł „Tutaj zacznij”
              </h3>
              <p className="relative mt-2 max-w-sm text-slate-300/85">
                Darmowe lekcje wprowadzające - jak uczyć się fizyki skutecznie i
                jak korzystać z platformy.
              </p>
              <span className="relative mt-4 inline-flex items-center gap-1.5 font-semibold text-white">
                Otwórz moduł →
              </span>
            </Link>

            <Link
              href="/planer"
              className="group relative overflow-hidden rounded-3xl border border-line bg-white p-7 shadow-card"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-brand-500">
                Nawigator
              </p>
              <h3 className="mt-1 text-2xl font-extrabold text-ink">
                Twój planer nauki 🧭
              </h3>
              <p className="mt-2 max-w-sm text-muted">
                Spersonalizowany plan dzień po dniu aż do matury. Zaznacz, co
                umiesz, a resztą zajmiemy się my.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-brand-600 group-hover:text-magenta-600">
                Otwórz planer →
              </span>
            </Link>
          </div>

          <h2 className="mb-5 text-xl font-extrabold text-ink">
            Wszystkie działy
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {COURSES.map((c) => (
              <CourseTile key={c.id} course={c} />
            ))}
          </div>

          {user && unlocked === 0 && !isAdmin && (
            <div className="mt-10 rounded-3xl border border-brand-100 bg-brand-50/60 p-7 text-center">
              <p className="text-lg font-bold text-ink">
                Nie masz jeszcze dostępu do działów
              </p>
              <p className="mt-1 text-muted">
                Wybierz pakiet i odblokuj cały kurs albo pojedynczy dział.
              </p>
              <div className="mt-4 flex justify-center">
                <Button href="/cennik" variant="gradient">
                  Zobacz cennik
                </Button>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
