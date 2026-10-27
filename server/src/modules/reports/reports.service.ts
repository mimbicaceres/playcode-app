import { prisma } from '../../lib/prisma';

// Reporte general del instituto para el panel de admin (mismo formato que
// ReportsData del front). Todo sale de la base: usuarios, asignaciones y
// ExerciseProgress, asi los graficos cambian a medida que los alumnos
// resuelven ejercicios. Cubre los ultimos 30 dias (el front deriva de ahi los
// demas periodos). Lo que la base no registra todavia (tiempo de practica y
// lineas de codigo) va en cero.

const DAY_MS = 24 * 60 * 60 * 1000;
const BAR_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-400', 'bg-violet-400', 'bg-orange-400'];
const ERROR_COLORS = [
  { color: '#ef4444', dotClass: 'bg-red-500' },
  { color: '#f59e0b', dotClass: 'bg-amber-500' },
  { color: '#10b981', dotClass: 'bg-emerald-500' },
  { color: '#6366f1', dotClass: 'bg-indigo-500' },
];
const WEEKS = 5;

export interface InstituteReport {
  averageStreakDays: number;
  exercisesSolved: number;
  practiceTime: string;
  linesOfCode: number;
  coursePerformance: { label: string; percent: number; barClass: string }[];
  totalErrors: number;
  errorBreakdown: { label: string; percent: number; color: string; dotClass: string }[];
  xpTrend: { weeklyXp: number[] };
  activeStudents: number;
  averageProgress: number;
  activitiesCount: number;
  difficulties: { topic: string; errors: number }[];
  studentsCount: number;
}

const average = (values: number[]) => (values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0);

export async function getInstituteReport(now: Date = new Date()): Promise<InstituteReport> {
  const since = new Date(now.getTime() - 30 * DAY_MS);
  const sinceWeeks = new Date(now.getTime() - WEEKS * 7 * DAY_MS);

  const students = await prisma.user.findMany({
    where: { role: 'student', isActive: true },
    select: { id: true, streakDays: true, lastActivityAt: true },
  });
  const studentIds = students.map((s) => s.id);

  const courses = await prisma.course.findMany({
    include: { units: { include: { exercises: { select: { id: true } } } }, assignments: { select: { userId: true } } },
  });
  // Un curso esta "en uso" cuando tiene alguien asignado.
  const activeCourses = courses.filter((c) => c.assignments.length > 0 && c.units.some((u) => u.exercises.length > 0));
  const totalByCourse = new Map(activeCourses.map((c) => [c.id, c.units.reduce((n, u) => n + u.exercises.length, 0)]));

  const progress = await prisma.exerciseProgress.findMany({
    where: { userId: { in: studentIds }, courseId: { in: activeCourses.map((c) => c.id) } },
    select: { userId: true, courseId: true, unitId: true, attempts: true, completed: true, xpEarned: true, completedAt: true, lastAttempt: true },
  });

  // Avance de cada alumno en cada curso asignado (% de ejercicios completados).
  const completedBy = new Map<string, number>();
  for (const p of progress) if (p.completed) completedBy.set(`${p.userId}:${p.courseId}`, (completedBy.get(`${p.userId}:${p.courseId}`) ?? 0) + 1);
  const studentSet = new Set(studentIds);
  const percentsByCourse = new Map<string, number[]>();
  for (const course of activeCourses) {
    const total = totalByCourse.get(course.id)!;
    const percents = course.assignments
      .filter((a) => studentSet.has(a.userId))
      .map((a) => Math.round(((completedBy.get(`${a.userId}:${course.id}`) ?? 0) / total) * 100));
    if (percents.length > 0) percentsByCourse.set(course.id, percents);
  }
  const coursePerformance = activeCourses
    .filter((c) => percentsByCourse.has(c.id))
    .map((c, i) => ({ label: c.title ?? c.slug, percent: average(percentsByCourse.get(c.id)!), barClass: BAR_COLORS[i % BAR_COLORS.length] }));

  // Actividad de los ultimos 30 dias.
  const recent = progress.filter((p) => p.lastAttempt && p.lastAttempt >= since);
  const exercisesSolved = progress.filter((p) => p.completed && p.completedAt && p.completedAt >= since).length;
  const activeStudents = new Set(recent.map((p) => p.userId)).size;

  // Errores = intentos fallidos (en un ejercicio completado, todos menos el ultimo).
  const errorsByUnit = new Map<string, number>();
  const errorsByCourse = new Map<string, number>();
  let totalErrors = 0;
  for (const p of recent) {
    const errors = p.attempts - (p.completed ? 1 : 0);
    if (errors <= 0) continue;
    totalErrors += errors;
    if (p.unitId) errorsByUnit.set(p.unitId, (errorsByUnit.get(p.unitId) ?? 0) + errors);
    if (p.courseId) errorsByCourse.set(p.courseId, (errorsByCourse.get(p.courseId) ?? 0) + errors);
  }
  const unitInfo = new Map(activeCourses.flatMap((c) => c.units.map((u) => [u.id, `${u.title ?? u.slug} (${c.title ?? c.slug})`] as const)));
  const difficulties = [...errorsByUnit.entries()]
    .map(([unitId, errors]) => ({ topic: unitInfo.get(unitId) ?? unitId, errors }))
    .sort((a, b) => b.errors - a.errors)
    .slice(0, 4);
  const courseErrors = [...errorsByCourse.entries()].sort((a, b) => b[1] - a[1]).slice(0, ERROR_COLORS.length);
  const errorBreakdown = courseErrors.map(([courseId, errors], i) => ({
    label: activeCourses.find((c) => c.id === courseId)?.title ?? courseId,
    percent: Math.round((errors / (totalErrors || 1)) * 100),
    ...ERROR_COLORS[i],
  }));

  // XP por semana (la ultima es la actual).
  const weeklyXp = new Array(WEEKS).fill(0) as number[];
  for (const p of progress) {
    if (!p.completed || !p.completedAt || p.completedAt < sinceWeeks) continue;
    const weeksAgo = Math.floor((now.getTime() - p.completedAt.getTime()) / (7 * DAY_MS));
    if (weeksAgo >= 0 && weeksAgo < WEEKS) weeklyXp[WEEKS - 1 - weeksAgo] += p.xpEarned;
  }

  const allPercents = [...percentsByCourse.values()].flat();
  const recentlyActive = students.filter((s) => s.lastActivityAt && s.lastActivityAt >= since);

  return {
    averageStreakDays: average(recentlyActive.map((s) => s.streakDays)),
    exercisesSolved,
    practiceTime: '0h 0m',
    linesOfCode: 0,
    coursePerformance,
    totalErrors,
    errorBreakdown,
    xpTrend: { weeklyXp },
    activeStudents,
    averageProgress: average(allPercents),
    activitiesCount: [...totalByCourse.values()].reduce((a, b) => a + b, 0),
    difficulties,
    studentsCount: students.length,
  };
}
