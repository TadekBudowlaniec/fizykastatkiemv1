import type { Metadata, Viewport } from 'next';
import { inter, poppins } from '@/lib/fonts';
import { SITE } from '@/lib/site';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import 'katex/dist/katex.min.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Fizyka Statkiem - Kursy fizyki online do matury',
    template: '%s | Fizyka Statkiem',
  },
  description: SITE.description,
  keywords: [
    'fizyka',
    'kurs fizyki online',
    'matura z fizyki',
    'korepetycje z fizyki',
    'mechanika',
    'termodynamika',
    'elektromagnetyzm',
    'optyka',
  ],
  authors: [{ name: SITE.owner }],
  creator: SITE.name,
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: SITE.url,
    siteName: SITE.name,
    title: 'Fizyka Statkiem - Kursy fizyki online do matury',
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fizyka Statkiem - Kursy fizyki online',
    description: SITE.description,
    images: [SITE.ogImage],
  },
  icons: {
    icon: '/images/czarny_statek.png',
    apple: '/images/czarny_statek.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b1224',
  width: 'device-width',
  initialScale: 1,
};

// Jeden graf encji (@id) współdzielony przez całą witrynę — spina Organizację,
// WebSite i osobę (autora/korepetytora) w spójną wiedzę dla Google i silników AI.
const graphJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': `${SITE.url}/#org`,
      name: SITE.name,
      url: SITE.url,
      email: SITE.email,
      telephone: SITE.telephone,
      description:
        'Kursy fizyki online do matury (poziom rozszerzony) oraz korepetycje z fizyki i matematyki — Lublin i online.',
      logo: `${SITE.url}/images/logo_magenta.png`,
      image: `${SITE.url}/images/logo_magenta.png`,
      founder: { '@id': `${SITE.url}/#czarek` },
      areaServed: { '@type': 'Country', name: 'Polska' },
      address: {
        '@type': 'PostalAddress',
        addressLocality: SITE.addressLocality,
        addressRegion: SITE.addressRegion,
        addressCountry: 'PL',
      },
      knowsLanguage: 'pl',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: SITE.email,
        telephone: SITE.telephone,
        availableLanguage: 'Polish',
      },
      sameAs: [SITE.socials.instagram, SITE.socials.facebook],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      name: SITE.name,
      url: SITE.url,
      inLanguage: 'pl',
      publisher: { '@id': `${SITE.url}/#org` },
    },
    {
      '@type': 'Person',
      '@id': `${SITE.url}/#czarek`,
      name: SITE.owner,
      alternateName: SITE.ownerAlias,
      jobTitle: 'Nauczyciel fizyki i matematyki, twórca kursu Fizyka Statkiem',
      description:
        'Korepetytor i twórca kursu maturalnego z fizyki. Fizykę rozszerzoną na maturze zdał na 82%, uczy fizyki i matematyki online oraz w Lublinie.',
      url: `${SITE.url}/o-mnie/`,
      email: SITE.email,
      telephone: SITE.telephone,
      worksFor: { '@id': `${SITE.url}/#org` },
      knowsAbout: [
        'Fizyka',
        'Matematyka',
        'Matura z fizyki',
        'Matura z matematyki',
        'Fizyka rozszerzona',
      ],
      sameAs: [SITE.socials.instagram, SITE.socials.facebook],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graphJsonLd) }}
        />
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
