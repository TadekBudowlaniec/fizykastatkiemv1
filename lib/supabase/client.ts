'use client';

import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_ENV } from '@/lib/site';

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Singleton klienta Supabase dla przeglądarki. */
export function getSupabaseBrowser() {
  if (!client) {
    client = createBrowserClient(
      PUBLIC_ENV.supabaseUrl,
      PUBLIC_ENV.supabaseAnonKey
    );
  }
  return client;
}
