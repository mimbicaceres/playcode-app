import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { prisma } from '../../lib/prisma';
import { getCourseContent } from './courseContent.service';

const router = Router();

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
