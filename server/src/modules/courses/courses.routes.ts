import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { getUserCourses } from './courses.service';
import { prisma } from '../../lib/prisma';
import { withCourses, toPublicUser } from '../../lib/users';
import { isCodixCourseId } from '../../lib/codixCourses';
import { Prisma } from '@prisma/client';

const router = Router();

router.get('/courses', requireAuth, async (req, res) => {
  try {
    // existing handler
    const courseIds = await getUserCourses(req.auth!.userId);
    res.json({ courseIds });
  } catch (error) {
    console.error('getUserCourses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign a student to a course (admin or teacher)
router.post('/assign', requireAuth, requireRole('admin', 'teacher'), async (req: Request, res: Response) => {
  const { studentId, courseId } = req.body as { studentId?: string; courseId?: string };
  if (!studentId || !courseId) {
    return res.status(400).json({ error: 'studentId and courseId are required' });
  }
  if (!isCodixCourseId(courseId)) {
    return res.status(400).json({ error: 'Invalid courseId' });
  }
  const requesterId = req.auth!.userId;
  const requesterRole = req.auth!.role;
  // Teacher can only assign to courses they are assigned to
  if (requesterRole === 'teacher') {
    const hasCourse = await prisma.courseAssignment.findFirst({
      where: { userId: requesterId, courseId },
    });
    if (!hasCourse) {
      return res.status(403).json({ error: 'Teacher not assigned to this course' });
    }
  }
  try {
    await prisma.courseAssignment.create({
      data: { userId: studentId, courseId },
    });
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: withCourses,
    });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.status(200).json({ user: toPublicUser(student) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(200).json({ message: 'Already assigned' });
    }
    console.error('assignStudent error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
