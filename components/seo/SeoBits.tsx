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
export function FormulaGrid({ formulas }: { formulas: Formula[] }) {
  if (!formulas?.length) return null;
  return (
    <div className="not-prose grid gap-4 sm:grid-cols-2">
      {formulas.map((f) => (
        <div
          key={f.name}
          className="rounded-2xl border border-line bg-white p-5 shadow-soft"
        >
          <div className="text-sm font-bold text-brand-600">{f.name}</div>
          <div className="my-3 overflow-x-auto text-center text-lg">
            <MathContent html={`$$${f.latex}$$`} className="prose-fs" />
          </div>
          <div className="text-sm text-muted">{f.desc}</div>
        </div>
      ))}
    </div>
  );
}

export function DefinitionList({ defs }: { defs: Definition[] }) {
  if (!defs?.length) return null;
  return (
    <dl className="not-prose grid gap-3 sm:grid-cols-2">
      {defs.map((d) => (
        <div
          key={d.term}
          className="rounded-2xl border border-line bg-cloud p-5"
        >
          <dt className="font-bold text-ink">{d.term}</dt>
          <dd className="mt-1 text-sm text-slate">
            <MathContent html={d.def} />
          </dd>
        </div>
      ))}
    </dl>
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
export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(150deg,#070b18,#0f1b36)] py-16 text-white">
      <div className="aurora left-[15%] top-[-30%] h-64 w-64 bg-brand-600/40" />
      <div className="aurora right-[10%] bottom-[-30%] h-64 w-64 bg-magenta-500/30" />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
          Potrzebujesz pomocy z fizyką?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-300/85">
          Dołącz do kursu online albo umów indywidualne korepetycje. Tłumaczymy
          fizykę prosto - krok po kroku, aż zrozumiesz.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/cennik"
            className="rounded-full bg-[linear-gradient(120deg,#6b4df6,#a855f7,#f43f8f)] px-7 py-3.5 font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
          >
            📚 Przejdź do kursu
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
