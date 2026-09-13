import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CourseCard } from '@/components/course/CourseCard';
import { COURSES } from '@/lib/courses';

export function CourseCatalog() {
  return (
    <section id="program" className="scroll-mt-20 bg-cloud py-14 sm:py-24">
      <Container size="wide">
        <SectionHeading
          eyebrow="Program kursu"
          title="16 działów - cały zakres matury z fizyki"
          subtitle="Kompletny materiał od pierwszych tematów aż do matury. Wszystkie działy wchodzą w skład Kursu Pełnego."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {COURSES.map((c, i) => (
            <Reveal key={c.id} delay={(i % 4) * 60}>
              <CourseCard course={c} showBuy={false} />
            </Reveal>
          ))}
        </div>

        {/* Dyskretny link do oferty pojedynczych działów - nie rozprasza
            osoby zainteresowanej Kursem Pełnym. */}
        <p className="mt-10 text-center text-sm text-muted">
          Potrzebujesz tylko jednego działu zamiast całego kursu?{' '}
          <Link
            href="/dzialy"
            className="font-semibold text-brand-600 underline underline-offset-4 hover:text-magenta-600"
          >
            Zobacz pojedyncze działy →
          </Link>
        </p>
      </Container>
    </section>
  );
}
