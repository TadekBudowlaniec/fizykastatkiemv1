import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

/**
 * Manifest PWA - potrzebny, żeby panel dodany na ekran główny iPhone'a (Safari
 * → Udostępnij → Do ekranu początkowego) działał jako osobna aplikacja
 * (`display: standalone`) i mógł odbierać Web Push (iOS 16.4+ wymaga
 * zainstalowanej web-aplikacji z manifestem). Start w panelu admina.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fizyka Statkiem - panel',
    short_name: 'FS Admin',
    description: 'Panel administracyjny Fizyka Statkiem: sprzedaż, kursanci, leady, mailing.',
    start_url: '/admin/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b1224',
    theme_color: '#0b1224',
    lang: 'pl',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
