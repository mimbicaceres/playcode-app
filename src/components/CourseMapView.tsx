import React, { useState } from 'react';
import { ScreenView, Course } from '../types';
import { StatusHud } from './ui/StatusHud';

interface CourseMapViewProps {
  // Demo mode passes COURSES_DATA from mockData; real users pass their assigned courses.
  courses: Course[];
  onNavigate: (view: ScreenView) => void;
  onSelectCourse?: (course: Course) => void;
  // Where the "back" button goes (the home view of the current role).
  backView?: ScreenView;
  // 'teacher': the real teacher's courses ("Ver curso" instead of "Continuar"/"Empezar").
  mode?: 'student' | 'teacher';
  // Teacher mode: opens a course. There is no course detail view yet, so the
  // button stays disabled until this is provided.
  onViewCourse?: (course: Course) => void;
}

export const CourseMapView: React.FC<CourseMapViewProps> = ({
  courses,
  onNavigate,
  onSelectCourse,
  backView = 'dashboard',
  mode = 'student',
  onViewCourse,
}) => {
  const isTeacher = mode === 'teacher';
  const [lockedMessage, setLockedMessage] = useState<{ courseId: string; text: string } | null>(null);
  const [activeMessage, setActiveMessage] = useState<{ courseId: string; text: string } | null>(null);

  const inProgressCourse = courses.find(c => c.status === 'in_progress');

  const getLanguageStripeColor = (course: Course) => {
    const text = `${course.title} ${course.tag} ${course.category}`.toLowerCase();
    if (text.includes('python')) return '#ffb95f';
    if (text.includes('javascript') || text.includes('js')) return '#eab308';
    if (text.includes('c++')) return '#3b82f6';
    if (text.includes('css')) return '#0284c7';
    if (text.includes('java')) return '#f97316';
    return course.color || '#2563eb';
  };

  const getPrerequisiteName = (prerequisiteId?: string) => {
    if (!prerequisiteId) return '';
    return courses.find(c => c.id === prerequisiteId)?.title ?? prerequisiteId;
  };

  const handleCourseClick = (course: Course) => {
    // Dismiss all messages first
    setLockedMessage(null);
    setActiveMessage(null);

    if (isTeacher) {
      onViewCourse?.(course);
      return;
    }

    if (course.status === 'locked') {
      const prereqName = getPrerequisiteName(course.prerequisiteId);
      setLockedMessage({
        courseId: course.id,
        text: `Completá "${prereqName}" para desbloquear este curso.`,
      });
      return;
    }

    if (
      course.status === 'available' &&
      inProgressCourse &&
      inProgressCourse.id !== course.id
    ) {
      setActiveMessage({
        courseId: course.id,
        text: `Ya tenés un curso en progreso: "${inProgressCourse.title}". Terminalo antes de empezar uno nuevo.`,
      });
      return;
    }

    if (onSelectCourse) onSelectCourse(course);
    onNavigate('course_roadmap');
  };

  const dismissMessages = () => {
    setLockedMessage(null);
    setActiveMessage(null);
  };

  const getBadge = (course: Course) => {
    switch (course.status) {
      case 'in_progress':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            En curso
          </span>
        );
      case 'available':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200">
            Disponible
          </span>
        );
      case 'completed':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            Completado
          </span>
        );
      case 'locked':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>lock</span>
            Bloqueado
          </span>
        );
    }
  };

  const getButtonLabel = (course: Course) => {
    switch (course.status) {
      case 'in_progress': return 'Continuar';
      case 'available': return 'Empezar';
      case 'completed': return 'Repasar';
      case 'locked': return 'Bloqueado';
    }
  };

  const getButtonClass = (course: Course) => {
    switch (course.status) {
      case 'in_progress':
        return 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white';
      case 'available':
        return 'bg-violet-600 hover:bg-violet-700 text-white';
      case 'completed':
        return 'bg-[#0b1c30] hover:bg-[#122e4e] text-white';
      case 'locked':
        return 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed';
    }
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 pb-28 md:pb-12 flex flex-col gap-6"
      onClick={dismissMessages}
    >
      {/* Top Status HUD */}
      <StatusHud
        avatarIcon="explore"
        badgeText={isTeacher ? 'Cursos a cargo' : 'Catálogo de Aprendizaje'}
        title={isTeacher ? 'Mis Cursos' : 'Mapa de Cursos'}
        subtitle={isTeacher
          ? 'Tus cursos con sus unidades, actividades y alumnos'
          : 'Explora las rutas de programación y continúa tu camino formativo'}
      >
        <button
          onClick={() => onNavigate(backView)}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-100 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition-all border border-white/15 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">dashboard</span>
          <span>{isTeacher ? 'Volver al Inicio' : 'Volver al Dashboard'}</span>
        </button>
      </StatusHud>

      {/* Courses Bento List */}
      <div className="grid grid-cols-1 gap-5">
        {courses.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-[0px_4px_16px_rgba(0,0,0,0.04)] p-10 flex flex-col items-center text-center gap-2">
            <span className="material-symbols-outlined text-4xl text-slate-300">menu_book</span>
            <p className="text-sm font-semibold text-slate-600">
              {isTeacher ? 'No tenés cursos asignados todavía.' : 'Todavía no tenés cursos asignados.'}
            </p>
            <p className="text-xs text-slate-400">Cuando un administrador te asigne cursos, van a aparecer acá.</p>
          </div>
        )}
        {courses.map((course) => {
          const stripeColor = getLanguageStripeColor(course);
          // A teacher consults the courses assigned to them: nothing is locked and there
          // is no personal progress (those states belong to the student's path).
          const isLocked = !isTeacher && course.status === 'locked';
          const activitiesCount = course.units.reduce((sum, u) => sum + u.exercises.length, 0);
          const showLockedMsg = lockedMessage?.courseId === course.id;
          const showActiveMsg = activeMessage?.courseId === course.id;

          return (
            <div key={course.id} className="flex flex-col gap-1.5">
              <article
                onClick={(e) => {
                  e.stopPropagation();
                  handleCourseClick(course);
                }}
                className={`bg-white rounded-2xl border border-[#e2e8f0] shadow-[0px_4px_16px_rgba(0,0,0,0.04)] overflow-hidden transition-all flex flex-col relative ${
                  isLocked
                    ? 'cursor-pointer opacity-70'
                    : 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                }`}
              >
                {/* Lock overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-slate-50/60 z-10 rounded-2xl flex items-center justify-end pr-6 pointer-events-none">
                    <span className="material-symbols-outlined text-4xl text-slate-300">lock</span>
                  </div>
                )}

                {/* Top Language Colored Stripe */}
                <div
                  className="h-1.5 w-full shrink-0"
                  style={{ backgroundColor: isLocked ? '#cbd5e1' : stripeColor }}
                />

                <div className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
                  {/* Logo / Badge */}
                  <div
                    className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex-shrink-0 flex items-center justify-center p-2.5 shadow-xs"
                    style={
                      isLocked
                        ? { backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }
                        : { backgroundColor: `${stripeColor}18`, border: `1px solid ${stripeColor}40` }
                    }
                  >
                    {course.logoUrl ? (
                      <img
                        src={course.logoUrl}
                        alt={course.title}
                        className={`w-full h-full object-contain ${isLocked ? 'grayscale opacity-50' : ''}`}
                      />
                    ) : (
                      <span
                        className="material-symbols-outlined text-3xl font-bold"
                        style={{ color: isLocked ? '#94a3b8' : stripeColor }}
                      >
                        {course.iconName}
                      </span>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="flex-grow w-full md:w-auto min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md"
                        style={
                          isLocked
                            ? { backgroundColor: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }
                            : { backgroundColor: `${stripeColor}20`, color: '#0b1c30', border: `1px solid ${stripeColor}50` }
                        }
                      >
                        {course.tag}
                      </span>
                      {isTeacher ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Asignado
                        </span>
                      ) : (
                        getBadge(course)
                      )}
                    </div>

                    <h2 className={`font-heading font-bold text-xl mb-1 ${isLocked ? 'text-slate-500' : 'text-[#0b1c30]'}`}>
                      {course.title}
                    </h2>
                    <p className="text-xs md:text-sm text-[#434655] line-clamp-2">
                      {course.description}
                    </p>

                    {/* Teacher: course content summary */}
                    {isTeacher && (
                      <p className="mt-3 text-xs font-semibold text-[#737686] flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>menu_book</span>
                          {course.units.length} {course.units.length === 1 ? 'unidad' : 'unidades'}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>assignment</span>
                          {activitiesCount} {activitiesCount === 1 ? 'actividad' : 'actividades'}
                        </span>
                      </p>
                    )}

                    {/* Progress Bar (student) */}
                    {!isLocked && !isTeacher && (
                      <div className="mt-3.5 flex items-center gap-3">
                        <div className="flex-grow bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${course.progressPercent}%`,
                              backgroundColor: course.status === 'completed' ? '#10B981' : stripeColor
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#737686] whitespace-nowrap">
                          {course.completedLessons}/{course.totalLessons} lecciones ({course.progressPercent}%)
                        </span>
                      </div>
                    )}
                    {isLocked && course.prerequisiteId && (
                      <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>arrow_forward</span>
                        Requiere: {getPrerequisiteName(course.prerequisiteId)}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(course);
                    }}
                    disabled={isTeacher ? !onViewCourse : isLocked}
                    title={isTeacher && !onViewCourse ? 'Disponible próximamente' : undefined}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all flex-shrink-0 shadow-xs relative z-20 ${
                      isTeacher
                        ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-50 disabled:cursor-not-allowed'
                        : getButtonClass(course)
                    }`}
                  >
                    {isTeacher ? 'Ver curso' : getButtonLabel(course)}
                  </button>
                </div>
              </article>

              {/* Inline locked message */}
              {showLockedMsg && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium shadow-xs animate-fadeIn"
                >
                  <span className="material-symbols-outlined text-amber-500 mt-0.5" style={{ fontSize: '15px' }}>info</span>
                  <span>{lockedMessage?.text}</span>
                </div>
              )}

              {/* Inline active-course message */}
              {showActiveMsg && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs font-medium shadow-xs animate-fadeIn"
                >
                  <span className="material-symbols-outlined text-blue-500 mt-0.5" style={{ fontSize: '15px' }}>school</span>
                  <span>{activeMessage?.text}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
