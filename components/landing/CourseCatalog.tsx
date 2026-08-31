import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CourseCard } from '@/components/course/CourseCard';
import { COURSES, SINGLE_COURSE_PRICE } from '@/lib/courses';

export function CourseCatalog() {
  return (
    <section id="kursy" className="bg-cloud py-14 sm:py-24">
      <Container size="wide">
        <SectionHeading
          eyebrow="Program kursu"
          title="16 działów - cały zakres matury z fizyki"
          subtitle={`Weź cały pakiet albo uzupełnij braki punktowo. Pojedynczy dział już od ${SINGLE_COURSE_PRICE} zł.`}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {COURSES.map((c, i) => (
            <Reveal key={c.id} delay={(i % 4) * 60}>
              <CourseCard course={c} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
