import React from 'react';
import { ScreenView, Course, StudentProgressRecord, Unit } from '../types';
import { COURSES_DATA, MASCOT_IMAGES } from '../data/mockData';
import { StatusHud } from './ui/StatusHud';
import { SegmentedProgressBar } from './ui/SegmentedProgressBar';
import { CourseStudentList } from './CourseStudentList';

interface CourseRoadmapViewProps {
  onNavigate: (view: ScreenView) => void;
  course: Course | null;
  // 'teacher': the real teacher's course view (units of the course, without the
  // student's "Continuar/Repasar" actions, locks or mascot, and never mock data).
  mode?: 'student' | 'teacher';
  // Teacher mode: figures of the selected course's students (not a student's own progress).
  teacherSummary?: { studentsCount: number; averageProgress: number };
  // Teacher mode: students of the selected course (teacherCourseId) and the
  // "Ver progreso" action that opens their individual follow-up.
  teacherStudents?: StudentProgressRecord[];
  onViewStudentProgress?: (studentId: string) => void;
}

/**
 * Vista del roadmap del curso.
 * Muestra las unidades y actividades del curso seleccionado.
 * @param onNavigate Callback para cambiar la vista principal.
 * @param course Curso a mostrar (null para demo).
 * @param mode Modo de visualización: 'student' o 'teacher'.
 * @param teacherSummary Resumen del progreso promedio de los alumnos (modo docente).
 * @param teacherStudents Lista de estudiantes del curso (modo docente).
 * @param onViewStudentProgress Callback para ver el progreso individual de un estudiante.
 */
export const CourseRoadmapView: React.FC<CourseRoadmapViewProps> = ({
  onNavigate,
  course: courseProp,
  mode = 'student',
  teacherSummary,
  teacherStudents = [],
  onViewStudentProgress,
}) => {
  const isTeacher = mode === 'teacher';

  // Teacher mode never falls back to example data: it asks to choose a course.
  if (isTeacher && !courseProp) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 pb-28 md:pb-12 flex flex-col gap-6">
        <StatusHud avatarIcon="menu_book" badgeText="Curso a cargo" title="Curso" subtitle="Unidades y actividades del curso" />
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-3xl border border-[#e2e8f0] shadow-sm text-center px-6">
          <span className="material-symbols-outlined text-5xl text-slate-300">menu_book</span>
          <p className="text-base font-semibold text-slate-600">Elegí un curso para ver su contenido.</p>
          <button
            onClick={() => onNavigate('courses_map')}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-xl font-semibold text-xs transition-colors shadow-xs cursor-pointer"
          >
            Ir a Cursos
          </button>
        </div>
      </div>
    );
  }

  // Fallback to first in_progress course if nothing was passed
  const course: Course = courseProp ?? COURSES_DATA.find(c => c.status === 'in_progress') ?? COURSES_DATA[0];
  const isReviewMode = !isTeacher && course.status === 'completed';

  // Renderiza una unidad del curso según su estado y modo
const renderUnit = (unit: Unit, index: number) => {
    // Teacher: every unit is shown the same way (no student progress/locks).
    // Modo docente: siempre muestra la unidad sin bloqueos ni progreso del estudiante
if (isTeacher) {
      return (
        <div key={unit.id} className="relative z-10 flex flex-col items-center mb-12">
          <div className="w-14 h-14 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-md border-4 border-white z-10 mb-2 font-heading font-bold text-lg">
            {unit.number}
          </div>
          <div className="soft-card rounded-2xl p-5 border-blue-100 w-full max-w-sm text-center shadow-xs">
            <span className="text-[11px] font-bold text-[#2563eb] uppercase tracking-wider">{unit.title}</span>
            <h3 className="font-heading font-bold text-lg text-[#0b1c30]">{unit.subtitle}</h3>
            <p className="text-xs text-[#434655] mt-1">{unit.description}</p>
            <p className="text-[11px] text-slate-500 mt-3 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">assignment</span>
              {unit.exercises.length} actividades
            </p>
          </div>
        </div>
      );
    }

    const effectiveStatus = isReviewMode ? 'active' : unit.status;
    const isCompleted = unit.status === 'completed';
    const isActive = effectiveStatus === 'active';
    const isLocked = !isReviewMode && unit.status === 'locked';

    // Unidad completada (y no en modo repaso) muestra un ícono de verificación
if (isCompleted && !isReviewMode) {
      return (
        <div
          key={unit.id}
          onClick={() => onNavigate('unit_detail')}
          className="relative z-10 flex flex-col items-center mb-12 group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-md border-4 border-white z-10 mb-2 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-2xl fill">check_circle</span>
          </div>
          <div className="soft-card rounded-2xl p-4 border-emerald-200 w-full max-w-sm text-center group-hover:border-emerald-400 transition-colors shadow-xs">
            <span className="text-[11px] font-bold text-[#00714d] uppercase tracking-wider">Completado</span>
            <h3 className="font-heading font-bold text-lg text-[#0b1c30]">{unit.title}</h3>
            <p className="text-xs text-[#434655]">{unit.subtitle}</p>
          </div>
        </div>
      );
    }

    // Unidad activa (en progreso) muestra botón para continuar o reproducir
if (isActive) {
      return (
        <div key={unit.id} className="relative z-10 flex flex-col items-center mb-12 group">
          <div
            onClick={() => onNavigate('unit_detail')}
            className="w-16 h-16 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-lg border-4 border-white z-10 mb-2 ring-4 ring-blue-100 cursor-pointer transition-transform group-hover:scale-105"
          >
            <span className="material-symbols-outlined text-3xl fill ml-0.5">
              {isReviewMode ? 'replay' : 'play_arrow'}
            </span>
          </div>
          <div className="bg-white rounded-3xl p-6 border-2 border-[#2563eb] shadow-[0px_8px_24px_rgba(37,99,235,0.12)] w-full max-w-sm text-center relative overflow-visible">
            {/* Single Mascot placement on first active node */}
            {index === (isReviewMode ? 0 : course.units.findIndex(u => u.status === 'active')) && (
              <div className="absolute -top-10 right-4 w-18 h-18 animate-peek pointer-events-none drop-shadow-md">
                <img src={MASCOT_IMAGES.thumbsUp} alt="Carpincho en progreso" className="w-full h-full object-contain" />
              </div>
            )}
            <span className="inline-block text-[11px] font-bold text-[#2563eb] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              {isReviewMode ? 'Repaso' : `En Curso • ${unit.progressPercent}%`}
            </span>
            <h3 className="font-heading font-bold text-xl text-[#0b1c30] mt-2">{unit.title}</h3>
            <p className="text-xs font-semibold text-[#2563eb] mb-4">{unit.subtitle}</p>
            <button
              onClick={() => onNavigate('unit_detail')}
              className="btn-game-primary py-3 px-6 text-sm w-full flex items-center justify-center gap-2"
            >
              <span>{isReviewMode ? 'Repasar Unidad' : 'Continuar Unidad'}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      );
    }

    // Unidad bloqueada: muestra indicación de prerequisito
    return (
      <div key={unit.id} className="relative z-10 flex flex-col items-center mb-12 opacity-60">
        <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shadow-xs border-4 border-white z-10 mb-2">
          <span className="material-symbols-outlined text-2xl fill">lock</span>
        </div>
        <div className="soft-card rounded-2xl p-4 border-slate-200 w-full max-w-sm text-center">
          <h3 className="font-heading font-bold text-base text-slate-700">{unit.title}</h3>
          <p className="text-xs text-slate-500">{unit.subtitle}</p>
        </div>
      </div>
    );
  };

  // Teacher: average progress of the course's students; student: their own progress.
  const progressPercent = isTeacher ? teacherSummary?.averageProgress ?? 0 : course.progressPercent;
  const completedSegments = Math.round((progressPercent / 100) * 20);
  const activitiesCount = course.units.reduce((sum, u) => sum + u.exercises.length, 0);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 pb-28 md:pb-12 flex flex-col gap-6">
      {/* Top Status HUD */}
      <StatusHud
        avatarIcon="terminal"
        badgeText={isTeacher ? 'Curso a cargo' : 'Ruta de Aprendizaje'}
        title={course.title}
        subtitle={`${course.subtitle} • ${course.category}`}
      >
        <button
          onClick={() => onNavigate('courses_map')}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-100 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition-all border border-white/15 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Volver a Cursos</span>
        </button>
      </StatusHud>

      {/* Review mode banner */}
      {isReviewMode && (
        <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold shadow-xs">
          <span className="material-symbols-outlined text-emerald-500">replay</span>
          <span>Modo repaso — todas las unidades disponibles</span>
        </div>
      )}

      {/* Segmented Progress Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <SegmentedProgressBar
          totalSegments={20}
          completedSegments={completedSegments}
          percentage={progressPercent}
          label={isTeacher ? 'Progreso promedio de los alumnos' : 'Progreso general del curso'}
        />
        {isTeacher && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
            <p className="text-xs text-[#434655]">{course.description}</p>
            <p className="text-xs font-semibold text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-blue-600">groups</span>{teacherSummary?.studentsCount ?? 0} {teacherSummary?.studentsCount === 1 ? 'alumno' : 'alumnos'}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-blue-600">menu_book</span>{course.units.length} unidades</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-blue-600">assignment</span>{activitiesCount} actividades</span>
            </p>
          </div>
        )}
      </div>

      {/* Teacher: students of the selected course (same list as "Alumnos") */}
      {isTeacher && onViewStudentProgress && (
        <CourseStudentList courseName={course.title} students={teacherStudents} onViewProgress={onViewStudentProgress} />
      )}

      {/* Learning Path Tree */}
      {course.units.length === 0 ? (
        /* Empty state for courses without units yet */
        <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-3xl border border-[#e2e8f0] shadow-sm">
          <span className="material-symbols-outlined text-6xl text-slate-300">construction</span>
          <p className="text-base font-semibold text-slate-500 text-center max-w-xs">
            {isTeacher ? 'Este curso todavía no tiene unidades.' : 'Las unidades de este curso estarán disponibles pronto'}
          </p>
          <p className="text-xs text-slate-400 text-center max-w-xs">
            {isTeacher
              ? 'Cuando se carguen unidades y actividades, vas a verlas acá.'
              : 'Estamos preparando el contenido para que puedas aprender de la mejor manera.'}
          </p>
        </div>
      ) : (
        <div className="relative py-8 px-4 bg-sendero-pattern rounded-3xl border border-[#e2e8f0]/90 shadow-sm">
          {/* Central connecting pathway line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-12 bottom-20 w-1 border-r-2 border-dashed border-blue-300/70 z-0">
            <div
              className="w-full bg-[#2563eb] rounded-full transition-all duration-1000"
              style={{ height: `${progressPercent}%` }}
            />
          </div>

          {course.units.map((unit, index) => renderUnit(unit, index))}
        </div>
      )}
    </div>
  );
};
