// Cursos reales de la base de datos (sin contenido hardcodeado). A diferencia
// de CODIX_CATALOG (cursos viejos, contenido fijo en mockData), estos se
// resuelven pidiendo el contenido real al backend. Un courseId es "dinamico"
// cuando no esta en el catalogo estatico.
import { Course, Unit, Exercise } from '../types';
import { findCatalogCourse } from './codixCatalog';
import { CourseContent } from '../auth/api';
import { languageInfo } from '../lib/languages';

export function splitCourseIds(courseIds: string[]): { staticIds: string[]; dynamicIds: string[] } {
  const staticIds: string[] = [];
  const dynamicIds: string[] = [];
  for (const id of courseIds) {
    if (findCatalogCourse(id)) {
      staticIds.push(id);
    } else {
      dynamicIds.push(id);
    }
  }
  return { staticIds, dynamicIds };
}

// Valores visuales de los cursos dinamicos: no hay color/icono en la base de
// datos todavia (Fase B), asi que se derivan del lenguaje de sus ejercicios.
// Independiente de mockData.
function courseStyle(content: CourseContent) {
  // El lenguaje es del curso (si no, el del primer ejercicio, para cursos sin dato).
  const language = content.language ?? content.units.flatMap((u) => u.exercises)[0]?.language ?? 'python';
  const info = languageInfo(language);
  // Lo elegido al crear el curso manda; si no, se usa lo propio del lenguaje.
  const category = content.category?.trim() || info.category;
  const color = content.color || info.color;
  return {
    category,
    tag: category,
    color,
    accentBorder: color,
    iconName: content.iconName || info.iconName,
    ...(content.level ? { level: content.level } : {}),
    ...(content.estimatedHours ? { estimatedHours: content.estimatedHours } : {}),
  };
}

function toFrontendExercise(exercise: CourseContent['units'][number]['exercises'][number], unitId: string): Exercise {
  return {
    id: exercise.id,
    unitId,
    title: exercise.title ?? '',
    description: exercise.prompt ?? '',
    instruction: exercise.prompt ?? '',
    initialCode: exercise.starterCode ?? '',
    hint: exercise.hint ?? '',
    errorMessage: '',
    rewardXp: exercise.rewardXp,
    status: exercise.status,
    codeLanguage: exercise.language,
    type: exercise.type,
    prompt: exercise.prompt ?? undefined,
    starterCode: exercise.starterCode ?? undefined,
    testCases: exercise.testCases,
  };
}

function toFrontendUnit(unit: CourseContent['units'][number], courseId: string, index: number): Unit {
  const exercises = unit.exercises.map((exercise) => toFrontendExercise(exercise, unit.id));
  const completedCount = exercises.filter((e) => e.status === 'completed').length;
  const hasActive = exercises.some((e) => e.status === 'active');
  const status: Unit['status'] =
    exercises.length > 0 && completedCount === exercises.length
      ? 'completed'
      : hasActive || completedCount > 0
        ? 'active'
        : 'locked';

  return {
    id: unit.id,
    courseId,
    number: index + 1,
    title: unit.title ?? '',
    subtitle: '',
    description: '',
    progressPercent: exercises.length > 0 ? Math.round((completedCount / exercises.length) * 100) : 0,
    status,
    exercises,
  };
}

export function toFrontendCourse(content: CourseContent): Course {
  const units = content.units.map((unit, index) => toFrontendUnit(unit, content.id, index));
  const totalLessons = units.reduce((sum, unit) => sum + unit.exercises.length, 0);
  const completedLessons = units.reduce(
    (sum, unit) => sum + unit.exercises.filter((e) => e.status === 'completed').length,
    0,
  );

  return {
    id: content.id,
    title: content.title ?? '',
    subtitle: content.description ?? '',
    description: content.description ?? '',
    ...courseStyle(content),
    progressPercent: content.progressPercent,
    completedLessons,
    totalLessons,
    units,
    // Asignado por un administrador, nunca aparece bloqueado para el usuario.
    status: 'available',
  };
}
