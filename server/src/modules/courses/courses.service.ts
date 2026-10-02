import { prisma } from '../../lib/prisma';

/**
 * Retrieves the list of course IDs assigned to a given user.
 * Returns an array of strings (the courseId values from the CourseAssignment table).
 */
export async function getUserCourses(userId: string): Promise<string[]> {
  const assignments = await prisma.courseAssignment.findMany({
    where: { userId },
    select: { courseId: true },
  });
  return assignments.map((a) => a.courseId);
}
