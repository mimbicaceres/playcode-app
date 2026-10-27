import { Prisma } from "@prisma/client";
import { prisma } from "../../src/lib/prisma";

// Estructura comun de los seeds de cursos "reales" (los que se ejecutan en el
// navegador). Cada curso arma su CourseSpec con el expectedOutput ya resuelto y
// upsertCourse lo escribe en la base. Es idempotente: se identifica todo por
// slug, asi que correrlo de nuevo actualiza en vez de duplicar.

export interface SeedTestCaseSpec {
  input?: string | null;
  expectedOutput: string;
  isHidden: boolean;
  // "text" (default) | "rows_ordered" | "rows_unordered" | "dom"
  compareMode?: string;
  // Datos del runner (script SQL, selectores a medir...). Nunca la respuesta.
  spec?: Prisma.InputJsonValue;
}

export interface SeedExerciseSpec {
  slug: string;
  title: string;
  prompt: string;
  starterCode: string;
  rewardXp: number;
  hint: string;
  testCases: SeedTestCaseSpec[];
}

export interface SeedUnitSpec {
  slug: string;
  title: string;
  exercises: SeedExerciseSpec[];
}

export interface SeedCourseSpec {
  slug: string;
  title: string;
  description: string;
  language: string;
  units: SeedUnitSpec[];
}

export async function upsertCourse(spec: SeedCourseSpec) {
  const course = await prisma.course.upsert({
    where: { slug: spec.slug },
    update: { title: spec.title, description: spec.description, language: spec.language },
    create: { slug: spec.slug, title: spec.title, description: spec.description, language: spec.language },
  });

  for (let unitIndex = 0; unitIndex < spec.units.length; unitIndex++) {
    const unitSpec = spec.units[unitIndex];
    const unit = await prisma.unit.upsert({
      where: { slug: unitSpec.slug },
      update: { title: unitSpec.title, order: unitIndex, courseId: course.id },
      create: { slug: unitSpec.slug, title: unitSpec.title, order: unitIndex, courseId: course.id },
    });

    for (let exIndex = 0; exIndex < unitSpec.exercises.length; exIndex++) {
      const ex = unitSpec.exercises[exIndex];
      const existing = await prisma.exercise.findFirst({ where: { slug: ex.slug } });
      const data = {
        title: ex.title,
        type: "code_runner" as const,
        order: exIndex,
        prompt: ex.prompt,
        starterCode: ex.starterCode,
        language: spec.language,
        rewardXp: ex.rewardXp,
        hint: ex.hint,
        unitId: unit.id,
      };
      const exercise = existing
        ? await prisma.exercise.update({ where: { id: existing.id }, data })
        : await prisma.exercise.create({ data: { ...data, slug: ex.slug } });

      await prisma.testCase.deleteMany({ where: { exerciseId: exercise.id } });
      await prisma.testCase.createMany({
        data: ex.testCases.map((tc, tcIndex) => ({
          exerciseId: exercise.id,
          order: tcIndex,
          input: tc.input ?? null,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          compareMode: tc.compareMode ?? "text",
          spec: tc.spec ?? Prisma.JsonNull,
        })),
      });
    }
    console.log(`  Unidad "${unitSpec.title}": ${unitSpec.exercises.length} ejercicios.`);
  }
}
