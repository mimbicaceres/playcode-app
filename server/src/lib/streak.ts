// Calculo de racha con huso horario de Argentina (America/Argentina/Buenos_Aires,
// UTC-3 sin horario de verano). La racha se basa en `lastActivityAt` (ultimo
// intento de ejercicio, exito o no), nunca en `updatedAt` del usuario (que
// cambia con cualquier edicion de perfil y no refleja actividad real).

const AR_TIMEZONE = 'America/Argentina/Buenos_Aires';

// Clave de fecha (YYYY-MM-DD) de un instante, en el huso de Argentina.
function dateKeyInArgentina(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: AR_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(date);
}

// Diferencia en dias calendario (huso Argentina) entre dos instantes.
function daysBetweenInArgentina(earlier: Date, later: Date): number {
  const earlierKey = dateKeyInArgentina(earlier);
  const laterKey = dateKeyInArgentina(later);
  const earlierUtc = Date.parse(`${earlierKey}T00:00:00Z`);
  const laterUtc = Date.parse(`${laterKey}T00:00:00Z`);
  return Math.round((laterUtc - earlierUtc) / (24 * 60 * 60 * 1000));
}

// Se llama cuando el alumno hace una actividad AHORA: devuelve la nueva racha
// a guardar. Mismo dia (huso AR) que la ultima actividad -> no cambia.
// Dia consecutivo -> +1. Si paso mas de un dia -> se reinicia en 1.
export function nextStreakOnActivity(previousStreak: number, lastActivityAt: Date | null, now: Date = new Date()): number {
  if (!lastActivityAt) return 1;
  const gap = daysBetweenInArgentina(lastActivityAt, now);
  if (gap <= 0) return previousStreak || 1; // misma actividad del dia (o reloj desincronizado)
  if (gap === 1) return previousStreak + 1;
  return 1;
}

// Racha a MOSTRAR en este momento (sin escribir nada en la base): si paso
// mas de un dia completo desde la ultima actividad, la racha ya se perdio
// aunque todavia no haya una nueva actividad que la reinicie en la DB.
export function effectiveStreak(streakDays: number, lastActivityAt: Date | null, now: Date = new Date()): number {
  if (!lastActivityAt) return 0;
  const gap = daysBetweenInArgentina(lastActivityAt, now);
  return gap > 1 ? 0 : streakDays;
}
