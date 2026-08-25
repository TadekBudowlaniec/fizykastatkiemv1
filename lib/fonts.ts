import { Inter, Poppins } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});
