import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-navy-950 px-5 text-center text-white">
      <div className="aurora left-1/4 top-1/4 h-72 w-72 bg-brand-600/40" />
      <div className="aurora bottom-1/4 right-1/4 h-72 w-72 bg-magenta-500/30" />
      <div className="relative">
        <p className="font-display text-[6rem] font-extrabold leading-none text-gradient sm:text-[9rem]">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          Ta strona odpłynęła
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-300/80">
          Nie znaleźliśmy tego, czego szukasz. Wróć na pokład i płyniemy dalej.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" variant="gradient">
            Strona główna
          </Button>
          <Button href="/baza-wiedzy" variant="light">
            Baza wiedzy
          </Button>
        </div>
        <p className="mt-6 text-sm text-slate-400">
          Albo{' '}
          <Link href="/kurs" className="text-brand-300 underline">
            przejdź do kursu
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
