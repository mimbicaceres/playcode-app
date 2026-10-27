import { prisma } from "../../src/lib/prisma";
import { CODIX_CATALOG } from "../../src/lib/codixCatalog";

// Filas Course y Unit de los 5 cursos del catalogo CODIX (prog1, py2, java3,
// js_base, css_modern). Su contenido vive en el front (catalogo estatico), pero
// las asignaciones (CourseAssignment) apuntan por clave foranea a estas filas:
// sin ellas, asignar uno de esos cursos desde el admin falla en una base nueva.
//
// La clave primaria es el id del catalogo ("prog1", "u1"), asi que
// CourseAssignment.courseId y ExerciseProgress.courseId/unitId siguen usando esos
// ids. Idempotente (upsert).
export async function seedCatalog() {
  for (const catalogCourse of CODIX_CATALOG) {
    const course = await prisma.course.upsert({
      where: { slug: catalogCourse.id },
      update: { title: catalogCourse.title, description: catalogCourse.description },
      create: { id: catalogCourse.id, slug: catalogCourse.id, title: catalogCourse.title, description: catalogCourse.description },
    });
    for (const catalogUnit of catalogCourse.units) {
      await prisma.unit.upsert({
        where: { slug: catalogUnit.id },
        update: { title: catalogUnit.title, courseId: course.id },
        create: { id: catalogUnit.id, slug: catalogUnit.id, title: catalogUnit.title, courseId: course.id },
      });
    }
  }
  console.log(`Catálogo CODIX: ${CODIX_CATALOG.length} cursos (filas Course/Unit)`);
}
