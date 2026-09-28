import { ScreenView } from './types';

// Mapeo entre las vistas internas (ScreenView) y las URLs reales de la app.
export const viewToPath: Record<ScreenView, string> = {
  welcome: '/',
  login: '/login',
  register: '/register',
  dashboard: '/alumno',
  courses_map: '/alumno/cursos',
  course_roadmap: '/alumno/cursos/roadmap',
  unit_detail: '/alumno/cursos/roadmap/unidad',
  exercise: '/alumno/cursos/roadmap/unidad/ejercicio',
  reports: '/alumno/progreso',
  profile: '/alumno/perfil',
  teacher_dashboard: '/docente',
  teacher_student_detail: '/docente/alumno',
  student_progress: '/docente/progreso',
  admin_dashboard: '/admin',
};

// Algunos componentes navegan usando el string 'student_detail' (con cast a ScreenView)
// en lugar de 'teacher_student_detail'. Se mantiene ese comportamiento existente
// y se lo asocia a la misma URL.
const extraPathAliases: Record<string, string> = {
  student_detail: '/docente/alumno',
};

// Demo mode: every view can also be opened under /demo/... and then renders
// the example data from mockData instead of the logged-in user's real data.
export const DEMO_PREFIX = '/demo';

export function isDemoPath(pathname: string): boolean {
  return pathname === DEMO_PREFIX || pathname.startsWith(`${DEMO_PREFIX}/`);
}

// In the demo, the admin can switch between three perspectives (student, teacher,
// admin). Views shared by several perspectives get a demo-only path under that
// perspective, so the URL always tells which one is active.
// In real mode the perspective is simply the user's role.
export type DemoPerspective = 'student' | 'teacher' | 'admin';

const demoPerspectivePaths: Record<DemoPerspective, Partial<Record<ScreenView, string>>> = {
  student: {},
  teacher: {
    courses_map: '/docente/cursos',
    course_roadmap: '/docente/cursos/roadmap',
    unit_detail: '/docente/cursos/roadmap/unidad',
    exercise: '/docente/cursos/roadmap/unidad/ejercicio',
    reports: '/docente/reporte',
  },
  admin: {
    student_progress: '/admin/progreso',
    reports: '/admin/reporte',
  },
};

// Real-mode paths that depend on the role (the rest are shared, see viewToPath).
const realRolePaths: Record<DemoPerspective, Partial<Record<ScreenView, string>>> = {
  student: {},
  teacher: {},
  admin: {
    student_progress: '/admin/progreso',
  },
};

export function getDemoPerspective(pathname: string): DemoPerspective {
  const path = pathname.slice(DEMO_PREFIX.length);
  if (path === '/admin' || path.startsWith('/admin/')) return 'admin';
  if (path === '/docente' || path.startsWith('/docente/')) return 'teacher';
  return 'student';
}

export function getPathForView(view: ScreenView, demo = false, perspective: DemoPerspective = 'student'): string {
  const override = (demo ? demoPerspectivePaths : realRolePaths)[perspective][view];
  const path = override ?? viewToPath[view] ?? extraPathAliases[view as string] ?? '/alumno';
  return demo ? `${DEMO_PREFIX}${path}` : path;
}

const pathToView: Record<string, ScreenView> = Object.entries(viewToPath).reduce(
  (acc, [view, path]) => {
    acc[path] = view as ScreenView;
    return acc;
  },
  {} as Record<string, ScreenView>
);

const reversePaths = (byPerspective: Record<DemoPerspective, Partial<Record<ScreenView, string>>>) =>
  Object.values(byPerspective).reduce(
    (acc, paths) => {
      for (const [view, path] of Object.entries(paths)) acc[path as string] = view as ScreenView;
      return acc;
    },
    {} as Record<string, ScreenView>
  );

// Demo-only paths (never resolved outside /demo) and role-specific real paths.
const demoPathToView = reversePaths(demoPerspectivePaths);
const realRolePathToView = reversePaths(realRolePaths);

export function getViewForPath(pathname: string): ScreenView {
  if (isDemoPath(pathname)) {
    const path = pathname.slice(DEMO_PREFIX.length) || '/';
    return demoPathToView[path] ?? pathToView[path] ?? 'welcome';
  }
  return pathToView[pathname] ?? realRolePathToView[pathname] ?? 'welcome';
}
