import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { COURSE_FACTS } from '@/lib/kurs';

/** Tabela „kurs w pigułce” - sama lista faktów, do wstawienia w dowolną sekcję. */
export function CourseFactsTable() {
  return (
    <dl className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
      {COURSE_FACTS.map((f) => (
        <div
          key={f.label}
          className="grid gap-1 px-5 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6 sm:px-7"
        >
          <dt className="text-sm font-bold uppercase tracking-wide text-brand-600">
            {f.label}
          </dt>
          <dd className="text-slate">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const guides = [
  { label: 'Szczegółowy program kursu fizyki online', href: '/kurs-fizyki-online' },
  { label: 'Kurs fizyki od podstaw - dla zaczynających od zera', href: '/kurs-fizyki-od-podstaw' },
  { label: 'Ile kosztuje kurs maturalny z fizyki', href: '/blog/ile-kosztuje-kurs-maturalny-z-fizyki' },
  { label: 'Jak wybrać kurs maturalny z fizyki', href: '/blog/jak-wybrac-kurs-maturalny-z-fizyki' },
];

/**
 * Sekcja strony głównej z konkretami o kursie zapisanymi zwykłym tekstem.
 * Reszta landingu to hasła sprzedażowe; tutaj wyszukiwarka i silniki AI
 * dostają jednoznaczną odpowiedź „co to za kurs, dla kogo, za ile”.
 */
export function CourseFacts() {
  return (
    <section id="o-kursie" className="scroll-mt-20 bg-white py-14 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Kurs w pigułce"
          title="Kurs maturalny z fizyki online - najważniejsze informacje"
          subtitle="Fizyka Statkiem to kurs maturalny z fizyki na poziomie rozszerzonym, który przerabiasz online we własnym tempie: od pierwszej lekcji kinematyki do arkuszy CKE na czas."
        />
        <div className="mx-auto mt-10 max-w-4xl">
          <CourseFactsTable />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {guides.map((g) => (
              <li key={g.href}>
                <Link
                  href={g.href}
                  className="flex h-full items-center justify-between gap-3 rounded-2xl border border-line bg-cloud px-5 py-4 text-sm font-semibold text-ink transition hover:border-brand-200 hover:text-brand-700"
                >
                  {g.label}
                  <span aria-hidden className="text-brand-500">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
