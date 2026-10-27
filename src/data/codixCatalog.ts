import { Course } from '../types';

// Catalogo de cursos fijos para cuentas reales: los 5 cursos viejos de CODIX
// (prog1, py2, java3, js_base, css_modern) se dieron de baja porque ya existen
// sus alternativas reales en la base de datos (Python, JavaScript, SQL y HTML/CSS).
// Todos los cursos reales llegan ahora desde el backend (ver dynamicCourses.ts).
//
// El modo demo (/demo) NO usa este catalogo: sigue con su propio contenido de
// ejemplo en mockData.ts.
export const CODIX_CATALOG: Course[] = [];

export const findCatalogCourse = (id: string) => CODIX_CATALOG.find((c) => c.id === id);

// Assigned course ids → catalog courses (unknown ids are ignored).
export const catalogCoursesFor = (courseIds: string[]) =>
  courseIds.map(findCatalogCourse).filter((c): c is Course => !!c);

export const countActivities = (course: Course) => course.units.reduce((sum, u) => sum + u.exercises.length, 0);
