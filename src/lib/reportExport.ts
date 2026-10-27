// Exportacion de los reportes ("Progreso" / "Reporte") a archivos que se descargan:
// PDF (informe listo para imprimir o compartir) y CSV (para abrir en Excel o Google Sheets).
// Los dos salen del MISMO modelo, que refleja exactamente lo que se ve en pantalla
// (incluido el periodo elegido: 7 dias, 30 dias, semestre o año).
import { ReportsData } from '../types';

export type ExportFormat = 'pdf' | 'csv';

export interface ReportModel {
  title: string;
  subtitle: string;
  periodLabel: string;
  generatedAt: Date;
  kpis: { label: string; value: string }[];
  performanceTitle: string;
  performance: { label: string; percent: number }[];
  /** null cuando el reporte no tiene ese bloque (el del alumno usa "errores comunes"). */
  difficulties: { topic: string; errors: number }[] | null;
  errorsTotal: number;
  errors: { label: string; percent: number }[];
  xpDescription: string;
  xpTrend: { label: string; xp: number }[];
}

export interface BuildModelInput {
  data: ReportsData;
  title: string;
  subtitle: string;
  periodLabel: string;
  /** Admin / docente: indicadores educativos. Alumno: racha, tiempo de practica y lineas de codigo. */
  educational: boolean;
  /** "unidades" (reporte de un curso) o "cursos". */
  performanceTitle: string;
  xpDescription: string;
  trendLabels: string[];
}

const number = (n: number) => n.toLocaleString('es-AR');

export function buildReportModel(input: BuildModelInput): ReportModel {
  const { data } = input;
  const kpis = input.educational
    ? [
        { label: 'Alumnos activos', value: `${data.activeStudents ?? 0}${data.studentsCount !== undefined ? ` de ${data.studentsCount}` : ''}` },
        { label: 'Progreso promedio', value: `${data.averageProgress ?? 0}%` },
        { label: 'Ejercicios resueltos', value: number(data.exercisesSolved) },
        { label: 'Actividades', value: number(data.activitiesCount ?? 0) },
      ]
    : [
        { label: 'Racha promedio', value: `${data.averageStreakDays} días` },
        { label: 'Ejercicios resueltos', value: number(data.exercisesSolved) },
        { label: 'Tiempo de práctica', value: data.practiceTime },
        { label: 'Líneas de código', value: number(data.linesOfCode) },
      ];

  const weekly = data.xpTrend?.weeklyXp ?? [];
  return {
    title: input.title,
    subtitle: input.subtitle,
    periodLabel: input.periodLabel,
    generatedAt: new Date(),
    kpis,
    performanceTitle: input.performanceTitle,
    performance: data.coursePerformance.map((c) => ({ label: c.label, percent: c.percent })),
    difficulties: input.educational ? data.difficulties ?? [] : null,
    errorsTotal: data.totalErrors,
    errors: data.errorBreakdown.map((e) => ({ label: e.label, percent: e.percent })),
    xpDescription: input.xpDescription,
    xpTrend: weekly.map((xp, i) => ({ label: input.trendLabels[i] ?? `Punto ${i + 1}`, xp })),
  };
}

/** Nombre del archivo: reporte-<titulo>-<periodo>-<fecha>.<ext>, sin acentos ni simbolos. */
export function reportFileName(model: ReportModel, format: ExportFormat): string {
  const slug = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const date = model.generatedAt.toISOString().slice(0, 10);
  const name = slug(model.title).replace(/^reportes?-/, '');
  return `reporte-${name}-${slug(model.periodLabel)}-${date}.${format}`;
}

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const stamp = (date: Date) => date.toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' });

// ─── CSV ────────────────────────────────────────────────────────────────────
// Una sola tabla "Sección;Indicador;Valor" (separador ";" y BOM UTF-8: asi Excel en español la
// abre bien, con acentos, y tambien se importa en Google Sheets).
export function reportToCsv(model: ReportModel): string {
  const cell = (value: string | number) => {
    const text = String(value);
    return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const rows: (string | number)[][] = [['Sección', 'Indicador', 'Valor']];
  rows.push(['Reporte', 'Título', model.title]);
  rows.push(['Reporte', 'Detalle', model.subtitle]);
  rows.push(['Reporte', 'Período', model.periodLabel]);
  rows.push(['Reporte', 'Generado', stamp(model.generatedAt)]);
  for (const k of model.kpis) rows.push(['Resumen', k.label, k.value]);
  for (const p of model.performance) rows.push([`Rendimiento por ${model.performanceTitle}`, p.label, `${p.percent}%`]);
  if (model.difficulties) for (const d of model.difficulties) rows.push(['Dificultades frecuentes', d.topic, `${d.errors} errores`]);
  rows.push(['Errores comunes', 'Total de errores', model.errorsTotal]);
  for (const e of model.errors) rows.push(['Errores comunes', e.label, `${e.percent}%`]);
  for (const x of model.xpTrend) rows.push(['XP obtenida', x.label, x.xp]);
  return `﻿${rows.map((r) => r.map(cell).join(';')).join('\r\n')}\r\n`;
}

// ─── PDF ────────────────────────────────────────────────────────────────────
// Las fuentes estandar de PDF cubren el castellano (acentos, ñ, ¿ ¡); lo demas se reemplaza.
const pdfText = (text: string) => text.replace(/[→←↑↓•]/g, '-').replace(/[^\x20-\x7EÀ-ÿ¿¡—–…°]/g, '');

export async function reportToPdf(model: ReportModel): Promise<Blob> {
  const { jsPDF } = await import('jspdf'); // se carga solo al exportar (no pesa en el resto de la app)
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const page = { width: 210, height: 297, margin: 16 };
  const contentWidth = page.width - page.margin * 2;
  let y = page.margin;

  const ensure = (needed: number) => {
    if (y + needed > page.height - page.margin) {
      doc.addPage();
      y = page.margin;
    }
  };
  const text = (value: string, x: number, size: number, style: 'normal' | 'bold', color: [number, number, number] = [11, 28, 48]) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(pdfText(value), x, y);
  };
  const heading = (value: string) => {
    ensure(14);
    y += 4;
    text(value, page.margin, 12.5, 'bold');
    y += 2;
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.6);
    doc.line(page.margin, y, page.margin + 18, y);
    y += 6;
  };
  const empty = (value: string) => {
    ensure(8);
    text(value, page.margin, 9.5, 'normal', [115, 118, 134]);
    y += 6;
  };

  // Encabezado
  doc.setFillColor(11, 28, 48);
  doc.rect(0, 0, page.width, 34, 'F');
  y = 14;
  text('CODIX', page.margin, 10, 'bold', [147, 197, 253]);
  y = 22;
  text(model.title, page.margin, 17, 'bold', [255, 255, 255]);
  y = 29;
  const subtitleLines = doc.splitTextToSize(pdfText(model.subtitle), contentWidth) as string[];
  text(subtitleLines[0] ?? '', page.margin, 9.5, 'normal', [203, 213, 225]);
  y = 43;
  text(`Período: ${model.periodLabel}`, page.margin, 9.5, 'bold', [67, 70, 85]);
  text(`Generado: ${stamp(model.generatedAt)}`, page.width - page.margin - doc.getTextWidth(pdfText(`Generado: ${stamp(model.generatedAt)}`)), 9.5, 'normal', [115, 118, 134]);
  y += 4;

  // Resumen: tarjetas de 2 columnas
  heading('Resumen');
  const cardWidth = (contentWidth - 6) / 2;
  model.kpis.forEach((k, i) => {
    if (i % 2 === 0) ensure(20);
    const x = page.margin + (i % 2) * (cardWidth + 6);
    doc.setFillColor(239, 244, 255);
    doc.setDrawColor(219, 225, 255);
    doc.roundedRect(x, y - 4, cardWidth, 16, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(115, 118, 134);
    doc.text(pdfText(k.label.toUpperCase()), x + 4, y + 1);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(11, 28, 48);
    doc.text(pdfText(k.value), x + 4, y + 9);
    if (i % 2 === 1 || i === model.kpis.length - 1) y += 20;
  });

  // Rendimiento (barras)
  heading(`Rendimiento por ${model.performanceTitle}`);
  if (model.performance.length === 0) empty('Todavía no hay datos de progreso.');
  for (const p of model.performance) {
    ensure(10);
    text(p.label, page.margin, 9.5, 'normal');
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(page.margin + 78, y - 3.4, 80, 4, 2, 2, 'F');
    doc.setFillColor(16, 185, 129);
    if (p.percent > 0) doc.roundedRect(page.margin + 78, y - 3.4, Math.max(2, (80 * Math.min(100, p.percent)) / 100), 4, 2, 2, 'F');
    text(`${p.percent}%`, page.margin + contentWidth - doc.getTextWidth(`${p.percent}%`), 9.5, 'bold');
    y += 8;
  }

  // Dificultades frecuentes
  if (model.difficulties) {
    heading('Dificultades frecuentes');
    if (model.difficulties.length === 0) empty('Todavía no hay dificultades registradas.');
    for (const d of model.difficulties) {
      ensure(8);
      text(d.topic, page.margin, 9.5, 'normal');
      const label = `${d.errors} errores`;
      text(label, page.margin + contentWidth - doc.getTextWidth(pdfText(label)), 9.5, 'bold', [220, 38, 38]);
      y += 7;
    }
  }

  // Errores comunes
  heading(`Errores comunes (${model.errorsTotal} en total)`);
  if (model.errors.length === 0) empty('No hay errores registrados.');
  for (const e of model.errors) {
    ensure(8);
    text(e.label, page.margin, 9.5, 'normal');
    text(`${e.percent}%`, page.margin + contentWidth - doc.getTextWidth(`${e.percent}%`), 9.5, 'bold');
    y += 7;
  }

  // Tendencia de XP (barras verticales)
  ensure(70); // titulo y grafico quedan en la misma pagina
  heading('Tendencia de XP');
  text(model.xpDescription, page.margin, 8.5, 'normal', [115, 118, 134]);
  y += 5;
  if (model.xpTrend.length === 0) {
    empty('Todavía no hay datos de progreso.');
  } else {
    const chartHeight = 42;
    ensure(chartHeight + 16);
    const max = Math.max(...model.xpTrend.map((x) => x.xp), 1);
    const slot = contentWidth / model.xpTrend.length;
    const barWidth = Math.min(16, slot * 0.6);
    const baseline = y + chartHeight;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(page.margin, baseline, page.margin + contentWidth, baseline);
    model.xpTrend.forEach((point, i) => {
      const height = (point.xp / max) * (chartHeight - 8);
      const x = page.margin + slot * i + (slot - barWidth) / 2;
      doc.setFillColor(5, 150, 105);
      if (height > 0) doc.roundedRect(x, baseline - height, barWidth, height, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(11, 28, 48);
      const value = number(point.xp);
      doc.text(value, x + barWidth / 2 - doc.getTextWidth(value) / 2, baseline - height - 1.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(115, 118, 134);
      const label = pdfText(point.label);
      doc.text(label, x + barWidth / 2 - doc.getTextWidth(label) / 2, baseline + 4.5);
    });
    y = baseline + 10;
  }

  // Pie de pagina con numeracion
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`CODIX · ${pdfText(model.title)}`, page.margin, page.height - 8);
    const label = `Página ${i} de ${pages}`;
    doc.text(label, page.width - page.margin - doc.getTextWidth(label), page.height - 8);
  }
  return doc.output('blob');
}

/** Genera el archivo en el formato elegido y lo descarga. Devuelve el nombre del archivo. */
export async function exportReport(model: ReportModel, format: ExportFormat): Promise<string> {
  const fileName = reportFileName(model, format);
  if (format === 'csv') {
    download(new Blob([reportToCsv(model)], { type: 'text/csv;charset=utf-8' }), fileName);
  } else {
    download(await reportToPdf(model), fileName);
  }
  return fileName;
}
