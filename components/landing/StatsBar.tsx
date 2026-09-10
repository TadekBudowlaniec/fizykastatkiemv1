import { Container } from '@/components/ui/Container';

// Tylko dane prawdziwe i zweryfikowane (audyt treści 2026-09).
// NIE dodawać liczby klientów, średniej ocen ani gwiazdek bez potwierdzenia.
const stats = [
  { value: '100%', label: 'zdawalności matury' },
  { value: '28/28', label: 'absolwentów zdało maturę' },
  { value: '16', label: 'działów pełnego zakresu' },
  { value: 'CAŁY SYSTEM', label: 'wideo • PDF-y • zadania • quizy • planer' },
];

export function StatsBar() {
  return (
    <section className="bg-cloud pt-4">
      <Container>
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8 md:grid-cols-4">
          {stats.map((s) => {
            // Wartości tekstowe (np. „CAŁY SYSTEM”) renderujemy mniejszą czcionką
            // niż duże liczby, żeby zmieściły się w kafelku bez łamania układu.
            const isText = /[a-ząćęłńóśźż]/i.test(s.value);
            return (
              <div key={s.label} className="text-center">
                <p
                  className={
                    isText
                      ? 'font-display text-xl font-extrabold uppercase text-gradient sm:text-2xl'
                      : 'font-display text-3xl font-extrabold text-gradient sm:text-4xl'
                  }
                >
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
