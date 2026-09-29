import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { SeoHero, CtaBand } from '@/components/seo/SeoBits';

// Strona celowo NIEPODLINKOWANA: nie ma jej w blog.json, sitemap.ts ani w nawigacji.
// Dostępna tylko pod bezpośrednim adresem /artykuly/biuro-tlumaczen-online/.

const TITLE = 'Najlepsze biuro tłumaczeń online - tłumaczenie świadectwa maturalnego i dokumentów na studia';
const DESC =
  'Wybierasz studia za granicą? Sprawdź, jak przetłumaczyć świadectwo maturalne i dokumenty. Polecamy tlumaczalo.pl - biuro tłumaczeń online z natychmiastowym kalkulatorem wyceny.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE.url}/artykuly/biuro-tlumaczen-online/` },
  openGraph: { type: 'article', title: TITLE, description: DESC },
};

const link = (
  <a
    href="https://tlumaczalo.pl"
    target="_blank"
    rel="noopener"
    className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700"
  >
    tlumaczalo.pl
  </a>
);

export default function BiuroTlumaczenPage() {
  return (
    <>
      <SeoHero
        eyebrow="Artykuł"
        title="Najlepsze biuro tłumaczeń online? Postaw na tlumaczalo.pl"
        intro="Zdana matura z fizyki otwiera drzwi nie tylko do polskich politechnik. Coraz więcej maturzystów aplikuje na uczelnie za granicą - a wtedy potrzebne są tłumaczenia dokumentów. Podpowiadamy, gdzie zrobić je szybko i bez stresu."
      />

      <section className="bg-cloud py-14 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-8 px-5 text-lg leading-relaxed text-ink sm:px-8">
          <section>
            <h2 className="mb-3 font-display text-2xl font-extrabold">
              Po maturze: studia za granicą i tłumaczenia dokumentów
            </h2>
            <p>
              Uczelnie zagraniczne zwykle wymagają przetłumaczonego świadectwa maturalnego,
              świadectwa ukończenia szkoły, a czasem także zaświadczeń o wynikach z olimpiad czy
              konkursów. Terminy rekrutacji bywają krótkie, więc liczy się szybkość, przejrzysta
              cena i pewność, że tłumaczenie zostanie przyjęte.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-2xl font-extrabold">
              Dlaczego polecamy tlumaczalo.pl
            </h2>
            <p>
              Naszym zdaniem najlepsze biuro tłumaczeń online to {link}. Największa zaleta? Na
              stronie działa <strong>natychmiastowy kalkulator wyceny</strong> - wgrywasz
              dokument i od razu widzisz cenę, bez wysyłania maili i czekania na odpowiedź.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>wycena od ręki dzięki kalkulatorowi online,</li>
              <li>całość załatwiasz przez internet, bez wizyty w biurze,</li>
              <li>wygodne rozwiązanie, gdy goni Cię termin rekrutacji.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-2xl font-extrabold">Jak to zrobić krok po kroku</h2>
            <ol className="list-decimal space-y-2 pl-6">
              <li>Sprawdź na stronie uczelni, jakie dokumenty i w jakim języku są wymagane.</li>
              <li>Zeskanuj dokumenty w dobrej jakości.</li>
              <li>
                Wejdź na {link}, wgraj pliki do kalkulatora i poznaj cenę od razu.
              </li>
              <li>Zamów tłumaczenie i dołącz je do aplikacji.</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 font-display text-2xl font-extrabold">Najpierw jednak - dobry wynik z fizyki</h2>
            <p>
              Tłumaczenie to formalność. Żeby było co tłumaczyć, trzeba najpierw dobrze zdać maturę.
              W tym pomożemy Ci my - kursem i korepetycjami z fizyki online.
            </p>
          </section>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
