// netlify/functions/admin-user-progress.js
// Postęp JEDNEGO kursanta dla panelu admina (modal po kliknięciu w wiersz).
// Dostęp WYŁĄCZNIE dla users.is_admin = true (wspólna bramka _shared/admin-auth).
//
// Liczymy postęp DOKŁADNIE tak, jak widzi go uczeń w CourseView:
//   kroki działu = lekcje wideo (user_materialy poziom 0, file = yt_id)
//               + pliki Poziomu 1 (user_materialy poziom 1, file = nazwa PDF)
//               + poziomy 2, 3, 4 jako całość (user_levels)
//   quiz        = user_tasks (good / bad / skip) na tle aktywnych tasks działu;
//                 wynik % = good / (good + bad), jak w TaskRunner.
//
// Liczba plików Poziomu 1 pochodzi z bucketu „materialy-pdf" (ta sama struktura
// co w get-materialy-url.js). Listujemy tylko działy, w których uczeń ma dostęp
// albo jakikolwiek zapisany postęp.

const { createClient } = require('@supabase/supabase-js');
const { requireAdmin, json } = require('./_shared/admin-auth');

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const BUCKET = 'materialy-pdf';
const ROOT = 'Fizyka_Statkiem_Materialy';
const P1_SUBFOLDER = 'Poziom1_Teoria';
const COURSE_IDS = Array.from({ length: 16 }, (_, i) => i + 1);
const WHOLE_LEVELS = [2, 3, 4];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function maxIso(a, b) {
    if (!a) return b || null;
    if (!b) return a;
    return new Date(a) > new Date(b) ? a : b;
}

/** Mapa course_id -> liczba plików PDF w Poziomie 1 (tylko dla podanych działów). */
async function countP1Files(courseIds) {
    const result = new Map();
    if (!courseIds.length) return result;

    const { data: rootEntries, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .list(ROOT, { limit: 1000 });
    if (error) {
        console.error('admin-user-progress storage root error:', error);
        return result;
    }

    await Promise.all(
        courseIds.map(async (id) => {
            const prefix = String(id).padStart(2, '0') + '_';
            const folder = (rootEntries || []).find((e) => e.name && e.name.startsWith(prefix));
            if (!folder) return;
            const dir = `${ROOT}/${folder.name}/${P1_SUBFOLDER}`;
            const { data, error: listErr } = await supabaseAdmin.storage
                .from(BUCKET)
                .list(dir, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
            if (listErr) {
                console.error('admin-user-progress storage P1 error:', listErr, dir);
                return;
            }
            const names = (data || [])
                .filter((e) => e.id && /\.pdf$/i.test(e.name || ''))
                .map((e) => e.name);
            result.set(id, names);
        })
    );
    return result;
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return json(405, { error: 'Method Not Allowed' });
    }

    try {
        const gate = await requireAdmin(event);
        if (gate.response) return gate.response;

        let body = {};
        try {
            body = JSON.parse(event.body || '{}');
        } catch {
            return json(400, { error: 'Nieprawidłowe body.' });
        }
        const userId = String(body.userId || '');
        if (!UUID_RE.test(userId)) {
            return json(400, { error: 'Nieprawidłowy identyfikator użytkownika.' });
        }

        // 1) Konto + profil + dostępy + cały zapisany postęp (równolegle).
        const [
            authRes,
            profileRes,
            enrRes,
            materialyRes,
            levelsRes,
            userTasksRes,
            tasksRes,
            videoRes,
        ] = await Promise.all([
            supabaseAdmin.auth.admin.getUserById(userId),
            supabaseAdmin.from('users').select('id, full_name, is_admin').eq('id', userId).maybeSingle(),
            supabaseAdmin
                .from('enrollments')
                .select('course_id, enrolled_at')
                .eq('user_id', userId)
                .eq('access_granted', true),
            supabaseAdmin
                .from('user_materialy')
                .select('course_id, poziom, file, completed_at')
                .eq('user_id', userId),
            supabaseAdmin
                .from('user_levels')
                .select('course_id, poziom, completed_at')
                .eq('user_id', userId),
            supabaseAdmin.from('user_tasks').select('*').eq('user_id', userId),
            supabaseAdmin.from('tasks').select('id, course_id').eq('is_active', true),
            supabaseAdmin
                .from('video')
                .select('video_id, course_id, yt_id_wideo')
                .not('yt_id_wideo', 'is', null),
        ]);

        const authUser = authRes.data && authRes.data.user;
        if (authRes.error || !authUser) {
            return json(404, { error: 'Nie znaleziono użytkownika.' });
        }

        // Tabele postępu mogą jeszcze nie istnieć (patrz supabase/*.sql) -
        // wtedy traktujemy je jako puste, zamiast wywalać cały modal.
        const materialy = materialyRes.error ? [] : materialyRes.data || [];
        const levels = levelsRes.error ? [] : levelsRes.data || [];
        const userTasks = userTasksRes.error ? [] : userTasksRes.data || [];
        const tasks = tasksRes.error ? [] : tasksRes.data || [];
        const videos = videoRes.error ? [] : videoRes.data || [];
        const enrollments = (enrRes.data || []).map((e) => ({
            course_id: Number(e.course_id),
            enrolled_at: e.enrolled_at || null,
        }));

        // 2) Indeksy pomocnicze.
        const taskCourse = new Map(tasks.map((t) => [Number(t.id), Number(t.course_id)]));
        const tasksByCourse = new Map();
        for (const t of tasks) {
            const cid = Number(t.course_id);
            tasksByCourse.set(cid, (tasksByCourse.get(cid) || 0) + 1);
        }
        const videosByCourse = new Map();
        for (const v of videos) {
            const cid = Number(v.course_id);
            if (!videosByCourse.has(cid)) videosByCourse.set(cid, []);
            videosByCourse.get(cid).push(String(v.yt_id_wideo));
        }

        const enrolledIds = new Set(enrollments.map((e) => e.course_id));
        const touched = new Set();
        for (const m of materialy) touched.add(Number(m.course_id));
        for (const l of levels) touched.add(Number(l.course_id));
        for (const ut of userTasks) {
            const cid = taskCourse.get(Number(ut.task_id));
            if (cid) touched.add(cid);
        }

        const relevant = COURSE_IDS.filter((id) => enrolledIds.has(id) || touched.has(id));
        const p1Files = await countP1Files(relevant);

        // 3) Postęp per dział.
        const courses = relevant.map((courseId) => {
            const enr = enrollments.find((e) => e.course_id === courseId);
            const rowsM = materialy.filter((m) => Number(m.course_id) === courseId);
            const rowsL = levels.filter((l) => Number(l.course_id) === courseId);

            let lastActivity = null;

            // Wideo (poziom 0).
            const ytIds = videosByCourse.get(courseId) || [];
            const watched = new Set(rowsM.filter((m) => m.poziom === 0).map((m) => m.file));
            const videosDone = ytIds.filter((id) => watched.has(id)).length;
            for (const m of rowsM) lastActivity = maxIso(lastActivity, m.completed_at);

            // Pliki Poziomu 1.
            const doneP1 = new Map(
                rowsM.filter((m) => m.poziom === 1).map((m) => [m.file, m.completed_at || null])
            );
            const names = p1Files.get(courseId) || [];
            // Pliki odhaczone, których nie ma już w buckecie (zmiana nazwy) - też pokazujemy.
            const extra = [...doneP1.keys()].filter((n) => !names.includes(n));
            const files = [...names, ...extra].map((name) => ({
                name,
                done: doneP1.has(name),
                completed_at: doneP1.get(name) || null,
                missing: !names.includes(name),
            }));
            const p1Total = names.length;
            const p1Done = names.filter((n) => doneP1.has(n)).length;

            // Poziomy 2-4 (całość).
            const levelsDone = {};
            for (const p of WHOLE_LEVELS) {
                const row = rowsL.find((l) => Number(l.poziom) === p);
                levelsDone[p] = row ? row.completed_at || '' : null; // null = nieukończony
                if (row) lastActivity = maxIso(lastActivity, row.completed_at);
            }
            const wholeDone = WHOLE_LEVELS.filter((p) => levelsDone[p] != null).length;

            const total = ytIds.length + p1Total + WHOLE_LEVELS.length;
            const done = videosDone + p1Done + wholeDone;

            // Quiz.
            const counts = { good: 0, bad: 0, skip: 0 };
            let quizLast = null;
            for (const ut of userTasks) {
                if (taskCourse.get(Number(ut.task_id)) !== courseId) continue;
                if (ut.status in counts) counts[ut.status]++;
                quizLast = maxIso(quizLast, ut.completed_at || null);
            }
            lastActivity = maxIso(lastActivity, quizLast);
            const answered = counts.good + counts.bad + counts.skip;
            const scored = counts.good + counts.bad;
            const score = scored ? Math.round((counts.good / scored) * 100) : null;

            return {
                course_id: courseId,
                hasAccess: enrolledIds.has(courseId),
                enrolled_at: enr ? enr.enrolled_at : null,
                videos: { total: ytIds.length, done: videosDone },
                p1: { total: p1Total, done: p1Done, files },
                levels: levelsDone,
                steps: { done, total, pct: total ? Math.round((done / total) * 100) : 0 },
                quiz: {
                    total: tasksByCourse.get(courseId) || 0,
                    answered,
                    good: counts.good,
                    bad: counts.bad,
                    skip: counts.skip,
                    score,
                    lastAt: quizLast,
                },
                lastActivity,
            };
        });

        // 4) Podsumowanie.
        const sum = (f) => courses.reduce((acc, c) => acc + f(c), 0);
        const good = sum((c) => c.quiz.good);
        const bad = sum((c) => c.quiz.bad);
        const stepsDone = sum((c) => c.steps.done);
        const stepsTotal = sum((c) => c.steps.total);
        let lastActivity = null;
        for (const c of courses) lastActivity = maxIso(lastActivity, c.lastActivity);

        return json(200, {
            user: {
                id: authUser.id,
                email: authUser.email || '—',
                full_name: (profileRes.data && profileRes.data.full_name) || null,
                is_admin: !!(profileRes.data && profileRes.data.is_admin),
                created_at: authUser.created_at || null,
                last_sign_in_at: authUser.last_sign_in_at || null,
            },
            enrollments,
            courses,
            summary: {
                steps: {
                    done: stepsDone,
                    total: stepsTotal,
                    pct: stepsTotal ? Math.round((stepsDone / stepsTotal) * 100) : 0,
                },
                videos: { done: sum((c) => c.videos.done), total: sum((c) => c.videos.total) },
                files: { done: sum((c) => c.p1.done), total: sum((c) => c.p1.total) },
                levels: {
                    done: sum((c) => WHOLE_LEVELS.filter((p) => c.levels[p] != null).length),
                    total: courses.length * WHOLE_LEVELS.length,
                },
                quiz: {
                    answered: sum((c) => c.quiz.answered),
                    total: sum((c) => c.quiz.total),
                    good,
                    bad,
                    skip: sum((c) => c.quiz.skip),
                    score: good + bad ? Math.round((good / (good + bad)) * 100) : null,
                },
                coursesWithAccess: courses.filter((c) => c.hasAccess).length,
                coursesStarted: courses.filter((c) => c.steps.done > 0 || c.quiz.answered > 0).length,
                coursesDone: courses.filter((c) => c.steps.total > 0 && c.steps.done === c.steps.total)
                    .length,
                lastActivity,
            },
            generatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('admin-user-progress error:', err);
        return json(500, { error: 'Wystąpił błąd serwera.' });
    }
};
