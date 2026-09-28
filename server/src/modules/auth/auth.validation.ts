const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

export interface NewUserInput {
  email: string;
  password: string;
  name: string;
  lastName: string;
  school: string | null;
  grade: string | null;
}

export type NewUserValidation =
  | { ok: true; data: NewUserInput }
  | { ok: false; error: string };

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Shared by public registration and admin-created accounts. Never reads a
// role from the body: the caller decides which role the account gets.
export function validateNewUserInput(body: unknown): NewUserValidation {
  const { email, password, name, lastName, school, grade } =
    (body ?? {}) as Record<string, unknown>;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof name !== "string" ||
    typeof lastName !== "string"
  ) {
    return { ok: false, error: "email, password, name and lastName are required" };
  }

  const normalizedEmail = normalizeEmail(email);

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { ok: false, error: "Invalid email" };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    };
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at most ${MAX_PASSWORD_LENGTH} characters long`,
    };
  }

  if (!name.trim() || !lastName.trim()) {
    return { ok: false, error: "name and lastName cannot be empty" };
  }

  if (school !== undefined && school !== null && typeof school !== "string") {
    return { ok: false, error: "school must be a string" };
  }

  if (grade !== undefined && grade !== null && typeof grade !== "string") {
    return { ok: false, error: "grade must be a string" };
  }

  return {
    ok: true,
    data: {
      email: normalizedEmail,
      password,
      name: name.trim(),
      lastName: lastName.trim(),
      school: (school as string | null | undefined) ?? null,
      grade: (grade as string | null | undefined) ?? null,
    },
  };
}
