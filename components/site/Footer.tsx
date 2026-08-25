import Link from 'next/link';
import Image from 'next/image';
import { SITE } from '@/lib/site';

const learnLinks = [
  { label: 'Kinematyka', href: '/fizyka/kinematyka' },
  { label: 'Dynamika', href: '/fizyka/dynamika' },
  { label: 'Termodynamika', href: '/fizyka/termodynamika' },
  { label: 'Elektrostatyka', href: '/fizyka/elektrostatyka' },
  { label: 'Optyka', href: '/fizyka/optyka-falowa' },
  { label: 'Baza wiedzy', href: '/baza-wiedzy' },
];

const examLinks = [
  { label: 'Matura z fizyki', href: '/matura-z-fizyki/kinematyka' },
  { label: 'Zadania z fizyki', href: '/zadania-z-fizyki/kinematyka' },
  { label: 'Blog maturalny', href: '/blog' },
  { label: 'Planer nauki', href: '/planer' },
];

const cityLinks = [
  { label: 'Korepetycje online', href: '/korepetycje' },
  { label: 'Korepetycje Warszawa', href: '/korepetycje-z-fizyki/warszawa' },
  { label: 'Korepetycje Kraków', href: '/korepetycje-z-fizyki/krakow' },
  { label: 'Korepetycje Wrocław', href: '/korepetycje-z-fizyki/wroclaw' },
  { label: 'Wszystkie miasta', href: '/korepetycje-z-fizyki' },
];

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-200">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-slate-300/70 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white">
      <div className="aurora left-[-10%] top-[-20%] h-72 w-72 bg-brand-600/40" />
      <div className="aurora right-[-5%] bottom-[-30%] h-80 w-80 bg-magenta-500/30" />

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/images/magenta_statek.png"
                alt=""
                width={40}
                height={40}
                className="h-9 w-9"
              />
              <span className="font-display text-xl font-extrabold">
                Fizyka<span className="text-gradient">Statkiem</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-300/70">
              Kursy fizyki online, które prowadzą Cię do matury krok po kroku —
              wideo HD, PDF-y, zadania i planer nauki.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { label: 'Instagram', href: SITE.socials.instagram },
                { label: 'Facebook', href: SITE.socials.facebook },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-slate-200 ring-1 ring-white/15 transition hover:bg-white/10 hover:text-white"
                  aria-label={s.label}
                >
                  {s.label.slice(0, 2)}
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Ucz się" links={learnLinks} />
          <FooterCol title="Matura" links={examLinks} />
          <FooterCol title="Korepetycje" links={cityLinks} />
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {SITE.name}. Wszystkie prawa zastrzeżone.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href={`mailto:${SITE.email}`} className="hover:text-white">
              {SITE.email}
            </a>
            <Link href="/regulamin" className="hover:text-white">
              Regulamin
            </Link>
            <Link href="/polityka-prywatnosci" className="hover:text-white">
              Polityka prywatności
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
