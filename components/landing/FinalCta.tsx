import { Button } from '@/components/ui/Button';

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(150deg,#070b18,#0f1b36)] py-14 text-white sm:py-28">
      <div className="aurora left-[10%] top-[-30%] h-80 w-80 bg-brand-600/50" />
      <div className="aurora right-[5%] bottom-[-30%] h-80 w-80 bg-magenta-500/40" />
      <div className="bg-grid absolute inset-0" />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">
          Twoja matura zaczyna się{' '}
          <span className="text-gradient">dzisiaj</span>.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300/85">
          Dołącz do kursu, odbierz planer i przestań się zastanawiać, od czego
          zacząć. Płyniemy razem - aż do wyniku, z którego będziesz dumny.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Button href="/cennik" variant="gradient" size="lg" className="w-full sm:w-auto">
            Wybieram kurs
          </Button>
          <Button
            href="/kurs"
            variant="outline"
            size="lg"
            className="w-full border-white/30 text-white hover:bg-white hover:text-navy-900 sm:w-auto"
          >
            Zobacz platformę
          </Button>
        </div>
      </div>
    </section>
  );
}
