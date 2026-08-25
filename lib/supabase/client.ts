'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_ENV } from '@/lib/site';

let client: SupabaseClient | null = null;

/**
 * Singleton klienta Supabase dla przeglądarki.
 * Używamy klasycznego createClient (flow implicit, detectSessionInUrl) — tak jak
 * działająca stara wersja — aby zachować logowanie magic-linkiem (np. /planer).
 */
export function getSupabaseBrowser(): SupabaseClient {
  if (!client) {
    client = createClient(PUBLIC_ENV.supabaseUrl, PUBLIC_ENV.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
