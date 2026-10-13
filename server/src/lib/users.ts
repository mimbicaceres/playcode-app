import { Prisma, User } from "@prisma/client";
import { effectiveStreak } from "./streak";

// Include the ids of the CODIX courses assigned to the user.
export const withCourses = {
  courseAssignments: { select: { courseId: true }, orderBy: { createdAt: "asc" } },
} satisfies Prisma.UserInclude;

type UserWithCourses = User & { courseAssignments?: { courseId: string }[] };

export type PublicUser = Omit<User, "passwordHash"> & { courseIds: string[] };

export function toPublicUser(user: UserWithCourses): PublicUser {
  const { passwordHash: _passwordHash, courseAssignments, ...publicUser } = user;
  return {
    ...publicUser,
    // Racha a mostrar AHORA: si paso mas de un dia sin actividad, ya se
    // perdio aunque todavia no haya una actividad nueva que lo refleje en la DB.
    streakDays: effectiveStreak(user.streakDays, user.lastActivityAt),
    courseIds: (courseAssignments ?? []).map((a) => a.courseId),
  };
}
