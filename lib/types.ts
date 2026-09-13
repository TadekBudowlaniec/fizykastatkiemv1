// Typy odwzorowujące schemat bazy Supabase (patrz raporty migracyjne).

export type Lesson = {
  video_id: number;
  course_id: number;
  tytul_lekcji: string;
  yt_id_wideo: string | null;
  content: string | null; // markdown + LaTeX
};

export type VideoSegment = {
  segment_id: number;
  tytul_segmentu: string;
  start_s: number;
  end_s: number;
  video_id: number; // UWAGA: przechowuje course_id
};

export type TaskType = 'closed' | 'open';

export type Task = {
  id: number;
  course_id: number;
  is_active: boolean;
  type: string; // 'closed' lub inne (otwarte)
  content: string;
  options: string | string[] | null;
  solution: string | null;
};

export type TaskImage = {
  task_id: number;
  image_url: string;
};

export type UserTaskStatus = 'good' | 'bad' | 'skip';

export type UserTask = {
  user_id: string;
  task_id: number;
  status: UserTaskStatus;
  completed_at?: string | null;
};

export type StudyPlan = {
  id: number;
  user_id: string;
  scheduled_date: string; // YYYY-MM-DD
  topic_name: string;
  activity_type: string;
  description: string;
  is_completed: boolean;
};

// Postęp poziomów w zakładce „Materiały PDF" (tabela public.user_levels).
export type UserLevel = {
  user_id: string;
  course_id: number;
  poziom: number; // 1..4
  completed_at?: string | null;
};

// Postęp per plik — Poziom 1 (tabela public.user_materialy).
export type UserMaterial = {
  user_id: string;
  course_id: number;
  poziom: number;
  file: string;
  completed_at?: string | null;
};

// Plik PDF w Storage (bucket „materialy-pdf") zwracany przez get-materialy-url.
export type MaterialFile = {
  name: string; // nazwa pliku, np. „1.1 Wstep.pdf"
};
