// Genera usuarios-iniciales.txt (raiz del proyecto, ignorado por git) con el
// nombre, correo y contrasena inicial de los usuarios del seed, ordenado por rol
// y con los cursos y el avance de cada uno, para pasarselo al equipo.
//
// Las contrasenas se leen del propio archivo (en la base solo hay hashes), asi
// que este script NO cambia ninguna: solo reordena y completa los datos. Antes
// de reescribir deja una copia en usuarios-iniciales.previo.txt, y las
// contrasenas de correos que no estan en la base se conservan al final.
//
// Uso (desde server/):  npm run users:file
import "dotenv/config";
import fs from "node:fs";
import { UserRole } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { credentialsFile, readCredentials } from "../prisma/seeds/credentials";
import { DEMO_PASSWORD, DEMO_USERS } from "../src/prisma/seed";

const ROLE_LABEL: Record<UserRole, string> = { admin: "administrador", teacher: "docente", student: "alumno" };
const TEST_EMAIL = "e2e.prueba@ejemplo.com";

async function main() {
  const credentials = readCredentials();
  if (credentials.size === 0) throw new Error(`No hay contraseñas en ${credentialsFile}: corré primero npm run db:seed.`);

  // Cuentas de desarrollo del seed (todas con la misma contraseña publica).
  const devEmails = new Set(DEMO_USERS.map((u) => u.email));
  for (const email of devEmails) credentials.set(email, DEMO_PASSWORD);

  const users = await prisma.user.findMany({
    where: { email: { in: [...credentials.keys()] } },
    include: { courseAssignments: { include: { course: { include: { units: { include: { exercises: { select: { id: true } } } } } } } } },
    orderBy: [{ lastName: "asc" }, { name: "asc" }],
  });
  const completed = await prisma.exerciseProgress.groupBy({
    by: ["userId", "courseId"],
    where: { userId: { in: users.map((u) => u.id) }, completed: true },
    _count: true,
  });
  const doneBy = new Map(completed.map((c) => [`${c.userId}:${c.courseId}`, c._count]));
  const studentsOf = new Map<string, Set<string>>();
  for (const u of users) {
    if (u.role !== "student") continue;
    for (const a of u.courseAssignments) studentsOf.set(a.courseId, (studentsOf.get(a.courseId) ?? new Set()).add(u.id));
  }
  // Alumnos reales por curso (incluye a quienes no estan en este archivo).
  const allStudents = await prisma.courseAssignment.groupBy({ by: ["courseId"], where: { user: { role: "student" } }, _count: true });
  const studentCount = new Map(allStudents.map((s) => [s.courseId, s._count]));

  const block = (u: (typeof users)[number]) => {
    const total = (c: (typeof u.courseAssignments)[number]["course"]) => c.units.reduce((n, un) => n + un.exercises.length, 0);
    const lines = [
      `${u.name} ${u.lastName} (${u.email === TEST_EMAIL ? "alumno de prueba" : ROLE_LABEL[u.role]})`,
      `  Correo:      ${u.email}`,
      `  Contraseña:  ${credentials.get(u.email)}`,
    ];
    if (u.grade) lines.push(`  Curso:       ${u.grade}`);
    if (u.role === "student") {
      for (const a of u.courseAssignments) {
        const done = doneBy.get(`${u.id}:${a.courseId}`) ?? 0;
        // Los cursos del catalogo CODIX viven en el front: no tienen ejercicios en la base.
        lines.push(
          total(a.course) === 0
            ? `  Avance:      ${a.course.title} — curso del catálogo CODIX (sin avance en la base)`
            : `  Avance:      ${a.course.title} — ${done}/${total(a.course)} ejercicios (${Math.round((done / total(a.course)) * 100)}%)`,
        );
      }
      if (u.courseAssignments.length === 0) lines.push("  Avance:      sin cursos asignados");
      lines.push(`  XP total:    ${u.totalXp}   Racha: ${u.streakDays} días`);
    } else if (u.role === "teacher") {
      lines.push(
        u.courseAssignments.length === 0
          ? "  Cursos:      sin cursos asignados"
          : `  Cursos:      ${u.courseAssignments.map((a) => `${a.course.title} (${studentCount.get(a.courseId) ?? 0} alumnos)`).join("; ")}`,
      );
    }
    return lines.join("\n");
  };

  const section = (title: string, list: typeof users) =>
    list.length ? [`${"=".repeat(70)}\n${title} (${list.length})\n${"=".repeat(70)}`, ...list.map(block)].join("\n\n") : "";
  const sections = [
    section("CUENTAS DE DESARROLLO (contraseña pública del seed: la misma para las tres)", users.filter((u) => devEmails.has(u.email))),
    section("ADMINISTRADORES", users.filter((u) => u.role === "admin" && !devEmails.has(u.email))),
    section("DOCENTES", users.filter((u) => u.role === "teacher" && !devEmails.has(u.email))),
    section("ALUMNO DE PRUEBA (todos los cursos)", users.filter((u) => u.email === TEST_EMAIL)),
    section("ALUMNOS", users.filter((u) => u.role === "student" && u.email !== TEST_EMAIL && !devEmails.has(u.email))),
  ].filter(Boolean);

  const known = new Set(users.map((u) => u.email));
  const orphans = [...credentials].filter(([email]) => !known.has(email));
  if (orphans.length) {
    sections.push(
      [`${"=".repeat(70)}\nCORREOS QUE NO ESTÁN EN ESTA BASE (${orphans.length})\n${"=".repeat(70)}`, ...orphans.map(([e, p]) => `${e}\n  Correo:      ${e}\n  Contraseña:  ${p}`)].join("\n\n"),
    );
  }

  const header = [
    "USUARIOS INICIALES - SOLO LOCAL (ignorado por git: no subir ni commitear)",
    `Generado: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "Todos los correos son ficticios (@ejemplo.com). El avance de cada alumno sale del",
    "mismo cálculo que la demo (misma semilla), traducido a los cursos reales.",
    "",
    "Para usar las mismas contraseñas en otra computadora: copiá este archivo a la raíz",
    "del proyecto ANTES de correr `npm run db:seed`. Si no existe, el seed genera",
    "contraseñas nuevas y las anota acá.",
    "Incluye las cuentas de desarrollo (estudiante@, docente@, admin@ejemplo.com).",
    "",
  ].join("\n");

  fs.copyFileSync(credentialsFile, credentialsFile.replace(/\.txt$/, ".previo.txt"));
  const tmp = `${credentialsFile}.tmp`;
  fs.writeFileSync(tmp, `${header}\n${sections.join("\n\n")}\n`, "utf8");
  fs.renameSync(tmp, credentialsFile);
  console.log(`${users.length} usuarios escritos en ${credentialsFile} (${orphans.length} correos sin usuario en la base)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
