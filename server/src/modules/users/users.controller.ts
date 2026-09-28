import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { toPublicUser, withCourses } from "../../lib/users";
import { isCodixCourseId } from "../../lib/codixCourses";
import { createTeacher, EmailAlreadyRegisteredError } from "../auth/auth.service";
import { isValidEmail, normalizeEmail, validateNewUserInput } from "../auth/auth.validation";

const isUniqueConstraintError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

export async function getMe(req: Request, res: Response): Promise<Response> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.userId },
      include: withCourses,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function listUsers(_req: Request, res: Response): Promise<Response> {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, include: withCourses });
    return res.status(200).json({ users: users.map(toPublicUser) });
  } catch (error) {
    console.error("listUsers error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function listStudents(_req: Request, res: Response): Promise<Response> {
  try {
    const students = await prisma.user.findMany({
      where: { role: "student" },
      orderBy: { lastName: "asc" },
      include: withCourses,
    });
    return res.status(200).json({ users: students.map(toPublicUser) });
  } catch (error) {
    console.error("listStudents error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Teacher only: the teacher's assigned courses, each with the students assigned to it.
export async function getTeaching(req: Request, res: Response): Promise<Response> {
  try {
    const assignments = await prisma.courseAssignment.findMany({
      where: { userId: req.auth!.userId },
      orderBy: { createdAt: "asc" },
    });
    const courseIds = assignments.map((a) => a.courseId);

    const students = await prisma.user.findMany({
      where: { role: "student", courseAssignments: { some: { courseId: { in: courseIds } } } },
      orderBy: { lastName: "asc" },
      include: withCourses,
    });

    const courses = courseIds.map((courseId) => ({
      courseId,
      students: students
        .filter((s) => s.courseAssignments.some((a) => a.courseId === courseId))
        .map(toPublicUser),
    }));

    return res.status(200).json({ courses });
  } catch (error) {
    console.error("getTeaching error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Admin only. Any "role" sent in the body is ignored: the account is always a teacher.
export async function createTeacherUser(req: Request, res: Response): Promise<Response> {
  const validation = validateNewUserInput(req.body);

  if (!validation.ok) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const user = await createTeacher(validation.data);
    return res.status(201).json({ user });
  } catch (error) {
    if (error instanceof EmailAlreadyRegisteredError) {
      return res.status(409).json({ error: error.message });
    }

    console.error("createTeacherUser error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Admin only: edit the profile data of a user (never the role or the password).
export async function updateUser(req: Request, res: Response): Promise<Response> {
  const { name, lastName, email, school, grade } = (req.body ?? {}) as Record<string, unknown>;

  if (typeof name !== "string" || typeof lastName !== "string" || typeof email !== "string") {
    return res.status(400).json({ error: "name, lastName and email are required" });
  }
  if (!name.trim() || !lastName.trim()) {
    return res.status(400).json({ error: "name and lastName cannot be empty" });
  }
  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  for (const [field, value] of [["school", school], ["grade", grade]] as const) {
    if (value !== undefined && value !== null && typeof value !== "string") {
      return res.status(400).json({ error: `${field} must be a string` });
    }
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name: name.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        school: typeof school === "string" && school.trim() ? school.trim() : null,
        grade: typeof grade === "string" && grade.trim() ? grade.trim() : null,
      },
      include: withCourses,
    });
    return res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({ error: "Email is already registered" });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    console.error("updateUser error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Admin only: activate or deactivate an account (an admin cannot deactivate itself).
export async function setUserStatus(req: Request, res: Response): Promise<Response> {
  const { isActive } = (req.body ?? {}) as Record<string, unknown>;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ error: "isActive must be a boolean" });
  }
  if (!isActive && req.params.id === req.auth!.userId) {
    return res.status(400).json({ error: "You cannot deactivate your own account" });
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
      include: withCourses,
    });
    return res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    console.error("setUserStatus error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Admin only: set the CODIX courses assigned to a student or a teacher.
export async function setUserCourses(req: Request, res: Response): Promise<Response> {
  const { courseIds } = (req.body ?? {}) as Record<string, unknown>;

  if (!Array.isArray(courseIds) || !courseIds.every(isCodixCourseId)) {
    return res.status(400).json({ error: "courseIds must be a list of CODIX course ids" });
  }
  const uniqueIds = [...new Set(courseIds as string[])];

  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id }, select: { role: true } });
    if (!target) {
      return res.status(404).json({ error: "User not found" });
    }
    if (target.role === "admin") {
      return res.status(400).json({ error: "Courses can only be assigned to students and teachers" });
    }

    const user = await prisma.$transaction(async (tx) => {
      await tx.courseAssignment.deleteMany({ where: { userId: req.params.id, courseId: { notIn: uniqueIds } } });
      await tx.courseAssignment.createMany({
        data: uniqueIds.map((courseId) => ({ userId: req.params.id, courseId })),
        skipDuplicates: true,
      });
      return tx.user.findUniqueOrThrow({ where: { id: req.params.id }, include: withCourses });
    });

    return res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    console.error("setUserCourses error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
