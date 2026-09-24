import { ScreenView, UserRole } from '../types';

// Which roles may open each view. 'public' views need no session.
// Teachers keep access to the content views their panel already links to
// (cursos, unidad, progreso, perfil); admins may open every perspective.
const STUDENT_HOME: UserRole[] = ['student', 'admin'];
const LEARNING_CONTENT: UserRole[] = ['student', 'teacher', 'admin'];
const TEACHER_AREA: UserRole[] = ['teacher', 'admin'];
const ADMIN_AREA: UserRole[] = ['admin'];

const VIEW_ACCESS: Record<ScreenView, UserRole[] | 'public'> = {
  welcome: 'public',
  login: 'public',
  register: 'public',
  dashboard: STUDENT_HOME,
  courses_map: LEARNING_CONTENT,
  course_roadmap: LEARNING_CONTENT,
  unit_detail: LEARNING_CONTENT,
  exercise: LEARNING_CONTENT,
  reports: LEARNING_CONTENT,
  profile: LEARNING_CONTENT,
  teacher_dashboard: TEACHER_AREA,
  teacher_student_detail: TEACHER_AREA,
  admin_dashboard: ADMIN_AREA,
};

export function isPublicView(view: ScreenView): boolean {
  return VIEW_ACCESS[view] === 'public';
}

export function canAccessView(view: ScreenView, role: UserRole): boolean {
  const access = VIEW_ACCESS[view];
  return access === 'public' || access.includes(role);
}

export function getHomeView(role: UserRole): ScreenView {
  if (role === 'teacher') return 'teacher_dashboard';
  if (role === 'admin') return 'admin_dashboard';
  return 'dashboard';
}
