import { Prisma, User } from "@prisma/client";

// Include the ids of the CODIX courses assigned to the user.
export const withCourses = {
  courseAssignments: { select: { courseId: true }, orderBy: { createdAt: "asc" } },
} satisfies Prisma.UserInclude;

type UserWithCourses = User & { courseAssignments?: { courseId: string }[] };

export type PublicUser = Omit<User, "passwordHash"> & { courseIds: string[] };

export function toPublicUser(user: UserWithCourses): PublicUser {
  const { passwordHash: _passwordHash, courseAssignments, ...publicUser } = user;
  return { ...publicUser, courseIds: (courseAssignments ?? []).map((a) => a.courseId) };
}
