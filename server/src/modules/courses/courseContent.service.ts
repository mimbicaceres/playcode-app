import { prisma } from '../../lib/prisma';

export interface CourseContentTestCase {
  id: string;
  input: string | null;
  isHidden: boolean;
  compareMode: string;
  // Datos del runner (script SQL de ejemplo, selectores a medir...). Nunca
  // contiene la respuesta esperada, asi que puede viajar tambien en casos ocultos.
  spec: unknown;
  // Nunca se incluye cuando isHidden es true.
  expectedOutput?: string;
}

export interface CourseContentExercise {
  id: string;
  slug: string | null;
  title: string | null;
  type: 'fill_variable' | 'code_runner';
  order: number;
  prompt: string | null;
  starterCode: string | null;
  language: string;
  rewardXp: number;
  hint: string | null;
  status: 'completed' | 'active' | 'locked';
  testCases: CourseContentTestCase[];
}

export interface CourseContentUnit {
  id: string;
  slug: string;
  title: string | null;
  order: number;
  exercises: CourseContentExercise[];
}

export interface CourseContent {
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  // Lenguaje del curso (python | javascript | sql | html): define la categoria y el color de la tarjeta.
  language: string;
  category: string | null;
  level: string | null;
  estimatedHours: number | null;
  iconName: string | null;
  color: string | null;
  progressPercent: number;
  units: CourseContentUnit[];
}

/**
 * Devuelve el curso con sus unidades y ejercicios en orden real, con el
 * estado (completed/active/locked) calculado segun el progreso real del
 * usuario que pide el contenido. El primer ejercicio no completado en el
 * orden global es "active", el resto despues queda "locked" -> esto
 * implementa el avance secuencial. Nunca se expone el expectedOutput de
 * test cases ocultos.
 */
export async function getCourseContent(courseId: string, userId: string): Promise<CourseContent | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      units: {
        orderBy: { order: 'asc' },
        include: {
          exercises: {
            orderBy: { order: 'asc' },
            include: { testCases: { orderBy: { order: 'asc' } } },
          },
        },
      },
    },
  });
  if (!course) return null;

  const allExerciseIds = course.units.flatMap((unit) => unit.exercises.map((exercise) => exercise.id));
  const progresses = allExerciseIds.length
    ? await prisma.exerciseProgress.findMany({
        where: { userId, exerciseId: { in: allExerciseIds } },
      })
    : [];
  const completedIds = new Set(progresses.filter((p) => p.completed).map((p) => p.exerciseId));

  // El primer ejercicio no completado (recorriendo en orden global) es el activo.
  let nextIsActive = true;

  const units: CourseContentUnit[] = course.units.map((unit) => ({
    id: unit.id,
    slug: unit.slug,
    title: unit.title,
    order: unit.order,
    exercises: unit.exercises.map((exercise) => {
      const completed = completedIds.has(exercise.id);
      let status: 'completed' | 'active' | 'locked';
      if (completed) {
        status = 'completed';
      } else if (nextIsActive) {
        status = 'active';
        nextIsActive = false;
      } else {
        status = 'locked';
      }

      return {
        id: exercise.id,
        slug: exercise.slug,
        title: exercise.title,
        type: exercise.type,
        order: exercise.order,
        prompt: exercise.prompt,
        starterCode: exercise.starterCode,
        language: exercise.language,
        rewardXp: exercise.rewardXp,
        hint: exercise.hint,
        status,
        testCases: exercise.testCases.map((testCase) => ({
          id: testCase.id,
          input: testCase.input,
          isHidden: testCase.isHidden,
          compareMode: testCase.compareMode,
          spec: testCase.spec,
          expectedOutput: testCase.isHidden ? undefined : testCase.expectedOutput,
        })),
      };
    }),
  }));

  const totalExercises = allExerciseIds.length;
  const progressPercent = totalExercises > 0 ? Math.round((completedIds.size / totalExercises) * 100) : 0;

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    language: course.language,
    category: course.category,
    level: course.level,
    estimatedHours: course.estimatedHours,
    iconName: course.iconName,
    color: course.color,
    progressPercent,
    units,
  };
}
