'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

type Gtag = (...args: unknown[]) => void;

/** Zdarzenie GA4 - bezpiecznie, gdy gtag jeszcze się nie załadował. */
export function track(event: string, params: Record<string, unknown> = {}) {
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof g === 'function') g('event', event, params);
}

/**
 * Jedno delegowane nasłuchiwanie kliknięć w elementy z `data-cta`.
 * Dzięki temu serwerowe komponenty (Link, BuyButton) raportują kliknięcia
 * do GA4 jako `cta_click` bez zamieniania ich w komponenty klienckie.
 */
export function CtaTracker({ pageType, topic }: { pageType: string; topic?: string }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cta]');
      if (!el) return;
      track('cta_click', { cta: el.dataset.cta, page_type: pageType, topic });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [pageType, topic]);
  return null;
}

/**
 * Przyklejony pasek na mobile dla stron bazy wiedzy. Pojawia się po przewinięciu
 * początku treści i prowadzi do oferty działu (#oferta). Chowa się, gdy oferta
 * albo formularz planera są w widoku, żeby nie zasłaniać właściwych przycisków.
 */
export function SeoStickyCta({ label, sub, cta }: { label: string; sub: string; cta: string }) {
  const [show, setShow] = useState(false);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const visible = new Set<Element>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) visible.add(en.target);
          else visible.delete(en.target);
        }
        setCovered(visible.size > 0);
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    document.querySelectorAll('#oferta, #planer').forEach((el) => obs.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      obs.disconnect();
    };
  }, []);

  const visible = show && !covered;

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-[400] transition-transform duration-300 lg:hidden',
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-[130%]'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-3 mb-3 flex items-center justify-between gap-3 rounded-2xl bg-navy-900/95 p-3 pl-4 shadow-glow ring-1 ring-white/10 backdrop-blur">
        <div className="min-w-0 text-white">
          <p className="truncate text-sm font-bold leading-tight">{label}</p>
          <p className="truncate text-xs text-slate-300">{sub}</p>
        </div>
        <a
          href="#oferta"
          data-cta="sticky_mobile"
          tabIndex={visible ? 0 : -1}
          className="whitespace-nowrap rounded-full bg-[linear-gradient(120deg,#6b4df6,#f43f8f)] px-5 py-3 text-sm font-bold text-white shadow-glow transition active:scale-95"
        >
          {cta}
        </a>
      </div>
    </div>
  );
}
