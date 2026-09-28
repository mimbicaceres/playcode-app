import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  AccountDisabledError,
} from "./auth.service";
import { normalizeEmail, validateNewUserInput } from "./auth.validation";

export async function register(req: Request, res: Response): Promise<Response> {
  const validation = validateNewUserInput(req.body);

  if (!validation.ok) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const result = await registerUser(validation.data);

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
    if (error instanceof AccountDisabledError) {
      return res.status(403).json({ error: error.message });
    }

    if (error instanceof InvalidCredentialsError) {
      return res.status(401).json({ error: error.message });
    }

    console.error("login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
