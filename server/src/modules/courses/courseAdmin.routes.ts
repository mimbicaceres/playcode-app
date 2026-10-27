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

const LANGUAGES = ['python', 'javascript', 'html', 'sql'];
const COMPARE_MODES = ['text', 'rows_ordered', 'rows_unordered', 'dom'];

interface TestCaseInput {
  input?: string;
  expectedOutput: string;
  isHidden?: boolean;
  compareMode?: string;
  spec?: Prisma.InputJsonValue;
}

// Datos opcionales del runner; se persisten tal cual para que editar un
// ejercicio no pierda el spec ni el modo de comparacion de sus casos.
const testCaseRunnerData = (tc: TestCaseInput) => ({
  compareMode: tc.compareMode ?? 'text',
  spec: tc.spec ?? Prisma.JsonNull,
});

function validateTestCases(raw: unknown): TestCaseInput[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const result: TestCaseInput[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) return null;
    const { input, expectedOutput, isHidden, compareMode, spec } = item as Record<string, unknown>;
    if (compareMode !== undefined && (typeof compareMode !== 'string' || !COMPARE_MODES.includes(compareMode))) return null;
    if (typeof expectedOutput !== 'string' || expectedOutput.length === 0) return null;
    if (input !== undefined && typeof input !== 'string') return null;
    if (isHidden !== undefined && typeof isHidden !== 'boolean') return null;
    result.push({
      input: typeof input === 'string' ? input : '',
      expectedOutput,
      isHidden: !!isHidden,
      compareMode: typeof compareMode === 'string' ? compareMode : undefined,
      spec: spec === undefined || spec === null ? undefined : (spec as Prisma.InputJsonValue),
    });
  }
  return result;
}

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
  const { title, description } = (req.body ?? {}) as Record<string, unknown>;
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title es requerido' });
  }
  try {
    const slug = await uniqueSlug(title, async (s) => !!(await prisma.course.findUnique({ where: { slug: s } })));
    const course = await prisma.course.create({
      data: { slug, title: title.trim(), description: typeof description === 'string' ? description.trim() || null : null },
    });
    return res.status(201).json({ course });
  } catch (error) {
    console.error('createCourse error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:courseId', async (req: Request, res: Response) => {
  const { title, description } = (req.body ?? {}) as Record<string, unknown>;
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'title no puede estar vacio' });
  }
  try {
    const course = await prisma.course.update({
      where: { id: req.params.courseId },
      data: {
        ...(title !== undefined && { title: (title as string).trim() }),
        ...(description !== undefined && { description: typeof description === 'string' ? description.trim() || null : null }),
      },
    });
    return res.status(200).json({ course });
  } catch (error) {
    console.error('updateCourse error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:courseId/units', async (req: Request, res: Response) => {
  const { title } = (req.body ?? {}) as Record<string, unknown>;
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title es requerido' });
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

router.patch('/units/:unitId', async (req: Request, res: Response) => {
  const { title } = (req.body ?? {}) as Record<string, unknown>;
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'title no puede estar vacio' });
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

router.post('/units/:unitId/exercises', async (req: Request, res: Response) => {
  const { title, prompt, starterCode, rewardXp, hint, testCases, language } = (req.body ?? {}) as Record<string, unknown>;
  if (language !== undefined && (typeof language !== 'string' || !LANGUAGES.includes(language))) return res.status(400).json({ error: `language debe ser uno de: ${LANGUAGES.join(', ')}` });
  if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ error: 'title es requerido' });
  if (typeof prompt !== 'string' || !prompt.trim()) return res.status(400).json({ error: 'prompt es requerido' });
  if (typeof starterCode !== 'string') return res.status(400).json({ error: 'starterCode es requerido' });
  if (typeof rewardXp !== 'number' || rewardXp < 0) return res.status(400).json({ error: 'rewardXp debe ser un numero >= 0' });
  const validTestCases = validateTestCases(testCases);
  if (!validTestCases) return res.status(400).json({ error: 'testCases debe tener al menos un caso con expectedOutput' });

  try {
    const unit = await prisma.unit.findUnique({ where: { id: req.params.unitId } });
    if (!unit) return res.status(404).json({ error: 'Unidad no encontrada' });

    const maxOrder = await prisma.exercise.aggregate({ where: { unitId: unit.id }, _max: { order: true } });
    const exercise = await prisma.exercise.create({
      data: {
        title: title.trim(),
        type: 'code_runner',
        order: (maxOrder._max.order ?? -1) + 1,
        prompt: prompt.trim(),
        starterCode,
        ...(typeof language === 'string' && { language }),
        rewardXp,
        hint: typeof hint === 'string' ? hint.trim() || null : null,
        unitId: unit.id,
        testCases: {
          create: validTestCases.map((tc, index) => ({
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

router.patch('/exercises/:exerciseId', async (req: Request, res: Response) => {
  const { title, prompt, starterCode, rewardXp, hint, testCases, language } = (req.body ?? {}) as Record<string, unknown>;
  if (language !== undefined && (typeof language !== 'string' || !LANGUAGES.includes(language))) return res.status(400).json({ error: `language debe ser uno de: ${LANGUAGES.join(', ')}` });
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) return res.status(400).json({ error: 'title no puede estar vacio' });
  if (prompt !== undefined && (typeof prompt !== 'string' || !prompt.trim())) return res.status(400).json({ error: 'prompt no puede estar vacio' });
  if (starterCode !== undefined && typeof starterCode !== 'string') return res.status(400).json({ error: 'starterCode invalido' });
  if (rewardXp !== undefined && (typeof rewardXp !== 'number' || rewardXp < 0)) return res.status(400).json({ error: 'rewardXp debe ser un numero >= 0' });
  let validTestCases: TestCaseInput[] | null = null;
  if (testCases !== undefined) {
    validTestCases = validateTestCases(testCases);
    if (!validTestCases) return res.status(400).json({ error: 'testCases debe tener al menos un caso con expectedOutput' });
  }

  try {
    const existing = await prisma.exercise.findUnique({ where: { id: req.params.exerciseId } });
    if (!existing) return res.status(404).json({ error: 'Ejercicio no encontrado' });

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
      if (validTestCases) {
        await tx.testCase.deleteMany({ where: { exerciseId: updated.id } });
        await tx.testCase.createMany({
          data: validTestCases.map((tc, index) => ({
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
    await prisma.exercise.delete({ where: { id: req.params.exerciseId } });
    return res.status(204).send();
  } catch (error) {
    console.error('deleteExercise error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
