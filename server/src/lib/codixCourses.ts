import { prisma } from "./prisma";

// Los cursos del catalogo fijo de CODIX (prog1, py2, java3, js_base, css_modern)
// se dieron de baja: todos los cursos son ahora cursos reales de la base de datos
// (Course.id). La lista queda vacia y `isCodixCourseId` siempre da false.
export const CODIX_COURSE_IDS: readonly string[] = [];

export function isCodixCourseId(id: unknown): id is string {
  return typeof id === "string" && CODIX_COURSE_IDS.includes(id);
}

// Valida que un id sea un curso asignable: tiene que existir en la base de datos.
export async function isAssignableCourseId(id: unknown): Promise<boolean> {
  if (typeof id !== "string") return false;
  const course = await prisma.course.findUnique({ where: { id }, select: { id: true } });
  return !!course;
}
