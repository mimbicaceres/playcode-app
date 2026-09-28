import React, { useState } from 'react';
import { ReportsData } from '../types';
import { StatusHud } from './ui/StatusHud';
import { XpTrendChart } from './ui/XpTrendChart';
import { REPORT_PERIODS, ReportPeriod, TREND_DESCRIPTIONS, TREND_LABELS, reportForPeriod } from '../data/reportPeriods';

interface ReportsAnalyticsViewProps {
  // Demo mode passes DEMO_REPORTS from mockData; real users pass their own data.
  data: ReportsData;
  // 'general': admin report over the whole institute.
  // 'teacher': teacher report over all their assigned courses (no course selected).
  // 'course': teacher report of the selected course only.
  // Omitted: the original report (demo and student progress).
  scope?: 'general' | 'teacher' | 'course';
  // scope 'course' only: name of the selected course.
  courseName?: string;
}

const NO_PROGRESS_MESSAGE = 'Todavía no hay datos de progreso.';

const HEADERS = {
  default: {
    badge: 'Analítica & Métricas',
    title: 'Reportes & Rendimiento Académico',
    subtitle: 'Consolidado de avance curricular, diagnóstico de errores y horas de práctica',
  },
  general: {
    badge: 'Reporte General',
    title: 'Reportes & Rendimiento General',
    subtitle: 'Consolidado del progreso de alumnos, cursos y actividades del instituto',
  },
  teacher: {
    badge: 'Reporte General',
    title: 'Reportes & Rendimiento de mis Cursos',
    subtitle: 'Consolidado de todos los cursos que tenés asignados',
  },
  course: {
    badge: 'Reporte del Curso',
    title: 'Reporte & Rendimiento',
    subtitle: 'Avance, dificultades y actividad de los alumnos del curso',
  },
};

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  data: baseData,
  scope,
  courseName,
}) => {
  const header = HEADERS[scope ?? 'default'];
  // Admin and teacher reports use educational indicators;
  // the default report (demo and student) keeps its original cards.
  const isEducational = scope === 'general' || scope === 'teacher' || scope === 'course';
  const [timeRange, setTimeRange] = useState<ReportPeriod>('30d');
  const [copiedNotification, setCopiedNotification] = useState(false);
  // Figures of the selected period (the report data covers the last 30 days).
  const data = reportForPeriod(baseData, timeRange);

  const hasData = data.coursePerformance.length > 0 || data.totalErrors > 0 || !!data.xpTrend;

  const handleExport = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const timeRanges = REPORT_PERIODS;

  // Donut slices from the error breakdown; an empty neutral ring when there are no errors.
  let accumulated = 0;
  const donutBackground = data.errorBreakdown.length > 0
    ? `conic-gradient(${data.errorBreakdown
        .map((slice) => {
          const start = accumulated;
          accumulated += slice.percent;
          return `${slice.color} ${start}% ${accumulated}%`;
        })
        .join(', ')})`
    : '#e2e8f0';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-5 md:py-6 pb-32 flex flex-col gap-6">

      {/* Top Status HUD in compact mode */}
      <StatusHud
        compact={true}
        avatarIcon="analytics"
        badgeText={header.badge}
        title={header.title}
        subtitle={scope === 'course' && courseName ? courseName : header.subtitle}
      >

        {/* Time range pill selector */}
        <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                timeRange === range.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleExport}
          disabled={!hasData}
          title={hasData ? undefined : NO_PROGRESS_MESSAGE}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          <span className="material-symbols-outlined text-[17px]">download</span>
          <span>Exportar PDF/CSV</span>
        </button>
      </StatusHud>

      {copiedNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
          <span>Informe analítico exportado y descargado exitosamente.</span>
        </div>
      )}

      {!hasData && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-blue-600">info</span>
          <span>
            {NO_PROGRESS_MESSAGE}{' '}
            {scope === 'general'
              ? 'Cuando los alumnos del instituto tengan actividad, vas a ver acá el rendimiento general.'
              : scope === 'teacher'
              ? 'Cuando tengas cursos asignados con alumnos, vas a ver acá el rendimiento de tus cursos.'
              : scope === 'course'
              ? 'Cuando los alumnos de este curso tengan actividad, vas a ver acá su rendimiento.'
              : 'Cuando empieces a resolver ejercicios, vas a ver acá tu progreso.'}
          </span>
        </div>
      )}

      {/* Summary KPI Cards Row */}
      {isEducational ? (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: 'groups', box: 'bg-blue-50 text-blue-700 border-blue-100', label: 'Alumnos Activos', value: `${data.activeStudents ?? 0}`,
              hint: data.studentsCount !== undefined ? `de ${data.studentsCount} ${data.studentsCount === 1 ? 'alumno' : 'alumnos'}` : undefined,
            },
            { icon: 'insights', box: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: scope === 'course' ? 'Progreso del Curso' : 'Progreso Promedio', value: `${data.averageProgress ?? 0}%` },
            { icon: 'task_alt', box: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Ejercicios Resueltos', value: data.exercisesSolved.toLocaleString('en-US') },
            { icon: 'assignment', box: 'bg-indigo-50 text-indigo-700 border-indigo-100', label: 'Actividades', value: `${data.activitiesCount ?? 0}` },
          ].map((kpi: { icon: string; box: string; label: string; value: string; hint?: string }) => (
            <div key={kpi.label} className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${kpi.box}`}>
                <span className="material-symbols-outlined text-2xl">{kpi.icon}</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                <p className="font-sans font-bold text-xl text-[#0b1c30]">
                  {kpi.value}
                  {kpi.hint && <span className="ml-1.5 text-xs font-medium text-slate-500">{kpi.hint}</span>}
                </p>
              </div>
            </div>
          ))}
        </section>
      ) : (
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <span className="material-symbols-outlined text-2xl">local_fire_department</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Racha Promedio</p>
            <p className="font-sans font-bold text-xl text-[#0b1c30]">{data.averageStreakDays} Días</p>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <span className="material-symbols-outlined text-2xl">task_alt</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ejercicios Resueltos</p>
            <p className="font-sans font-bold text-xl text-[#0b1c30]">{data.exercisesSolved.toLocaleString('en-US')}</p>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <span className="material-symbols-outlined text-2xl">timer</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tiempo de Práctica</p>
            <p className="font-sans font-bold text-xl text-[#0b1c30]">{data.practiceTime}</p>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
            <span className="material-symbols-outlined text-2xl">code</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Líneas de Código</p>
            <p className="font-sans font-bold text-xl text-[#0b1c30]">{data.linesOfCode.toLocaleString('en-US')}</p>
          </div>
        </div>
      </section>
      )}

      {/* Bento Grid Layout for Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Card 1: Reporte de Rendimiento por Curso (Bar Chart area - 8 cols) */}
        <div className="bg-white border border-[#e2e8f0] shadow-xs rounded-2xl p-5 md:p-6 flex flex-col col-span-1 md:col-span-8 min-h-[360px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-heading font-bold text-lg text-[#0b1c30]">
                {scope === 'course' ? 'Rendimiento por Unidad' : 'Rendimiento por Curso'}
              </h2>
              <p className="text-xs text-slate-500">
                {scope === 'course' ? 'Porcentaje medio de finalización por unidad del curso' : 'Porcentaje medio de finalización por materia'}
              </p>
            </div>
            <span className="font-mono text-xs text-slate-400">
              Total: {data.coursePerformance.length} {scope === 'course' ? 'unidades' : 'cursos'}
            </span>
          </div>

          {/* Bar Chart Canvas */}
          <div className="flex-grow flex items-end justify-between gap-3 relative pt-6 pb-2">
            {/* Y Axis Labels (Inter/Mono font for data precision) */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-400 font-mono pointer-events-none">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* Grid Lines */}
            <div className="absolute inset-x-8 top-0 border-b border-slate-100" />
            <div className="absolute inset-x-8 top-[25%] border-b border-slate-100" />
            <div className="absolute inset-x-8 top-[50%] border-b border-slate-100" />
            <div className="absolute inset-x-8 top-[75%] border-b border-slate-100" />
            <div className="absolute inset-x-8 bottom-6 border-b border-slate-200" />

            {/* Bars container */}
            <div className="ml-10 w-full flex items-end justify-around gap-2 h-[200px]">
              {data.coursePerformance.length === 0 && (
                <div className="self-center text-center">
                  <span className="material-symbols-outlined text-3xl text-slate-300 block mb-1">bar_chart</span>
                  <p className="text-sm font-semibold text-slate-500">{NO_PROGRESS_MESSAGE}</p>
                </div>
              )}
              {data.coursePerformance.map((bar) => (
                <div key={bar.label} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                  <div className={`w-full max-w-[40px] ${bar.barClass} rounded-t-lg transition-all relative`} style={{ height: `${bar.percent}%` }}>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[10px] font-bold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                      {bar.percent}%
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 mt-2 truncate w-full text-center">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Dificultades frecuentes (admin/teacher reports) / Errores Comunes (Donut Chart area - 4 cols) */}
        {isEducational ? (
        <div className="bg-white border border-[#e2e8f0] shadow-xs rounded-2xl p-5 md:p-6 flex flex-col col-span-1 md:col-span-4 min-h-[360px]">
          <h2 className="font-heading font-bold text-lg text-[#0b1c30] mb-1">
            Dificultades Frecuentes
          </h2>
          <p className="text-xs text-slate-500 mb-4">Contenidos que generan más errores en los alumnos</p>

          {(data.difficulties ?? []).length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-3xl text-slate-300 block mb-1">psychology_alt</span>
              <p className="text-xs text-slate-400">Todavía no hay dificultades registradas.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {(data.difficulties ?? []).map((item) => (
                <div key={item.topic} className="flex items-center justify-between py-2.5 text-xs">
                  <span className="text-slate-700 font-medium">{item.topic}</span>
                  <span className="font-mono font-bold text-red-600">{item.errors} errores</span>
                </div>
              ))}
            </div>
          )}
        </div>
        ) : (
        <div className="bg-white border border-[#e2e8f0] shadow-xs rounded-2xl p-5 md:p-6 flex flex-col col-span-1 md:col-span-4 min-h-[360px]">
          <h2 className="font-heading font-bold text-lg text-[#0b1c30] mb-1">
            Errores Comunes
          </h2>
          <p className="text-xs text-slate-500 mb-4">Tipología de fallos en ejecuciones</p>

          <div className="flex-grow flex flex-col items-center justify-center">
            {/* Donut Chart with Conic Gradient */}
            <div
              className="w-40 h-40 rounded-full shadow-inner relative flex items-center justify-center"
              style={{ background: donutBackground }}
            >
              <div className="w-26 h-26 bg-white rounded-full flex flex-col items-center justify-center shadow-xs">
                <span className="font-sans font-bold text-2xl text-[#0b1c30]">{data.totalErrors}</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total
                </span>
              </div>
            </div>

            {/* Legend (Clean Inter/Mono metrics) */}
            <div className="mt-5 w-full flex flex-col gap-2">
              {data.errorBreakdown.length === 0 && (
                <p className="text-xs text-slate-400 text-center">Sin errores registrados.</p>
              )}
              {data.errorBreakdown.map((slice) => (
                <div key={slice.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${slice.dotClass}`} />
                    <span className="text-slate-700 font-medium">{slice.label}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{slice.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Card 3: Tendencias de XP (Line Chart area - 12 cols) */}
        <div className="bg-white border border-[#e2e8f0] shadow-xs rounded-2xl p-5 md:p-6 flex flex-col col-span-1 md:col-span-12">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">trending_up</span>
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-[#0b1c30]">
                  Tendencias de XP & Actividad
                </h2>
                <p className="text-xs text-slate-500">{TREND_DESCRIPTIONS[timeRange]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-xs font-medium text-slate-600">XP Obtenida</span>
            </div>
          </div>

          <XpTrendChart
            weeklyXp={data.xpTrend?.weeklyXp ?? []}
            labels={TREND_LABELS[timeRange]}
            emptyMessage={NO_PROGRESS_MESSAGE}
          />
        </div>

      </div>

    </div>
  );
};
