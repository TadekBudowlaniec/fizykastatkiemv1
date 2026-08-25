import { CourseView } from '@/components/app/CourseView';

export function generateStaticParams() {
  // 0 = "Tutaj zacznij", 1..16 = działy
  return Array.from({ length: 17 }, (_, i) => ({ id: String(i) }));
}

export const dynamicParams = false;

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const n = Number(id);
  return <CourseView courseId={Number.isFinite(n) ? n : -1} />;
}
