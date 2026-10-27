import { AchievementBadge, ReportsData, StudentProgressRecord, UserProfile } from '../types';
import { ApiUser, CourseProgressSummary, Gamification, ProgressByCourseResult, StudentStats } from '../auth/api';
import { EMPTY_REPORTS } from './realTeacherData';
import { findCatalogCourse } from './codixCatalog';
import { formatMinutes, formatWhen } from '../lib/timeFormat';

const BAR_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-400', 'bg-violet-400', 'bg-orange-400'];
const ERROR_COLORS = [
  { color: '#ef4444', dotClass: 'bg-red-500' },
  { color: '#f59e0b', dotClass: 'bg-amber-500' },
  { color: '#10b981', dotClass: 'bg-emerald-500' },
  { color: '#6366f1', dotClass: 'bg-indigo-500' },
];

/** Logros del backend (con progreso hacia cada uno) → el formato que dibujan las pantallas. */
export function toAchievementBadges(gamification: Gamification | null | undefined): AchievementBadge[] {
  return (gamification?.badges ?? []).map((b) => ({
    id: b.id,
    title: b.title,
    iconName: b.iconName,
    color: b.unlocked ? b.color : '#737686',
    bgColor: b.unlocked ? b.bgColor : '#eff4ff',
    unlocked: b.unlocked,
    unlockedAt: b.unlockedAt ?? undefined,
    description: b.description,
    current: b.current,
    target: b.target,
  }));
}

/**
 * Registro de "Progreso" de un alumno (vista de docente y de admin). Nombre,
 * escuela, año, XP, racha y cursos asignados vienen del usuario; el avance por
 * unidad, la precision, el tiempo de practica, las areas de atencion y la
 * actividad reciente salen de lo que el alumno hizo (progreso + historial de
 * intentos). `courseId` indica de que curso se muestra (el del docente); sin el,
 * se combinan todos los cursos del alumno.
 */
export function buildStudentProgressRecord(
  student: ApiUser,
  courseId?: string,
  insight?: ProgressByCourseResult,
): StudentProgressRecord {
  const progressByCourse: CourseProgressSummary[] = insight?.progress ?? [];
  const titles = (courseId ? [courseId] : student.courseIds).map((id) => findCatalogCourse(id)?.title ?? id);
  const relevantProgress = courseId ? progressByCourse.filter((p) => p.courseId === courseId) : progressByCourse;
  // Nombres reales de los cursos (el catalogo fijo ya no existe).
  const courseTitles = relevantProgress.map((p) => p.courseName ?? p.courseId);

  const completedExercises = relevantProgress.reduce((sum, p) => sum + p.completedExercises, 0);
  const totalExercises = relevantProgress.reduce((sum, p) => sum + p.totalExercises, 0);
  const overallProgress = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
  const showCourseName = relevantProgress.length > 1;
  const units = relevantProgress.flatMap((progress) =>
    progress.units.map((unit) => ({
      label: showCourseName ? `${progress.courseName ?? progress.courseId} • ${unit.unitName ?? ''}` : unit.unitName ?? '',
      percent: unit.percent,
    })),
  );

  const stats: StudentStats | undefined = courseId ? insight?.stats.byCourse[courseId] ?? insight?.stats.overall : insight?.stats.overall;
  const gamification = insight?.gamification;
  const week = stats?.practice;

  return {
    id: student.id,
    name: `${student.name} ${student.lastName}`,
    avatarUrl: student.avatarUrl ?? undefined,
    grade: student.grade ?? undefined,
    school: student.school ?? undefined,
    courseName: courseTitles.length ? courseTitles.join(', ') : titles.length ? titles.join(', ') : undefined,
    isActive: stats?.isActive ?? false,
    lastActivity: stats?.lastActivityAt ? formatWhen(stats.lastActivityAt) : undefined,
    streakDays: student.streakDays,
    bestStreakDays: gamification?.bestStreakDays ?? student.streakDays,
    totalXp: student.totalXp,
    // Ancho de la barra de XP: avance hacia el proximo nivel.
    xpProgressPercent: gamification?.percentToNextLevel ?? 0,
    badgesUnlocked: gamification?.badgesUnlocked ?? 0,
    badgesTotal: gamification?.badgesTotal ?? 0,
    assignedCourses: student.courseIds,
    overallProgress,
    exercisesSolved: completedExercises,
    exercisesTotal: totalExercises,
    accuracy: stats?.accuracy ?? 0,
    units,
    correctAnswers: stats?.correctAnswers ?? 0,
    incorrectAnswers: stats?.incorrectAnswers ?? 0,
    practiceThisWeek: formatMinutes(week?.thisWeekMinutes ?? 0),
    practiceDailyAverage: formatMinutes(week?.dailyAverageMinutes ?? 0),
    practiceByDay: week?.byDay.length ? week.byDay : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => ({ day, minutes: 0 })),
    attentionAreas: stats?.attentionAreas ?? [],
    recentActivity: (stats?.recentActivity ?? []).map((a) => ({ when: formatWhen(a.at), exercise: a.exerciseTitle, correct: a.correct })),
  };
}

/**
 * "Progreso" propio del alumno. El avance por curso, el tiempo de practica, las
 * lineas de codigo y los errores comunes salen de lo que hizo realmente. Nunca usa
 * mockData: la version de ejemplo es DEMO_REPORTS (/demo/alumno/progreso).
 */
export function buildStudentReports(
  student: UserProfile,
  progressByCourse: CourseProgressSummary[] = [],
  weeklyXp: number[] = [],
  stats?: StudentStats,
): ReportsData {
  const xpTrend = weeklyXp.length > 0 ? { weeklyXp } : undefined;
  if (progressByCourse.length === 0) {
    return { ...EMPTY_REPORTS, averageStreakDays: student.streakDays, xpTrend };
  }
  const exercisesSolved = progressByCourse.reduce((sum, p) => sum + p.completedExercises, 0);

  const errors = stats?.errorsByUnit ?? [];
  const totalErrors = stats?.last30Days.incorrect ?? 0;
  const errorTotal = errors.reduce((sum, e) => sum + e.errors, 0) || 1;

  return {
    ...EMPTY_REPORTS,
    averageStreakDays: student.streakDays,
    exercisesSolved,
    practiceTime: formatHoursMinutes(stats?.last30Days.practiceMinutes ?? 0),
    linesOfCode: stats?.last30Days.linesOfCode ?? 0,
    totalErrors,
    errorBreakdown: errors.map((e, i) => ({
      label: e.topic,
      percent: Math.round((e.errors / errorTotal) * 100),
      ...ERROR_COLORS[i % ERROR_COLORS.length],
    })),
    coursePerformance: progressByCourse.map((progress, index) => ({
      label: progress.courseName ?? `Curso ${index + 1}`,
      percent: progress.progressPercent,
      barClass: BAR_COLORS[index % BAR_COLORS.length],
    })),
    xpTrend,
  };
}

// El reporte usa "Xh Ym" (p. ej. "0h 45m"), que es lo que parsea reportPeriods.
function formatHoursMinutes(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
