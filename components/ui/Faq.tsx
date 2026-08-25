import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';

export type FaqItem = { q: string; a: string };

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-line rounded-3xl border border-line bg-white shadow-soft">
      {items.map((it) => (
        <details
          key={it.q}
          className="group px-6 [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold text-ink">
            {it.q}
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="pb-5 text-muted">{it.a}</div>
        </details>
      ))}
    </div>
  );
}

export function FaqSection({
  items,
  eyebrow = 'FAQ',
  title = 'Najczęstsze pytania',
  subtitle,
}: {
  items: FaqItem[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-cloud py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <div className="mt-10">
          <FaqList items={items} />
        </div>
      </Container>
    </section>
  );
}
