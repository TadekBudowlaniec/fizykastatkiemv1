import { PLANS } from '@/lib/courses';
import { BuyButton } from '@/components/shop/BuyButton';
import { cn } from '@/lib/cn';

const accentRing: Record<string, string> = {
  full: 'ring-slate-200',
  vip: 'ring-magenta-400',
};

const accentGlow: Record<string, string> = {
  full: 'from-brand-50 to-white',
  vip: 'from-magenta-400/10 to-white',
};

function Check() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 flex-none text-brand-500"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.1 3.1 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function PricingTiers() {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:items-start">
      {PLANS.map((plan) => {
        const featured = plan.featured;
        return (
          <div
            key={plan.key}
            id={plan.key === 'vip' ? 'vip' : undefined}
            className={cn(
              'relative flex flex-col scroll-mt-24 rounded-3xl bg-gradient-to-b p-8 shadow-card ring-1 transition-all duration-300',
              accentGlow[plan.accent],
              accentRing[plan.accent],
              featured
                ? 'ring-2 ring-brand-400 shadow-glow md:-translate-y-1'
                : 'hover:-translate-y-1',
              // Podświetlenie po wejściu z linku „VIP" w Hero (#vip)
              plan.key === 'vip' &&
                'target:-translate-y-1 target:shadow-glow-magenta target:ring-2 target:ring-magenta-500'
            )}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[linear-gradient(120deg,#6b4df6,#f43f8f)] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-glow">
                {plan.badge}
              </span>
            )}

            <div className="text-center">
              <p className="font-display text-2xl font-extrabold text-ink">
                {plan.name}
              </p>
              <p className="mt-1 text-sm font-medium text-muted">
                {plan.subtitle}
              </p>
              <div className="mt-5 flex items-baseline justify-center gap-1">
                <span className="font-display text-5xl font-extrabold text-gradient">
                  {plan.price}
                </span>
                <span className="text-xl font-bold text-ink">zł</span>
              </div>
              <p className="mt-1 text-xs text-muted">Płatność jednorazowa</p>
              {plan.anchor && (
                <p className="mx-auto mt-3 max-w-[15rem] rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">
                  {plan.anchor}
                </p>
              )}
            </div>

            <ul className="mt-7 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-slate">
                  <Check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {plan.seats != null && (
              <p className="mt-6 rounded-2xl bg-magenta-50 px-4 py-3 text-center text-sm font-semibold text-magenta-700">
                Tylko {plan.seats} miejsc - każde oznacza indywidualne
                prowadzenie 1:1 aż do matury.
              </p>
            )}

            <div className="mt-6">
              <BuyButton
                courseId={plan.key}
                variant={featured ? 'gradient' : 'outline'}
                size="lg"
              >
                {plan.cta}
              </BuyButton>
            </div>
          </div>
        );
      })}
    </div>
  );
}
