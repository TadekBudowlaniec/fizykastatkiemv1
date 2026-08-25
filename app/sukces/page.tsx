import type { Metadata } from 'next';
import { SuccessClient } from './SuccessClient';

export const metadata: Metadata = {
  title: 'Dziękujemy za zakup',
  robots: { index: false, follow: false },
};

export default function SukcesPage() {
  return <SuccessClient />;
}
