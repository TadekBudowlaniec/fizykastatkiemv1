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
    ];
  },
};

export default nextConfig;
