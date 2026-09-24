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
  admin_dashboard: '/admin',
};

// Algunos componentes navegan usando el string 'student_detail' (con cast a ScreenView)
// en lugar de 'teacher_student_detail'. Se mantiene ese comportamiento existente
// y se lo asocia a la misma URL.
const extraPathAliases: Record<string, string> = {
  student_detail: '/docente/alumno',
};

export function getPathForView(view: ScreenView): string {
  return viewToPath[view] ?? extraPathAliases[view as string] ?? '/alumno';
}

const pathToView: Record<string, ScreenView> = Object.entries(viewToPath).reduce(
  (acc, [view, path]) => {
    acc[path] = view as ScreenView;
    return acc;
  },
  {} as Record<string, ScreenView>
);

export function getViewForPath(pathname: string): ScreenView {
  return pathToView[pathname] ?? 'welcome';
}
