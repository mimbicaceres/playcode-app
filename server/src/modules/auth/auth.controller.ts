import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
} from "./auth.service";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function register(req: Request, res: Response): Promise<Response> {
  const { email, password, name, lastName, school, grade } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof name !== "string" ||
    typeof lastName !== "string"
  ) {
    return res.status(400).json({
      error: "email, password, name and lastName are required",
    });
  }

  const normalizedEmail = normalizeEmail(email);

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    });
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return res.status(400).json({
      error: `Password must be at most ${MAX_PASSWORD_LENGTH} characters long`,
    });
  }

  if (!name.trim() || !lastName.trim()) {
    return res.status(400).json({ error: "name and lastName cannot be empty" });
  }

  if (school !== undefined && school !== null && typeof school !== "string") {
    return res.status(400).json({ error: "school must be a string" });
  }

  if (grade !== undefined && grade !== null && typeof grade !== "string") {
    return res.status(400).json({ error: "grade must be a string" });
  }

  try {
    const result = await registerUser({
      email: normalizedEmail,
      password,
      name: name.trim(),
      lastName: lastName.trim(),
      school: school ?? null,
      grade: grade ?? null,
    });

    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof EmailAlreadyRegisteredError) {
      return res.status(409).json({ error: error.message });
    }

    console.error("register error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req: Request, res: Response): Promise<Response> {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "email and password are required" });
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const result = await loginUser({ email: normalizedEmail, password });
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return res.status(401).json({ error: error.message });
    }

    console.error("login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
