import { prisma } from './prisma';

// Ajustes de gamificacion que configura el admin (tabla Institute, un solo
// registro). Sin registro (base nueva) valen los valores por defecto: el XP del
// ejercicio tal cual, sin bonus y con todos los logros activos.
export interface GamificationSettings {
  xpMultiplier: number;
  baseXp: number;
  streakBonusXp: number;
  disabledBadges: string[];
}

export const DEFAULT_GAMIFICATION_SETTINGS: GamificationSettings = {
  xpMultiplier: 1,
  baseXp: 0,
  streakBonusXp: 0,
  disabledBadges: [],
};

export async function getGamificationSettings(): Promise<GamificationSettings> {
  const row = await prisma.institute.findUnique({
    where: { id: 'singleton' },
    select: { xpMultiplier: true, baseXp: true, streakBonusXp: true, disabledBadges: true },
  });
  return row ?? DEFAULT_GAMIFICATION_SETTINGS;
}

/** XP que se otorga por resolver un ejercicio: (XP del ejercicio + base) x multiplicador. */
export function xpForExercise(rewardXp: number, settings: GamificationSettings): number {
  return Math.max(0, Math.round((rewardXp + settings.baseXp) * settings.xpMultiplier));
}
