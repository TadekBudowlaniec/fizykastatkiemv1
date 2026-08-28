import { PLANS } from '@/lib/courses';
import { BuyButton } from '@/components/shop/BuyButton';
import { cn } from '@/lib/cn';

const accentRing: Record<string, string> = {
  silver: 'ring-slate-200',
  gold: 'ring-brand-300',
  diamond: 'ring-magenta-400',
};

const accentGlow: Record<string, string> = {
  silver: 'from-slate-100 to-white',
  gold: 'from-brand-50 to-white',
  diamond: 'from-magenta-400/10 to-white',
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

export function PricingTiers({
  dark = false,
  promo = false,
}: {
  dark?: boolean;
  /** Ceny promocyjne (tylko /oferta-ratunkowa, gdzie ustawiany jest promoStartedAt) */
  promo?: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
      {PLANS.map((plan) => {
        const featured = plan.featured;
        const price = promo ? plan.promoPrice : plan.price;
        return (
          <div
            key={plan.key}
            className={cn(
              'relative flex flex-col rounded-3xl bg-gradient-to-b p-8 shadow-card ring-1 transition-transform duration-300',
              accentGlow[plan.accent],
              accentRing[plan.accent],
              featured
                ? 'lg:-translate-y-4 lg:scale-[1.03] ring-2 ring-brand-400 shadow-glow'
                : 'hover:-translate-y-1'
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
              <p className="text-sm font-medium text-muted">{plan.subtitle}</p>
              <div className="mt-5 flex items-end justify-center gap-2">
                <span className="text-lg font-semibold text-slate-400 line-through">
                  {plan.priceOld} zł
                </span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-display text-5xl font-extrabold text-gradient">
                  {price}
                </span>
                <span className="text-xl font-bold text-ink">zł</span>
              </div>
            </div>

            <ul className="mt-7 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-slate">
                  <Check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
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
