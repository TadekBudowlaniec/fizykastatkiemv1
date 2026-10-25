'use client';

import { getSupabaseBrowser } from '@/lib/supabase/client';

/**
 * Wywołanie funkcji Netlify panelu admina: POST z tokenem sesji Supabase.
 * Autoryzacja (is_admin) odbywa się po stronie funkcji (_shared/admin-auth.js).
 */
export async function postAdmin<T>(path: string, body?: unknown): Promise<T> {
  const supabase = getSupabaseBrowser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Brak sesji.');
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || `Błąd ${res.status}`);
  }
  return (await res.json()) as T;
}
