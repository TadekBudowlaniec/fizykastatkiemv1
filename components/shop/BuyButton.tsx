'use client';

import { useState } from 'react';
import { startCheckout } from '@/lib/checkout';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export function BuyButton({
  courseId,
  children,
  variant = 'gradient',
  size = 'md',
  className,
}: {
  courseId: number | string;
  children: ReactNode;
  variant?: 'gradient' | 'outline' | 'light' | 'dark' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await startCheckout(courseId);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Coś poszło nie tak. Spróbuj ponownie.'
      );
      setLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Przekierowanie…' : children}
      </Button>
      {error && <p className="text-xs text-magenta-600">{error}</p>}
    </div>
  );
}
