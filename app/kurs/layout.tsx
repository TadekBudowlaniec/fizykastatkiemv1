import type { Metadata } from 'next';

// Panel kursu (płatna/zalogowana treść) — poza indeksem Google.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function KursLayout({ children }: { children: React.ReactNode }) {
  return children;
}
