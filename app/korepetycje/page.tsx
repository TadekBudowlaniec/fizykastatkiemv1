import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { SITE } from '@/lib/site';
import { TUTORING_PRICE } from '@/lib/courses';
import { FaqSection, type FaqItem } from '@/components/ui/Faq';
import { JsonLd, breadcrumbLd, faqLd } from '@/components/seo/SeoBits';

const korepetycjeFaq: FaqItem[] = [
  {
    q: 'Ile kosztują korepetycje z fizyki?',
    a: `Korepetycje kosztują ${TUTORING_PRICE} zł za 60 minut — tyle samo online i stacjonarnie w Lublinie. Płatność po zajęciach lub z góry za pakiet lekcji.`,
  },
  {
    q: 'Korepetycje z fizyki online czy stacjonarnie w Lublinie?',
    a: 'Prowadzę oba warianty. Online na Discordzie z interaktywną tablicą (notatki zapisują się automatycznie), a stacjonarnie w Lublinie na os. Rury. Skuteczność jest taka sama — wybierasz to, co dla Ciebie wygodniejsze.',
  },
  {
    q: 'Czy przygotujesz mnie do matury rozszerzonej z fizyki?',
    a: 'Tak, to moja specjalność. Fizykę rozszerzoną zdałem na 82%, a moi uczniowie regularnie osiągają 90%+. Uczę pod wymagania CKE i typowe zadania maturalne.',
  },
  {
    q: 'Jak wyglądają zajęcia online?',
    a: 'Spotykamy się na Discordzie z interaktywną tablicą. Rozwiązujemy zadania na żywo, a wszystkie notatki zostają u Ciebie do powtórki.',
  },
  {
    q: 'Od kiedy zacząć przygotowania do matury z fizyki?',
    a: 'Im wcześniej, tym spokojniej — ale nawet kilka miesięcy skoncentrowanej pracy potrafi dać duży skok wyniku. Zaczynamy od diagnozy braków na pierwszej lekcji.',
  },
];

const korepetycjeJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE.url}/korepetycje/#service`,
    serviceType: 'Korepetycje z fizyki i matematyki',
    name: 'Korepetycje z fizyki — matura rozszerzona (online i Lublin)',
    description:
      'Indywidualne korepetycje z fizyki (i matematyki): przygotowanie do matury rozszerzonej i egzaminu ósmoklasisty. Online (Discord + interaktywna tablica) oraz stacjonarnie w Lublinie.',
    provider: { '@id': `${SITE.url}/#czarek` },
    areaServed: [
      { '@type': 'City', name: 'Lublin' },
      { '@type': 'Country', name: 'Polska' },
    ],
    audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
    inLanguage: 'pl',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PLN',
      price: String(TUTORING_PRICE),
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: String(TUTORING_PRICE),
        priceCurrency: 'PLN',
        unitCode: 'HUR',
        unitText: '60 minut',
      },
    },
  },
  faqLd(korepetycjeFaq),
  breadcrumbLd([
    { name: 'Start', url: '/' },
    { name: 'Korepetycje z fizyki', url: '/korepetycje/' },
  ]),
];

export const metadata: Metadata = {
  title: 'Korepetycje z fizyki — matura rozszerzona (online i Lublin)',
  description:
    'Korepetycje z fizyki do matury rozszerzonej — online (Discord + tablica) i stacjonarnie w Lublinie. Prowadzi Czarek (82% z fizyki rozszerzonej). Także matematyka i egzamin 8-klasisty.',
  alternates: { canonical: '/korepetycje/' },
};

const mailto =
  'mailto:fizykastatkiem@gmail.com?subject=Zapytanie%20o%20korepetycje';

const stats = [
  { val: '100%', lbl: 'Matematyka podstawowa' },
  { val: '92%', lbl: 'Matematyka rozszerzona' },
  { val: '82%', lbl: 'Fizyka rozszerzona' },
];

const logistics = [
  {
    icon: '🏠',
    title: 'Stacjonarnie',
    desc: 'Lublin (os. Rury). Tradycyjne spotkania twarzą w twarz w przyjaznej atmosferze. Możliwy dojazd do ucznia (za dopłatą).',
  },
  {
    icon: '💻',
    title: 'Online (Discord + tablica)',
    desc: 'Nowoczesne lekcje z interaktywną tablicą. Wszystkie notatki zapisują się automatycznie. Wygoda i skuteczność bez wychodzenia z domu.',
  },
  {
    icon: '🎯',
    title: 'Indywidualny plan',
    desc: 'Matura, egzamin 8-klasisty czy bieżące sprawdziany - dopasowuję tempo i metody pod Twoje potrzeby.',
  },
];

const proofs = [
  {
    score: '🏆 94%',
    subject: 'Fizyka rozsz.',
    quote: 'Hejj, super poszło, 94%! Mega dzięki za pomoc ❤️',
    author: 'Nadia',
    role: 'Matura rozszerzona',
  },
  {
    score: '⏱️ 1 mc',
    subject: 'Po 10 latach',
    quote:
      'Jak na tak krótki czas przygotowania, wynik jest lepszy, niż się spodziewałem. (Niecały miesiąc nauki)',
    author: 'Filip, 28 lat',
    role: 'Matura rozszerzona',
  },
  {
    score: '📈 ~90%',
    subject: 'Matma podst.',
    quote:
      'Córka wróciła zadowolona. Z tego co policzyła, powinna mieć 90%. Poszła na egzamin naprawdę spokojna.',
    author: 'Mama Darii',
    role: 'Matura rozszerzona',
  },
];

export default function KorepetycjePage() {
  return (
    <>
      <JsonLd data={korepetycjeJsonLd} />
      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#070b18,#0b1224_55%,#16223f)] py-16 text-white sm:py-24">
        <div className="aurora left-[-6%] top-[-10%] h-80 w-80 bg-brand-600/45" />
        <div className="aurora right-[-6%] bottom-[-20%] h-80 w-80 bg-magenta-500/30" />
        <div className="bg-grid absolute inset-0" />
        <Container size="wide">
          <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-200 ring-1 ring-white/15">
                🚀 Skutecznie, szybko i z pasją
              </span>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.06] sm:text-5xl">
                Korepetycje z fizyki —{' '}
                <span className="text-gradient">zrozum, nie wkuwaj</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-300/85">
                Cześć, jestem Czarek. Fizykę rozszerzoną na maturze zdałem na{' '}
                <strong className="text-white">82%</strong>, a moi uczniowie
                regularnie osiągają 90%+. Uczę fizyki i matematyki —{' '}
                <strong className="text-white">pokazuję mechanizm zjawiska</strong>,
                a nie każę wkuwać wzorów. Online i stacjonarnie w Lublinie.
              </p>

              <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Moje wyniki z matury:
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {stats.map((s) => (
                  <div
                    key={s.lbl}
                    className="glass rounded-2xl px-5 py-3 text-center"
                  >
                    <span className="block font-display text-2xl font-extrabold text-white">
                      {s.val}
                    </span>
                    <span className="block text-xs text-slate-300">{s.lbl}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col items-start gap-3">
                <Button href={mailto} variant="gradient" size="lg">
                  Umów pierwszą lekcję
                </Button>
                <p className="text-sm font-semibold text-white">
                  {TUTORING_PRICE} zł / 60 min · online i stacjonarnie w Lublinie
                </p>
                <p className="text-sm text-magenta-300">
                  📅 Zostały ostatnie wolne terminy!
                </p>
                <p className="text-sm text-slate-400">
                  lub napisz bezpośrednio:{' '}
                  <a
                    href={`mailto:${SITE.email}`}
                    className="font-semibold text-white underline"
                  >
                    {SITE.email}
                  </a>
                </p>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="absolute h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(107,77,246,0.5),transparent_70%)] blur-2xl" />
              <Image
                src="/images/bialy.svg"
                alt="Korepetytor Czarek"
                width={420}
                height={420}
                priority
                className="relative w-64 animate-[float_8s_ease-in-out_infinite] drop-shadow-[0_30px_60px_rgba(107,77,246,0.45)] sm:w-80"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Logistyka */}
      <section className="bg-cloud py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Jak wyglądają zajęcia?"
            title="Uczysz się tak, jak Ci wygodnie"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {logistics.map((c, i) => (
              <Reveal key={c.title} delay={i * 90}>
                <article className="h-full rounded-3xl border border-line bg-white p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f2efff,#ffe6f3)] text-3xl ring-1 ring-brand-100">
                    {c.icon}
                  </div>
                  <h3 className="mt-4 text-xl font-extrabold text-ink">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-muted">{c.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Opinie */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Owoce współpracy"
            title="Uczniowie czują się pewnie na maturze"
            subtitle="Historie maturzystów, którzy przestali wkuwać, a zaczęli rozumieć."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {proofs.map((p, i) => (
              <Reveal key={p.author} delay={i * 90}>
                <figure className="flex h-full flex-col rounded-3xl border border-line bg-cloud p-7 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg font-extrabold text-brand-600">
                      {p.score}
                    </span>
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-600">
                      {p.subject}
                    </span>
                  </div>
                  <blockquote className="mt-4 flex-1 text-slate">
                    „{p.quote}”
                  </blockquote>
                  <figcaption className="mt-5 border-t border-line pt-4">
                    <span className="block font-bold text-ink">{p.author}</span>
                    <span className="block text-sm text-muted">{p.role}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <FaqSection
        items={korepetycjeFaq}
        subtitle="Masz inne pytanie? Napisz — odpowiem osobiście."
      />

      {/* Finalne CTA */}
      <section className="relative overflow-hidden bg-[linear-gradient(150deg,#070b18,#0f1b36)] py-20 text-white sm:py-24">
        <div className="aurora left-[10%] top-[-30%] h-80 w-80 bg-brand-600/50" />
        <div className="aurora right-[10%] bottom-[-30%] h-80 w-80 bg-magenta-500/40" />
        <Container>
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              Nie odkładaj nauki na później
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300/85">
              Im wcześniej zaczniesz, tym spokojniej podejdziesz do egzaminu.
              Wystarczy kilka miesięcy pracy, by osiągnąć wynik marzeń.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4">
              <Button href={`mailto:${SITE.email}`} variant="gradient" size="lg">
                📧 Napisz do mnie
              </Button>
              <div className="flex gap-4 text-sm">
                <a
                  href={SITE.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 underline hover:text-white"
                >
                  Instagram
                </a>
                <a
                  href={SITE.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 underline hover:text-white"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
