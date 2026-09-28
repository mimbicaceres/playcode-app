import { ReportsData, StudentProgressRecord, UserProfile } from '../types';
import { ApiUser } from '../auth/api';
import { EMPTY_REPORTS } from './realTeacherData';
import { findCatalogCourse } from './codixCatalog';

// Real "Progreso" record for one student (teacher/admin view). Only name, school,
// grade, XP, streak and assigned courses exist in the backend; everything else
// starts at zero/empty. `courseId` names the course the record is shown for
// (teacher's course); without it, the student's assigned courses are listed.
export function buildStudentProgressRecord(student: ApiUser, courseId?: string): StudentProgressRecord {
  const titles = (courseId ? [courseId] : student.courseIds).map((id) => findCatalogCourse(id)?.title ?? id);
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
    overallProgress: 0,
    exercisesSolved: 0,
    exercisesTotal: 0,
    accuracy: 0,
    units: [],
    correctAnswers: 0,
    incorrectAnswers: 0,
    practiceThisWeek: '0m',
    practiceDailyAverage: '0m',
    practiceByDay: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => ({ day, minutes: 0 })),
    attentionAreas: [],
    recentActivity: [],
  };
}

// Real "Progreso" data for a student: the backend only tracks XP and streak
// for now, so everything else starts at zero/empty. Never uses mockData: the
// example version for presentations is DEMO_REPORTS (/demo/alumno/progreso).
export function buildStudentReports(student: UserProfile): ReportsData {
  return {
    ...EMPTY_REPORTS,
    averageStreakDays: student.streakDays,
  };
}
