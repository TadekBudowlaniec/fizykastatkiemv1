import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Twój profil',
  robots: { index: false, follow: false },
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return children;
}
