import { ReportsData } from '../types';

// Period filter of the reports ("7 días", "30 días", "Semestre", "Año").
// Report data is built for the last 30 days; the other periods are derived
// from it so every figure stays coherent: what accumulates over time
// (exercises, practice, lines of code, errors, XP) scales with the period,
// and what describes the current state (progress, completion per course,
// error distribution in %) does not change.
export type ReportPeriod = '7d' | '30d' | 'semester' | 'year';

export const REPORT_PERIODS: { id: ReportPeriod; label: string }[] = [
  { id: '7d', label: '7 días' },
  { id: '30d', label: '30 días' },
  { id: 'semester', label: 'Semestre' },
  { id: 'year', label: 'Año' },
];

// Activity of the period relative to the last 30 days.
const SCALE: Record<ReportPeriod, number> = { '7d': 0.24, '30d': 1, semester: 4.6, year: 8.2 };
// Students active in the period relative to the last 30 days.
const ACTIVE_SCALE: Record<ReportPeriod, number> = { '7d': 0.82, '30d': 1, semester: 1, year: 1 };

export const TREND_LABELS: Record<ReportPeriod, string[]> = {
  '7d': ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Hoy'],
  '30d': ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana Actual'],
  semester: ['Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'],
  year: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'],
};

export const TREND_DESCRIPTIONS: Record<ReportPeriod, string> = {
  '7d': 'Experiencia ganada por día en los últimos 7 días',
  '30d': 'Experiencia ganada por semana en los últimos 30 días',
  semester: 'Experiencia ganada por mes en el último semestre',
  year: 'Experiencia ganada por mes en el último año',
};

// Share of the week's XP earned each day (Mon..today), and growth curves (oldest → newest).
const DAY_SHARES = [0.12, 0.16, 0.13, 0.17, 0.15, 0.1, 0.17];
const SEMESTER_CURVE = [0.38, 0.5, 0.58, 0.72, 0.86, 1];
const YEAR_CURVE = [0.18, 0.24, 0.2, 0.12, 0.16, 0.3, 0.42, 0.5, 0.58, 0.72, 0.86, 1];

function parseMinutes(text: string) {
  const hours = Number(/(\d+)\s*h/.exec(text)?.[1] ?? 0);
  const minutes = Number(/(\d+)\s*m/.exec(text)?.[1] ?? 0);
  return hours * 60 + minutes;
}

function formatMinutes(total: number) {
  if (total < 60) return `${total}m`;
  const hours = Math.floor(total / 60);
  return total % 60 ? `${hours}h ${total % 60}m` : `${hours}h`;
}

function trendFor(weeklyXp: number[], period: ReportPeriod): number[] {
  if (period === '30d') return weeklyXp;
  const currentWeek = weeklyXp[weeklyXp.length - 1] ?? 0;
  if (period === '7d') return DAY_SHARES.map((share) => Math.round(currentWeek * share));
  // Current month ≈ the XP of the last 4 weeks; earlier months follow the growth curve.
  const currentMonth = weeklyXp.slice(-4).reduce((sum, xp) => sum + xp, 0);
  const curve = period === 'semester' ? SEMESTER_CURVE : YEAR_CURVE;
  return curve.map((factor) => Math.round(currentMonth * factor));
}

export function reportForPeriod(data: ReportsData, period: ReportPeriod): ReportsData {
  if (period === '30d') return data;
  const scale = SCALE[period];
  const scaled = (value: number) => Math.round(value * scale);
  const totalErrors = scaled(data.totalErrors);
  return {
    ...data,
    exercisesSolved: scaled(data.exercisesSolved),
    linesOfCode: scaled(data.linesOfCode),
    practiceTime: formatMinutes(scaled(parseMinutes(data.practiceTime))),
    totalErrors,
    activeStudents: data.activeStudents === undefined ? undefined : Math.round(data.activeStudents * ACTIVE_SCALE[period]),
    difficulties: data.difficulties?.map((d) => ({ ...d, errors: scaled(d.errors) })),
    xpTrend: data.xpTrend && { weeklyXp: trendFor(data.xpTrend.weeklyXp, period) },
  };
}
