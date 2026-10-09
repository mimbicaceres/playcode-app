import React, { useEffect, useRef, useState } from 'react';
import { Course, ScreenView, UserProfile } from '../types';
import { DEMO_STUDENT_HOME, MASCOT_IMAGES } from '../data/mockData';

interface StudentDashboardProps {
  user: UserProfile;
  onNavigate: (view: ScreenView) => void;
  // Real students: their assigned courses (no progress yet). Without it (demo
  // mode) the example content from DEMO_STUDENT_HOME is shown.
  courses?: Course[];
  onOpenCourse?: (course: Course) => void;
}

// ---------------------------------------------------------------------------
// View models: both demo and real data are mapped to these shapes so the layout
// below is written only once.
// ---------------------------------------------------------------------------

interface HeroModel {
  tag: string;
  tagIcon: string;
  title: string;
  description: string;
  percent: number;
  progressLabel: string;
  onOpen: () => void;
  primaryLabel: string;
  secondary?: { label: string; icon: string; onClick: () => void };
}

interface CourseCardModel {
  id: string;
  title: string;
  color: string;
  percent: number;
  icon: React.ReactNode;
  onClick: () => void;
}

// Courses shown in "Tus Cursos" before pressing "Ver todos".
const COURSES_PREVIEW = 3;

/**
 * Color de semáforo según el avance: rojo (0%) → amarillo (50%) → verde (100%).
 * El tono va cambiando de forma continua a medida que sube el porcentaje.
 */
const progressColor = (percent: number, lightness = 42): string => {
  const p = Math.min(100, Math.max(0, percent));
  return `hsl(${Math.round(p * 1.2)}, 85%, ${lightness}%)`;
};

/** Estadística en formato chip, para la barra del saludo (racha, experiencia, cursos). */
const BannerStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3 py-1.5 min-w-0">
    <span className="text-xl leading-none flex items-center">{icon}</span>
    <div className="leading-tight">
      <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">{label}</p>
      <p className="font-heading font-extrabold text-sm text-white whitespace-nowrap">{value}</p>
    </div>
  </div>
);

/** Tarjeta compacta de un curso: icono de color, título, barra y porcentaje. */
const CourseCard: React.FC<{ course: CourseCardModel }> = ({ course }) => (
  <button
    onClick={course.onClick}
    className="w-full text-left bg-white p-2.5 rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center gap-2.5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border font-heading font-extrabold text-xs"
      style={{ backgroundColor: `${course.color}1a`, borderColor: `${course.color}40`, color: course.color }}
    >
      {course.icon}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-sm text-[#0b1c30] truncate group-hover:text-[#2563eb] transition-colors">
        {course.title}
      </h4>
      <div className="flex items-center gap-2 mt-1">
        <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${course.percent}%`, backgroundColor: progressColor(course.percent) }}
          />
        </div>
        <span
          className="text-[11px] font-bold w-8 text-right"
          style={{ color: progressColor(course.percent, 34) }}
        >
          {course.percent}%
        </span>
      </div>
    </div>
    <span className="material-symbols-outlined text-lg text-slate-400 group-hover:text-[#2563eb] group-hover:translate-x-0.5 transition-all">
      chevron_right
    </span>
  </button>
);

/** Contenedor de las tarjetas inferiores (logros, actividad, consejo). */
const InfoCard: React.FC<{
  icon: string;
  iconClassName: string;
  title: string;
  action?: { label: string; onClick: () => void };
  className?: string;
  children: React.ReactNode;
}> = ({ icon, iconClassName, title, action, className = 'bg-white border-[#e2e8f0]', children }) => (
  <section className={`rounded-2xl border px-3.5 py-3 shadow-sm flex flex-col gap-2 min-w-0 ${className}`}>
    <div className="flex items-center justify-between gap-2">
      <h2 className="font-heading font-bold text-sm text-[#0b1c30] flex items-center gap-1.5">
        <span className={`material-symbols-outlined fill text-lg ${iconClassName}`}>{icon}</span>
        {title}
      </h2>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs font-bold text-[#2563eb] hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
        >
          {action.label} <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      )}
    </div>
    <div className="flex-1 flex flex-col justify-center">{children}</div>
  </section>
);

/** Barra de progreso segmentada, versión baja para el curso destacado. */
const CompactProgress: React.FC<{ percent: number; label: string }> = ({ percent, label }) => {
  const filled = Math.round((percent / 100) * 20);
  const color = progressColor(percent, 55);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-blue-200">{label}</span>
        <span className="font-bold" style={{ color: progressColor(percent, 65) }}>{percent}%</span>
      </div>
      <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1 bg-[#0b1c30]/50 p-1.5 rounded-lg border border-white/15">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={index}
            className={`h-2.5 rounded-[3px] ${index < filled ? '' : 'bg-white/10 border border-white/5'}`}
            style={index < filled ? { backgroundColor: color, boxShadow: `0 0 6px ${color}` } : undefined}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Vista principal del estudiante, a pantalla completa en escritorio.
 * Tres filas: saludo con estadísticas al costado y lamparita del consejo; curso
 * destacado + cursos; logros y actividad reciente.
 * @param user Perfil del usuario.
 * @param onNavigate Callback para cambiar de vista.
 * @param courses Cursos asignados al estudiante (opcional; sin él se muestra la demo).
 * @param onOpenCourse Callback para abrir un curso seleccionado.
 */
export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onNavigate, courses, onOpenCourse }) => {
  const isDemo = !courses;
  const firstCourse = courses?.[0];

  // Tip of the day: only shown as a floating message when the lightbulb is pressed.
  const [showTip, setShowTip] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // "Tus Cursos": only a few are shown until "Ver todos" is pressed.
  const [showAllCourses, setShowAllCourses] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowTip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ----- Hero ("Continuar aprendiendo") -----
  let hero: HeroModel | null = null;
  if (isDemo) {
    hero = {
      tag: 'Python',
      tagIcon: 'code',
      title: 'Unidad 2 - Variables',
      description: 'Aprende a guardar información en la memoria de tu programa.',
      percent: 45,
      progressLabel: 'Progreso de la unidad',
      onOpen: () => onNavigate('course_roadmap'),
      primaryLabel: 'Continuar lección',
      secondary: { label: 'Ver contenido', icon: 'list_alt', onClick: () => onNavigate('unit_detail') },
    };
  } else if (firstCourse) {
    hero = {
      tag: firstCourse.tag,
      tagIcon: firstCourse.iconName,
      title: firstCourse.title,
      description: firstCourse.description,
      percent: 0,
      progressLabel: 'Progreso del curso',
      onOpen: () => onOpenCourse?.(firstCourse),
      primaryLabel: 'Ver curso',
    };
  }
  const heroPrimaryAction = isDemo ? () => onNavigate('exercise') : hero?.onOpen;

  // ----- Courses list (a preview first, all of them after "Ver todos") -----
  const courseCards: CourseCardModel[] = isDemo
    ? DEMO_STUDENT_HOME.courses.map((c) => ({
        id: c.id,
        title: c.title,
        color: c.color,
        percent: c.percent,
        icon: <span>{c.initials}</span>,
        onClick: () => onNavigate('course_roadmap'),
      }))
    : (courses ?? []).map((c) => ({
        id: c.id,
        title: c.title,
        color: c.color,
        percent: c.progressPercent,
        icon: c.logoUrl
          ? <img src={c.logoUrl} alt="" className="w-6 h-6 object-contain" />
          : <span className="material-symbols-outlined text-xl">{c.iconName}</span>,
        onClick: () => onOpenCourse?.(c),
      }));

  const hasMoreCourses = courseCards.length > COURSES_PREVIEW;
  const visibleCourseCards = showAllCourses ? courseCards : courseCards.slice(0, COURSES_PREVIEW);

  // Collapsed: the list stretches to the height of the featured course
  // (3 rows = COURSES_PREVIEW).
  const fillCourses = !!hero && !showAllCourses && visibleCourseCards.length === COURSES_PREVIEW;

  const courseCount = isDemo ? DEMO_STUDENT_HOME.courses.length : (courses?.length ?? 0);

  // ----- Achievements / activity (empty for real students, who have no data yet) -----
  const achievements = isDemo ? DEMO_STUDENT_HOME.achievements : [];
  const activity = isDemo ? DEMO_STUDENT_HOME.activity : [];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-28 md:pb-5 flex-1 flex flex-col gap-4">
      {/* Row 1: greeting on the left; stats and the tip lightbulb on the right */}
      <div className="w-full bg-gradient-to-r from-[#0b1c30] via-[#0d223a] to-[#122e4e] px-4 py-3 rounded-2xl border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            onClick={() => onNavigate('profile')}
            className="w-11 h-11 rounded-xl overflow-hidden border-2 border-white/20 bg-white/10 shrink-0 shadow-md cursor-pointer hover:border-white/40 transition-colors"
          >
            <img src={user.avatarUrl || MASCOT_IMAGES.roundAvatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="font-heading font-bold text-white leading-tight truncate text-lg xl:text-xl">
                {`¡Hola, ${user.name}!`}
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold text-blue-300 uppercase tracking-wider bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 rounded-md shrink-0">
                Estudiante
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate">{`${user.school} • ${user.grade || '4to Año'}`}</p>
          </div>
        </div>

        {/* Right side: stats, a divider and the tip lightbulb */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <BannerStat icon="🔥" label="Racha" value={`${user.streakDays} días`} />
            <BannerStat
              icon={<span className="material-symbols-outlined text-amber-400 text-xl fill">stars</span>}
              label="Experiencia"
              value={`${user.totalXp.toLocaleString()} XP`}
            />
            <BannerStat
              icon={<span className="material-symbols-outlined text-emerald-400 text-xl">task_alt</span>}
              label="Cursos"
              value={`${courseCount} ${courseCount === 1 ? 'asignado' : 'asignados'}`}
            />
          </div>

          <div className="hidden sm:block w-px h-8 bg-white/15" />

          {/* Lightbulb: opens the tip of the day as a floating message */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setShowTip((open) => !open)}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Consejo del día"
              title="Consejo del día"
            >
              <span className="material-symbols-outlined fill text-xl text-amber-400">lightbulb</span>
            </button>

            {showTip && (
              <div className="absolute right-0 top-full mt-2 w-72 z-50 bg-amber-50 border border-amber-200 rounded-2xl shadow-xl p-4">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h2 className="font-heading font-bold text-sm text-[#0b1c30] flex items-center gap-1.5">
                    <span className="material-symbols-outlined fill text-lg text-amber-500">lightbulb</span>
                    Consejo del día
                  </h2>
                  <button
                    onClick={() => setShowTip(false)}
                    className="text-slate-400 hover:text-slate-600 flex items-center cursor-pointer"
                    aria-label="Cerrar"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
                <p className="text-sm text-[#434655] leading-snug">{DEMO_STUDENT_HOME.tip}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Row 2: featured course + course list */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 ${showAllCourses ? 'lg:items-start' : 'items-stretch lg:flex-1 lg:max-h-[360px]'}`}>
        {hero && (
          <section className="lg:col-span-7 flex flex-col gap-2 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-base text-[#0b1c30]">
                {isDemo ? 'Continuar aprendiendo' : 'Empezá a aprender'}
              </h2>
              <button
                onClick={hero.onOpen}
                className="text-xs font-bold text-[#2563eb] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                Ver curso <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="flex-1 rounded-2xl bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#0b1c30] text-white p-5 relative overflow-hidden shadow-[0_8px_24px_rgba(11,28,48,0.25)] border border-blue-400/30">
              <div className="grid grid-cols-12 gap-3 items-end h-full relative z-10">
                <div className="col-span-12 sm:col-span-8 flex flex-col justify-center gap-3 h-full">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffb95f]/20 text-[#ffb95f] border border-[#ffb95f]/40">
                        <span className="material-symbols-outlined text-sm">{hero.tagIcon}</span>
                        {hero.tag}
                      </span>
                      <h3 className="font-heading font-bold text-lg xl:text-xl text-white">{hero.title}</h3>
                    </div>
                    <p className="text-xs xl:text-sm text-blue-100/90 mt-1 leading-snug max-w-lg">{hero.description}</p>
                  </div>
                  <CompactProgress percent={hero.percent} label={hero.progressLabel} />
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={heroPrimaryAction}
                      className="btn-game-amber px-4 py-1.5 text-sm flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">play_arrow</span>
                      <span>{hero.primaryLabel}</span>
                    </button>
                    {hero.secondary && (
                      <button
                        onClick={hero.secondary.onClick}
                        className="px-3.5 py-1.5 text-sm font-semibold rounded-xl border border-white/30 text-blue-100 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">{hero.secondary.icon}</span>
                        <span>{hero.secondary.label}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="hidden sm:flex sm:col-span-4 justify-end items-end -mb-4">
                  <img
                    src={MASCOT_IMAGES.thumbsUp}
                    alt="Carpincho"
                    className="w-28 xl:w-32 max-w-full object-contain select-none pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        <section className={`${hero ? 'lg:col-span-5' : 'lg:col-span-12'} flex flex-col gap-2 min-w-0`}>
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-[#0b1c30]">Tus Cursos</h2>
            {hasMoreCourses ? (
              <button
                onClick={() => setShowAllCourses((open) => !open)}
                className="text-xs font-bold text-[#2563eb] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                {showAllCourses ? 'Ver menos' : `Ver todos (${courseCards.length})`}
                <span className="material-symbols-outlined text-sm">{showAllCourses ? 'expand_less' : 'expand_more'}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('courses_map')}
                className="text-xs font-bold text-[#2563eb] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                Ver catálogo <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            )}
          </div>
          <div className={`grid grid-cols-1 gap-2 ${fillCourses ? 'lg:flex-1 lg:grid-rows-3' : 'content-start'}`}>
            {visibleCourseCards.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      </div>

      {/* Row 3: achievements and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch lg:flex-1 lg:max-h-[210px]">
        <div className="lg:col-span-6 flex">
          <InfoCard
            icon="emoji_events"
            iconClassName="text-amber-500"
            title="Logros recientes"
            action={{ label: 'Ver todos', onClick: () => onNavigate('profile') }}
            className="bg-white border-[#e2e8f0] w-full"
          >
            {achievements.length > 0 ? (
              <div className="grid grid-cols-4 gap-1.5">
                {achievements.map((a) => (
                  <div key={a.id} className="flex flex-col items-center text-center gap-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        a.unlocked ? '' : 'border-dashed opacity-60'
                      }`}
                      style={{
                        backgroundColor: `${a.color}1a`,
                        borderColor: a.unlocked ? `${a.color}66` : '#cbd5e1',
                        color: a.color,
                      }}
                    >
                      <span className={`material-symbols-outlined text-xl ${a.unlocked ? 'fill' : ''}`}>{a.iconName}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#434655] leading-tight">{a.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#737686]">
                Todavía no desbloqueaste logros. ¡Completá tu primera lección para conseguir el primero!
              </p>
            )}
          </InfoCard>
        </div>

        <div className="lg:col-span-6 flex">
          <InfoCard
            icon="schedule"
            iconClassName="text-slate-500"
            title="Actividad reciente"
            className="bg-white border-[#e2e8f0] w-full"
          >
            {activity.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {activity.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-xs xl:text-[13px]">
                    <span
                      className="material-symbols-outlined fill text-lg shrink-0"
                      style={{ color: item.color }}
                    >
                      {item.iconName}
                    </span>
                    <span className="flex-1 min-w-0 truncate text-[#0b1c30]">{item.text}</span>
                    <span className="text-[11px] text-[#737686] shrink-0">{item.timeAgo}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#737686]">
                Cuando empieces a resolver ejercicios, tu actividad va a aparecer acá.
              </p>
            )}
          </InfoCard>
        </div>

      </div>
    </div>
  );
};