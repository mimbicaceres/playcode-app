// Demo institute for presentations (/demo/*). Everything here is fictitious and is
// ONLY used by the demo branches of App.tsx: real users never receive this data
// and nothing is written to the backend.
//
// The data is generated deterministically (seeded pseudo-random numbers), so the
// demo always shows the same values, and every figure is derived from the
// students' records to stay coherent:
//   overall progress → progress per unit → exercises solved → XP
//   students → course averages → course / teacher / institute reports.
import {
  AdminInstituteData,
  Course,
  Exercise,
  ReportsData,
  StudentProgressRecord,
  TeacherCourseRecord,
  Unit,
  UserProfile,
} from '../types';
import { AVATAR_IMAGES, COURSES_DATA } from './mockData';

const SCHOOL = 'Colegio San Martín';
const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const BADGES_TOTAL = 8;

// ─── Seeded pseudo-random numbers (mulberry32) ──────────────────────────────
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

// ─── Course content (CODIX courses, completed with units/activities for the demo) ──
const course = (id: string) => COURSES_DATA.find((c) => c.id === id)!;

function makeExercises(courseId: string, unitId: string, topic: string, count: number, rewardXp: number): Exercise[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${unitId}-ex${i + 1}`,
    unitId,
    title: `Ejercicio ${i + 1} — ${topic}`,
    description: `Práctica de ${topic.toLowerCase()}.`,
    instruction: '',
    initialCode: '',
    hint: '',
    errorMessage: '',
    rewardXp,
    status: 'locked' as const,
    codeLanguage: courseId === 'py2' ? 'python' : courseId === 'java3' ? 'java' : 'javascript',
  }));
}

function makeUnits(courseId: string, units: { topic: string; description: string; exercises: number }[]): Unit[] {
  return units.map((u, index) => {
    const id = `demo-${courseId}-u${index + 1}`;
    return {
      id,
      courseId,
      number: index + 1,
      title: `Unidad ${index + 1}`,
      subtitle: u.topic,
      description: u.description,
      progressPercent: 0,
      status: 'locked' as const,
      exercises: makeExercises(courseId, id, u.topic, u.exercises, 15 + index * 5),
    };
  });
}

// prog1 already has its units in CODIX: only the units without activities are completed.
const prog1 = course('prog1');
const PROG1_EXTRA: Record<string, number> = { u1: 6, u3: 6, u4: 6 };
const DEMO_PROG1: Course = {
  ...prog1,
  units: prog1.units.map((u, index) => (u.exercises.length > 0
    ? u
    : { ...u, exercises: makeExercises('prog1', u.id, u.subtitle, PROG1_EXTRA[u.id] ?? 5, 15 + index * 5) })),
};

export const DEMO_COURSE_CONTENT: Course[] = [
  DEMO_PROG1,
  { ...course('js_base'), units: makeUnits('js_base', [
    { topic: 'Variables y tipos', description: 'Declaración de variables, tipos primitivos y operadores.', exercises: 6 },
    { topic: 'Condicionales', description: 'Decisiones con if, else y operadores lógicos.', exercises: 6 },
    { topic: 'Bucles', description: 'Repetición con for y while.', exercises: 6 },
    { topic: 'Funciones', description: 'Parámetros, retorno y reutilización de código.', exercises: 6 },
    { topic: 'Arrays', description: 'Listas de datos y sus métodos principales.', exercises: 5 },
  ]) },
  { ...course('css_modern'), units: makeUnits('css_modern', [
    { topic: 'Selectores y colores', description: 'Cómo aplicar estilos a los elementos de una página.', exercises: 5 },
    { topic: 'Modelo de caja', description: 'Margen, borde, relleno y tamaños.', exercises: 5 },
    { topic: 'Flexbox', description: 'Alineación y distribución en una dimensión.', exercises: 6 },
    { topic: 'CSS Grid', description: 'Layouts en dos dimensiones.', exercises: 6 },
    { topic: 'Responsive', description: 'Diseños que se adaptan a cualquier pantalla.', exercises: 5 },
  ]) },
  { ...course('py2'), units: makeUnits('py2', [
    { topic: 'Listas', description: 'Colecciones ordenadas y sus operaciones.', exercises: 6 },
    { topic: 'Diccionarios', description: 'Datos organizados por clave y valor.', exercises: 6 },
    { topic: 'Funciones', description: 'Modularizar el análisis de datos.', exercises: 6 },
    { topic: 'Archivos y datos', description: 'Leer y procesar información de archivos.', exercises: 5 },
  ]) },
  { ...course('java3'), units: makeUnits('java3', [
    { topic: 'Clases y objetos', description: 'Fundamentos de la programación orientada a objetos.', exercises: 6 },
    { topic: 'Herencia', description: 'Reutilizar y extender comportamiento.', exercises: 5 },
    { topic: 'Interfaces', description: 'Contratos entre clases.', exercises: 5 },
    { topic: 'Colecciones', description: 'Listas, conjuntos y mapas en Java.', exercises: 6 },
  ]) },
];
const contentOf = (id: string) => DEMO_COURSE_CONTENT.find((c) => c.id === id)!;
const exercisesOf = (c: Course) => c.units.reduce((sum, u) => sum + u.exercises.length, 0);

// ─── People ─────────────────────────────────────────────────────────────────
const STUDENT_NAMES = [
  'Ana López', 'Mateo Fernández', 'Lucía Gómez', 'Juan Pérez', 'Valentina Ruiz', 'Tomás Herrera', 'Camila Torres',
  'Benjamín Díaz', 'Sofía Romero', 'Santiago Molina', 'Martina Castro', 'Joaquín Suárez', 'Emma Álvarez', 'Lautaro Benítez',
  'Isabella Acosta', 'Thiago Medina', 'Mía Rojas', 'Bautista Ortiz', 'Catalina Flores', 'Facundo Silva', 'Victoria Núñez',
  'Agustín Cabrera', 'Julieta Ríos', 'Nicolás Vega', 'Renata Ibáñez', 'Felipe Morales', 'Delfina Pereyra', 'Ignacio Luna',
  'Abril Sosa', 'Maximiliano Ramos', 'Olivia Figueroa', 'Franco Aguirre', 'Guadalupe Paz', 'Lorenzo Giménez', 'Pilar Quiroga',
  'Valentino Correa', 'Morena Blanco', 'Gael Domínguez', 'Josefina Castillo', 'Dante Vargas', 'Zoe Maldonado', 'Ciro Navarro',
];
const GRADES = ['3er Año A', '3er Año B', '4to Año A', '4to Año B', '5to Año A'];
const AVATARS = [AVATAR_IMAGES.ana, AVATAR_IMAGES.facuVector, AVATAR_IMAGES.maria, AVATAR_IMAGES.luis, AVATAR_IMAGES.carlos];

// Enrollments: 4 active courses, 42 students, 12 of them in two courses.
const ENROLLMENTS: Record<string, [number, number]> = {
  prog1: [0, 17],       // 18 students
  js_base: [10, 23],    // 14 students (10–17 also in prog1)
  css_modern: [24, 33], // 10 students
  py2: [30, 41],        // 12 students (30–33 also in css_modern)
};
const ACTIVE_COURSE_IDS = Object.keys(ENROLLMENTS);

export const DEMO_TEACHERS = [
  { id: 'dt-maria', name: 'María', lastName: 'González', email: 'maria.gonzalez@codix.demo', courseIds: ['prog1', 'js_base', 'css_modern'] },
  { id: 'dt-santiago', name: 'Santiago', lastName: 'Ramos', email: 'santiago.ramos@codix.demo', courseIds: ['py2'] },
  { id: 'dt-carla', name: 'Carla', lastName: 'Véliz', email: 'carla.veliz@codix.demo', courseIds: ['js_base'] },
  { id: 'dt-diego', name: 'Diego', lastName: 'Herrera', email: 'diego.herrera@codix.demo', courseIds: ['py2'] },
  { id: 'dt-paula', name: 'Paula', lastName: 'Sosa', email: 'paula.sosa@codix.demo', courseIds: [] },
];

// Demo teacher whose flow is shown in /demo/docente.
export const DEMO_TEACHER_USER: UserProfile = {
  id: 'dt-maria',
  name: 'María',
  lastName: 'González',
  email: 'maria.gonzalez@codix.demo',
  role: 'teacher',
  school: SCHOOL,
  avatarUrl: '',
  streakDays: 0,
  totalXp: 0,
  generalProgress: 0,
  assignedCourseIds: ['prog1', 'js_base', 'css_modern'],
};

// ─── Students' records (one per student and course) ─────────────────────────
interface Enrollment { courseId: string; record: StudentProgressRecord; incorrectByUnit: number[]; weeklyXp: number }

// Activity is a property of the student (the same in every course they take).
interface StudentActivity {
  isActive: boolean;
  streak: number;
  bestStreak: number;
  lastActivity: string;
  recentWhen: string[];
  practiceByDay: { day: string; minutes: number }[];
}

const pad = (n: number) => String(n).padStart(2, '0');

function buildActivity(skill: number, rng: () => number): StudentActivity {
  const active = rng() < 0.78 + skill * 0.15;
  const streak = active ? between(rng, 1, 3 + Math.round(skill * 12)) : 0;
  const daysSinceActivity = active ? 0 : between(rng, 3, 20);
  const practiceByDay = WEEK_DAYS.map((day, i) => {
    const daysAgo = 6 - i;
    const practiced = active && (daysAgo < streak || rng() < 0.45);
    return { day, minutes: practiced ? between(rng, 15, 35 + Math.round(skill * 55)) : 0 };
  });
  const time = (from: number, to: number) => `${pad(between(rng, from, to))}:${pad(between(rng, 0, 59))}`;
  const lastActivity = active ? `Hoy ${time(18, 21)}` : `${pad(25 - daysSinceActivity)}/09 ${time(14, 20)}`;
  const recentWhen = active
    ? [lastActivity, `Hoy ${time(15, 17)}`, `Ayer ${time(18, 21)}`, `Ayer ${time(14, 17)}`, `22/09 ${time(15, 20)}`]
    : [lastActivity, `${pad(24 - daysSinceActivity)}/09 ${time(14, 20)}`, `${pad(23 - daysSinceActivity)}/09 ${time(14, 20)}`];
  return {
    isActive: active,
    streak,
    bestStreak: Math.max(streak, between(rng, 3, 10) + streak),
    lastActivity,
    recentWhen,
    practiceByDay,
  };
}

function buildEnrollment(index: number, courseId: string, skill: number, activity: StudentActivity): Enrollment {
  const content = contentOf(courseId);
  const rng = createRng(hash(`${index}-${courseId}`));
  const units = content.units;

  // Overall progress, then units completed in order (their average equals the overall progress).
  const overall = clamp(Math.round(skill * 100 + (rng() - 0.5) * 24), 8, 97);
  let remaining = overall * units.length;
  const unitPercents = units.map(() => {
    const value = clamp(remaining, 0, 100);
    remaining -= value;
    return value;
  });
  const unitSolved = units.map((u, i) => Math.round((unitPercents[i] / 100) * u.exercises.length));
  const solved = unitSolved.reduce((a, b) => a + b, 0);

  // Accuracy from skill; errors distributed on the units the student worked on.
  const targetAccuracy = clamp(Math.round(55 + skill * 40 + (rng() - 0.5) * 10), 50, 97);
  const incorrect = solved === 0 ? 0 : Math.round((solved * (100 - targetAccuracy)) / targetAccuracy);
  const incorrectByUnit = unitSolved.map(() => 0);
  const workedUnits = unitSolved.map((n, i) => (n > 0 || unitPercents[i] > 0 ? i : -1)).filter((i) => i >= 0);
  for (let e = 0; e < incorrect; e++) {
    // Later (harder) units concentrate more errors.
    const pick = workedUnits[Math.min(workedUnits.length - 1, Math.floor(Math.sqrt(rng()) * workedUnits.length))];
    if (pick !== undefined) incorrectByUnit[pick] += 1;
  }
  const accuracy = solved + incorrect === 0 ? 0 : Math.round((solved / (solved + incorrect)) * 100);

  const { streak, practiceByDay, lastActivity } = activity;
  const weekMinutes = practiceByDay.reduce((sum, d) => sum + d.minutes, 0);

  // Areas that need attention: units with most errors, then the next unit not started yet.
  const attentionAreas: StudentProgressRecord['attentionAreas'] = incorrectByUnit
    .map((errors, i) => ({ errors, i }))
    .filter((u) => u.errors >= 2)
    .sort((a, b) => b.errors - a.errors)
    .slice(0, 2)
    .map((u) => ({ title: units[u.i].subtitle, detail: `${u.errors} ejercicios incorrectos en esta unidad`, status: 'reinforce' as const }));
  const nextUnit = unitPercents.findIndex((p) => p === 0);
  if (nextUnit > 0) attentionAreas.push({ title: units[nextUnit].subtitle, detail: 'Aún no comenzó esta unidad', status: 'pending' });

  // Recent activity: the last exercises solved (newest first), right or wrong by accuracy.
  const solvedExercises = units.flatMap((u, ui) => u.exercises.slice(0, unitSolved[ui]).map((ex) => (
    ex.title.includes('—') ? ex.title : `${ex.title.split(':')[0]} — ${u.subtitle}`
  )));
  const recentActivity = solvedExercises.slice(-activity.recentWhen.length).reverse().map((exercise, i) => ({
    when: activity.recentWhen[i],
    exercise,
    correct: rng() * 100 < accuracy,
  }));

  const badgesUnlocked = clamp(Math.round((overall / 100) * 6) + (streak >= 7 ? 1 : 0) + (accuracy >= 90 ? 1 : 0), 0, BADGES_TOTAL);

  const record: StudentProgressRecord = {
    id: `ds-${index}`,
    name: STUDENT_NAMES[index],
    avatarUrl: index % 9 === 0 ? AVATARS[(index / 9) % AVATARS.length] : undefined,
    grade: GRADES[index % GRADES.length],
    school: SCHOOL,
    courseName: content.title,
    isActive: activity.isActive,
    lastActivity,
    streakDays: streak,
    bestStreakDays: activity.bestStreak,
    totalXp: 0, // set below (the student's XP across all their courses)
    xpProgressPercent: 0,
    badgesUnlocked,
    badgesTotal: BADGES_TOTAL,
    overallProgress: overall,
    exercisesSolved: solved,
    exercisesTotal: exercisesOf(content),
    accuracy,
    units: units.map((u, i) => ({ label: `${u.title} — ${u.subtitle}`, percent: unitPercents[i] })),
    correctAnswers: solved,
    incorrectAnswers: incorrect,
    practiceThisWeek: formatMinutes(weekMinutes),
    practiceDailyAverage: formatMinutes(Math.round(weekMinutes / 7)),
    practiceByDay,
    attentionAreas,
    recentActivity,
  };
  // XP earned in this course: reward of each solved exercise.
  const courseXp = units.reduce((sum, u, ui) => sum + u.exercises.slice(0, unitSolved[ui]).reduce((s, ex) => s + ex.rewardXp, 0), 0);
  // XP of the current week: part of what the student earned in this course, never more.
  return { courseId, record: { ...record, totalXp: courseXp }, incorrectByUnit, weeklyXp: Math.min(courseXp, Math.round(weekMinutes * 0.5)) };
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return minutes % 60 ? `${hours}h ${minutes % 60}m` : `${hours}h`;
}

// ─── Students' base data (fixed) and their records per course ───────────────
const studentIdOf = (index: number) => `ds-${index}`;
const indexOfStudent = (id: string) => Number(id.slice(3));
const demoEmail = (fullName: string) =>
  `${fullName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(' ', '.')}@codix.demo`;
const splitName = (fullName: string) => {
  const [name, ...rest] = fullName.split(' ');
  return { name, lastName: rest.join(' ') };
};

// Skill and activity are properties of the student (the same in every course they take).
const STUDENT_BASE = STUDENT_NAMES.map((_, index) => {
  const rng = createRng(hash(`student-${index}`));
  const skill = 0.25 + rng() * 0.7;
  return { skill, activity: buildActivity(skill, rng) };
});

const isOriginalEnrollment = (index: number, courseId: string) =>
  courseId in ENROLLMENTS && index >= ENROLLMENTS[courseId][0] && index <= ENROLLMENTS[courseId][1];

// Record of a student without progress: a course assigned during the demo
// (nothing solved yet), or no course at all.
function newRecord(index: number, content?: Course): StudentProgressRecord {
  const { activity } = STUDENT_BASE[index];
  const weekMinutes = activity.practiceByDay.reduce((sum, d) => sum + d.minutes, 0);
  const units = content?.units ?? [];
  return {
    id: studentIdOf(index),
    name: STUDENT_NAMES[index],
    avatarUrl: index % 9 === 0 ? AVATARS[(index / 9) % AVATARS.length] : undefined,
    grade: GRADES[index % GRADES.length],
    school: SCHOOL,
    courseName: content?.title,
    isActive: activity.isActive,
    lastActivity: activity.lastActivity,
    streakDays: activity.streak,
    bestStreakDays: activity.bestStreak,
    totalXp: 0,
    xpProgressPercent: 0,
    badgesUnlocked: 0,
    badgesTotal: BADGES_TOTAL,
    overallProgress: 0,
    exercisesSolved: 0,
    exercisesTotal: content ? exercisesOf(content) : 0,
    accuracy: 0,
    units: units.map((u) => ({ label: `${u.title} — ${u.subtitle}`, percent: 0 })),
    correctAnswers: 0,
    incorrectAnswers: 0,
    practiceThisWeek: formatMinutes(weekMinutes),
    practiceDailyAverage: formatMinutes(Math.round(weekMinutes / 7)),
    practiceByDay: activity.practiceByDay,
    attentionAreas: units.length ? [{ title: units[0].subtitle, detail: 'Aún no comenzó este curso', status: 'pending' }] : [],
    recentActivity: [],
  };
}

// Enrollments are generated once and reused: the original ones with their progress,
// the ones assigned during the demo starting at zero.
const enrollmentCache = new Map<string, Enrollment>();
function enrollmentFor(index: number, courseId: string): Enrollment {
  const key = `${index}-${courseId}`;
  let enrollment = enrollmentCache.get(key);
  if (!enrollment) {
    const content = contentOf(courseId);
    enrollment = isOriginalEnrollment(index, courseId)
      ? buildEnrollment(index, courseId, STUDENT_BASE[index].skill, STUDENT_BASE[index].activity)
      : { courseId, record: newRecord(index, content), incorrectByUnit: content.units.map(() => 0), weeklyXp: 0 };
    enrollmentCache.set(key, enrollment);
  }
  return enrollment;
}

type EnrollmentsByCourse = Record<string, Enrollment[]>;

// ─── Aggregates and reports ─────────────────────────────────────────────────
const average = (values: number[]) => (values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0);
const BAR_CLASSES = [
  'bg-blue-600 group-hover:bg-blue-700',
  'bg-emerald-500 group-hover:bg-emerald-600',
  'bg-amber-500 group-hover:bg-amber-600',
  'bg-indigo-400 group-hover:bg-indigo-500',
  'bg-slate-400 group-hover:bg-slate-500',
];
const ERROR_COLORS = [
  { color: '#ef4444', dotClass: 'bg-red-500' },
  { color: '#f59e0b', dotClass: 'bg-amber-500' },
  { color: '#10b981', dotClass: 'bg-emerald-500' },
  { color: '#6366f1', dotClass: 'bg-indigo-500' },
];

// Weekly XP evolution ending in the current week (growing, but not perfectly linear).
function xpTrendFor(currentWeekXp: number, seed: string): ReportsData['xpTrend'] {
  const rng = createRng(hash(seed));
  const factors = [0.3, 0.46, 0.62, 0.8, 1].map((f, i) => (i === 4 ? 1 : f + (rng() - 0.5) * 0.08));
  return { weeklyXp: factors.map((f) => Math.round(currentWeekXp * f)) };
}

function buildReport(enrollments: Enrollment[], performance: ReportsData['coursePerformance'], difficultyTopics: { topic: string; errors: number }[], seed: string): ReportsData {
  const byStudent = new Map<string, StudentProgressRecord>();
  enrollments.forEach((e) => byStudent.set(e.record.id, e.record));
  const students = [...byStudent.values()];
  const totalErrors = enrollments.reduce((sum, e) => sum + e.record.incorrectAnswers, 0);
  const difficulties = difficultyTopics.filter((d) => d.errors > 0).sort((a, b) => b.errors - a.errors).slice(0, 4);
  const difficultyErrors = difficulties.reduce((sum, d) => sum + d.errors, 0) || 1;
  const weekMinutes = students.reduce((sum, s) => sum + s.practiceByDay.reduce((m, d) => m + d.minutes, 0), 0);
  const solved = enrollments.reduce((sum, e) => sum + e.record.exercisesSolved, 0);
  return {
    averageStreakDays: Math.round((students.reduce((sum, s) => sum + s.streakDays, 0) / Math.max(1, students.length)) * 10) / 10,
    exercisesSolved: solved,
    practiceTime: formatMinutes(weekMinutes),
    linesOfCode: solved * 14,
    coursePerformance: performance,
    totalErrors,
    errorBreakdown: difficulties.map((d, i) => ({ label: d.topic, percent: Math.round((d.errors / difficultyErrors) * 100), ...ERROR_COLORS[i] })),
    xpTrend: xpTrendFor(enrollments.reduce((sum, e) => sum + e.weeklyXp, 0), seed),
    activeStudents: students.filter((s) => s.isActive).length,
    studentsCount: students.length,
    averageProgress: average(enrollments.map((e) => e.record.overallProgress)),
    activitiesCount: 0, // set by the caller (activities of the courses in the report)
    difficulties,
  };
}

function unitDifficulties(courseId: string, byCourse: EnrollmentsByCourse) {
  return contentOf(courseId).units.map((u, i) => ({
    topic: u.subtitle,
    errors: byCourse[courseId].reduce((sum, e) => sum + e.incorrectByUnit[i], 0),
  }));
}

// Report of one course: performance per unit.
function courseReport(courseId: string, byCourse: EnrollmentsByCourse): ReportsData {
  const content = contentOf(courseId);
  const enrollments = byCourse[courseId];
  const performance = content.units.map((u, i) => ({
    label: u.subtitle,
    percent: average(enrollments.map((e) => e.record.units[i].percent)),
    barClass: BAR_CLASSES[i % BAR_CLASSES.length],
  }));
  return { ...buildReport(enrollments, performance, unitDifficulties(courseId, byCourse), `course-${courseId}`), activitiesCount: exercisesOf(content) };
}

// Report over several courses: performance per course, difficulties merged by topic.
function multiCourseReport(courseIds: string[], byCourse: EnrollmentsByCourse, seed: string): ReportsData {
  const enrollments = courseIds.flatMap((id) => byCourse[id]);
  const performance = courseIds.map((id, i) => ({
    label: contentOf(id).title.replace(/:.*$/, ''),
    percent: average(byCourse[id].map((e) => e.record.overallProgress)),
    barClass: BAR_CLASSES[i % BAR_CLASSES.length],
  }));
  const topics = new Map<string, number>();
  courseIds.flatMap((id) => unitDifficulties(id, byCourse)).forEach((d) => topics.set(d.topic, (topics.get(d.topic) ?? 0) + d.errors));
  const report = buildReport(enrollments, performance, [...topics].map(([topic, errors]) => ({ topic, errors })), seed);
  return { ...report, activitiesCount: courseIds.reduce((sum, id) => sum + exercisesOf(contentOf(id)), 0) };
}

// ─── Demo state: temporary changes made from /demo/admin ────────────────────
// Lives only in the browser tab (App state): it resets on reload and is never
// sent to the backend.
export interface DemoUserEdit {
  name: string;
  lastName: string;
  email: string;
  school: string | null;
  grade: string | null;
}

export interface DemoInstituteState {
  edits: Record<string, DemoUserEdit>;
  inactiveIds: string[];
  // CODIX courses assigned to each student / teacher, by user id.
  courseIds: Record<string, string[]>;
  // Teachers created during the demo.
  createdTeachers: { id: string; name: string; lastName: string; email: string }[];
}

const DEMO_ADMIN = { id: 'da-laura', name: 'Laura', lastName: 'Méndez', email: 'laura.mendez@codix.demo' };
export const DEMO_ADMIN_ID = DEMO_ADMIN.id;
const ALL_COURSE_IDS = DEMO_COURSE_CONTENT.map((c) => c.id);

export function initialDemoInstituteState(): DemoInstituteState {
  const courseIds: Record<string, string[]> = {};
  STUDENT_NAMES.forEach((_, index) => {
    courseIds[studentIdOf(index)] = ACTIVE_COURSE_IDS.filter((id) => isOriginalEnrollment(index, id));
  });
  DEMO_TEACHERS.forEach((t) => {
    courseIds[t.id] = [...t.courseIds];
  });
  return { edits: {}, inactiveIds: [], courseIds, createdTeachers: [] };
}

export interface DemoInstitute {
  admin: AdminInstituteData;
  // Demo teacher (María González) whose panel is /demo/docente.
  teacherUser: UserProfile;
  teacherCourses: TeacherCourseRecord[];
  teacherReport: ReportsData;
  courseReport: (teacherCourseId: string) => ReportsData;
  instituteReport: ReportsData;
  instituteStudents: StudentProgressRecord[];
}

// Everything the demo shows (admin, teacher and reports), derived from the state,
// so a change made by the demo admin is reflected in every demo view.
export function buildDemoInstitute(state: DemoInstituteState): DemoInstitute {
  const inactive = new Set(state.inactiveIds);
  const status = (id: string) => (inactive.has(id) ? 'Inactivo' as const : 'Activo' as const);
  const coursesOf = (id: string) => state.courseIds[id] ?? [];
  const byCourse: EnrollmentsByCourse = Object.fromEntries(ALL_COURSE_IDS.map((id) => [id, []]));

  // Students: their records per course, with the edits and aggregates applied.
  const students = STUDENT_NAMES.map((fullName, index) => {
    const id = studentIdOf(index);
    const edit = state.edits[id];
    const { activity } = STUDENT_BASE[index];
    const enrollments = coursesOf(id).map((courseId) => enrollmentFor(index, courseId));
    // A student's XP (all their courses + streak bonus) and badges are the same in every course.
    const totalXp = enrollments.reduce((sum, e) => sum + e.record.totalXp, 0) + activity.streak * 10;
    const badges = enrollments.length ? Math.max(...enrollments.map((e) => e.record.badgesUnlocked)) : 0;
    const apply = (record: StudentProgressRecord): StudentProgressRecord => ({
      ...record,
      ...(edit && { name: `${edit.name} ${edit.lastName}`, school: edit.school ?? undefined, grade: edit.grade ?? undefined }),
      // A deactivated account does not practice.
      isActive: record.isActive && !inactive.has(id),
      totalXp,
      xpProgressPercent: Math.round(((totalXp % 1000) / 1000) * 100),
      badgesUnlocked: badges,
    });
    const records = enrollments.map((e) => ({ ...e, record: apply(e.record) }));
    records.forEach((e) => byCourse[e.courseId].push(e));
    return {
      id,
      edit,
      fullName,
      courseIds: coursesOf(id),
      // The student's first course record (or one without course) for Progreso and the admin table.
      record: records[0]?.record ?? apply(newRecord(index)),
    };
  });

  const teachers = [...DEMO_TEACHERS, ...state.createdTeachers].map((t) => ({ ...t, ...state.edits[t.id], courseIds: coursesOf(t.id) }));
  const teacherFullName = (t: { name: string; lastName: string }) => `${t.name} ${t.lastName}`;
  const courseTitle = (id: string) => contentOf(id).title;

  // Courses with students (reports) and courses assigned to anyone (active in the institute).
  const coursesWithStudents = ALL_COURSE_IDS.filter((id) => byCourse[id].length > 0);
  const activeCourseIds = ALL_COURSE_IDS.filter((id) => byCourse[id].length > 0 || teachers.some((t) => t.courseIds.includes(id)));
  const activeContent = activeCourseIds.map(contentOf);

  const admin = { ...DEMO_ADMIN, ...state.edits[DEMO_ADMIN.id] };
  const adminData: AdminInstituteData = {
    studentsCount: students.length,
    teachersCount: teachers.length,
    activeCoursesCount: activeCourseIds.length,
    activitiesCount: activeContent.reduce((sum, c) => sum + exercisesOf(c), 0),
    users: [
      ...students.map((s) => {
        const titles = s.courseIds.map(courseTitle);
        const names = s.edit ?? splitName(s.fullName);
        return {
          id: s.id,
          name: s.record.name,
          email: s.edit?.email ?? demoEmail(s.fullName),
          role: 'student' as const,
          courseName: titles.length > 1 ? `${titles[0]} (+${titles.length - 1})` : titles[0],
          progress: s.courseIds.length ? s.record.overallProgress : undefined,
          lastActivity: s.record.lastActivity,
          status: status(s.id),
          firstName: names.name,
          lastName: names.lastName,
          school: s.record.school,
          grade: s.record.grade,
          courseIds: s.courseIds,
          totalXp: s.record.totalXp,
          streakDays: s.record.streakDays,
        };
      }),
      ...teachers.map((t) => ({
        id: t.id,
        name: teacherFullName(t),
        email: t.email,
        role: 'teacher' as const,
        assignedCourses: t.courseIds.length,
        status: status(t.id),
        firstName: t.name,
        lastName: t.lastName,
        school: state.edits[t.id] ? state.edits[t.id].school ?? undefined : SCHOOL,
        courseIds: t.courseIds,
      })),
      {
        id: admin.id,
        name: teacherFullName(admin),
        email: admin.email,
        role: 'admin' as const,
        status: status(admin.id),
        firstName: admin.name,
        lastName: admin.lastName,
        school: state.edits[admin.id] ? state.edits[admin.id].school ?? undefined : SCHOOL,
        courseIds: [],
      },
    ],
    courses: DEMO_COURSE_CONTENT.map((c) => {
      const names = teachers.filter((t) => t.courseIds.includes(c.id)).map(teacherFullName);
      return {
        id: c.id,
        name: c.title,
        teacherName: names.length ? names.join(', ') : undefined,
        studentsCount: byCourse[c.id].length,
        unitsCount: c.units.length,
        activitiesCount: exercisesOf(c),
        status: activeCourseIds.includes(c.id) ? 'Activo' as const : 'Inactivo' as const,
        units: c.units.map((u) => ({ title: `${u.title} — ${u.subtitle}`, activities: u.exercises.length })),
      };
    }),
    activities: activeContent.flatMap((c) => c.units.flatMap((u, ui) => u.exercises.map((ex, ei) => ({
      id: ex.id,
      name: ex.title,
      courseName: c.title,
      unitName: `${u.title} — ${u.subtitle}`,
      type: ei % 5 === 4 ? 'Desafío' : ei % 3 === 2 ? 'Quiz' : 'Ejercicio práctico',
      difficulty: ui < 2 ? 'Inicial' : ui < c.units.length - 1 ? 'Intermedio' : 'Avanzado',
      status: 'Activo' as const,
    })))),
    gamification: { xpMultiplier: 1.5, baseXp: 15, streakBonusXp: 50 },
  };

  // Demo teacher panel: María González's courses, each with its own students.
  const maria = teachers.find((t) => t.id === DEMO_TEACHER_USER.id)!;
  const teacherUser: UserProfile = {
    ...DEMO_TEACHER_USER,
    name: maria.name,
    lastName: maria.lastName,
    email: maria.email,
    school: state.edits[maria.id] ? state.edits[maria.id].school ?? '' : SCHOOL,
    assignedCourseIds: maria.courseIds,
  };
  const teacherCourses = maria.courseIds.map((courseId): TeacherCourseRecord => {
    const content = contentOf(courseId);
    const courseStudents = byCourse[courseId].map((e) => e.record);
    return {
      id: `demo-${courseId}`,
      name: content.title,
      category: content.category,
      status: 'Activo',
      averageProgress: average(courseStudents.map((s) => s.overallProgress)),
      students: courseStudents,
      course: content,
    };
  });

  const courseReports = new Map<string, ReportsData>();
  return {
    admin: adminData,
    teacherUser,
    teacherCourses,
    teacherReport: multiCourseReport(maria.courseIds, byCourse, 'teacher-maria'),
    // Computed when opened (one per course of the demo teacher).
    courseReport: (teacherCourseId) => {
      const courseId = teacherCourseId.replace(/^demo-/, '');
      if (!courseReports.has(courseId)) courseReports.set(courseId, courseReport(courseId, byCourse));
      return courseReports.get(courseId)!;
    },
    instituteReport: multiCourseReport(coursesWithStudents, byCourse, 'institute'),
    instituteStudents: students.map((s) => s.record).sort((a, b) => indexOfStudent(a.id) - indexOfStudent(b.id)),
  };
}
