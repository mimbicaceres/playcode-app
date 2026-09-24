import { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { verifyToken } from "../lib/jwt";

export interface AuthContext {
  userId: string;
  role: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

const VALID_ROLES = Object.values(UserRole) as string[];

// Validates the "Authorization: Bearer <token>" header and attaches
// { userId, role } to req.auth. Responds 401 if missing or invalid.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = verifyToken(header.slice("Bearer ".length).trim());

    if (typeof payload.sub !== "string" || !VALID_ROLES.includes(payload.role)) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.auth = { userId: payload.sub, role: payload.role as UserRole };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Must run after requireAuth. Responds 403 if the user's role is not allowed.
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return next();
  };
}
