import { Container } from '@/components/ui/Container';

const stats = [
  { value: '2000+', label: 'zadowolonych uczniów' },
  { value: '16', label: 'działów pełnego zakresu' },
  { value: '500+', label: 'zadań z rozwiązaniami' },
  { value: '4.9/5', label: 'średnia ocen kursu' },
];

export function StatsBar() {
  return (
    <section className="bg-cloud pt-4">
      <Container>
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-extrabold text-gradient sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
