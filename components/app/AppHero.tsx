import { PageHero } from '@/components/ui/PageHero';
import type { ReactNode } from 'react';

/**
 * Cienki adapter nad wspólnym PageHero (jedno źródło markupu ciemnego mini-hero).
 * Zachowuje dotychczasowe API stron aplikacji (`breadcrumb`).
 */
export function AppHero({
  title,
  subtitle,
  breadcrumb,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumb?: { label: string; href: string }[];
  children?: ReactNode;
}) {
  return (
    <PageHero title={title} subtitle={subtitle} crumbs={breadcrumb} size="sm">
      {children}
    </PageHero>
  );
}
