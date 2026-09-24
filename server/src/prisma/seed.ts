import "dotenv/config";
import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";

// Development-only demo accounts, one per role. Public registration always
// creates students, so this is the way to get teacher/admin users locally.
const DEMO_PASSWORD = "password123";

const DEMO_USERS: { email: string; name: string; lastName: string; role: UserRole; grade?: string }[] = [
  { email: "estudiante@ejemplo.com", name: "Facundo", lastName: "González", role: "student", grade: "4to Año" },
  { email: "docente@ejemplo.com", name: "Santiago", lastName: "Ramos", role: "teacher" },
  { email: "admin@ejemplo.com", name: "Admin", lastName: "CODIX", role: "admin" },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed demo users in production");
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const demo of DEMO_USERS) {
    await prisma.user.upsert({
      where: { email: demo.email },
      update: { role: demo.role },
      create: {
        ...demo,
        passwordHash,
        school: "Colegio San Martín",
      },
    });
    console.log(`  ${demo.role.padEnd(7)} ${demo.email}`);
  }

  console.log(`Demo users ready (password: ${DEMO_PASSWORD})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
