import { ReportsData, StudentProgressRecord, TeacherCourseRecord } from '../types';
import type { TeachingCourse } from '../auth/api';
import { findCatalogCourse } from './codixCatalog';
import { buildStudentProgressRecord } from './realStudentData';

// Real teacher data. Never uses mockData: the example versions for presentations
// live in mockData (DEMO_TEACHER_DASHBOARD, DEMO_REPORTS, DEMO_STUDENT_AUDIT)
// and are only shown in demo mode.

// Courses in charge of the teacher (assigned by an admin, GET /api/users/me/teaching),
// each with the students assigned to it. Progress tracking does not exist in the
// backend yet, so averages start at zero.
export function buildTeacherCourses(teaching: TeachingCourse[]): TeacherCourseRecord[] {
  return teaching.flatMap(({ courseId, students }) => {
    const course = findCatalogCourse(courseId);
    if (!course) return [];
    return [{
      id: course.id,
      name: course.title,
      category: course.category,
      status: 'Activo' as const,
      averageProgress: 0,
      students: students.map((s) => buildStudentProgressRecord(s, course.id)),
      course,
    }];
  });
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
