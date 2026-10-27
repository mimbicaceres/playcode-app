import bcrypt from "bcrypt";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../src/lib/prisma";
import { appendCredentials, credentialsFile, generatePassword, NewCredential, readCredentials } from "./credentials";
import { applyGradualProgress } from "./progress";

// Institucion "Colegio San Martin" con usuarios, asignaciones y progreso REALES
// en la base (antes solo existian como datos de demostracion en el front:
// src/data/demoInstitute.ts). Los nombres, las habilidades y la actividad de cada
// alumno salen de la misma semilla que usa la demo, asi lo que se ve en los
// graficos del admin es coherente con la demo. Los correos son ficticios
// (@ejemplo.com).
//
// Cursos de la demo -> cursos reales:
//   prog1      -> python-fundamentos       js_base   -> javascript-fundamentos
//   css_modern -> html-css-fundamentos     py2, java3 -> se ignoran (el curso de
//   Python "de demo" y Java no existen como curso real); en su lugar los 12
//   alumnos de py2 cursan sql-consultas.
//
// Idempotente y no destructivo:
//   - un usuario que ya existe no se toca (ni su contrasena);
//   - el progreso solo se genera para usuarios que todavia no tienen ninguno,
//     asi correr el seed de nuevo nunca pisa el avance real de nadie.
// Las contrasenas no estan en el repo: ver credentials.ts.

const SCHOOL = "Colegio San Martín";
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

// Misma mezcla de numeros pseudo-aleatorios que la demo (mulberry32).
function createRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (text: string) => [...text].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
const between = (rng: () => number, min: number, max: number) => Math.round(min + rng() * (max - min));
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const STUDENT_NAMES = [
  "Ana López", "Mateo Fernández", "Lucía Gómez", "Juan Pérez", "Valentina Ruiz", "Tomás Herrera", "Camila Torres",
  "Benjamín Díaz", "Sofía Romero", "Santiago Molina", "Martina Castro", "Joaquín Suárez", "Emma Álvarez", "Lautaro Benítez",
  "Isabella Acosta", "Thiago Medina", "Mía Rojas", "Bautista Ortiz", "Catalina Flores", "Facundo Silva", "Victoria Núñez",
  "Agustín Cabrera", "Julieta Ríos", "Nicolás Vega", "Renata Ibáñez", "Felipe Morales", "Delfina Pereyra", "Ignacio Luna",
  "Abril Sosa", "Maximiliano Ramos", "Olivia Figueroa", "Franco Aguirre", "Guadalupe Paz", "Lorenzo Giménez", "Pilar Quiroga",
  "Valentino Correa", "Morena Blanco", "Gael Domínguez", "Josefina Castillo", "Dante Vargas", "Zoe Maldonado", "Ciro Navarro",
];
const GRADES = ["3er Año A", "3er Año B", "4to Año A", "4to Año B", "5to Año A"];

// Alumnos (por posicion en STUDENT_NAMES) de cada curso: 12 cursan dos a la vez.
const ENROLLMENTS: Record<string, { range: [number, number]; demoCourseId: string }> = {
  "python-fundamentos": { range: [0, 17], demoCourseId: "prog1" },
  "javascript-fundamentos": { range: [10, 23], demoCourseId: "js_base" },
  "html-css-fundamentos": { range: [24, 33], demoCourseId: "css_modern" },
  "sql-consultas": { range: [30, 41], demoCourseId: "py2" },
};

// Docentes de la demo. Santiago Ramos ya existe como docente@ejemplo.com (cuenta del
// seed de usuarios): se le asignan cursos a esa cuenta en vez de duplicar a la persona.
const TEACHERS: { name: string; lastName: string; email: string; courses: string[] }[] = [
  { name: "María", lastName: "González", email: "maria.gonzalez@ejemplo.com", courses: ["python-fundamentos", "javascript-fundamentos", "html-css-fundamentos"] },
  { name: "Santiago", lastName: "Ramos", email: "docente@ejemplo.com", courses: ["sql-consultas"] },
  { name: "Carla", lastName: "Véliz", email: "carla.veliz@ejemplo.com", courses: ["javascript-fundamentos"] },
  { name: "Diego", lastName: "Herrera", email: "diego.herrera@ejemplo.com", courses: ["sql-consultas"] },
  { name: "Paula", lastName: "Sosa", email: "paula.sosa@ejemplo.com", courses: [] },
];
const ADMIN = { name: "Laura", lastName: "Méndez", email: "laura.mendez@ejemplo.com" };

// Alumno de pruebas del equipo: los 4 cursos con un avance gradual fijo.
const E2E = {
  name: "E2E",
  lastName: "Prueba",
  email: "e2e.prueba@ejemplo.com",
  courses: ["python-fundamentos", "javascript-fundamentos", "sql-consultas", "html-css-fundamentos"],
  progress: ["python-fundamentos=10", "javascript-fundamentos=9+2", "sql-consultas=6+1", "html-css-fundamentos=4"],
};

const emailOf = (fullName: string) =>
  `${fullName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(" ", ".")}@ejemplo.com`;
const splitName = (fullName: string) => {
  const [name, ...rest] = fullName.split(" ");
  return { name, lastName: rest.join(" ") };
};

interface RosterUser {
  email: string;
  name: string;
  lastName: string;
  role: UserRole;
  grade?: string;
  school?: string;
}

async function ensureUsers(roster: RosterUser[]): Promise<Map<string, string>> {
  const known = readCredentials();
  const created: NewCredential[] = [];
  const ids = new Map<string, string>();
  let createdCount = 0;

  for (const user of roster) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (existing) {
      ids.set(user.email, existing.id);
      continue;
    }
    const fromFile = known.get(user.email);
    const password = fromFile ?? generatePassword();
    const row = await prisma.user.create({ data: { ...user, passwordHash: await bcrypt.hash(password, 10) } });
    ids.set(user.email, row.id);
    createdCount++;
    if (!fromFile) {
      created.push({ name: `${user.name} ${user.lastName}`, email: user.email, password, role: user.role, detail: user.grade ? `Curso: ${user.grade}` : undefined });
    }
  }
  appendCredentials(created);
  console.log(`  usuarios nuevos: ${createdCount}, ya existían: ${roster.length - createdCount}`);
  if (created.length > 0) console.log(`  contraseñas generadas guardadas en ${credentialsFile}`);
  return ids;
}

export async function seedInstitute() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed the sample institute in production");
  }

  const courses = await prisma.course.findMany({
    where: { slug: { in: Object.keys(ENROLLMENTS) } },
    include: { units: { orderBy: { order: "asc" }, include: { exercises: { orderBy: { order: "asc" } } } } },
  });
  const courseBySlug = new Map(courses.map((c) => [c.slug, c]));
  for (const slug of Object.keys(ENROLLMENTS)) {
    if (!courseBySlug.has(slug)) throw new Error(`Falta el curso ${slug}: cargá primero los cursos (db:seed).`);
  }

  // ─── Usuarios ───────────────────────────────────────────────────────────
  const students = STUDENT_NAMES.map((fullName, index) => ({
    index,
    email: emailOf(fullName),
    ...splitName(fullName),
    role: "student" as UserRole,
    grade: GRADES[index % GRADES.length],
    school: SCHOOL,
  }));
  const roster: RosterUser[] = [
    ...students.map(({ index: _index, ...u }) => u),
    ...TEACHERS.filter((t) => t.email !== "docente@ejemplo.com").map((t) => ({ email: t.email, name: t.name, lastName: t.lastName, role: "teacher" as UserRole, school: SCHOOL })),
    { email: ADMIN.email, name: ADMIN.name, lastName: ADMIN.lastName, role: "admin", school: SCHOOL },
    { email: E2E.email, name: E2E.name, lastName: E2E.lastName, role: "student" },
  ];
  console.log("Usuarios:");
  const ids = await ensureUsers(roster);
  const docente = await prisma.user.findUnique({ where: { email: "docente@ejemplo.com" } });
  if (docente) ids.set("docente@ejemplo.com", docente.id);

  // ─── Asignaciones de cursos ─────────────────────────────────────────────
  const assignments: { userId: string; courseId: string }[] = [];
  for (const s of students) {
    for (const [slug, { range }] of Object.entries(ENROLLMENTS)) {
      if (s.index >= range[0] && s.index <= range[1]) assignments.push({ userId: ids.get(s.email)!, courseId: courseBySlug.get(slug)!.id });
    }
  }
  for (const t of TEACHERS) {
    const userId = ids.get(t.email);
    if (userId) for (const slug of t.courses) assignments.push({ userId, courseId: courseBySlug.get(slug)!.id });
  }
  for (const slug of E2E.courses) assignments.push({ userId: ids.get(E2E.email)!, courseId: courseBySlug.get(slug)!.id });
  const assigned = await prisma.courseAssignment.createMany({ data: assignments, skipDuplicates: true });
  console.log(`Asignaciones nuevas: ${assigned.count} (de ${assignments.length})`);

  // ─── Progreso ───────────────────────────────────────────────────────────
  const now = Date.now();
  let seededStudents = 0;
  let progressRows = 0;

  for (const s of students) {
    const userId = ids.get(s.email)!;
    if ((await prisma.exerciseProgress.count({ where: { userId } })) > 0) continue;

    // Misma secuencia de numeros que la demo: habilidad, si esta activo, racha.
    const rng = createRng(hash(`student-${s.index}`));
    const skill = 0.25 + rng() * 0.7;
    const active = rng() < 0.78 + skill * 0.15;
    const streak = active ? between(rng, 1, 3 + Math.round(skill * 12)) : 0;
    const daysSinceActivity = active ? 0 : between(rng, 3, 20);
    // Ultima actividad: hoy (alumnos activos) o hace unos dias.
    const lastTs = now - daysSinceActivity * DAY_MS - between(rng, 1, 8) * HOUR_MS;
    const startDays = Math.max(between(rng, 12, 34), daysSinceActivity + 6);

    const rows: Prisma.ExerciseProgressCreateManyInput[] = [];
    let totalXp = 0;
    let courseOrder = 0;
    for (const [slug, { range, demoCourseId }] of Object.entries(ENROLLMENTS)) {
      if (s.index < range[0] || s.index > range[1]) continue;
      const course = courseBySlug.get(slug)!;
      const exercises = course.units.flatMap((u) => u.exercises);
      const rngC = createRng(hash(`${s.index}-${demoCourseId}`));
      const overall = clamp(Math.round(skill * 100 + (rngC() - 0.5) * 24), 8, 97);
      const completed = Math.round((overall / 100) * exercises.length);
      // El segundo curso del alumno empezo mas tarde.
      const startTs = now - startDays * (courseOrder === 0 ? 1 : 0.55) * DAY_MS;
      courseOrder++;

      exercises.slice(0, completed).forEach((exercise, k) => {
        const position = completed > 1 ? k / (completed - 1) : 1;
        const jitter = (rngC() - 0.5) * 6 * HOUR_MS;
        const at = new Date(clamp(startTs + Math.pow(position, 0.85) * (lastTs - startTs) + jitter, startTs, lastTs));
        const attempts = 1 + (rngC() < (1 - skill) * 0.7 ? 1 : 0) + (rngC() < (1 - skill) * 0.25 ? 1 : 0);
        totalXp += exercise.rewardXp;
        rows.push({
          userId, exerciseId: exercise.id, unitId: exercise.unitId, courseId: course.id,
          attempts, completed: true, xpEarned: exercise.rewardXp, lastAttempt: at, completedAt: at,
        });
      });

      // Algunos alumnos estan trabados en el ejercicio siguiente.
      const next = exercises[completed];
      if (next && rngC() < 0.55) {
        rows.push({
          userId, exerciseId: next.id, unitId: next.unitId, courseId: course.id,
          attempts: between(rngC, 1, 3), completed: false, xpEarned: 0, lastAttempt: new Date(lastTs - between(rngC, 0, 5) * HOUR_MS),
        });
      }
    }

    await prisma.exerciseProgress.createMany({ data: rows, skipDuplicates: true });
    await prisma.user.update({ where: { id: userId }, data: { totalXp, streakDays: streak, lastActivityAt: new Date(lastTs) } });
    seededStudents++;
    progressRows += rows.length;
  }
  console.log(`Progreso generado para ${seededStudents} alumnos (${progressRows} registros)`);

  // Alumno de pruebas: avance gradual fijo, solo si todavia no tiene progreso.
  if ((await prisma.exerciseProgress.count({ where: { userId: ids.get(E2E.email)! } })) === 0) {
    await applyGradualProgress(E2E.email, E2E.progress);
  }

  await seedDevAccounts();
}

// Cuentas de desarrollo (password123, las crea seedUsers): para que todo el equipo
// las tenga igual, se les asignan los mismos cursos y, al alumno, el mismo avance
// inicial en Python que tiene en la base original. No pisa nada: solo agrega
// lo que falta (asignaciones nuevas) y solo da progreso a quien no tiene ninguno.
const DEV_COURSES: Record<string, string[]> = {
  "estudiante@ejemplo.com": ["python-fundamentos"],
  "docente@ejemplo.com": ["python-fundamentos", "sql-consultas"],
};
// Ejercicios de Python que ya tenia resueltos estudiante@ (intentos, y hace cuantos
// dias): 5 de hace dos semanas y 3 de hoy.
const ESTUDIANTE_PROGRESS: { slug: string; attempts: number; daysAgo: number }[] = [
  { slug: "py-1-1-5-2", attempts: 2, daysAgo: 14 },
  { slug: "py-1-1-5-3", attempts: 1, daysAgo: 14 },
  { slug: "py-1-1-5-4", attempts: 1, daysAgo: 14 },
  { slug: "py-1-1-5-5", attempts: 3, daysAgo: 14 },
  { slug: "py-1-1-5-6", attempts: 2, daysAgo: 14 },
  { slug: "py-1-1-5-7", attempts: 2, daysAgo: 14 },
  { slug: "py-1-1-5-1", attempts: 4, daysAgo: 0 },
  { slug: "py-1-7", attempts: 4, daysAgo: 0 },
];

async function seedDevAccounts() {
  const users = await prisma.user.findMany({ where: { email: { in: Object.keys(DEV_COURSES) } } });
  const courses = await prisma.course.findMany({ where: { slug: { in: [...new Set(Object.values(DEV_COURSES).flat())] } } });
  const courseBySlug = new Map(courses.map((c) => [c.slug, c]));
  const data = users.flatMap((u) =>
    DEV_COURSES[u.email].flatMap((slug) => {
      const course = courseBySlug.get(slug);
      return course ? [{ userId: u.id, courseId: course.id }] : [];
    }),
  );
  const assigned = await prisma.courseAssignment.createMany({ data, skipDuplicates: true });
  console.log(`Cuentas de desarrollo: ${assigned.count} asignaciones nuevas`);

  const estudiante = users.find((u) => u.email === "estudiante@ejemplo.com");
  const python = courseBySlug.get("python-fundamentos");
  if (!estudiante || !python) return;
  if ((await prisma.exerciseProgress.count({ where: { userId: estudiante.id } })) > 0) return;

  const exercises = await prisma.exercise.findMany({
    where: { slug: { in: ESTUDIANTE_PROGRESS.map((p) => p.slug) } },
    select: { id: true, slug: true, unitId: true, rewardXp: true },
  });
  const bySlug = new Map(exercises.map((e) => [e.slug, e]));
  const now = Date.now();
  const rows: Prisma.ExerciseProgressCreateManyInput[] = [];
  let totalXp = 0;
  let lastTs = 0;
  ESTUDIANTE_PROGRESS.forEach((p, i) => {
    const exercise = bySlug.get(p.slug);
    if (!exercise) return;
    const at = new Date(now - p.daysAgo * DAY_MS - (ESTUDIANTE_PROGRESS.length - i) * HOUR_MS);
    lastTs = Math.max(lastTs, at.getTime());
    totalXp += exercise.rewardXp;
    rows.push({
      userId: estudiante.id, exerciseId: exercise.id, unitId: exercise.unitId, courseId: python.id,
      attempts: p.attempts, completed: true, xpEarned: exercise.rewardXp, lastAttempt: at, completedAt: at,
    });
  });
  await prisma.exerciseProgress.createMany({ data: rows, skipDuplicates: true });
  await prisma.user.update({ where: { id: estudiante.id }, data: { totalXp, streakDays: 1, lastActivityAt: new Date(lastTs) } });
  console.log(`estudiante@ejemplo.com: ${rows.length} ejercicios de Python, ${totalXp} XP`);
}
