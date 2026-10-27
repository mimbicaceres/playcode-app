import { Course } from '../types';

// Antes aca vivian los 5 cursos del catalogo CODIX (prog1, py2, java3, js_base,
// css_modern), con contenido fijo y sin ejercicios reales. Fueron reemplazados
// por los cursos reales de la base de datos (Python, JavaScript, SQL y HTML/CSS)
// y se dieron de baja: ver server/prisma/seeds/catalog.ts. La lista queda vacia
// para que el resto del codigo que la consulta siga funcionando.
export const CODIX_CATALOG: Course[] = [];
