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
    default: 'Fizyka Statkiem — Kursy fizyki online do matury',
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
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: SITE.url,
    siteName: SITE.name,
    title: 'Fizyka Statkiem — Kursy fizyki online do matury',
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fizyka Statkiem — Kursy fizyki online',
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

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: SITE.name,
  url: SITE.url,
  email: SITE.email,
  logo: `${SITE.url}/images/logo_magenta.png`,
  sameAs: [SITE.socials.instagram, SITE.socials.facebook],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
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
