import { prisma } from './prisma';
import { dateKeyInArgentina } from './streak';
import { getGamificationSettings } from './gamificationSettings';

// Gamificacion de CODIX: nivel (por XP) y logros. NADA de esto se guarda: se
// calcula en cada consulta a partir del avance real del alumno (ejercicios
// completados, intentos y dias de actividad), asi sirve tambien para los datos
// que ya existian y nunca queda desincronizado.

const DAY_MS = 24 * 60 * 60 * 1000;

// ─── Niveles ────────────────────────────────────────────────────────────────
// XP acumulada necesaria para ALCANZAR el nivel L: 50·L·(L−1)
//   nivel 2 = 100, 3 = 300, 4 = 600, 5 = 1000, 6 = 1500, 7 = 2100 ...
export const xpToReachLevel = (level: number) => 50 * level * (level - 1);

export function levelForXp(xp: number): number {
  let level = 1;
  while (xpToReachLevel(level + 1) <= xp) level++;
  return level;
}

const LEVEL_TITLES = ['Aprendiz', 'Explorador', 'Programador', 'Desarrollador', 'Experto', 'Maestro', 'Leyenda'];
export const titleForLevel = (level: number) => LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 2))];

// ─── Logros ─────────────────────────────────────────────────────────────────
interface Completion {
  at: Date;
  attempts: number;
  xp: number;
  language: string;
  unitId: string | null;
  courseId: string | null;
}

interface Context {
  /** Ejercicios completados, del mas viejo al mas nuevo. */
  completions: Completion[];
  /** Dias (huso AR, YYYY-MM-DD) con al menos un intento, ordenados. */
  activeDays: string[];
  /** Cuando se completo cada unidad / curso entero. */
  unitDoneAt: Date[];
  courseDoneAt: Date[];
}

interface Progress {
  current: number;
  target: number;
  unlockedAt: Date | null;
}

interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  bgColor: string;
  evaluate: (ctx: Context) => Progress;
}

// Logro por cantidad: se desbloquea cuando la lista llega a `target` elementos,
// y la fecha es la del elemento que lo completo.
const byCount = (dates: Date[], target: number): Progress => ({
  current: Math.min(dates.length, target),
  target,
  unlockedAt: dates.length >= target ? dates[target - 1] : null,
});

// Rachas: dias consecutivos con actividad. Devuelve la longitud de cada racha y
// el dia en que cada una alcanzo cada largo.
function streakRuns(days: string[]): { best: number; reachedAt: Map<number, string> } {
  let best = 0;
  let run = 0;
  const reachedAt = new Map<number, string>();
  let previous: number | null = null;
  for (const day of days) {
    const t = Date.parse(`${day}T00:00:00Z`);
    run = previous !== null && Math.round((t - previous) / DAY_MS) === 1 ? run + 1 : 1;
    previous = t;
    if (run > best) best = run;
    if (!reachedAt.has(run)) reachedAt.set(run, day);
  }
  return { best, reachedAt };
}

// Fin del dia (huso AR, UTC-3) de una clave YYYY-MM-DD.
const endOfDay = (key: string) => new Date(Date.parse(`${key}T23:59:59-03:00`));

const streakBadge = (days: number) => (ctx: Context): Progress => {
  const { best, reachedAt } = streakRuns(ctx.activeDays);
  const key = reachedAt.get(days);
  return { current: Math.min(best, days), target: days, unlockedAt: key ? endOfDay(key) : null };
};

const languageBadge = (language: string, target: number) => (ctx: Context): Progress =>
  byCount(ctx.completions.filter((c) => c.language === language).map((c) => c.at), target);

const xpBadge = (target: number) => (ctx: Context): Progress => {
  let total = 0;
  for (const c of ctx.completions) {
    total += c.xp;
    if (total >= target) return { current: target, target, unlockedAt: c.at };
  }
  return { current: Math.min(total, target), target, unlockedAt: null };
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'first_steps', title: 'Primeros pasos', description: 'Resolvé tu primer ejercicio.', iconName: 'flag', color: '#2563eb', bgColor: '#dbe1ff',
    evaluate: (c) => byCount(c.completions.map((x) => x.at), 1) },
  { id: 'exercises_10', title: 'En marcha', description: 'Resolvé 10 ejercicios.', iconName: 'directions_run', color: '#0891b2', bgColor: '#cffafe',
    evaluate: (c) => byCount(c.completions.map((x) => x.at), 10) },
  { id: 'exercises_25', title: 'Constancia', description: 'Resolvé 25 ejercicios.', iconName: 'trending_up', color: '#059669', bgColor: '#d1fae5',
    evaluate: (c) => byCount(c.completions.map((x) => x.at), 25) },
  { id: 'exercises_50', title: 'Imparable', description: 'Resolvé 50 ejercicios.', iconName: 'bolt', color: '#d97706', bgColor: '#ffedd5',
    evaluate: (c) => byCount(c.completions.map((x) => x.at), 50) },
  { id: 'exercises_100', title: 'Leyenda del código', description: 'Resolvé 100 ejercicios.', iconName: 'military_tech', color: '#9333ea', bgColor: '#f3e8ff',
    evaluate: (c) => byCount(c.completions.map((x) => x.at), 100) },
  { id: 'streak_3', title: 'Racha de 3 días', description: 'Practicá 3 días seguidos.', iconName: 'local_fire_department', color: '#ea580c', bgColor: '#ffedd5',
    evaluate: streakBadge(3) },
  { id: 'streak_7', title: 'Racha 7 Días', description: 'Practicá 7 días seguidos.', iconName: 'whatshot', color: '#dc2626', bgColor: '#fee2e2',
    evaluate: streakBadge(7) },
  { id: 'streak_14', title: 'Racha de fuego', description: 'Practicá 14 días seguidos.', iconName: 'local_fire_department', color: '#be123c', bgColor: '#ffe4e6',
    evaluate: streakBadge(14) },
  { id: 'first_try', title: 'Puntería', description: 'Resolvé 5 ejercicios al primer intento.', iconName: 'target', color: '#0d9488', bgColor: '#ccfbf1',
    evaluate: (c) => byCount(c.completions.filter((x) => x.attempts === 1).map((x) => x.at), 5) },
  { id: 'bug_hunter', title: 'Cazador de Bugs', description: 'Resolvé 3 ejercicios después de equivocarte al menos 2 veces: ¡no te rendís!', iconName: 'bug_report', color: '#00714d', bgColor: '#dcfce7',
    evaluate: (c) => byCount(c.completions.filter((x) => x.attempts >= 3).map((x) => x.at), 3) },
  { id: 'unit_done', title: 'Unidad completa', description: 'Terminá todos los ejercicios de una unidad.', iconName: 'task_alt', color: '#4f46e5', bgColor: '#e0e7ff',
    evaluate: (c) => byCount(c.unitDoneAt, 1) },
  { id: 'units_3', title: 'Gran avance', description: 'Completá 3 unidades.', iconName: 'layers', color: '#7c3aed', bgColor: '#ede9fe',
    evaluate: (c) => byCount(c.unitDoneAt, 3) },
  { id: 'course_done', title: 'Curso completado', description: 'Terminá todos los ejercicios de un curso.', iconName: 'workspace_premium', color: '#ca8a04', bgColor: '#fef9c3',
    evaluate: (c) => byCount(c.courseDoneAt, 1) },
  { id: 'xp_500', title: 'Coleccionista', description: 'Juntá 500 XP.', iconName: 'stars', color: '#d97706', bgColor: '#fef3c7',
    evaluate: xpBadge(500) },
  { id: 'xp_1000', title: 'Mil XP', description: 'Juntá 1000 XP.', iconName: 'diamond', color: '#0284c7', bgColor: '#e0f2fe',
    evaluate: xpBadge(1000) },
  { id: 'python_10', title: 'Pythonista', description: 'Resolvé 10 ejercicios de Python.', iconName: 'code', color: '#16a34a', bgColor: '#dcfce7',
    evaluate: languageBadge('python', 10) },
  { id: 'javascript_10', title: 'JavaScript Ninja', description: 'Resolvé 10 ejercicios de JavaScript.', iconName: 'javascript', color: '#ca8a04', bgColor: '#fef9c3',
    evaluate: languageBadge('javascript', 10) },
  { id: 'sql_10', title: 'Maestro SQL', description: 'Resolvé 10 consultas SQL.', iconName: 'database', color: '#2563eb', bgColor: '#dbeafe',
    evaluate: languageBadge('sql', 10) },
  { id: 'html_10', title: 'Mago del HTML', description: 'Resolvé 10 ejercicios de HTML y CSS.', iconName: 'html', color: '#ea580c', bgColor: '#ffedd5',
    evaluate: languageBadge('html', 10) },
];

// ─── Resultado ──────────────────────────────────────────────────────────────
export interface GamificationBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  bgColor: string;
  unlocked: boolean;
  unlockedAt: string | null;
  current: number;
  target: number;
}

export interface Gamification {
  level: number;
  levelTitle: string;
  totalXp: number;
  levelStartXp: number;
  nextLevelXp: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  percentToNextLevel: number;
  streakDays: number;
  bestStreakDays: number;
  badges: GamificationBadge[];
  badgesUnlocked: number;
  badgesTotal: number;
}

export async function getGamification(userId: string, now: Date = new Date()): Promise<Gamification> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { totalXp: true, streakDays: true, lastActivityAt: true } });
  if (!user) throw new Error('User not found');

  const progress = await prisma.exerciseProgress.findMany({
    where: { userId, completed: true, completedAt: { not: null } },
    select: { exerciseId: true, unitId: true, courseId: true, attempts: true, xpEarned: true, completedAt: true },
    orderBy: { completedAt: 'asc' },
  });
  const exercises = progress.length
    ? await prisma.exercise.findMany({ where: { id: { in: progress.map((p) => p.exerciseId) } }, select: { id: true, language: true } })
    : [];
  const languageOf = new Map(exercises.map((e) => [e.id, e.language]));

  const completions: Completion[] = progress.map((p) => ({
    at: p.completedAt as Date,
    attempts: p.attempts,
    xp: p.xpEarned,
    language: languageOf.get(p.exerciseId) ?? 'python',
    unitId: p.unitId,
    courseId: p.courseId,
  }));

  // Unidades y cursos terminados enteros.
  const unitIds = [...new Set(completions.map((c) => c.unitId).filter((id): id is string => !!id))];
  const courseIds = [...new Set(completions.map((c) => c.courseId).filter((id): id is string => !!id))];
  const [units, courses] = await Promise.all([
    unitIds.length ? prisma.unit.findMany({ where: { id: { in: unitIds } }, select: { id: true, _count: { select: { exercises: true } } } }) : [],
    courseIds.length
      ? prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, units: { select: { _count: { select: { exercises: true } } } } } })
      : [],
  ]);
  const doneAtOf = (match: (c: Completion) => boolean, total: number): Date | null => {
    const list = completions.filter(match);
    return total > 0 && list.length >= total ? list[list.length - 1].at : null;
  };
  const unitDoneAt = units
    .map((u) => doneAtOf((c) => c.unitId === u.id, u._count.exercises))
    .filter((d): d is Date => !!d)
    .sort((a, b) => a.getTime() - b.getTime());
  const courseDoneAt = courses
    .map((c) => doneAtOf((x) => x.courseId === c.id, c.units.reduce((n, u) => n + u._count.exercises, 0)))
    .filter((d): d is Date => !!d)
    .sort((a, b) => a.getTime() - b.getTime());

  // Dias con actividad (para las rachas).
  const attempts = await prisma.exerciseAttempt.findMany({ where: { userId }, select: { createdAt: true } });
  const dayKeys = new Set(attempts.map((a) => dateKeyInArgentina(a.createdAt)));
  // Sin historial de intentos (datos viejos), los dias de los ejercicios completados.
  if (dayKeys.size === 0) for (const c of completions) dayKeys.add(dateKeyInArgentina(c.at));
  const activeDays = [...dayKeys].sort();

  const ctx: Context = { completions, activeDays, unitDoneAt, courseDoneAt };
  const disabled = new Set((await getGamificationSettings()).disabledBadges);
  const badges: GamificationBadge[] = BADGE_DEFINITIONS.filter((def) => !disabled.has(def.id)).map((def) => {
    const result = def.evaluate(ctx);
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      iconName: def.iconName,
      color: def.color,
      bgColor: def.bgColor,
      unlocked: result.unlockedAt !== null,
      unlockedAt: result.unlockedAt ? result.unlockedAt.toISOString() : null,
      current: result.current,
      target: result.target,
    };
  });

  const level = levelForXp(user.totalXp);
  const levelStartXp = xpToReachLevel(level);
  const nextLevelXp = xpToReachLevel(level + 1);
  const xpIntoLevel = user.totalXp - levelStartXp;
  return {
    level,
    levelTitle: titleForLevel(level),
    totalXp: user.totalXp,
    levelStartXp,
    nextLevelXp,
    xpIntoLevel,
    xpToNextLevel: nextLevelXp - user.totalXp,
    percentToNextLevel: Math.round((xpIntoLevel / (nextLevelXp - levelStartXp)) * 100),
    streakDays: user.streakDays,
    bestStreakDays: Math.max(streakRuns(activeDays).best, user.streakDays),
    badges,
    badgesUnlocked: badges.filter((b) => b.unlocked).length,
    badgesTotal: badges.length,
  };
}

/** Que cambio entre dos fotos de gamificacion (para celebrar en pantalla). */
export function gamificationDelta(before: Gamification, after: Gamification) {
  const had = new Set(before.badges.filter((b) => b.unlocked).map((b) => b.id));
  return {
    leveledUp: after.level > before.level,
    level: after.level,
    levelTitle: after.levelTitle,
    newBadges: after.badges.filter((b) => b.unlocked && !had.has(b.id)),
    percentToNextLevel: after.percentToNextLevel,
    xpToNextLevel: after.xpToNextLevel,
  };
}
