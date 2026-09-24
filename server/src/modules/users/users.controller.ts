import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { toPublicUser } from "../../lib/users";

export async function getMe(req: Request, res: Response): Promise<Response> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.userId },
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
    const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
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
    });
    return res.status(200).json({ users: students.map(toPublicUser) });
  } catch (error) {
    console.error("listStudents error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
