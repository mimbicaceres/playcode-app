// Formatos de tiempo para las pantallas de progreso y actividad.

/** 45 -> "45m", 65 -> "1h 5m", 120 -> "2h". */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return minutes % 60 ? `${hours}h ${minutes % 60}m` : `${hours}h`;
}

const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Hoy 18:30", "Ayer 09:05" o "22/10 14:00": cuando paso algo, en el huso del navegador. */
export function formatWhen(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (days <= 0) return `Hoy ${hhmm(date)}`;
  if (days === 1) return `Ayer ${hhmm(date)}`;
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${hhmm(date)}`;
}

/** "Hace 10 min", "Hace 3 h", "Ayer", "Hace 4 días", "Hace 2 semanas". */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.round((startOfDay(now) - startOfDay(new Date(iso))) / 86_400_000);
  if (days <= 1) return 'Ayer';
  if (days < 14) return `Hace ${days} días`;
  return `Hace ${Math.round(days / 7)} semanas`;
}
