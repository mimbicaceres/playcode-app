import React, { useEffect, useRef, useState } from 'react';
import { StudentProgressRecord } from '../types';
import { StatusHud } from './ui/StatusHud';

interface StudentProgressViewProps {
  // Demo mode passes DEMO_STUDENT_PROGRESS from mockData; real mode passes the
  // students of the teacher/admin (all zeros until there is activity).
  students: StudentProgressRecord[];
  // Shown in the search box when there are no students (yet).
  emptyLabel?: string;
  // Student to show right away (e.g. "Ver progreso" from the teacher's Alumnos view).
  initialStudentId?: string | null;
}

const UNIT_BAR_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-400', 'bg-orange-400', 'bg-violet-400'];

const formatNumber = (value: number) => value.toLocaleString('es-AR');

const formatMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

const EmptyListMessage: React.FC<{ text: string }> = ({ text }) => (
  <p className="py-6 text-center text-xs text-slate-400">{text}</p>
);

const SectionHeader: React.FC<{ icon: string; iconClass: string; title: string; subtitle: string }> = ({
  icon,
  iconClass,
  title,
  subtitle,
}) => (
  <div className="flex items-start gap-3 mb-4">
    <span className={`material-symbols-outlined text-2xl ${iconClass}`}>{icon}</span>
    <div>
      <h2 className="font-heading font-bold text-base text-[#0b1c30]">{title}</h2>
      <p className="text-[11px] text-slate-500">{subtitle}</p>
    </div>
  </div>
);

// Full report of the chosen student (only rendered once a student is selected).
const StudentProgressDetails: React.FC<{ student: StudentProgressRecord }> = ({ student }) => {
  const attempts = student.correctAnswers + student.incorrectAnswers;
  const correctPercent = attempts > 0 ? Math.round((student.correctAnswers / attempts) * 100) : 0;
  const maxMinutes = Math.max(...student.practiceByDay.map((d) => d.minutes), 0);
  const exercisesPercent = student.exercisesTotal > 0 ? (student.exercisesSolved / student.exercisesTotal) * 100 : 0;
  const badgesText = student.badgesTotal > 0
    ? `${student.badgesUnlocked} / ${student.badgesTotal}`
    : `${student.badgesUnlocked}`;

  return (
    <>
      {/* Student summary card */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-5 flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="flex items-center gap-4 lg:flex-1 min-w-0">
          <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-100 overflow-hidden flex items-center justify-center shrink-0">
            {student.avatarUrl ? (
              <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-4xl text-blue-300">person</span>
            )}
          </div>
          <div className="min-w-0 flex flex-col gap-1">
            <h2 className="font-heading font-bold text-xl text-[#0b1c30] truncate">{student.name}</h2>
            <p className="text-xs text-slate-500">
              {[student.grade, student.school].filter(Boolean).join(' • ') || 'Sin datos de curso o institución'}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-slate-400">menu_book</span>
                {student.courseName ? `Curso: ${student.courseName}` : 'Sin curso asignado'}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${student.isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${student.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {student.isActive ? 'Alumno activo' : 'Sin actividad reciente'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:divide-x divide-slate-100">
          {[
            { icon: 'calendar_today', iconClass: 'text-slate-500', label: 'Última actividad', value: student.lastActivity ?? 'Sin actividad' },
            { icon: 'local_fire_department', iconClass: 'text-red-500', label: 'Racha actual', value: `${student.streakDays} días` },
            { icon: 'emoji_events', iconClass: 'text-amber-500', label: 'XP total', value: `${formatNumber(student.totalXp)} XP` },
            { icon: 'verified_user', iconClass: 'text-blue-600', label: 'Insignias', value: `${student.badgesUnlocked} desbloqueadas` },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center gap-1 px-5 py-2">
              <span className={`material-symbols-outlined text-2xl ${item.iconClass}`}>{item.icon}</span>
              <span className="text-xs text-slate-500">{item.label}</span>
              <span className="text-sm font-bold text-[#0b1c30] whitespace-nowrap">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: 'local_fire_department', iconBox: 'bg-orange-50 text-orange-500', label: 'Progreso global', value: `${student.overallProgress}%`, percent: student.overallProgress, bar: 'bg-emerald-500' },
          { icon: 'check_circle', iconBox: 'bg-emerald-50 text-emerald-600', label: 'Ejercicios resueltos', value: `${student.exercisesSolved} / ${student.exercisesTotal}`, percent: exercisesPercent, bar: 'bg-blue-500' },
          { icon: 'schedule', iconBox: 'bg-violet-50 text-violet-600', label: 'Precisión promedio', value: `${student.accuracy}%`, percent: student.accuracy, bar: 'bg-violet-500' },
          { icon: 'code', iconBox: 'bg-blue-50 text-blue-600', label: 'XP total', value: formatNumber(student.totalXp), percent: student.xpProgressPercent, bar: 'bg-amber-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${kpi.iconBox}`}>
                <span className="material-symbols-outlined text-2xl">{kpi.icon}</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                <p className="font-sans font-bold text-2xl text-[#0b1c30]">{kpi.value}</p>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${kpi.bar}`} style={{ width: `${kpi.percent}%` }} />
            </div>
          </div>
        ))}
      </section>

      {/* Units / exercise results / practice time */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progress per unit */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-5">
          <SectionHeader icon="menu_book" iconClass="text-blue-600" title="Progreso por unidad" subtitle="Porcentaje de finalización de cada unidad del curso" />
          {student.units.length === 0 ? (
            <EmptyListMessage text="Todavía no hay unidades con progreso." />
          ) : (
            <div className="flex flex-col gap-3.5">
              {student.units.map((unit, index) => (
                <div key={unit.label} className="grid grid-cols-[1fr_7rem_2.5rem] items-center gap-3 text-xs">
                  <span className="text-slate-700 truncate">{unit.label}</span>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${UNIT_BAR_COLORS[index % UNIT_BAR_COLORS.length]}`} style={{ width: `${unit.percent}%` }} />
                  </div>
                  <span className={`text-right font-bold ${unit.percent === 100 ? 'text-emerald-600' : 'text-slate-700'}`}>{unit.percent}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exercise results */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-5">
          <SectionHeader icon="bar_chart" iconClass="text-blue-600" title="Rendimiento en ejercicios" subtitle="Distribución de resultados en todos los ejercicios" />
          <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs mb-4">
            {[
              { dot: 'bg-emerald-500', label: 'Correctos', value: student.correctAnswers },
              { dot: 'bg-red-500', label: 'Incorrectos', value: student.incorrectAnswers },
              { dot: 'bg-slate-300', label: 'Intentos totales', value: attempts },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-3 py-2">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className={`w-2.5 h-2.5 rounded-full ${row.dot}`} />
                  {row.label}
                </span>
                <span className="font-bold text-[#0b1c30]">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: attempts > 0
                  ? `conic-gradient(#10b981 0% ${correctPercent}%, #f87171 ${correctPercent}% 100%)`
                  : '#e2e8f0',
              }}
            >
              <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="font-bold text-xl text-[#0b1c30]">{student.accuracy}%</span>
                <span className="text-[10px] text-slate-500">Precisión</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-xs text-slate-700">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Correctos ({correctPercent}%)</span>
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Incorrectos ({attempts > 0 ? 100 - correctPercent : 0}%)</span>
            </div>
          </div>
        </div>

        {/* Practice time */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-5">
          <SectionHeader icon="schedule" iconClass="text-blue-600" title="Tiempo de práctica" subtitle="Análisis del tiempo de práctica en la plataforma" />
          <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs mb-4">
            {[
              { label: 'Esta semana', value: student.practiceThisWeek },
              { label: 'Promedio diario', value: student.practiceDailyAverage },
              { label: 'Última actividad', value: student.lastActivity ?? 'Sin actividad' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-3 py-2">
                <span className="text-slate-700">{row.label}</span>
                <span className="font-bold text-[#0b1c30]">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-end justify-between gap-2 h-28">
            {student.practiceByDay.map((day) => (
              <div key={day.day} className="flex flex-col items-center justify-end gap-1 flex-1 h-full">
                <span className="text-[10px] text-slate-500">{day.minutes > 0 ? formatMinutes(day.minutes) : ''}</span>
                <div
                  className={`w-full max-w-[28px] rounded-t ${day.minutes > 0 ? 'bg-blue-300' : 'bg-slate-200'}`}
                  style={{ height: maxMinutes > 0 && day.minutes > 0 ? `${(day.minutes / maxMinutes) * 70}%` : '6px' }}
                />
                <span className="text-[10px] text-slate-500">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Attention areas / recent activity / achievements */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Areas that need attention */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-5">
          <SectionHeader icon="warning" iconClass="text-red-500" title="Áreas que requieren atención" subtitle="Unidades con más dificultades según los errores" />
          {student.attentionAreas.length === 0 ? (
            <EmptyListMessage text="No hay áreas que requieran atención." />
          ) : (
            <div className="flex flex-col gap-2.5">
              {student.attentionAreas.map((area) => (
                <div key={area.title} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${area.status === 'reinforce' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                    }`}>
                    <span className="material-symbols-outlined text-xl">priority_high</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0b1c30]">{area.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{area.detail}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${area.status === 'reinforce' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                    }`}>
                    {area.status === 'reinforce' ? 'Reforzar' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-5">
          <SectionHeader icon="description" iconClass="text-blue-600" title="Actividad reciente" subtitle="Últimos ejercicios resueltos por el alumno" />
          {student.recentActivity.length === 0 ? (
            <EmptyListMessage text="Todavía no hay ejercicios resueltos." />
          ) : (
            <div className="divide-y divide-slate-100">
              {student.recentActivity.map((activity) => (
                <div key={`${activity.when}-${activity.exercise}`} className="flex items-center gap-3 py-2 text-xs">
                  <span className="material-symbols-outlined text-base text-slate-400">draft</span>
                  <span className="text-slate-500 w-20 shrink-0">{activity.when}</span>
                  <span className="flex-1 text-slate-700 truncate">{activity.exercise}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${activity.correct
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                    <span className="material-symbols-outlined text-xs">{activity.correct ? 'check' : 'close'}</span>
                    {activity.correct ? 'Correcto' : 'Incorrecto'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements & stats */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-5">
          <SectionHeader icon="emoji_events" iconClass="text-amber-500" title="Logros y estadísticas" subtitle="Resumen de hitos y métricas del alumno" />
          <div className="grid grid-cols-3 gap-2.5 mb-2.5">
            {[
              { icon: 'local_fire_department', iconClass: 'text-red-500', label: 'Racha actual', value: `${student.streakDays} días` },
              { icon: 'workspace_premium', iconClass: 'text-amber-500', label: 'Mejor racha', value: `${student.bestStreakDays} días` },
              { icon: 'star', iconClass: 'text-amber-500', label: 'XP total', value: formatNumber(student.totalXp) },
            ].map((stat) => (
              <div key={stat.label} className="border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                <span className={`material-symbols-outlined text-2xl ${stat.iconClass}`}>{stat.icon}</span>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 truncate">{stat.label}</p>
                  <p className="text-sm font-bold text-[#0b1c30] whitespace-nowrap">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: 'description', iconClass: 'text-blue-600', label: 'Ejercicios resueltos', value: `${student.exercisesSolved}` },
              { icon: 'verified_user', iconClass: 'text-blue-600', label: 'Insignias desbloqueadas', value: badgesText },
            ].map((stat) => (
              <div key={stat.label} className="border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                <span className={`material-symbols-outlined text-2xl ${stat.iconClass}`}>{stat.icon}</span>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 truncate">{stat.label}</p>
                  <p className="text-sm font-bold text-[#0b1c30]">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

// Case- and accent-insensitive matching ("Gonzalez" finds "González").
const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const StudentProgressView: React.FC<StudentProgressViewProps> = ({
  students,
  emptyLabel = 'Sin alumnos asignados',
  initialStudentId = null,
}) => {
  const initialStudent = students.find((s) => s.id === initialStudentId);
  /** Estado del texto de búsqueda del alumno. */
  const [query, setQuery] = useState(initialStudent?.name ?? '');
  /** ID del alumno seleccionado; null cuando no hay selección. */
  const [selectedId, setSelectedId] = useState<string | null>(initialStudent?.id ?? null);
  /** Estado que indica si el dropdown de resultados está abierto. */
  const [isOpen, setIsOpen] = useState(false);
  /** Índice del elemento resaltado en la lista de sugerencias. */
  const [highlighted, setHighlighted] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const hasStudents = students.length > 0;
  const student = students.find((s) => s.id === selectedId) ?? null;
  const matches = students
    .filter((s) => normalize(`${s.name} ${s.grade ?? ''} ${s.school ?? ''}`).includes(normalize(query.trim())))
    .slice(0, 8);

  // Preselect the requested student once the list is available (it can load
  // asynchronously). Applied only once, so the user can search another student.
  const appliedInitialRef = useRef<string | null>(initialStudent ? initialStudent.id : null);
  /**
   * Effect que preselecciona al alumno indicado por `initialStudentId` una vez que la lista de estudiantes está disponible.
   * Se ejecuta únicamente cuando cambian `students` o `initialStudentId`.
   */
  useEffect(() => {
    if (!initialStudentId || appliedInitialRef.current === initialStudentId) return;
    const requested = students.find((s) => s.id === initialStudentId);
    if (requested) {
      appliedInitialRef.current = requested.id;
      setSelectedId(requested.id);
      setQuery(requested.name);
    }
  }, [students, initialStudentId]);

  // Close the suggestions when clicking outside the search box.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Handler que selecciona un alumno de la lista de sugerencias.
   * Actualiza `selectedId`, `query` y cierra el dropdown.
   */
  const selectStudent = (chosen: StudentProgressRecord) => {
    setSelectedId(chosen.id);
    setQuery(chosen.name);
    setIsOpen(false);
  };

  /**
   * Handler que responde a cambios en el campo de búsqueda.
   * Actualiza el texto, reinicia la selección y abre el dropdown.
   */
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedId(null); // typing again hides the previous report until a student is chosen
    setHighlighted(0);
    setIsOpen(true);
  };

  /**
   * Handler que limpia la búsqueda y cierra el dropdown.
   */
  const clearSearch = () => {
    setQuery('');
    setSelectedId(null);
    setIsOpen(false);
  };

  /**
   * Handler de atajos de teclado en el input de búsqueda.
   * Navega entre resultados con flechas, selecciona con Enter y cierra con Escape.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlighted((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && isOpen && matches[highlighted]) {
      e.preventDefault();
      selectStudent(matches[highlighted]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  /**
   * Renderizado del componente.
   * Muestra un HUD, buscador y, según el estado, carga, progreso real o vista de estudiante.
   */
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-5 md:py-6 pb-32 flex flex-col gap-5">

      {/* Header with student search */}
      <StatusHud
        compact={true}
        avatarIcon="bar_chart"
        badgeText="Reporte del Alumno"
        title="Seguimiento Individual del Alumno"
        subtitle="Análisis detallado del rendimiento, actividad y logros"
      >
        <div className="flex flex-col gap-1 w-full sm:w-80" ref={searchRef}>
          <label htmlFor="progress-student-search" className="text-xs font-semibold text-slate-200">Buscar alumno</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">search</span>
            <input
              id="progress-student-search"
              type="text"
              role="combobox"
              aria-expanded={isOpen}
              aria-controls="progress-student-results"
              autoComplete="off"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => hasStudents && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              disabled={!hasStudents}
              placeholder={hasStudents ? 'Escribí el nombre del alumno...' : emptyLabel}
              className="w-full bg-white text-[#0b1c30] text-sm font-semibold rounded-xl pl-10 pr-9 py-2.5 outline-none placeholder:text-slate-400 placeholder:font-normal disabled:cursor-not-allowed"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}

            {isOpen && hasStudents && (
              <ul
                id="progress-student-results"
                role="listbox"
                className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-30 max-h-72 overflow-y-auto"
              >
                {matches.length === 0 ? (
                  <li className="px-4 py-3 text-xs text-slate-400">No se encontraron alumnos.</li>
                ) : (
                  matches.map((s, index) => (
                    <li
                      key={s.id}
                      role="option"
                      aria-selected={index === highlighted}
                      onMouseDown={(e) => { e.preventDefault(); selectStudent(s); }}
                      onMouseEnter={() => setHighlighted(index)}
                      className={`px-3 py-2 flex items-center gap-3 cursor-pointer ${index === highlighted ? 'bg-blue-50' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 overflow-hidden flex items-center justify-center shrink-0">
                        {s.avatarUrl ? (
                          <img src={s.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-base text-blue-300">person</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0b1c30] truncate">{s.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {[s.grade, s.school].filter(Boolean).join(' • ') || 'Sin datos de curso o institución'}
                        </p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </StatusHud>

      {student ? (
        <StudentProgressDetails student={student} />
      ) : (
        <section className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs py-16 px-6 flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-3xl">{hasStudents ? 'person_search' : 'group_off'}</span>
          </div>
          <h2 className="font-heading font-bold text-lg text-[#0b1c30]">
            {hasStudents ? 'Buscá un alumno para ver su progreso' : emptyLabel}
          </h2>
          <p className="text-sm text-slate-500 max-w-md">
            {hasStudents
              ? 'Escribí su nombre en el buscador y elegilo de la lista para ver su seguimiento individual.'
              : 'Cuando haya alumnos disponibles, vas a poder buscarlos acá para ver su seguimiento individual.'}
          </p>
        </section>
      )}
    </div>
  );
};
