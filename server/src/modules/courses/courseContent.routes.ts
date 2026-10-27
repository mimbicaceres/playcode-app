import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { prisma } from '../../lib/prisma';
import { getCourseContent } from './courseContent.service';

const router = Router();

// Listado de cursos para el panel de admin y el de docente. Incluye TODOS los cursos, tambien
// los recien creados que todavia no tienen unidades ni ejercicios: si no, un curso nuevo
// desapareceria de la lista y no habria forma de entrar a cargarle contenido.
router.get('/', requireAuth, requireRole('admin', 'teacher'), async (_req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        units: {
          orderBy: { order: 'asc' },
          include: { exercises: { select: { id: true, title: true }, orderBy: { order: 'asc' } } },
        },
        _count: { select: { assignments: true } },
      },
      orderBy: { title: 'asc' },
    });

    const result = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      language: course.language,
      category: course.category,
      level: course.level,
      estimatedHours: course.estimatedHours,
      iconName: course.iconName,
      color: course.color,
      assignmentsCount: course._count.assignments,
      unitsCount: course.units.length,
      activitiesCount: course.units.reduce((sum, unit) => sum + unit.exercises.length, 0),
      units: course.units.map((unit) => ({
        title: unit.title ?? '',
        activities: unit.exercises.length,
        exercises: unit.exercises.map((exercise) => ({ id: exercise.id, title: exercise.title ?? '' })),
      })),
    }));

    return res.status(200).json({ courses: result });
  } catch (error) {
    console.error('listCourses error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Contenido real de un curso (unidades/ejercicios en orden, con el status
// de avance calculado para quien pide). Alumno y docente necesitan tener el
// curso asignado (misma tabla CourseAssignment que usa /assign); admin
// siempre puede abrirlo en lectura.
router.get('/:courseId/content', requireAuth, async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { userId, role } = req.auth!;

  if (role !== 'admin') {
    const assignment = await prisma.courseAssignment.findFirst({ where: { userId, courseId } });
    if (!assignment) {
      return res.status(403).json({ error: 'No tenés acceso a este curso' });
    }
  }

  try {
    const content = await getCourseContent(courseId, userId);
    if (!content) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    return res.status(200).json({ course: content });
  } catch (error) {
    console.error('getCourseContent error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
