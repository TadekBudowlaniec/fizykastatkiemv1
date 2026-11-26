// Dokąd prowadzą krótkie linki z bio (/tiktok, /ig, /yt, /fb).
// Zmień tutaj, np. na '/' (strona główna). Z końcowym "/" - inaczej
// trailingSlash dołoży drugie przekierowanie.
const BIO_LANDING = '/planer/';

const BIO_LINKS = {
  tiktok: 'tiktok',
  ig: 'instagram',
  yt: 'youtube',
  fb: 'facebook',
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Lint uruchamiamy osobno (npm run lint); build go nie blokuje.
  eslint: { ignoreDuringBuilds: true },
  // Zgodność ze starymi URL-ami SEO (canonical z końcowym "/")
  trailingSlash: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'kldekjrpottsqebueojg.supabase.co' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  async redirects() {
    return [
      // Stare ścieżki SPA -> nowe trasy Next.js
      { source: '/home', destination: '/', permanent: true },
      { source: '/pricing', destination: '/cennik', permanent: false },
      // Stary slug wpisu bloga (z generate.js) -> nowy slug w blog.json
      {
        source: '/blog/zadania-doswiadczalne-matura-fizyka',
        destination: '/blog/zadania-doswiadczalne-na-maturze-z-fizyki',
        permanent: true,
      },
      // Ukryta strona reklamowa (noindex) zastąpiona prawdziwym poradnikiem na blogu (26.11.2026)
      {
        source: '/artykuly/biuro-tlumaczen-online',
        destination: '/blog/studia-za-granica-po-maturze-dokumenty/',
        permanent: true,
      },
      // Krótkie linki do bio w social media -> UTM (302, żeby dało się zmienić cel)
      ...Object.entries(BIO_LINKS).map(([path, source]) => ({
        source: `/${path}`,
        destination: `${BIO_LANDING}?utm_source=${source}&utm_medium=social&utm_campaign=bio`,
        statusCode: 302,
      })),
    ];
  },
};

export default nextConfig;
