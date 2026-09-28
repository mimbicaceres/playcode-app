import { ScreenView, UserRole } from '../types';

type Access = UserRole[] | 'public';

// Real mode (normal URLs): each role only sees its own area, fed with real data
// (zeros/empty until an administrator assigns courses or students).
const REAL_ACCESS: Record<ScreenView, Access> = {
  welcome: 'public',
  login: 'public',
  register: 'public',
  dashboard: ['student'],
  courses_map: ['student', 'teacher'],
  // Course view: the student's learning path, or the teacher's course ("Ver curso").
  course_roadmap: ['student', 'teacher'],
  unit_detail: ['student'],
  exercise: ['student'],
  profile: ['student'],
  // Admin: general report; teacher: report per course; student: own progress (not in navbar).
  reports: ['student', 'teacher', 'admin'],
  teacher_dashboard: ['teacher'],
  teacher_student_detail: ['teacher'],
  // "Progreso": individual follow-up of each student (teacher and admin).
  student_progress: ['teacher', 'admin'],
  admin_dashboard: ['admin'],
};

// Demo mode (/demo/...): the existing screens with mockData, for presentations.
// Exclusive to administrators, who may open every perspective.
const DEMO_ACCESS: Record<ScreenView, Access> = {
  welcome: 'public',
  login: 'public',
  register: 'public',
  dashboard: ['admin'],
  courses_map: ['admin'],
  course_roadmap: ['admin'],
  unit_detail: ['admin'],
  exercise: ['admin'],
  profile: ['admin'],
  reports: ['admin'],
  teacher_dashboard: ['admin'],
  teacher_student_detail: ['admin'],
  student_progress: ['admin'],
  admin_dashboard: ['admin'],
};

export function canUseDemo(role: UserRole): boolean {
  return role === 'admin';
}

export function isPublicView(view: ScreenView): boolean {
  return REAL_ACCESS[view] === 'public';
}

export function canAccessView(view: ScreenView, role: UserRole, demo = false): boolean {
  const access = (demo ? DEMO_ACCESS : REAL_ACCESS)[view];
  return access === 'public' || access.includes(role);
}

export function getHomeView(role: UserRole): ScreenView {
  if (role === 'teacher') return 'teacher_dashboard';
  if (role === 'admin') return 'admin_dashboard';
  return 'dashboard';
}
