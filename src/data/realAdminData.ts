import { AdminInstituteData } from '../types';
import { ApiUser } from '../auth/api';
import { CODIX_CATALOG, countActivities, findCatalogCourse } from './codixCatalog';

const fullName = (user: ApiUser) => `${user.name} ${user.lastName}`;

// Real /admin data (institute management), built only from the backend users
// (GET /api/users) and the CODIX catalog. Progress and activity tracking do not
// exist in the backend yet, so they stay empty and the table shows "—".
// Never uses mockData: the example panel is /demo/admin.
export function buildAdminInstituteData(users: ApiUser[]): AdminInstituteData {
  const withCourse = (courseId: string, role: ApiUser['role']) =>
    users.filter((u) => u.role === role && u.courseIds.includes(courseId));
  // A course is active in the institute once it is assigned to someone.
  const activeCourses = CODIX_CATALOG.filter((c) => users.some((u) => u.courseIds.includes(c.id)));

  return {
    studentsCount: users.filter((u) => u.role === 'student').length,
    teachersCount: users.filter((u) => u.role === 'teacher').length,
    activeCoursesCount: activeCourses.length,
    activitiesCount: activeCourses.reduce((sum, c) => sum + countActivities(c), 0),
    users: users.map((user) => {
      const titles = user.courseIds.map((id) => findCatalogCourse(id)?.title ?? id);
      return {
        id: user.id,
        name: fullName(user),
        email: user.email,
        role: user.role,
        courseName: user.role === 'student' && titles.length
          ? titles.length > 1 ? `${titles[0]} (+${titles.length - 1})` : titles[0]
          : undefined,
        assignedCourses: user.role === 'teacher' ? user.courseIds.length : undefined,
        status: user.isActive ? 'Activo' : 'Inactivo',
        firstName: user.name,
        lastName: user.lastName,
        school: user.school ?? undefined,
        grade: user.grade ?? undefined,
        courseIds: user.courseIds,
        totalXp: user.totalXp,
        streakDays: user.streakDays,
        createdAt: user.createdAt,
      };
    }),
    courses: CODIX_CATALOG.map((course) => {
      const teachers = withCourse(course.id, 'teacher');
      return {
        id: course.id,
        name: course.title,
        teacherName: teachers.length ? teachers.map(fullName).join(', ') : undefined,
        studentsCount: withCourse(course.id, 'student').length,
        unitsCount: course.units.length,
        activitiesCount: countActivities(course),
        status: activeCourses.includes(course) ? 'Activo' : 'Inactivo',
        units: course.units.map((u) => ({ title: `${u.title} — ${u.subtitle}`, activities: u.exercises.length })),
      };
    }),
    activities: activeCourses.flatMap((course) => course.units.flatMap((unit) => unit.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.title,
      courseName: course.title,
      unitName: `${unit.title} — ${unit.subtitle}`,
      type: 'Ejercicio práctico',
      difficulty: '—',
      status: 'Activo' as const,
    })))),
    gamification: { xpMultiplier: 1, baseXp: 0, streakBonusXp: 0 },
  };
}
