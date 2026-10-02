import { Course } from '../types';
import { COURSES_DATA } from './mockData';

// CODIX course catalog for real accounts: the predefined courses (content
// only), without the example progress of mockData. Every real user starts at
// zero; ids match server/src/lib/codixCourses.ts.
export const CODIX_CATALOG: Course[] = COURSES_DATA.map((course) => ({
  ...course,
  progressPercent: 0,
  completedLessons: 0,
  // Assigned by an administrator, so it is never locked for the user.
  status: 'available',
  units: course.units.map((unit, unitIndex) => ({
    ...unit,
    progressPercent: 0,
    status: unitIndex === 0 ? 'active' : 'locked',
    exercises: unit.exercises.map((exercise) => ({ ...exercise, status: 'locked' })),
  })),
}));

export const findCatalogCourse = (id: string) => CODIX_CATALOG.find((c) => c.id === id);

// Assigned course ids → catalog courses (unknown ids are ignored).
export const catalogCoursesFor = (courseIds: string[]) =>
  courseIds.map(findCatalogCourse).filter((c): c is Course => !!c);

export const countActivities = (course: Course) => course.units.reduce((sum, u) => sum + u.exercises.length, 0);
