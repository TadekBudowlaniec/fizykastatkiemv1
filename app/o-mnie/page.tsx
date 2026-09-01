import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { SITE } from '@/lib/site';
import { JsonLd, breadcrumbLd } from '@/components/seo/SeoBits';

export const metadata: Metadata = {
  title: 'O mnie — Cezary Prusak, korepetytor i twórca kursu fizyki',
  description:
    'Kim jestem: Cezary Prusak. Fizykę rozszerzoną zdałem na 82%. Uczę fizyki i matematyki online oraz w Lublinie i tworzę kurs maturalny Fizyka Statkiem.',
  alternates: { canonical: '/o-mnie/' },
};

const profileJsonLd = [
  { '@context': 'https://schema.org', '@type': 'ProfilePage', mainEntity: { '@id': `${SITE.url}/#czarek` } },
  breadcrumbLd([
    { name: 'Start', url: '/' },
    { name: 'O mnie', url: '/o-mnie/' },
  ]),
];

const wyniki = [
  { val: '82%', lbl: 'Fizyka rozszerzona (matura)' },
  { val: '92%', lbl: 'Matematyka rozszerzona' },
  { val: '100%', lbl: 'Matematyka podstawowa' },
];

export default function OMniePage() {
  return (
    <>
      <JsonLd data={profileJsonLd} />
      <PageHero
        eyebrow="O mnie"
        title={
          <>
            Cześć, jestem <span className="text-gradient">Cezary Prusak</span>
          </>
        }
        subtitle="Uczę fizyki i matematyki tak, żebyś zrozumiał mechanizm — nie wkuwał wzorów. Prowadzę korepetycje i tworzę kurs maturalny Fizyka Statkiem."
        crumbs={[{ label: 'Start', href: '/' }, { label: 'O mnie' }]}
      />

      <section className="bg-cloud py-14 sm:py-16">
        <Container size="narrow">
          <div className="prose-fs max-w-none">
            <p>
              Nazywam się <strong>Cezary Prusak</strong>. Fizykę na
              maturze zdałem na poziomie rozszerzonym na <strong>82%</strong>,
              matematykę rozszerzoną na <strong>92%</strong>, a podstawową na{' '}
              <strong>100%</strong>. Od tamtej pory pomagam maturzystom
              osiągać wyniki, z których są dumni — moi uczniowie regularnie
              przekraczają 90%.
            </p>
            <p>
              Uczę <strong>fizyki</strong> i <strong>matematyki</strong> —{' '}
              indywidualnie (korepetycje) oraz w ramach kursu online{' '}
              <strong>Fizyka Statkiem</strong>. Moja zasada jest prosta:{' '}
              pokazuję, <em>skąd bierze się wzór i dlaczego zjawisko działa
              tak, a nie inaczej</em>. Kiedy rozumiesz mechanizm, przestajesz
              wkuwać, a zadania maturalne stają się logiczne.
            </p>

            <h2>Jak i gdzie uczę</h2>
            <ul>
              <li>
                <strong>Online</strong> — Discord + interaktywna tablica,
                notatki zapisują się automatycznie.
              </li>
              <li>
                <strong>Stacjonarnie w Lublinie</strong> — spotkania twarzą w
                twarz, możliwy dojazd do ucznia.
              </li>
              <li>
                <strong>Zakres</strong> — matura z fizyki i matematyki (poziom
                rozszerzony i podstawowy), egzamin ósmoklasisty, bieżące
                sprawdziany.
              </li>
            </ul>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {wyniki.map((w) => (
              <div
                key={w.lbl}
                className="rounded-2xl border border-line bg-white p-5 text-center shadow-soft"
              >
                <span className="block font-display text-3xl font-extrabold text-brand-600">
                  {w.val}
                </span>
                <span className="mt-1 block text-sm text-muted">{w.lbl}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/cennik" variant="gradient" size="lg" className="w-full sm:w-auto">
              Zobacz kurs maturalny
            </Button>
            <Button href="/korepetycje" variant="outline" size="lg" className="w-full sm:w-auto">
              Umów korepetycje
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
