'use client';

import { getSupabaseBrowser } from '@/lib/supabase/client';

/**
 * Rozpoczyna checkout Stripe dla działu (1..16) lub pakietu
 * ('full_access' | 'full_access_live' | 'vip'). Obsługuje zalogowanych i gości.
 * Używa istniejącej Netlify Function /create-checkout-session i przekierowuje
 * na hostowaną stronę płatności Stripe (session.url).
 */
export async function startCheckout(courseId: number | string): Promise<void> {
  const supabase = getSupabaseBrowser();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? null;

  const promoStartedAt =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('promoStartedAt')
      : null;

  const body: Record<string, unknown> = { courseId };
  if (promoStartedAt) body.promoStartedAt = Number(promoStartedAt);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    const guestEmail =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('squeezeMagicEmail')
        : null;
    if (guestEmail) body.guestEmail = guestEmail;
  }

  const res = await fetch('/.netlify/functions/create-checkout-session', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Checkout nie powiódł się (${res.status}). ${text}`);
  }

  const { url } = (await res.json()) as { id: string; url: string | null };
  if (!url) throw new Error('Brak adresu płatności Stripe.');
  window.location.href = url;
}
