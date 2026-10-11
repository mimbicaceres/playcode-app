import { Course, ReportsData, StudentProgressRecord, TeacherCourseRecord } from '../types';
import type { CourseProgressSummary, TeachingCourse } from '../auth/api';
import { findCatalogCourse } from './codixCatalog';
import { buildStudentProgressRecord } from './realStudentData';

// Real teacher data. Never uses mockData: the example versions for presentations
// live in mockData (DEMO_TEACHER_DASHBOARD, DEMO_REPORTS, DEMO_STUDENT_AUDIT)
// and are only shown in demo mode.

const BAR_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-400', 'bg-violet-400', 'bg-orange-400'];

// Courses in charge of the teacher (assigned by an admin, GET /api/users/me/teaching),
// each with the students assigned to it. Progress tracking does not exist in the
// backend yet for the static catalog courses, so their averages start at zero;
// dynamic (DB-backed) courses come with real progress (pass each student's
// CourseProgressSummary[] via `studentProgress`, keyed by student id).
export function buildTeacherCourses(
  teaching: TeachingCourse[],
  dynamicCourses?: Map<string, Course>,
  studentProgress?: Map<string, CourseProgressSummary[]>,
): TeacherCourseRecord[] {
  return teaching.flatMap(({ courseId, students }) => {
    const course = findCatalogCourse(courseId) ?? dynamicCourses?.get(courseId);
    if (!course) return [];
    const studentRecords = students.map((s) =>
      buildStudentProgressRecord(s, course.id, studentProgress?.get(s.id) ?? []),
    );
    const averageProgress = studentRecords.length > 0
      ? Math.round(studentRecords.reduce((sum, s) => sum + s.overallProgress, 0) / studentRecords.length)
      : 0;
    return [{
      id: course.id,
      name: course.title,
      category: course.category,
      status: 'Activo' as const,
      averageProgress,
      students: studentRecords,
      course,
    }];
  });
}

// Reporte de UN curso del docente (scope="course"): barras por unidad,
// promediando el avance de todos los alumnos del curso en cada unidad.
export function buildTeacherCourseReport(teacherCourse: TeacherCourseRecord): ReportsData {
  const studentsWithData = teacherCourse.students.filter((s) => s.units.length > 0);
  if (studentsWithData.length === 0) return EMPTY_REPORTS;

  const percentsByUnit = new Map<string, number[]>();
  for (const student of studentsWithData) {
    for (const unit of student.units) {
      percentsByUnit.set(unit.label, [...(percentsByUnit.get(unit.label) ?? []), unit.percent]);
    }
  }

  const coursePerformance = [...percentsByUnit.entries()].map(([label, percents], index) => ({
    label,
    percent: Math.round(percents.reduce((sum, p) => sum + p, 0) / percents.length),
    barClass: BAR_COLORS[index % BAR_COLORS.length],
  }));
  const exercisesSolved = teacherCourse.students.reduce((sum, s) => sum + s.exercisesSolved, 0);

  return { ...EMPTY_REPORTS, exercisesSolved, coursePerformance };
}

// Reporte de todos los cursos del docente (scope="teacher"): barras por
// curso, con el avance promedio de sus alumnos en cada uno.
export function buildTeacherOverallReport(courses: TeacherCourseRecord[]): ReportsData {
  const withData = courses.filter((course) => course.students.some((s) => s.exercisesTotal > 0));
  if (withData.length === 0) return EMPTY_REPORTS;

  const coursePerformance = withData.map((course, index) => ({
    label: course.name,
    percent: course.averageProgress,
    barClass: BAR_COLORS[index % BAR_COLORS.length],
  }));
  const exercisesSolved = courses.reduce(
    (sum, course) => sum + course.students.reduce((s2, s) => s2 + s.exercisesSolved, 0),
    0,
  );

  return { ...EMPTY_REPORTS, exercisesSolved, coursePerformance };
}

// Students of all the teacher's courses (a student in two courses appears once).
export function getTeacherStudents(courses: TeacherCourseRecord[]): StudentProgressRecord[] {
  const byId = new Map<string, StudentProgressRecord>();
  for (const course of courses) {
    for (const student of course.students) byId.set(student.id, student);
  }
  return [...byId.values()];
}

export const EMPTY_REPORTS: ReportsData = {
  averageStreakDays: 0,
  exercisesSolved: 0,
  practiceTime: '0h 0m',
  linesOfCode: 0,
  coursePerformance: [],
  totalErrors: 0,
  errorBreakdown: [],
};
