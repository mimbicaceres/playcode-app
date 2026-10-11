import { AdminInstituteData } from '../types';
import { ApiUser, AdminCourseSummary } from '../auth/api';
import { CODIX_CATALOG, countActivities, findCatalogCourse } from './codixCatalog';

const fullName = (user: ApiUser) => `${user.name} ${user.lastName}`;
const statusFor = (active: boolean): 'Activo' | 'Inactivo' => (active ? 'Activo' : 'Inactivo');

// Real /admin data (institute management), built from the backend users
// (GET /api/users), the CODIX catalog (static courses) and the real dynamic
// courses (GET /api/courses, DB-backed). Progress/activity tracking for the
// static courses does not exist in the backend, so those stay empty.
// Never uses mockData: the example panel is /demo/admin.
export function buildAdminInstituteData(users: ApiUser[], dbCourses: AdminCourseSummary[] = []): AdminInstituteData {
  const withCourse = (courseId: string, role: ApiUser['role']) =>
    users.filter((u) => u.role === role && u.courseIds.includes(courseId));
  const courseTitle = (id: string) => findCatalogCourse(id)?.title ?? dbCourses.find((c) => c.id === id)?.title ?? id;

  // A course is active in the institute once it is assigned to someone.
  const activeCatalogCourses = CODIX_CATALOG.filter((c) => users.some((u) => u.courseIds.includes(c.id)));
  const activeDbCourses = dbCourses.filter((c) => users.some((u) => u.courseIds.includes(c.id)));

  return {
    studentsCount: users.filter((u) => u.role === 'student').length,
    teachersCount: users.filter((u) => u.role === 'teacher').length,
    activeCoursesCount: activeCatalogCourses.length + activeDbCourses.length,
    activitiesCount:
      activeCatalogCourses.reduce((sum, c) => sum + countActivities(c), 0) +
      activeDbCourses.reduce((sum, c) => sum + c.activitiesCount, 0),
    users: users.map((user) => {
      const titles = user.courseIds.map(courseTitle);
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
    courses: [
      ...CODIX_CATALOG.map((course) => {
        const teachers = withCourse(course.id, 'teacher');
        return {
          id: course.id,
          name: course.title,
          teacherName: teachers.length ? teachers.map(fullName).join(', ') : undefined,
          studentsCount: withCourse(course.id, 'student').length,
          unitsCount: course.units.length,
          activitiesCount: countActivities(course),
          status: statusFor(activeCatalogCourses.includes(course)),
          units: course.units.map((u) => ({ title: `${u.title} — ${u.subtitle}`, activities: u.exercises.length })),
        };
      }),
      ...dbCourses.map((course) => {
        const teachers = withCourse(course.id, 'teacher');
        return {
          id: course.id,
          name: course.title ?? course.id,
          teacherName: teachers.length ? teachers.map(fullName).join(', ') : undefined,
          studentsCount: withCourse(course.id, 'student').length,
          unitsCount: course.unitsCount,
          activitiesCount: course.activitiesCount,
          status: statusFor(activeDbCourses.includes(course)),
          units: course.units,
          isDynamic: true,
        };
      }),
    ],
    activities: activeCatalogCourses.flatMap((course) => course.units.flatMap((unit) => unit.exercises.map((exercise) => ({
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
