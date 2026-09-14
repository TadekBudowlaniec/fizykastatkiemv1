'use client';

import { getSupabaseBrowser } from '@/lib/supabase/client';
import type {
  Lesson,
  VideoSegment,
  Task,
  TaskImage,
  UserTask,
  UserTaskStatus,
  StudyPlan,
  UserLevel,
  UserMaterial,
  MaterialFile,
} from '@/lib/types';

// ---------------- Lekcje (tabela `video`) ----------------

export async function getLessons(courseId: number): Promise<Lesson[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from('video')
    .select('video_id, course_id, tytul_lekcji, yt_id_wideo, content')
    .eq('course_id', courseId)
    .order('video_id', { ascending: true });
  if (error) throw error;
  return (data as Lesson[]) ?? [];
}

export async function getLesson(videoId: number): Promise<Lesson | null> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from('video')
    .select('video_id, course_id, tytul_lekcji, yt_id_wideo, content')
    .eq('video_id', videoId)
    .maybeSingle();
  if (error) throw error;
  return (data as Lesson) ?? null;
}

export async function getVideoSegments(
  courseId: number
): Promise<VideoSegment[]> {
  const supabase = getSupabaseBrowser();
  // Kolumna video_id w tej tabeli przechowuje course_id (nazewnictwo z oryginału)
  const { data, error } = await supabase
    .from('video_segments')
    .select('segment_id, tytul_segmentu, start_s, end_s, video_id')
    .eq('video_id', courseId)
    .order('start_s', { ascending: true });
  if (error) throw error;
  return (data as VideoSegment[]) ?? [];
}

// ---------------- Zadania (tasks / task_images / user_tasks) ----------------

export async function getTasks(courseId: number): Promise<Task[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('course_id', courseId)
    .eq('is_active', true)
    .order('id', { ascending: true });
  if (error) throw error;
  return (data as Task[]) ?? [];
}

export async function getTaskImages(taskId: number): Promise<TaskImage[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from('task_images')
    .select('task_id, image_url')
    .eq('task_id', taskId);
  if (error) throw error;
  return (data as TaskImage[]) ?? [];
}

export async function getUserTasks(
  userId: string,
  taskIds: number[]
): Promise<UserTask[]> {
  if (!taskIds.length) return [];
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from('user_tasks')
    .select('user_id, task_id, status, completed_at')
    .eq('user_id', userId)
    .in('task_id', taskIds);
  if (error) throw error;
  return (data as UserTask[]) ?? [];
}

export async function upsertUserTask(
  userId: string,
  taskId: number,
  status: UserTaskStatus
): Promise<void> {
  const supabase = getSupabaseBrowser();
  const payload = {
    user_id: userId,
    task_id: taskId,
    status,
    completed_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('user_tasks')
    .upsert(payload, { onConflict: 'user_id,task_id' });
  // Fallback: schema bez completed_at (PGRST204) - powtórz bez tej kolumny
  if (error) {
    if (String(error.code) === 'PGRST204') {
      const { user_id, task_id, status: st } = payload;
      const { error: e2 } = await supabase
        .from('user_tasks')
        .upsert({ user_id, task_id, status: st }, { onConflict: 'user_id,task_id' });
      if (e2) throw e2;
    } else {
      throw error;
    }
  }
}

export async function resetCourseTasks(
  userId: string,
  taskIds: number[]
): Promise<void> {
  if (!taskIds.length) return;
  const supabase = getSupabaseBrowser();
  const { error } = await supabase
    .from('user_tasks')
    .delete()
    .eq('user_id', userId)
    .in('task_id', taskIds);
  if (error) throw error;
}

// ---------------- Planer (study_plans) ----------------

export async function getStudyPlan(userId: string): Promise<StudyPlan[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from('study_plans')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_date', { ascending: true });
  if (error) throw error;
  return (data as StudyPlan[]) ?? [];
}

export async function deleteStudyPlan(userId: string): Promise<void> {
  const supabase = getSupabaseBrowser();
  const { error } = await supabase
    .from('study_plans')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

export async function insertStudyPlan(
  rows: Omit<StudyPlan, 'id'>[]
): Promise<void> {
  if (!rows.length) return;
  const supabase = getSupabaseBrowser();
  const { error } = await supabase.from('study_plans').insert(rows);
  if (error) throw error;
}

export async function setPlanItemCompleted(
  id: number,
  isCompleted: boolean
): Promise<void> {
  const supabase = getSupabaseBrowser();
  const { error } = await supabase
    .from('study_plans')
    .update({ is_completed: isCompleted })
    .eq('id', id);
  if (error) throw error;
}

// ---------------- Poziomy - postęp (tabela user_levels) ----------------

export async function getUserLevels(
  userId: string,
  courseId: number
): Promise<UserLevel[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from('user_levels')
    .select('user_id, course_id, poziom, completed_at')
    .eq('user_id', userId)
    .eq('course_id', courseId);
  if (error) throw error;
  return (data as UserLevel[]) ?? [];
}

export async function markLevel(
  userId: string,
  courseId: number,
  poziom: number
): Promise<void> {
  const supabase = getSupabaseBrowser();
  const { error } = await supabase.from('user_levels').upsert(
    {
      user_id: userId,
      course_id: courseId,
      poziom,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,course_id,poziom' }
  );
  if (error) throw error;
}

export async function unmarkLevel(
  userId: string,
  courseId: number,
  poziom: number
): Promise<void> {
  const supabase = getSupabaseBrowser();
  const { error } = await supabase
    .from('user_levels')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('poziom', poziom);
  if (error) throw error;
}

/** Wszystkie ukończone poziomy użytkownika (planer: synchronizacja z kursem). */
export async function getAllUserLevels(userId: string): Promise<UserLevel[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from('user_levels')
    .select('user_id, course_id, poziom, completed_at')
    .eq('user_id', userId);
  if (error) throw error;
  return (data as UserLevel[]) ?? [];
}

// ---------------- Pliki Poziomu 1 - postęp per plik (user_materialy) ----------------

/** Wszystkie ukończone pliki/wideo użytkownika (planer: synchronizacja z kursem). */
export async function getAllUserMaterialy(userId: string): Promise<UserMaterial[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from('user_materialy')
    .select('user_id, course_id, poziom, file, completed_at')
    .eq('user_id', userId);
  if (error) throw error;
  return (data as UserMaterial[]) ?? [];
}


export async function getUserMaterialy(
  userId: string,
  courseId: number
): Promise<UserMaterial[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from('user_materialy')
    .select('user_id, course_id, poziom, file, completed_at')
    .eq('user_id', userId)
    .eq('course_id', courseId);
  if (error) throw error;
  return (data as UserMaterial[]) ?? [];
}

export async function markMaterial(
  userId: string,
  courseId: number,
  poziom: number,
  file: string
): Promise<void> {
  const supabase = getSupabaseBrowser();
  const { error } = await supabase.from('user_materialy').upsert(
    {
      user_id: userId,
      course_id: courseId,
      poziom,
      file,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,course_id,poziom,file' }
  );
  if (error) throw error;
}

export async function unmarkMaterial(
  userId: string,
  courseId: number,
  poziom: number,
  file: string
): Promise<void> {
  const supabase = getSupabaseBrowser();
  const { error } = await supabase
    .from('user_materialy')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('poziom', poziom)
    .eq('file', file);
  if (error) throw error;
}

// ---------------- PDF (Netlify Functions) ----------------

async function requireToken(): Promise<string> {
  const supabase = getSupabaseBrowser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Musisz być zalogowany.');
  return token;
}

/** Poziom 4 (dawny Etap 3) - stary mechanizm/bucket, bez zmian. */
export async function getSecurePdfUrl(
  courseId: number,
  etap: number
): Promise<string> {
  const token = await requireToken();
  const res = await fetch('/.netlify/functions/get-pdf-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ courseId, etap }),
  });
  if (!res.ok) {
    if (res.status === 403) throw new Error('Brak dostępu do tego PDF.');
    throw new Error('Nie udało się pobrać pliku PDF.');
  }
  const { url } = (await res.json()) as { url: string };
  return url;
}

// ---- Materiały: nowy bucket „materialy-pdf", Poziomy 1–3 ----
// Ta sama metoda co Poziom 4: kontrola dostępu + podpisany URL w Netlify Function.
// Poziom 1 = zmienna liczba plików (listowanie folderu), Poziom 2/3 = stałe pliki.

/** Lista plików danego poziomu (nazwy). Dla P1 dynamiczna, dla P2/P3 stała. */
export async function listMaterialy(
  courseId: number,
  poziom: number
): Promise<MaterialFile[]> {
  const token = await requireToken();
  const res = await fetch('/.netlify/functions/get-materialy-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ courseId, poziom, action: 'list' }),
  });
  if (!res.ok) {
    if (res.status === 403) throw new Error('Brak dostępu do materiałów.');
    throw new Error('Nie udało się wczytać listy plików.');
  }
  const { files } = (await res.json()) as { files: MaterialFile[] };
  return files ?? [];
}

/** Podpisany URL do konkretnego pliku danego poziomu (otwierany na klik). */
export async function getMaterialyUrl(
  courseId: number,
  poziom: number,
  file: string
): Promise<string> {
  const token = await requireToken();
  const res = await fetch('/.netlify/functions/get-materialy-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ courseId, poziom, action: 'sign', file }),
  });
  if (!res.ok) {
    if (res.status === 403) throw new Error('Brak dostępu do tego pliku.');
    throw new Error('Nie udało się pobrać pliku PDF.');
  }
  const { url } = (await res.json()) as { url: string };
  return url;
}
