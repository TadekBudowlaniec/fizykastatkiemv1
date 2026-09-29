import Link from 'next/link';
import { PLANS, SINGLE_COURSE_PRICE, COURSES } from '@/lib/courses';
import { courseForTopic } from '@/lib/seo';
import { BuyButton } from '@/components/shop/BuyButton';
import { SqueezeForm } from '@/components/landing/SqueezeForm';
import { CtaTracker, SeoStickyCta } from '@/components/seo/SeoClient';

// Elementy sprzedażowe stron bazy wiedzy (/fizyka, /zadania-z-fizyki, /matura-z-fizyki, /blog).
// Ruch na tych stronach jest informacyjny (głównie z wyszukiwarek i cytowań AI),
// więc oferta jest dopasowana do tematu strony: najpierw tani, konkretny krok
// (dział, który czytelnik właśnie przerabia), obok kotwica Kursu Pełnego,
// a dla niegotowych na zakup - darmowy planer za e-mail.

const fullPlan = PLANS.find((p) => p.key === 'full_access')!;
const perDzial = Math.round(fullPlan.price / COURSES.length);

/**
 * Oferta działu kursu, w którym omawiany jest temat strony. Wstawiana w środek
 * treści (nie na dół), bo większość czytelników nie doczytuje do końca.
 */
export function TopicOffer({
  slug,
  heading,
  lead,
}: {
  slug: string;
  heading?: string;
  lead?: string;
}) {
  const c = courseForTopic(slug);
  if (!c) return null;

  return (
    <aside
      id="oferta"
      className="my-12 scroll-mt-24 overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-card"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f2efff,#ffe6f3)] text-2xl ring-1 ring-brand-100">
            {c.icon}
          </span>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-500">
            Dział {c.id} kursu · {c.title}
          </p>
        </div>
        {/* <p>, nie <h2>: bloki sprzedażowe nie wchodzą w strukturę nagłówków artykułu (SEO/AEO) */}
        <p className="mt-4 font-display text-2xl font-extrabold leading-tight text-ink">
          {heading ?? `Wolisz, żeby ktoś Ci to wytłumaczył? ${c.title} na wideo, krok po kroku`}
        </p>
        <p className="mt-2 text-muted">
          {lead ??
            'Tekst to dobry start, ale na maturze liczy się rozwiązywanie zadań. W dziale kursu przechodzisz przez cały temat z lekcjami wideo i zadaniami typu CKE.'}
        </p>

        <ul className="mt-5 grid gap-2 text-sm text-slate sm:grid-cols-3">
          {['Lekcje wideo HD', 'PDF-y z teorią i wzorami', 'Zadania z rozwiązaniami'].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>

        {c.topics.length ? (
          <p className="mt-4 text-sm text-muted">
            <strong className="text-ink">W dziale:</strong> {c.topics.slice(0, 6).join(' · ')}
            {c.topics.length > 6 ? ' i więcej' : ''}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div data-cta="buy_dzial" className="sm:w-64">
            <BuyButton courseId={c.id} variant="gradient" size="md">
              Kup dział · {SINGLE_COURSE_PRICE} zł
            </BuyButton>
          </div>
          <Link
            href={`/kurs/${c.id}`}
            data-cta="zobacz_lekcje"
            className="inline-flex items-center justify-center rounded-full border-2 border-brand-200 px-6 py-2.5 font-semibold text-brand-600 transition hover:border-brand-500 hover:bg-brand-50"
          >
            Zobacz lekcje działu
          </Link>
        </div>
        <p className="mt-2 text-xs text-muted">Płatność jednorazowa, dostęp od razu po zakupie.</p>
      </div>

      <Link
        href="/cennik"
        data-cta="kotwica_kurs_pelny"
        className="group flex flex-col gap-1 border-t border-brand-100 bg-[linear-gradient(120deg,#f6f3ff,#fff0f7)] px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8"
      >
        <span className="text-slate">
          <strong className="text-ink">Masz braki w kilku działach?</strong> Kurs Pełny to wszystkie{' '}
          {COURSES.length} działów za {fullPlan.price} zł (ok. {perDzial} zł za dział) + planer i Gwarancja
          Dobrego Wyniku.
        </span>
        <span className="whitespace-nowrap font-semibold text-brand-600 group-hover:text-magenta-600">
          Zobacz Kurs Pełny →
        </span>
      </Link>
    </aside>
  );
}

/** Oferta Kursu Pełnego - dla treści ogólnych (blog), bez jednego konkretnego działu. */
export function FullCourseOffer() {
  return (
    <aside
      id="oferta"
      className="my-12 scroll-mt-24 overflow-hidden rounded-3xl border border-brand-100 bg-white p-6 shadow-card sm:p-8"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-brand-500">
        {fullPlan.name} · {COURSES.length} działów
      </p>
      <p className="mt-3 font-display text-2xl font-extrabold leading-tight text-ink">
        Chcesz mieć cały plan przygotowań w jednym miejscu?
      </p>
      <p className="mt-2 text-muted">
        W kursie przerabiasz wszystkie działy matury z fizyki: lekcje wideo, PDF-y od teorii po arkusze CKE,
        quizy i planer, który rozkłada naukę do dnia egzaminu.
      </p>
      <ul className="mt-5 grid gap-2 text-sm text-slate sm:grid-cols-2">
        {fullPlan.features.slice(0, 4).map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div data-cta="buy_kurs_pelny" className="sm:w-72">
          <BuyButton courseId="full_access" variant="gradient" size="md">
            Kup {fullPlan.name} · {fullPlan.price} zł
          </BuyButton>
        </div>
        <Link
          href="/cennik"
          data-cta="cennik"
          className="inline-flex items-center justify-center rounded-full border-2 border-brand-200 px-6 py-2.5 font-semibold text-brand-600 transition hover:border-brand-500 hover:bg-brand-50"
        >
          Porównaj pakiety
        </Link>
      </div>
      <p className="mt-2 text-xs text-muted">
        Ok. {perDzial} zł za dział · płatność jednorazowa · Gwarancja Dobrego Wyniku
      </p>
    </aside>
  );
}

/** Pasek „ścieżki maturalnej” - przeprowadza ruch z teorii na stronę maturalną działu. */
export function MaturaPath({ slug, name }: { slug: string; name: string }) {
  return (
    <Link
      href={`/matura-z-fizyki/${slug}`}
      data-cta="sciezka_maturalna"
      className="group mb-10 flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-soft transition hover:border-brand-300"
    >
      <span className="text-2xl" aria-hidden>
        🎯
      </span>
      <span className="flex-1 text-sm text-slate sm:text-base">
        <strong className="text-ink">Zdajesz maturę z fizyki?</strong> Zobacz, jak {name.toLowerCase()} pojawia
        się na egzaminie: typowe zadania CKE i strategia.
      </span>
      <span className="font-semibold text-brand-600 group-hover:text-magenta-600" aria-hidden>
        →
      </span>
    </Link>
  );
}

/** Darmowy planer za e-mail - dla czytelników, którzy dziś jeszcze nie kupią. */
export function LeadBox({ source }: { source: string }) {
  return (
    <aside
      id="planer"
      className="relative my-12 scroll-mt-24 overflow-hidden rounded-3xl bg-[linear-gradient(150deg,#070b18,#16223f)] p-6 text-white sm:p-8"
    >
      <div className="aurora right-[-10%] top-[-40%] h-56 w-56 bg-magenta-500/30" />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-200">Za darmo</p>
        <p className="mt-2 font-display text-2xl font-extrabold leading-tight">
          Nie wiesz, od czego zacząć przygotowania do matury?
        </p>
        <p className="mt-2 max-w-xl text-slate-300/90">
          Odbierz darmowy planer nauki: ułoży Ci powtórkę działów do dnia matury. Dostaniesz też dostęp do
          modułu „Tutaj zacznij”.
        </p>
        <div className="mt-5">
          <SqueezeForm source="baza_wiedzy" gaSource={source} />
        </div>
      </div>
    </aside>
  );
}

/** Pasek na mobile + śledzenie kliknięć. Wstawiany raz na stronę. Bez `slug` = oferta Kursu Pełnego. */
export function SeoSalesLayer({ slug, pageType }: { slug?: string; pageType: string }) {
  const c = slug ? courseForTopic(slug) : undefined;
  return (
    <>
      <CtaTracker pageType={pageType} topic={slug} />
      {c ? (
        <SeoStickyCta
          label={`${c.icon} ${c.title} w kursie`}
          sub={`wideo + zadania · ${SINGLE_COURSE_PRICE} zł`}
          cta="Zobacz dział →"
        />
      ) : (
        <SeoStickyCta
          label={fullPlan.name}
          sub={`${COURSES.length} działów · ${fullPlan.price} zł jednorazowo`}
          cta="Zobacz kurs →"
        />
      )}
    </>
  );
}
