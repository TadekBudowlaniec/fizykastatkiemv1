'use client';

/**
 * Źródło pierwszego wejścia (first touch) do przypisania sprzedaży.
 * Cookie `fs_attr` (30 dni) zapisujemy tylko przy wejściu z utm_source
 * i tylko, gdy jeszcze go nie ma - kolejne wejścia go nie nadpisują.
 * Czyta je netlify/functions/create-checkout-session.js (nagłówek Cookie)
 * i wpisuje do metadata sesji Stripe.
 */
export const ATTR_COOKIE = 'fs_attr';
const MAX_AGE = 30 * 24 * 60 * 60; // 30 dni w sekundach
const KEYS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;

export type Attribution = Partial<Record<(typeof KEYS)[number], string>>;

function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? m[1] : null;
}

export function getAttribution(): Attribution | null {
  try {
    const raw = readCookie(ATTR_COOKIE);
    if (!raw) return null;
    const p = new URLSearchParams(decodeURIComponent(raw));
    const out: Attribution = {};
    for (const k of KEYS) {
      const v = p.get(k);
      if (v) out[k] = v;
    }
    return out.utm_source ? out : null;
  } catch {
    return null;
  }
}

export function captureAttribution(): void {
  try {
    if (getAttribution()) return; // first touch - nie nadpisujemy
    const url = new URLSearchParams(window.location.search);
    const source = url.get('utm_source');
    if (!source) return;
    const p = new URLSearchParams();
    for (const k of KEYS) {
      const v = url.get(k);
      if (v) p.set(k, v.slice(0, 100));
    }
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${ATTR_COOKIE}=${encodeURIComponent(p.toString())}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  } catch {
    /* cookies zablokowane - bez znaczenia dla działania strony */
  }
}

/** Źródło leada do GA4: utm_source z first touch albo 'direct'. */
export function getLeadSource(): string {
  return getAttribution()?.utm_source ?? 'direct';
}
