import "dotenv/config";
import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";

// Development-only accounts. Public registration always creates students,
// so the seed is the way to get teacher/admin users locally.
// Idempotent: running it again updates these users instead of duplicating them.

interface SeedUser {
  email: string;
  name: string;
  lastName: string;
  role: UserRole;
  grade?: string;
  school?: string;
}

// Demo accounts (one per role) with a well-known password.
const DEMO_PASSWORD = "password123";

const DEMO_USERS: SeedUser[] = [
  { email: "estudiante@ejemplo.com", name: "Facundo", lastName: "González", role: "student", grade: "4to Año", school: "Colegio San Martín" },
  { email: "docente@ejemplo.com", name: "Santiago", lastName: "Ramos", role: "teacher", school: "Colegio San Martín" },
  { email: "admin@ejemplo.com", name: "Admin", lastName: "CODIX", role: "admin", school: "Colegio San Martín" },
];

// Fixed test accounts (real, non-demo users). Their password is read from
// SEED_TEST_PASSWORD in server/.env so it never ends up in the repository.
const TEST_USERS: SeedUser[] = [
  { email: "antoalumno@codix.com", name: "Anto", lastName: "Alumno", role: "student" },
  { email: "antodocente@codix.com", name: "Anto", lastName: "Docente", role: "teacher" },
  { email: "antoadmin@codix.com", name: "Anto", lastName: "Admin", role: "admin" },
];

async function upsertUsers(users: SeedUser[], password: string, syncPassword: boolean) {
  const passwordHash = await bcrypt.hash(password, 10);

  for (const seedUser of users) {
    const { email, ...profile } = seedUser;
    await prisma.user.upsert({
      where: { email },
      update: syncPassword ? { ...profile, passwordHash } : { role: profile.role },
      create: { email, ...profile, passwordHash },
    });
    console.log(`  ${seedUser.role.padEnd(7)} ${email}`);
  }
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed development users in production");
  }

  console.log("Demo users:");
  await upsertUsers(DEMO_USERS, DEMO_PASSWORD, false);
  console.log(`  (password: ${DEMO_PASSWORD})`);

  const testPassword = process.env.SEED_TEST_PASSWORD;
  if (!testPassword) {
    console.warn("SEED_TEST_PASSWORD is not set in server/.env: skipping fixed test users.");
    return;
  }

  console.log("Fixed test users:");
  await upsertUsers(TEST_USERS, testPassword, true);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
