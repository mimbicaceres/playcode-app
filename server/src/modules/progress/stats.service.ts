import { prisma } from '../../lib/prisma';
import { dateKeyInArgentina } from '../../lib/streak';
import { getUserProgressByCourse } from './progress.service';

// Estadisticas de un alumno calculadas con su historial de intentos
// (ExerciseAttempt): precision, tiempo de practica, areas que requieren
// atencion y actividad reciente. Es lo que alimenta "Progreso" del alumno y el
// seguimiento individual del docente y del admin.

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
// Un intento sin tiempo informado (datos viejos) se estima en 4 minutos, y ningun
// intento cuenta mas de 30 minutos (una pestaña olvidada abierta no es practica).
const ESTIMATED_ATTEMPT_SEC = 240;
const MAX_ATTEMPT_SEC = 30 * 60;
const ACTIVE_WINDOW_DAYS = 7;
const RECENT_LIMIT = 8;

export interface StudentStats {
  accuracy: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalAttempts: number;
  lastActivityAt: string | null;
  isActive: boolean;
  // Ultimos 30 dias (la ventana de "Progreso"): tiempo de practica, lineas de codigo e incorrectos.
  last30Days: { practiceMinutes: number; linesOfCode: number; incorrect: number };
  practice: {
    thisWeekMinutes: number;
    dailyAverageMinutes: number;
    // Ultimos 7 dias (el ultimo es hoy, huso Argentina).
    byDay: { day: string; minutes: number }[];
  };
  attentionAreas: { title: string; detail: string; status: 'reinforce' | 'pending' }[];
  recentActivity: { exerciseTitle: string; courseId: string | null; courseName: string | null; correct: boolean; at: string }[];
  // Intentos incorrectos por unidad en los ultimos 30 dias (para "errores comunes").
  errorsByUnit: { topic: string; errors: number }[];
}

export interface StudentStatsBundle {
  overall: StudentStats;
  byCourse: Record<string, StudentStats>;
}

interface AttemptRow {
  exerciseId: string;
  unitId: string | null;
  courseId: string | null;
  success: boolean;
  durationSec: number | null;
  lines: number | null;
  createdAt: Date;
}

const emptyStats = (): StudentStats => ({
  accuracy: 0, correctAnswers: 0, incorrectAnswers: 0, totalAttempts: 0, lastActivityAt: null, isActive: false,
  last30Days: { practiceMinutes: 0, linesOfCode: 0, incorrect: 0 },
  practice: { thisWeekMinutes: 0, dailyAverageMinutes: 0, byDay: [] },
  attentionAreas: [], recentActivity: [], errorsByUnit: [],
});

export async function getStudentStatsBundle(userId: string, now: Date = new Date()): Promise<StudentStatsBundle> {
  const [attempts, progress] = await Promise.all([
    prisma.exerciseAttempt.findMany({
      where: { userId },
      select: { exerciseId: true, unitId: true, courseId: true, success: true, durationSec: true, lines: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    getUserProgressByCourse(userId),
  ]);

  const exerciseIds = [...new Set(attempts.slice(0, 200).map((a) => a.exerciseId))];
  const exercises = exerciseIds.length
    ? await prisma.exercise.findMany({ where: { id: { in: exerciseIds } }, select: { id: true, title: true } })
    : [];
  const titleOf = new Map(exercises.map((e) => [e.id, e.title ?? 'Ejercicio']));
  const courseNames = new Map(progress.map((p) => [p.courseId, p.courseName]));
  const unitNames = new Map(progress.flatMap((p) => p.units.map((u) => [u.unitId, u.unitName] as const)));

  const compute = (rows: AttemptRow[], courses: typeof progress): StudentStats => {
    if (rows.length === 0 && courses.length === 0) return emptyStats();
    const correct = rows.filter((r) => r.success).length;
    const incorrect = rows.length - correct;

    // Tiempo de practica de los ultimos 7 dias (huso AR), por dia.
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * DAY_MS);
      const key = dateKeyInArgentina(date);
      return { key, day: WEEKDAYS[new Date(`${key}T12:00:00-03:00`).getUTCDay()], seconds: 0 };
    });
    const dayByKey = new Map(days.map((d) => [d.key, d]));
    for (const r of rows) {
      const slot = dayByKey.get(dateKeyInArgentina(r.createdAt));
      if (slot) slot.seconds += Math.min(r.durationSec ?? ESTIMATED_ATTEMPT_SEC, MAX_ATTEMPT_SEC);
    }
    const byDay = days.map((d) => ({ day: d.day, minutes: Math.round(d.seconds / 60) }));
    const thisWeekMinutes = byDay.reduce((sum, d) => sum + d.minutes, 0);

    // Areas que requieren atencion: las unidades con mas intentos incorrectos,
    // y la primera unidad sin empezar despues de una con avance.
    const errorsByUnitId = new Map<string, number>();
    for (const r of rows) if (!r.success && r.unitId) errorsByUnitId.set(r.unitId, (errorsByUnitId.get(r.unitId) ?? 0) + 1);
    const showCourse = courses.length > 1;
    const unitLabel = (unitId: string, courseId: string | null) =>
      `${unitNames.get(unitId) ?? 'Unidad'}${showCourse ? ` (${courseNames.get(courseId ?? '') ?? 'Curso'})` : ''}`;
    const reinforce = [...errorsByUnitId.entries()]
      .filter(([, errors]) => errors >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([unitId, errors]) => ({
        title: unitLabel(unitId, rows.find((r) => r.unitId === unitId)?.courseId ?? null),
        detail: `${errors} intentos incorrectos en esta unidad`,
        status: 'reinforce' as const,
      }));
    const pending = courses.flatMap((course) => {
      const next = course.units.findIndex((u, i) => i > 0 && u.percent === 0 && course.units[i - 1].percent > 0);
      return next > 0
        ? [{ title: unitLabel(course.units[next].unitId, course.courseId), detail: 'Aún no comenzó esta unidad', status: 'pending' as const }]
        : [];
    });

    // Ventana de 30 dias.
    const since = now.getTime() - 30 * DAY_MS;
    const rows30 = rows.filter((r) => r.createdAt.getTime() >= since);
    const errors30ByUnit = new Map<string, number>();
    for (const r of rows30) if (!r.success && r.unitId) errors30ByUnit.set(r.unitId, (errors30ByUnit.get(r.unitId) ?? 0) + 1);
    const errorsByUnit = [...errors30ByUnit.entries()]
      .map(([unitId, errors]) => ({ topic: unitLabel(unitId, rows30.find((r) => r.unitId === unitId)?.courseId ?? null), errors }))
      .sort((a, b) => b.errors - a.errors)
      .slice(0, 4);
    const seconds30 = rows30.reduce((sum, r) => sum + Math.min(r.durationSec ?? ESTIMATED_ATTEMPT_SEC, MAX_ATTEMPT_SEC), 0);

    const last = rows[0]?.createdAt ?? null;
    return {
      accuracy: rows.length > 0 ? Math.round((correct / rows.length) * 100) : 0,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      totalAttempts: rows.length,
      lastActivityAt: last ? last.toISOString() : null,
      isActive: !!last && now.getTime() - last.getTime() <= ACTIVE_WINDOW_DAYS * DAY_MS,
      last30Days: {
        practiceMinutes: Math.round(seconds30 / 60),
        linesOfCode: rows30.reduce((sum, r) => sum + (r.lines ?? 0), 0),
        incorrect: rows30.filter((r) => !r.success).length,
      },
      practice: { thisWeekMinutes, dailyAverageMinutes: Math.round(thisWeekMinutes / 7), byDay },
      attentionAreas: [...reinforce, ...pending],
      recentActivity: rows.slice(0, RECENT_LIMIT).map((r) => ({
        exerciseTitle: titleOf.get(r.exerciseId) ?? 'Ejercicio',
        courseId: r.courseId,
        courseName: courseNames.get(r.courseId ?? '') ?? null,
        correct: r.success,
        at: r.createdAt.toISOString(),
      })),
      errorsByUnit,
    };
  };

  const byCourse: Record<string, StudentStats> = {};
  for (const course of progress) {
    byCourse[course.courseId] = compute(attempts.filter((a) => a.courseId === course.courseId), [course]);
  }
  return { overall: compute(attempts, progress), byCourse };
}
