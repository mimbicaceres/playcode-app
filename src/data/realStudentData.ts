import { ReportsData, StudentProgressRecord, UserProfile } from '../types';
import { ApiUser, CourseProgressSummary } from '../auth/api';
import { EMPTY_REPORTS } from './realTeacherData';
import { findCatalogCourse } from './codixCatalog';

const BAR_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-400', 'bg-violet-400', 'bg-orange-400'];

// Real "Progreso" record for one student (teacher/admin view). Name, school,
// grade, XP, streak and assigned courses come from the backend; progress
// (overallProgress/exercisesSolved/units) is real for dynamic (DB-backed)
// courses — pass their CourseProgressSummary[] via `progressByCourse`.
// Everything that still has no backend tracking (accuracy, practice time,
// recent activity) starts at zero/empty. `courseId` names the course the
// record is shown for (teacher's course); without it, all the student's
// dynamic courses are combined.
export function buildStudentProgressRecord(
  student: ApiUser,
  courseId?: string,
  progressByCourse: CourseProgressSummary[] = [],
): StudentProgressRecord {
  const titles = (courseId ? [courseId] : student.courseIds).map((id) => findCatalogCourse(id)?.title ?? id);
  const relevantProgress = courseId ? progressByCourse.filter((p) => p.courseId === courseId) : progressByCourse;

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

  return {
    id: student.id,
    name: `${student.name} ${student.lastName}`,
    avatarUrl: student.avatarUrl ?? undefined,
    grade: student.grade ?? undefined,
    school: student.school ?? undefined,
    courseName: titles.length ? titles.join(', ') : undefined,
    isActive: false,
    streakDays: student.streakDays,
    bestStreakDays: student.streakDays,
    totalXp: student.totalXp,
    xpProgressPercent: 0,
    badgesUnlocked: 0,
    badgesTotal: 0,
    // Antes nunca se seteaba: la vista de progreso siempre mostraba "sin
    // cursos asignados" para cualquier alumno real, sin importar el curso.
    assignedCourses: student.courseIds,
    overallProgress,
    exercisesSolved: completedExercises,
    exercisesTotal: totalExercises,
    accuracy: 0,
    units,
    correctAnswers: 0,
    incorrectAnswers: 0,
    practiceThisWeek: '0m',
    practiceDailyAverage: '0m',
    practiceByDay: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => ({ day, minutes: 0 })),
    attentionAreas: [],
    recentActivity: [],
  };
}

// Real "Progreso" data for a student's own reports. For dynamic (DB-backed)
// courses, exercisesSolved and coursePerformance (one bar per course) are
// real; everything else still has no backend tracking. Never uses mockData:
// the example version for presentations is DEMO_REPORTS (/demo/alumno/progreso).
export function buildStudentReports(
  student: UserProfile,
  progressByCourse: CourseProgressSummary[] = [],
  weeklyXp: number[] = [],
): ReportsData {
  const xpTrend = weeklyXp.length > 0 ? { weeklyXp } : undefined;
  if (progressByCourse.length === 0) {
    return { ...EMPTY_REPORTS, averageStreakDays: student.streakDays, xpTrend };
  }
  const exercisesSolved = progressByCourse.reduce((sum, p) => sum + p.completedExercises, 0);
  return {
    ...EMPTY_REPORTS,
    averageStreakDays: student.streakDays,
    exercisesSolved,
    coursePerformance: progressByCourse.map((progress, index) => ({
      label: progress.courseName ?? `Curso ${index + 1}`,
      percent: progress.progressPercent,
      barClass: BAR_COLORS[index % BAR_COLORS.length],
    })),
    xpTrend,
  };
}
