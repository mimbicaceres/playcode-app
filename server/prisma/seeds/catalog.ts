import { prisma } from "../../src/lib/prisma";

// Cursos del catalogo viejo de CODIX (contenido fijo en el front, sin ejercicios
// reales en la base). Fueron reemplazados por los cursos reales:
//
//   prog1 "Programación 1: HTML & CSS"  -> HTML y CSS: Fundamentos
//   py2 "Python Básico 2"               -> Python — Fundamentos
//   java3 "Java Básico 3"               -> (el curso real de Java todavia no esta cargado)
//   js_base "Fundamentos de JavaScript" -> JavaScript — Fundamentos
//   css_modern "Diseño Web con CSS"     -> HTML y CSS: Fundamentos
//
// `retireLegacyCourses` los da de baja: borra sus asignaciones, el avance que
// pudiera tener alguien en ellos, sus unidades y los cursos mismos. Es
// idempotente (si ya no estan, no hace nada) y solo toca estos 5 cursos.
export const LEGACY_COURSE_SLUGS = ["prog1", "py2", "java3", "js_base", "css_modern"];

export async function retireLegacyCourses() {
  const courses = await prisma.course.findMany({ where: { slug: { in: LEGACY_COURSE_SLUGS } }, select: { id: true, slug: true } });
  if (courses.length === 0) {
    console.log("Cursos viejos del catálogo: ya estaban dados de baja");
    return;
  }
  const courseIds = courses.map((c) => c.id);

  const units = await prisma.unit.findMany({ where: { courseId: { in: courseIds } }, select: { id: true } });
  const unitIds = units.map((u) => u.id);
  const exerciseCount = await prisma.exercise.count({ where: { unitId: { in: unitIds } } });
  if (exerciseCount > 0) {
    // Estos cursos no deberian tener ejercicios reales; si los tienen, no se borra nada.
    throw new Error(`Los cursos viejos tienen ${exerciseCount} ejercicios en la base: revisalo a mano antes de darlos de baja.`);
  }

  const progress = await prisma.exerciseProgress.deleteMany({ where: { OR: [{ courseId: { in: courseIds } }, { unitId: { in: unitIds } }] } });
  const attempts = await prisma.exerciseAttempt.deleteMany({ where: { courseId: { in: courseIds } } });
  const assignments = await prisma.courseAssignment.deleteMany({ where: { courseId: { in: courseIds } } });
  const deletedUnits = await prisma.unit.deleteMany({ where: { courseId: { in: courseIds } } });
  const deletedCourses = await prisma.course.deleteMany({ where: { id: { in: courseIds } } });

  console.log(
    `Cursos viejos dados de baja: ${deletedCourses.count} cursos (${courses.map((c) => c.slug).join(", ")}), ` +
      `${deletedUnits.count} unidades, ${assignments.count} asignaciones, ${progress.count} registros de avance, ${attempts.count} intentos`,
  );
}
