import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planer nauki',
  robots: { index: false, follow: false },
};

export default function PlanerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
