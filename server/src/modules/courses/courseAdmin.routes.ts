import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

const router = Router();
router.use(requireAuth, requireRole('admin'));

// Genera un slug unico (Course/Unit lo requieren) a partir de un titulo,
// agregando un sufijo numerico si ya existe.
async function uniqueSlug(title: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'curso';
  let slug = base;
  let suffix = 1;
  while (await exists(slug)) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

// ─── Lenguajes y casos de prueba ────────────────────────────────────────────
// 'quiz' = ejercicio de opcion multiple: no ejecuta codigo, sirve para cursos de teoria de cualquier tema.
export const LANGUAGES = ['python', 'javascript', 'html', 'sql', 'quiz'];
const COMPARE_MODES = ['text', 'rows_ordered', 'rows_unordered', 'dom'];
// Modo de comparacion que corresponde a cada lenguaje (ver lib/codeGrader.ts).
const COMPARE_MODES_BY_LANGUAGE: Record<string, string[]> = {
  python: ['text'],
  javascript: ['text'],
  sql: ['rows_ordered', 'rows_unordered'],
  html: ['dom'],
  quiz: ['text'],
};
const DEFAULT_COMPARE_MODE: Record<string, string> = { python: 'text', javascript: 'text', sql: 'rows_unordered', html: 'dom', quiz: 'text' };

interface TestCaseInput {
  input?: string;
  expectedOutput: string;
  isHidden?: boolean;
  compareMode?: string;
  spec?: Prisma.InputJsonValue;
}

// Datos del runner; se persisten tal cual para que editar un ejercicio no pierda
// el spec ni el modo de comparacion de sus casos.
const testCaseRunnerData = (tc: TestCaseInput) => ({
  compareMode: tc.compareMode ?? 'text',
  spec: tc.spec ?? Prisma.JsonNull,
});

const parseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

// Opcion multiple: un unico "caso" con las opciones en spec.options y el indice de la correcta
// como salida esperada. Va OCULTO para que la respuesta correcta nunca viaje al alumno (las
// opciones si, porque el ejecutor del navegador las necesita para mostrarlas).
function validateQuiz(raw: unknown): { cases: TestCaseInput[] } | { error: string } {
  if (!Array.isArray(raw) || raw.length !== 1 || typeof raw[0] !== 'object' || raw[0] === null) {
    return { error: 'Una pregunta de opción múltiple tiene que tener sus opciones y la respuesta correcta.' };
  }
  const { expectedOutput, spec } = raw[0] as Record<string, unknown>;
  const options = (spec as { options?: unknown } | null | undefined)?.options;
  if (!Array.isArray(options) || options.length < 2 || options.length > 6) return { error: 'Agregá entre 2 y 6 opciones de respuesta.' };
  if (options.some((o) => typeof o !== 'string' || !o.trim() || o.length > 300)) return { error: 'Ninguna opción puede estar vacía ni pasar de 300 caracteres.' };
  if (new Set(options.map((o) => (o as string).trim().toLowerCase())).size !== options.length) return { error: 'Hay opciones repetidas.' };
  const correct = typeof expectedOutput === 'string' ? Number(expectedOutput) : NaN;
  if (!Number.isInteger(correct) || correct < 0 || correct >= options.length) return { error: 'Marcá cuál es la respuesta correcta.' };
  return {
    cases: [{ input: '', expectedOutput: String(correct), isHidden: true, compareMode: 'text', spec: { options: (options as string[]).map((o) => o.trim()) } }],
  };
}

/**
 * Valida los casos de prueba de un ejercicio segun su lenguaje. Devuelve los casos
 * normalizados o un mensaje de error (en castellano) para mostrarle al admin.
 */
function validateTestCases(raw: unknown, language: string): { cases: TestCaseInput[] } | { error: string } {
  if (language === 'quiz') return validateQuiz(raw);
  if (!Array.isArray(raw) || raw.length === 0) return { error: 'Agregá al menos un caso de prueba con salida esperada.' };
  const allowedModes = COMPARE_MODES_BY_LANGUAGE[language] ?? ['text'];
  const result: TestCaseInput[] = [];

  for (const [index, item] of raw.entries()) {
    const label = `Caso ${index + 1}`;
    if (typeof item !== 'object' || item === null) return { error: `${label}: formato inválido.` };
    const { input, expectedOutput, isHidden, compareMode, spec } = item as Record<string, unknown>;
    if (typeof expectedOutput !== 'string' || expectedOutput.length === 0) return { error: `${label}: falta la salida esperada.` };
    if (input !== undefined && input !== null && typeof input !== 'string') return { error: `${label}: la entrada debe ser texto.` };
    if (isHidden !== undefined && typeof isHidden !== 'boolean') return { error: `${label}: "oculto" debe ser verdadero o falso.` };
    const mode = typeof compareMode === 'string' ? compareMode : DEFAULT_COMPARE_MODE[language] ?? 'text';
    if (!COMPARE_MODES.includes(mode) || !allowedModes.includes(mode)) {
      return { error: `${label}: el modo de comparación "${mode}" no corresponde a ${language}.` };
    }

    if (language === 'sql') {
      const setup = (spec as { setup?: unknown } | null | undefined)?.setup;
      if (typeof setup !== 'string' || !setup.trim()) return { error: `${label}: falta el script de la base de datos de ejemplo.` };
      const parsed = parseJson(expectedOutput) as { columns?: unknown; rows?: unknown } | undefined;
      if (!parsed || !Array.isArray(parsed.columns) || !Array.isArray(parsed.rows)) {
        return { error: `${label}: la salida esperada de una consulta SQL tiene que ser el resultado calculado (columnas y filas).` };
      }
    }
    if (language === 'html') {
      const measure = (spec as { measure?: unknown } | null | undefined)?.measure;
      if (!Array.isArray(measure) || measure.length === 0 || measure.some((m) => !m || typeof (m as { selector?: unknown }).selector !== 'string')) {
        return { error: `${label}: agregá al menos un chequeo con su selector.` };
      }
      if (!Array.isArray(parseJson(expectedOutput))) return { error: `${label}: la salida esperada de HTML/CSS tiene que ser el resultado calculado.` };
    }

    result.push({
      input: typeof input === 'string' ? input : '',
      expectedOutput,
      isHidden: !!isHidden,
      compareMode: mode,
      spec: spec === undefined || spec === null ? undefined : (spec as Prisma.InputJsonValue),
    });
  }
  if (!result.some((c) => !c.isHidden)) return { error: 'Al menos un caso tiene que ser visible para el alumno (no oculto).' };
  return { cases: result };
}

// Borra registros de avance y descuenta de cada alumno el XP que habia ganado en ellos
// (el XP total de un alumno es la suma de lo ganado en sus ejercicios; si se borra el
// ejercicio, su XP tambien deja de contar). Se usa dentro de una transaccion.
async function dropProgress(tx: Prisma.TransactionClient, where: Prisma.ExerciseProgressWhereInput) {
  const earned = await tx.exerciseProgress.groupBy({ by: ['userId'], where, _sum: { xpEarned: true } });
  for (const row of earned) {
    const xp = row._sum.xpEarned ?? 0;
    if (xp <= 0) continue;
    const user = await tx.user.findUnique({ where: { id: row.userId }, select: { totalXp: true } });
    if (user) await tx.user.update({ where: { id: row.userId }, data: { totalXp: Math.max(0, user.totalXp - xp) } });
  }
  await tx.exerciseProgress.deleteMany({ where });
}

const LEVELS = ['principiante', 'intermedio', 'avanzado'];

interface PresentationData {
  category?: string | null;
  level?: string | null;
  estimatedHours?: number | null;
  iconName?: string | null;
  color?: string | null;
}

/** Valida y normaliza las opciones de presentacion del curso (todas opcionales; null/"" las borra). */
function parsePresentation(body: Record<string, unknown>): { data: PresentationData } | { error: string } {
  const data: PresentationData = {};
  const blank = (v: unknown) => v === null || (typeof v === 'string' && !v.trim());

  if (body.category !== undefined) {
    if (blank(body.category)) data.category = null;
    else if (typeof body.category !== 'string' || body.category.trim().length > 40) return { error: 'La categoría puede tener hasta 40 caracteres.' };
    else data.category = body.category.trim();
  }
  if (body.level !== undefined) {
    if (blank(body.level)) data.level = null;
    else if (typeof body.level !== 'string' || !LEVELS.includes(body.level)) return { error: `El nivel tiene que ser: ${LEVELS.join(', ')}.` };
    else data.level = body.level;
  }
  if (body.estimatedHours !== undefined) {
    if (body.estimatedHours === null || body.estimatedHours === '') data.estimatedHours = null;
    else if (typeof body.estimatedHours !== 'number' || !Number.isInteger(body.estimatedHours) || body.estimatedHours < 1 || body.estimatedHours > 500) {
      return { error: 'La duración estimada tiene que ser un número de horas entre 1 y 500.' };
    } else data.estimatedHours = body.estimatedHours;
  }
  if (body.iconName !== undefined) {
    if (blank(body.iconName)) data.iconName = null;
    else if (typeof body.iconName !== 'string' || !/^[a-z0-9_]{2,40}$/.test(body.iconName)) return { error: 'Ícono inválido.' };
    else data.iconName = body.iconName;
  }
  if (body.color !== undefined) {
    if (blank(body.color)) data.color = null;
    else if (typeof body.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(body.color)) return { error: 'El color tiene que ser un código como #2563EB.' };
    else data.color = body.color;
  }
  return { data };
}

// Copia una unidad (con sus ejercicios y casos de prueba) a otro curso. Dentro de una transaccion.
type UnitWithContent = Prisma.UnitGetPayload<{ include: { exercises: { include: { testCases: true } } } }>;
async function copyUnit(tx: Prisma.TransactionClient, source: UnitWithContent, courseId: string, order: number, title: string) {
  const slug = await uniqueSlug(title, async (candidate) => !!(await tx.unit.findUnique({ where: { slug: candidate } })));
  const unit = await tx.unit.create({ data: { slug, title, courseId, order } });
  for (const exercise of [...source.exercises].sort((a, b) => a.order - b.order)) {
    await tx.exercise.create({
      data: {
        title: exercise.title,
        type: exercise.type,
        order: exercise.order,
        prompt: exercise.prompt,
        starterCode: exercise.starterCode,
        language: exercise.language,
        rewardXp: exercise.rewardXp,
        hint: exercise.hint,
        unitId: unit.id,
        testCases: {
          create: exercise.testCases.map((tc) => ({
            order: tc.order,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden,
            compareMode: tc.compareMode,
            spec: (tc.spec ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          })),
        },
      },
    });
  }
  return unit;
}

const languageError = (language: unknown) =>
  language !== undefined && (typeof language !== 'string' || !LANGUAGES.includes(language))
    ? `language debe ser uno de: ${LANGUAGES.join(', ')}`
    : null;

// ─── Cursos ─────────────────────────────────────────────────────────────────
// Contenido completo de un curso para el editor de admin: a diferencia del
// endpoint de contenido real para alumnos/docentes, este SI expone el
// expectedOutput de los test cases ocultos (el admin los necesita para
// poder editarlos).
router.get('/:courseId', async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.courseId },
      include: {
        units: {
          orderBy: { order: 'asc' },
          include: { exercises: { orderBy: { order: 'asc' }, include: { testCases: { orderBy: { order: 'asc' } } } } },
        },
        _count: { select: { assignments: true } },
      },
    });
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
    return res.status(200).json({ course });
  } catch (error) {
    console.error('getAdminCourseContent error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const { title, description, language, unitTitles, duplicateFromCourseId } = body;
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'El título es obligatorio.' });
  }
  const langError = languageError(language);
  if (langError) return res.status(400).json({ error: langError });
  const presentation = parsePresentation(body);
  if ('error' in presentation) return res.status(400).json({ error: presentation.error });

  // Unidades iniciales (una por titulo).
  let initialUnits: string[] = [];
  if (unitTitles !== undefined) {
    if (!Array.isArray(unitTitles) || unitTitles.some((t) => typeof t !== 'string') || unitTitles.length > 50) {
      return res.status(400).json({ error: 'unitTitles debe ser una lista de hasta 50 títulos.' });
    }
    initialUnits = (unitTitles as string[]).map((t) => t.trim()).filter(Boolean);
  }

  try {
    // Duplicar un curso existente: copia sus unidades, ejercicios y casos de prueba.
    let source: Prisma.CourseGetPayload<{ include: { units: { include: { exercises: { include: { testCases: true } } } } } }> | null = null;
    if (duplicateFromCourseId !== undefined && duplicateFromCourseId !== null && duplicateFromCourseId !== '') {
      if (typeof duplicateFromCourseId !== 'string') return res.status(400).json({ error: 'duplicateFromCourseId inválido.' });
      source = await prisma.course.findUnique({
        where: { id: duplicateFromCourseId },
        include: { units: { orderBy: { order: 'asc' }, include: { exercises: { orderBy: { order: 'asc' }, include: { testCases: { orderBy: { order: 'asc' } } } } } } },
      });
      if (!source) return res.status(404).json({ error: 'El curso a duplicar no existe.' });
    }

    const slug = await uniqueSlug(title, async (s) => !!(await prisma.course.findUnique({ where: { slug: s } })));
    const course = await prisma.$transaction(async (tx) => {
      const created = await tx.course.create({
        data: {
          slug,
          title: title.trim(),
          description: typeof description === 'string' ? description.trim() || null : source?.description ?? null,
          language: typeof language === 'string' ? language : source?.language ?? 'python',
          // Lo que no se indica se hereda del curso duplicado.
          category: presentation.data.category !== undefined ? presentation.data.category : source?.category ?? null,
          level: presentation.data.level !== undefined ? presentation.data.level : source?.level ?? null,
          estimatedHours: presentation.data.estimatedHours !== undefined ? presentation.data.estimatedHours : source?.estimatedHours ?? null,
          iconName: presentation.data.iconName !== undefined ? presentation.data.iconName : source?.iconName ?? null,
          color: presentation.data.color !== undefined ? presentation.data.color : source?.color ?? null,
        },
      });
      let order = 0;
      if (source) {
        for (const unit of source.units) await copyUnit(tx, unit, created.id, order++, unit.title ?? 'Unidad');
      }
      for (const unitTitle of initialUnits) {
        const unitSlug = await uniqueSlug(unitTitle, async (candidate) => !!(await tx.unit.findUnique({ where: { slug: candidate } })));
        await tx.unit.create({ data: { slug: unitSlug, title: unitTitle, courseId: created.id, order: order++ } });
      }
      return created;
    });
    return res.status(201).json({ course });
  } catch (error) {
    console.error('createCourse error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:courseId', async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const { title, description, language } = body;
  const presentation = parsePresentation(body);
  if ('error' in presentation) return res.status(400).json({ error: presentation.error });
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'El título no puede estar vacío.' });
  }
  const langError = languageError(language);
  if (langError) return res.status(400).json({ error: langError });
  try {
    const course = await prisma.course.update({
      where: { id: req.params.courseId },
      data: {
        ...(title !== undefined && { title: (title as string).trim() }),
        ...(description !== undefined && { description: typeof description === 'string' ? description.trim() || null : null }),
        ...(typeof language === 'string' && { language }),
        ...presentation.data,
      },
    });
    return res.status(200).json({ course });
  } catch (error) {
    console.error('updateCourse error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Borra el curso con todo lo que depende de el: ejercicios y casos de prueba, unidades,
// asignaciones, avance e historial de intentos de los alumnos. No se puede deshacer.
router.delete('/:courseId', async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId }, select: { id: true } });
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
    const unitIds = (await prisma.unit.findMany({ where: { courseId: course.id }, select: { id: true } })).map((u) => u.id);

    await prisma.$transaction(async (tx) => {
      await tx.exerciseAttempt.deleteMany({ where: { courseId: course.id } });
      await dropProgress(tx, { OR: [{ courseId: course.id }, { unitId: { in: unitIds } }] });
      await tx.courseAssignment.deleteMany({ where: { courseId: course.id } });
      await tx.exercise.deleteMany({ where: { unitId: { in: unitIds } } }); // los TestCase se borran en cascada
      await tx.unit.deleteMany({ where: { courseId: course.id } });
      await tx.course.delete({ where: { id: course.id } });
    });
    return res.status(204).send();
  } catch (error) {
    console.error('deleteCourse error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Unidades ───────────────────────────────────────────────────────────────
router.post('/:courseId/units', async (req: Request, res: Response) => {
  const { title } = (req.body ?? {}) as Record<string, unknown>;
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'El título de la unidad es obligatorio.' });
  }
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

    const maxOrder = await prisma.unit.aggregate({ where: { courseId: course.id }, _max: { order: true } });
    const slug = await uniqueSlug(title, async (s) => !!(await prisma.unit.findUnique({ where: { slug: s } })));
    const unit = await prisma.unit.create({
      data: { slug, title: title.trim(), courseId: course.id, order: (maxOrder._max.order ?? -1) + 1 },
    });
    return res.status(201).json({ unit });
  } catch (error) {
    console.error('createUnit error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Duplica una unidad (con sus ejercicios y casos de prueba) al final del mismo curso.
router.post('/units/:unitId/duplicate', async (req: Request, res: Response) => {
  try {
    const source = await prisma.unit.findUnique({
      where: { id: req.params.unitId },
      include: { exercises: { orderBy: { order: 'asc' }, include: { testCases: { orderBy: { order: 'asc' } } } } },
    });
    if (!source) return res.status(404).json({ error: 'Unidad no encontrada' });
    const maxOrder = await prisma.unit.aggregate({ where: { courseId: source.courseId }, _max: { order: true } });
    const unit = await prisma.$transaction((tx) => copyUnit(tx, source, source.courseId, (maxOrder._max.order ?? -1) + 1, `${source.title ?? 'Unidad'} (copia)`));
    return res.status(201).json({ unit });
  } catch (error) {
    console.error('duplicateUnit error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Reordena las unidades de un curso: `unitIds` tiene que ser exactamente el conjunto
// de unidades del curso, en el nuevo orden.
router.put('/:courseId/units/order', async (req: Request, res: Response) => {
  const { unitIds } = (req.body ?? {}) as { unitIds?: unknown };
  if (!Array.isArray(unitIds) || unitIds.some((id) => typeof id !== 'string')) {
    return res.status(400).json({ error: 'unitIds debe ser una lista de ids' });
  }
  try {
    const units = await prisma.unit.findMany({ where: { courseId: req.params.courseId }, select: { id: true } });
    const current = new Set(units.map((u) => u.id));
    if (unitIds.length !== current.size || new Set(unitIds).size !== unitIds.length || !(unitIds as string[]).every((id) => current.has(id))) {
      return res.status(400).json({ error: 'unitIds tiene que incluir exactamente las unidades del curso' });
    }
    await prisma.$transaction((unitIds as string[]).map((id, order) => prisma.unit.update({ where: { id }, data: { order } })));
    return res.status(204).send();
  } catch (error) {
    console.error('reorderUnits error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/units/:unitId', async (req: Request, res: Response) => {
  const { title } = (req.body ?? {}) as Record<string, unknown>;
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'El título de la unidad no puede estar vacío.' });
  }
  try {
    const unit = await prisma.unit.update({
      where: { id: req.params.unitId },
      data: { ...(title !== undefined && { title: (title as string).trim() }) },
    });
    return res.status(200).json({ unit });
  } catch (error) {
    console.error('updateUnit error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Borra la unidad con sus ejercicios (y el avance de los alumnos en ellos).
router.delete('/units/:unitId', async (req: Request, res: Response) => {
  try {
    const unit = await prisma.unit.findUnique({ where: { id: req.params.unitId }, select: { id: true, courseId: true } });
    if (!unit) return res.status(404).json({ error: 'Unidad no encontrada' });
    const exerciseIds = (await prisma.exercise.findMany({ where: { unitId: unit.id }, select: { id: true } })).map((e) => e.id);

    await prisma.$transaction(async (tx) => {
      await tx.exerciseAttempt.deleteMany({ where: { exerciseId: { in: exerciseIds } } });
      await dropProgress(tx, { OR: [{ unitId: unit.id }, { exerciseId: { in: exerciseIds } }] });
      await tx.exercise.deleteMany({ where: { unitId: unit.id } });
      await tx.unit.delete({ where: { id: unit.id } });
    });
    // Deja el orden de las unidades restantes sin huecos.
    const rest = await prisma.unit.findMany({ where: { courseId: unit.courseId }, orderBy: { order: 'asc' }, select: { id: true } });
    await prisma.$transaction(rest.map((u, order) => prisma.unit.update({ where: { id: u.id }, data: { order } })));
    return res.status(204).send();
  } catch (error) {
    console.error('deleteUnit error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Ejercicios ─────────────────────────────────────────────────────────────
// Reordena los ejercicios de una unidad (mismo criterio que las unidades).
router.put('/units/:unitId/exercises/order', async (req: Request, res: Response) => {
  const { exerciseIds } = (req.body ?? {}) as { exerciseIds?: unknown };
  if (!Array.isArray(exerciseIds) || exerciseIds.some((id) => typeof id !== 'string')) {
    return res.status(400).json({ error: 'exerciseIds debe ser una lista de ids' });
  }
  try {
    const exercises = await prisma.exercise.findMany({ where: { unitId: req.params.unitId }, select: { id: true } });
    const current = new Set(exercises.map((e) => e.id));
    if (exerciseIds.length !== current.size || new Set(exerciseIds).size !== exerciseIds.length || !(exerciseIds as string[]).every((id) => current.has(id))) {
      return res.status(400).json({ error: 'exerciseIds tiene que incluir exactamente los ejercicios de la unidad' });
    }
    await prisma.$transaction((exerciseIds as string[]).map((id, order) => prisma.exercise.update({ where: { id }, data: { order } })));
    return res.status(204).send();
  } catch (error) {
    console.error('reorderExercises error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/units/:unitId/exercises', async (req: Request, res: Response) => {
  const { title, prompt, starterCode, rewardXp, hint, testCases, language } = (req.body ?? {}) as Record<string, unknown>;
  if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ error: 'El título es obligatorio.' });
  if (typeof prompt !== 'string' || !prompt.trim()) return res.status(400).json({ error: 'La consigna es obligatoria.' });
  if (typeof starterCode !== 'string') return res.status(400).json({ error: 'starterCode es requerido' });
  if (typeof rewardXp !== 'number' || rewardXp < 0 || rewardXp > 1000) return res.status(400).json({ error: 'El XP tiene que ser un número entre 0 y 1000.' });
  const langError = languageError(language);
  if (langError) return res.status(400).json({ error: langError });

  try {
    const unit = await prisma.unit.findUnique({ where: { id: req.params.unitId }, include: { course: { select: { language: true } } } });
    if (!unit) return res.status(404).json({ error: 'Unidad no encontrada' });
    // Sin lenguaje propio, el ejercicio usa el del curso.
    const exerciseLanguage = typeof language === 'string' ? language : unit.course.language;

    const validated = validateTestCases(testCases, exerciseLanguage);
    if ('error' in validated) return res.status(400).json({ error: validated.error });

    const maxOrder = await prisma.exercise.aggregate({ where: { unitId: unit.id }, _max: { order: true } });
    const exercise = await prisma.exercise.create({
      data: {
        title: title.trim(),
        type: 'code_runner',
        order: (maxOrder._max.order ?? -1) + 1,
        prompt: prompt.trim(),
        starterCode,
        language: exerciseLanguage,
        rewardXp,
        hint: typeof hint === 'string' ? hint.trim() || null : null,
        unitId: unit.id,
        testCases: {
          create: validated.cases.map((tc, index) => ({
            order: index,
            input: tc.input || null,
            expectedOutput: tc.expectedOutput,
            isHidden: !!tc.isHidden,
            ...testCaseRunnerData(tc),
          })),
        },
      },
      include: { testCases: true },
    });
    return res.status(201).json({ exercise });
  } catch (error) {
    console.error('createExercise error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Duplica un ejercicio (con sus casos) al final de su unidad: sirve de base para escribir variantes.
router.post('/exercises/:exerciseId/duplicate', async (req: Request, res: Response) => {
  try {
    const source = await prisma.exercise.findUnique({ where: { id: req.params.exerciseId }, include: { testCases: { orderBy: { order: 'asc' } } } });
    if (!source) return res.status(404).json({ error: 'Ejercicio no encontrado' });
    const maxOrder = await prisma.exercise.aggregate({ where: { unitId: source.unitId }, _max: { order: true } });
    const exercise = await prisma.exercise.create({
      data: {
        title: `${source.title ?? 'Ejercicio'} (copia)`,
        type: source.type,
        order: (maxOrder._max.order ?? -1) + 1,
        prompt: source.prompt,
        starterCode: source.starterCode,
        language: source.language,
        rewardXp: source.rewardXp,
        hint: source.hint,
        unitId: source.unitId,
        testCases: {
          create: source.testCases.map((tc) => ({
            order: tc.order,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden,
            compareMode: tc.compareMode,
            spec: (tc.spec ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          })),
        },
      },
      include: { testCases: true },
    });
    return res.status(201).json({ exercise });
  } catch (error) {
    console.error('duplicateExercise error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/exercises/:exerciseId', async (req: Request, res: Response) => {
  const { title, prompt, starterCode, rewardXp, hint, testCases, language } = (req.body ?? {}) as Record<string, unknown>;
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) return res.status(400).json({ error: 'El título no puede estar vacío.' });
  if (prompt !== undefined && (typeof prompt !== 'string' || !prompt.trim())) return res.status(400).json({ error: 'La consigna no puede estar vacía.' });
  if (starterCode !== undefined && typeof starterCode !== 'string') return res.status(400).json({ error: 'starterCode inválido' });
  if (rewardXp !== undefined && (typeof rewardXp !== 'number' || rewardXp < 0 || rewardXp > 1000)) return res.status(400).json({ error: 'El XP tiene que ser un número entre 0 y 1000.' });
  const langError = languageError(language);
  if (langError) return res.status(400).json({ error: langError });

  try {
    const existing = await prisma.exercise.findUnique({ where: { id: req.params.exerciseId } });
    if (!existing) return res.status(404).json({ error: 'Ejercicio no encontrado' });
    const exerciseLanguage = typeof language === 'string' ? language : existing.language;

    let validCases: TestCaseInput[] | null = null;
    if (testCases !== undefined) {
      const validated = validateTestCases(testCases, exerciseLanguage);
      if ('error' in validated) return res.status(400).json({ error: validated.error });
      validCases = validated.cases;
    } else if (exerciseLanguage !== existing.language) {
      return res.status(400).json({ error: 'Para cambiar el lenguaje del ejercicio hay que volver a cargar sus casos de prueba.' });
    }

    const exercise = await prisma.$transaction(async (tx) => {
      const updated = await tx.exercise.update({
        where: { id: req.params.exerciseId },
        data: {
          ...(title !== undefined && { title: (title as string).trim() }),
          ...(prompt !== undefined && { prompt: (prompt as string).trim() }),
          ...(starterCode !== undefined && { starterCode }),
          ...(typeof language === 'string' && { language }),
          ...(rewardXp !== undefined && { rewardXp }),
          ...(hint !== undefined && { hint: typeof hint === 'string' ? hint.trim() || null : null }),
        },
      });
      if (validCases) {
        await tx.testCase.deleteMany({ where: { exerciseId: updated.id } });
        await tx.testCase.createMany({
          data: validCases.map((tc, index) => ({
            exerciseId: updated.id,
            order: index,
            input: tc.input || null,
            expectedOutput: tc.expectedOutput,
            isHidden: !!tc.isHidden,
            ...testCaseRunnerData(tc),
          })),
        });
      }
      return tx.exercise.findUniqueOrThrow({ where: { id: updated.id }, include: { testCases: { orderBy: { order: 'asc' } } } });
    });
    return res.status(200).json({ exercise });
  } catch (error) {
    console.error('updateExercise error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/exercises/:exerciseId', async (req: Request, res: Response) => {
  try {
    const exercise = await prisma.exercise.findUnique({ where: { id: req.params.exerciseId }, select: { id: true } });
    if (!exercise) return res.status(404).json({ error: 'Ejercicio no encontrado' });
    await prisma.$transaction(async (tx) => {
      await tx.exerciseAttempt.deleteMany({ where: { exerciseId: exercise.id } });
      await dropProgress(tx, { exerciseId: exercise.id });
      await tx.exercise.delete({ where: { id: exercise.id } });
    });
    return res.status(204).send();
  } catch (error) {
    console.error('deleteExercise error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
