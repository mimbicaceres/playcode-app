import bcrypt from "bcrypt";
import { Prisma, User, UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { signToken } from "../../lib/jwt";
import { toPublicUser, PublicUser, withCourses } from "../../lib/users";

const SALT_ROUNDS = 10;

// Precomputed at module load so failed-lookup logins take roughly the same
// time as a real password comparison, avoiding user-enumeration via timing.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  "dummy-password-for-timing-safety",
  SALT_ROUNDS,
);

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("Email is already registered");
    this.name = "EmailAlreadyRegisteredError";
  }
}

export class AccountDisabledError extends Error {
  constructor() {
    super("Account disabled");
    this.name = "AccountDisabledError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
    this.name = "InvalidCredentialsError";
  }
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  lastName: string;
  school?: string | null;
  grade?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

// Creates the account with the role decided by the caller (never by the request body).
async function createUserWithRole(input: RegisterInput, role: UserRole): Promise<User> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new EmailAlreadyRegisteredError();
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        lastName: input.lastName,
        school: input.school ?? null,
        grade: input.grade ?? null,
        role,
      },
    });
  } catch (error) {
    // Safety net for the race between the findUnique check above and this
    // create call under concurrent registrations for the same email.
    if (isUniqueConstraintError(error)) {
      throw new EmailAlreadyRegisteredError();
    }
    throw error;
  }

  return user;
}

// Public registration: always creates a student.
export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const user = await createUserWithRole(input, "student");
  const token = signToken({ sub: user.id, role: user.role });

  return { user: toPublicUser(user), token };
}

// Admin-only (see users.routes.ts): creates a teacher. No token is returned,
// the teacher signs in through the regular login.
export async function createTeacher(input: RegisterInput): Promise<PublicUser> {
  const user = await createUserWithRole(input, "teacher");
  return toPublicUser(user);
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: withCourses,
  });

  if (!user) {
    await bcrypt.compare(input.password, DUMMY_PASSWORD_HASH);
    throw new InvalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new InvalidCredentialsError();
  }

  // Checked after the password, so the answer does not reveal which accounts exist.
  if (!user.isActive) {
    throw new AccountDisabledError();
  }

  const token = signToken({ sub: user.id, role: user.role });

  return { user: toPublicUser(user), token };
}
