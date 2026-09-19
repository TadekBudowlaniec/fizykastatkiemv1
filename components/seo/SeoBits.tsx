import Link from 'next/link';
import { SITE } from '@/lib/site';
import { MathContent } from '@/components/seo/MathContent';
import type { Formula, Definition, Problem } from '@/lib/seo';

// --- JSON-LD ------------------------------------------------------------
export function JsonLd({ data }: { data: object | object[] }) {
  const arr = Array.isArray(data) ? data : [data];
  return (
    <>
      {arr.filter(Boolean).map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}

// --- Breadcrumbs --------------------------------------------------------
export type Crumb = { name: string; url?: string };

export function breadcrumbLd(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.url ? { item: SITE.url + it.url } : {}),
    })),
  };
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Okruszki"
      className="flex flex-wrap items-center gap-1.5 text-sm text-slate-300/70"
    >
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {last || !it.url ? (
              <span aria-current="page" className="text-white/90">
                {it.name}
              </span>
            ) : (
              <Link href={it.url} className="hover:text-white">
                {it.name}
              </Link>
            )}
            {!last && <span className="text-white/30">›</span>}
          </span>
        );
      })}
    </nav>
  );
}

// --- SEO hero (ciemny) --------------------------------------------------
export function SeoHero({
  eyebrow,
  title,
  intro,
  crumbs,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(160deg,#070b18,#0b1224_55%,#16223f)] text-white">
      <div className="aurora left-[-6%] top-[-30%] h-72 w-72 bg-brand-600/40" />
      <div className="aurora right-[-4%] bottom-[-40%] h-72 w-72 bg-magenta-500/30" />
      <div className="bg-grid absolute inset-0" />
      <div className="relative mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        {crumbs && (
          <div className="mb-6">
            <Breadcrumbs items={crumbs} />
          </div>
        )}
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-200 ring-1 ring-white/15">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.1] sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-2xl text-lg text-slate-300/85">{intro}</p>
        )}
        {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}

// --- Related cards ------------------------------------------------------
export function RelatedCard({
  kicker,
  title,
  desc,
  href,
}: {
  kicker: string;
  title: string;
  desc?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-line bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-card"
    >
      <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
        {kicker}
      </span>
      <span className="mt-1 font-bold text-ink group-hover:text-brand-700">
        {title}
      </span>
      {desc && <span className="mt-1 text-sm text-muted">{desc}</span>}
    </Link>
  );
}

export function RelatedGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

// --- Formulas / definitions / problems ---------------------------------
/** Karta wzoru: numer, nazwa jako etykieta, DUŻY wzór na tle brand, opis. */
export function FormulaGrid({ formulas }: { formulas: Formula[] }) {
  if (!formulas?.length) return null;
  return (
    <div className="not-prose grid gap-4 sm:grid-cols-2">
      {formulas.map((f, i) => (
        <div
          key={f.name}
          className="relative overflow-hidden rounded-2xl border border-brand-100 bg-white p-4 shadow-soft sm:p-5"
        >
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#6b4df6,#a855f7,#f43f8f)]"
          />
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-brand-500 text-xs font-extrabold text-white">
              {i + 1}
            </span>
            <p className="pt-0.5 text-sm font-bold leading-snug text-ink">{f.name}</p>
          </div>
          <div className="mt-3 overflow-x-auto rounded-xl bg-[linear-gradient(135deg,#f2efff,#fff0f7)] px-3 py-4 text-center ring-1 ring-brand-100 [&_.katex-display]:my-0 [&_.katex]:text-[1.45rem] sm:[&_.katex]:text-[1.6rem]">
            <MathContent html={`$$${f.latex}$$`} className="prose-fs !text-ink" />
          </div>
          <p className="mt-3 text-sm text-slate">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}

/** Pojęcie: pasek akcentowy + duży termin - ma wyglądać jak hasło w słowniku, nie jak akapit. */
export function DefinitionList({ defs }: { defs: Definition[] }) {
  if (!defs?.length) return null;
  return (
    <dl className="not-prose grid gap-3 sm:grid-cols-2">
      {defs.map((d) => (
        <div
          key={d.term}
          className="rounded-2xl border-l-4 border-brand-500 bg-white p-4 shadow-soft ring-1 ring-line sm:p-5"
        >
          <dt className="font-display text-lg font-extrabold leading-tight text-brand-700">
            {d.term}
          </dt>
          <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-slate">
            <MathContent html={d.def} className="!text-[0.95rem]" />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * „Ściąga” tuż pod nagłówkiem strony teorii: najważniejsze wzory i pojęcia
 * widoczne od razu, zanim czytelnik zacznie przewijać teorię. Linkuje do
 * pełnych sekcji (#wzory, #pojecia).
 */
export function QuickSheet({
  formulas,
  defs,
  limit = 6,
}: {
  formulas: Formula[];
  defs: Definition[];
  limit?: number;
}) {
  if (!formulas?.length && !defs?.length) return null;
  const top = formulas.slice(0, limit);
  const rest = Math.max(0, formulas.length - top.length);
  return (
    <section
      aria-label="Ściąga: najważniejsze wzory i pojęcia"
      className="relative overflow-hidden rounded-3xl bg-[linear-gradient(150deg,#0b1224,#16223f)] p-5 text-white shadow-card sm:p-7"
    >
      <div className="aurora right-[-10%] top-[-30%] h-56 w-56 bg-brand-500/40" />
      <div className="aurora bottom-[-40%] left-[10%] h-56 w-56 bg-magenta-500/25" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-200 ring-1 ring-white/15">
            ⚡ Ściąga - to musisz znać
          </p>
          <div className="flex gap-2 text-xs font-semibold">
            {formulas.length > 0 && (
              <a
                href="#wzory"
                className="rounded-full bg-white/10 px-3 py-1.5 text-white ring-1 ring-white/15 transition hover:bg-white/20"
              >
                Wszystkie wzory ↓
              </a>
            )}
            {defs.length > 0 && (
              <a
                href="#pojecia"
                className="rounded-full bg-white/10 px-3 py-1.5 text-white ring-1 ring-white/15 transition hover:bg-white/20"
              >
                Pojęcia ↓
              </a>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
          {top.length > 0 && (
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-slate-400">
                Najważniejsze wzory
              </p>
              <ul className="mt-3 grid gap-2">
                {top.map((f) => (
                  <li
                    key={f.name}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-white/[0.06] px-3.5 py-2.5 ring-1 ring-white/10"
                  >
                    <span className="min-w-0 text-xs font-semibold leading-snug text-slate-200">
                      {f.name}
                    </span>
                    <span className="flex-none overflow-x-auto text-white [&_.katex]:text-[1.05rem]">
                      <MathContent html={`\\(${f.latex}\\)`} className="!text-white" />
                    </span>
                  </li>
                ))}
              </ul>
              {rest > 0 && (
                <a
                  href="#wzory"
                  className="mt-3 inline-block text-xs font-semibold text-brand-200 underline underline-offset-4 hover:text-white"
                >
                  + jeszcze {rest} {rest === 1 ? 'wzór' : rest < 5 ? 'wzory' : 'wzorów'} niżej
                </a>
              )}
            </div>
          )}

          {defs.length > 0 && (
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-slate-400">
                Kluczowe pojęcia
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {defs.map((d) => (
                  <li key={d.term}>
                    <a
                      href="#pojecia"
                      className="inline-block rounded-full bg-[linear-gradient(120deg,rgba(107,77,246,0.35),rgba(244,63,143,0.25))] px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:ring-white/40"
                    >
                      {d.term}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function ProblemCard({ p, n }: { p: Problem; n?: number }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-6 shadow-soft">
      <h3 className="flex items-center gap-2 text-lg font-extrabold text-ink">
        {n != null && (
          <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-500 text-sm text-white">
            {n}
          </span>
        )}
        {p.title}
      </h3>
      <p className="mt-2 text-slate">{p.tresc}</p>
      {p.steps?.length > 0 && (
        <ol className="mt-4 space-y-2">
          {p.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                {i + 1}
              </span>
              <MathContent html={s} className="prose-fs flex-1" />
            </li>
          ))}
        </ol>
      )}
      {p.answer && (
        <div className="mt-4 rounded-xl bg-brand-50 p-4 text-sm font-semibold text-brand-800">
          <MathContent html={p.answer} className="prose-fs" />
        </div>
      )}
    </article>
  );
}

// --- CTA band -----------------------------------------------------------
import type { Course } from '@/lib/courses';
import { SINGLE_COURSE_PRICE } from '@/lib/courses';

/**
 * Pasek CTA pod treścią SEO. Z `course` pokazuje dodatkowo (jako główny)
 * przycisk do konkretnego działu w panelu kursu - tam temat jest szeroko
 * omówiony (wideo, 4 poziomy PDF, quiz) i można kupić sam ten dział.
 */
export function CtaBand({ course }: { course?: Course }) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(150deg,#070b18,#0f1b36)] py-16 text-white">
      <div className="aurora left-[15%] top-[-30%] h-64 w-64 bg-brand-600/40" />
      <div className="aurora right-[10%] bottom-[-30%] h-64 w-64 bg-magenta-500/30" />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
          {course
            ? `Chcesz przerobić ten dział do końca?`
            : 'Potrzebujesz pomocy z fizyką?'}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-300/85">
          {course
            ? `W kursie dział „${course.title}” ma lekcję wideo, cztery poziomy materiałów PDF (od teorii po arkusze CKE) i quiz. Możesz kupić sam ten dział za ${SINGLE_COURSE_PRICE} zł albo cały kurs.`
            : 'Dołącz do kursu online albo umów indywidualne korepetycje. Tłumaczymy fizykę prosto - krok po kroku, aż zrozumiesz.'}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          {course && (
            <Link
              href={`/kurs/${course.id}`}
              className="rounded-full bg-[linear-gradient(120deg,#6b4df6,#a855f7,#f43f8f)] px-7 py-3.5 font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
            >
              {course.icon} Dział {course.id}: {course.title} →
            </Link>
          )}
          <Link
            href="/cennik"
            className={
              course
                ? 'rounded-full bg-white/10 px-7 py-3.5 font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20'
                : 'rounded-full bg-[linear-gradient(120deg,#6b4df6,#a855f7,#f43f8f)] px-7 py-3.5 font-semibold text-white shadow-glow transition hover:-translate-y-0.5'
            }
          >
            📚 {course ? 'Cały kurs i ceny' : 'Przejdź do kursu'}
          </Link>
          <Link
            href="/korepetycje"
            className="rounded-full bg-white/10 px-7 py-3.5 font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
          >
            👨‍🏫 Zobacz korepetycje
          </Link>
        </div>
      </div>
    </section>
  );
}

// --- FAQ (odpowiedzi mogą zawierać HTML/math) --------------------------
import type { Faq } from '@/lib/seo';

export function faqLd(faqs: Faq[]) {
  if (!faqs?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q.replace(/<[^>]+>/g, ' ').trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      },
    })),
  };
}

export function SeoFaq({ faqs }: { faqs: Faq[] }) {
  if (!faqs?.length) return null;
  return (
    <div>
      <h2 className="mb-5 font-display text-2xl font-extrabold text-ink">
        Najczęściej zadawane pytania
      </h2>
      <div className="divide-y divide-line rounded-3xl border border-line bg-white shadow-soft">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="group px-6 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold text-ink">
              {f.q}
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="pb-5">
              <MathContent html={f.a} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

// --- Prose section wrapper ---------------------------------------------
export function ContentSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-cloud py-14 sm:py-16">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">{children}</div>
    </section>
  );
}
