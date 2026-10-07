import React, { useState } from 'react';
import { AchievementBadge, Course, ScreenView, UserProfile } from '../types';
import { DEMO_STUDENT_HOME, MASCOT_IMAGES } from '../data/mockData';
import { EditProfileModal } from './Modals/EditProfileModal';

interface StudentProfileViewProps {
  user: UserProfile;
  badges: AchievementBadge[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (view: ScreenView) => void;
  // Real students: their assigned courses. Without it (demo mode) the example
  // courses from DEMO_STUDENT_HOME are shown.
  courses?: Course[];
  onOpenCourse?: (course: Course) => void;
}

interface CourseCardModel {
  id: string;
  title: string;
  color: string;
  percent: number;
  icon: React.ReactNode;
  onClick: () => void;
}

/** Tarjeta pequeña de estadística (racha, experiencia, progreso). */
const StatCard: React.FC<{
  className: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}> = ({ className, icon, label, value, note }) => (
  <div className={`rounded-2xl border px-3 py-3 flex items-center gap-2.5 min-w-0 ${className}`}>
    <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shrink-0 text-xl">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-[#737686] uppercase tracking-wider">{label}</p>
      <p className="font-heading font-extrabold text-base text-[#0b1c30] leading-tight whitespace-nowrap">{value}</p>
      <p className="text-[10px] text-[#737686] truncate">{note}</p>
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
            className="h-full rounded-full"
            style={{ width: `${course.percent}%`, backgroundColor: course.color }}
          />
        </div>
        <span className="text-[11px] font-bold text-[#434655] w-8 text-right">{course.percent}%</span>
      </div>
    </div>
    <span className="material-symbols-outlined text-lg text-slate-400 group-hover:text-[#2563eb] group-hover:translate-x-0.5 transition-all">
      chevron_right
    </span>
  </button>
);

/** Dato de la cuenta: icono, etiqueta y valor. */
const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2.5 min-w-0 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 text-slate-500 flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-lg">{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-[#737686] uppercase tracking-wider">{label}</p>
      <p className="text-[13px] font-semibold text-[#0b1c30] truncate">{value}</p>
    </div>
  </div>
);

/** Contenedor de las tarjetas de contenido (insignias, datos, cursos). */
const Panel: React.FC<{
  icon: string;
  iconClassName: string;
  title: string;
  action?: { label: string; icon: string; onClick: () => void };
  className?: string;
  children: React.ReactNode;
}> = ({ icon, iconClassName, title, action, className = '', children }) => (
  <section className={`bg-white rounded-2xl border border-[#e2e8f0] shadow-sm px-4 py-3 flex flex-col gap-2.5 min-w-0 w-full ${className}`}>
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
          {action.label} <span className="material-symbols-outlined text-sm">{action.icon}</span>
        </button>
      )}
    </div>
    <div className="flex-1 flex flex-col justify-center">{children}</div>
  </section>
);

/**
 * Perfil del alumno, a pantalla completa en escritorio.
 * Tres filas: identidad + estadísticas; insignias + datos de la cuenta;
 * cursos + acceso al catálogo. Las filas 2 y 3 se estiran para ocupar el alto
 * de la ventana (con un tope).
 */
export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  user,
  badges,
  onUpdateProfile,
  onNavigate,
  courses,
  onOpenCourse
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isDemo = !courses;
  const unlockedBadges = badges.filter((badge) => badge.unlocked).length;
  const hasAssignedCourses = user.assignedCourseIds.length > 0;
  const schoolAndGrade = [user.school, user.grade].filter(Boolean).join(' • ');
  const fullName = `${user.name} ${user.lastName}`.trim();

  // ----- Courses (max. 6) -----
  const courseCards: CourseCardModel[] = isDemo
    ? DEMO_STUDENT_HOME.courses.map((c) => ({
        id: c.id,
        title: c.title,
        color: c.color,
        percent: c.percent,
        icon: <span>{c.initials}</span>,
        onClick: () => onNavigate('course_roadmap'),
      }))
    : (courses ?? []).slice(0, 6).map((c) => ({
        id: c.id,
        title: c.title,
        color: c.color,
        percent: c.progressPercent,
        icon: c.logoUrl
          ? <img src={c.logoUrl} alt="" className="w-6 h-6 object-contain" />
          : <span className="material-symbols-outlined text-xl">{c.iconName}</span>,
        onClick: () => onOpenCourse?.(c),
      }));

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-28 md:pb-5 flex-1 flex flex-col gap-4">
      {/* Row 1: identity + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7 min-w-0">
          <div className="h-full w-full bg-gradient-to-r from-[#0b1c30] via-[#0d223a] to-[#122e4e] px-4 py-3 rounded-2xl border border-white/10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 bg-white/10 shrink-0 shadow-md cursor-pointer hover:border-white/40 transition-colors"
                aria-label="Editar perfil"
              >
                <img
                  src={user.avatarUrl || MASCOT_IMAGES.roundAvatar}
                  alt={`Foto de ${user.name}`}
                  className="w-full h-full object-cover select-none"
                />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="font-heading font-bold text-white leading-tight truncate text-lg xl:text-xl">{fullName}</h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-[#ffb95f] uppercase tracking-wider bg-[#ffb95f]/15 border border-[#ffb95f]/40 px-2 py-0.5 rounded-md shrink-0">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Estudiante
                  </span>
                </div>
                <p className="text-xs text-slate-300 truncate">{schoolAndGrade || 'Alumno'}</p>
                <p className="text-xs text-blue-100/80 mt-1 leading-snug line-clamp-2 max-w-xl">
                  {hasAssignedCourses
                    ? `Alumno regular${user.school ? ` en ${user.school}` : ''}. Ha alcanzado un ${user.generalProgress}% de progreso general en la plataforma con una racha activa constante.`
                    : `Alumno${user.school ? ` en ${user.school}` : ''}. Todavía no tiene cursos asignados.`}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-stretch gap-2 shrink-0">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn-game-amber px-4 py-1.5 text-xs flex items-center justify-center gap-1.5"
              >
                <span>Editar Perfil</span>
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-xs font-semibold text-blue-200 hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Volver al Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
          <StatCard
            className="bg-amber-50 border-amber-100"
            icon="🔥"
            label="Racha"
            value={`${user.streakDays} días`}
            note={user.streakDays > 0 ? '¡Vas muy bien!' : '¡Empezá hoy!'}
          />
          <StatCard
            className="bg-blue-50 border-blue-100"
            icon={<span className="material-symbols-outlined text-amber-500 text-2xl fill">stars</span>}
            label="Experiencia"
            value={`${user.totalXp.toLocaleString()} XP`}
            note={user.totalXp > 0 ? 'Seguí así' : 'Ganá tu primer XP'}
          />
          <StatCard
            className="bg-emerald-50 border-emerald-100"
            icon={<span className="material-symbols-outlined text-emerald-600 text-2xl">trending_up</span>}
            label="Progreso"
            value={`${user.generalProgress}%`}
            note="Progreso general"
          />
        </div>
      </div>

      {/* Row 2: badges + account data */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch lg:flex-1 lg:max-h-[280px]">
        <div className="lg:col-span-7 flex">
          <Panel
            icon="military_tech"
            iconClassName="text-amber-500"
            title="Insignias & Logros"
          >
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-start justify-items-center">
                {badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center text-center gap-1.5 group">
                    <div
                      className={`w-14 h-14 xl:w-16 xl:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                        badge.unlocked
                          ? 'bg-gradient-to-br from-[#fff7ed] via-[#ffedd5] to-[#fde68a] border-3 border-[#ffb95f] shadow-[0_4px_14px_rgba(255,185,95,0.45)] group-hover:scale-105'
                          : 'bg-slate-100 border-2 border-dashed border-slate-300 opacity-55'
                      }`}
                      title={badge.unlocked ? `Desbloqueado: ${badge.title}` : `Bloqueado: ${badge.title}`}
                    >
                      <span
                        className={`material-symbols-outlined text-2xl ${badge.unlocked ? 'fill text-amber-600' : 'text-slate-400'}`}
                      >
                        {badge.iconName}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xs text-[#0b1c30]">{badge.title}</h3>
                      <p className="text-[10px] font-semibold" style={{ color: badge.unlocked ? '#b45309' : '#94a3b8' }}>
                        {badge.unlocked ? (badge.unlockedAt ? `Obtenida: ${badge.unlockedAt}` : 'Completado') : 'Bloqueado'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-[11px] font-bold text-blue-700">
                {unlockedBadges} / {badges.length} desbloqueadas
              </p>
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-5 flex">
          <Panel
            icon="badge"
            iconClassName="text-slate-500"
            title="Mis datos"
            action={{ label: 'Editar', icon: 'edit', onClick: () => setIsEditModalOpen(true) }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <InfoRow icon="mail" label="Email" value={user.email} />
              <InfoRow icon="school" label="Institución" value={user.school || 'Sin institución'} />
              <InfoRow icon="grade" label="Año" value={user.grade || 'Sin definir'} />
              <InfoRow icon="person" label="Rol" value="Estudiante" />
            </div>
          </Panel>
        </div>
      </div>

      {/* Row 3: courses + catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch lg:flex-1 lg:max-h-[240px]">
        <div className="lg:col-span-8 flex">
          <Panel
            icon="menu_book"
            iconClassName="text-blue-600"
            title="Mis cursos"
            action={{ label: 'Ver todos', icon: 'arrow_forward', onClick: () => onNavigate('courses_map') }}
          >
            {courseCards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {courseCards.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#737686]">
                Todavía no tenés cursos asignados. Cuando un administrador te asigne uno, va a aparecer acá.
              </p>
            )}
          </Panel>
        </div>

        <div className="lg:col-span-4 flex">
          <button
            onClick={() => onNavigate('courses_map')}
            className="w-full bg-white rounded-2xl border-2 border-dashed border-slate-200 p-4 flex flex-col items-center justify-center gap-2 text-center hover:border-[#2563eb] hover:bg-blue-50/30 transition-all cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">explore</span>
            </div>
            <h3 className="font-heading font-bold text-sm text-[#0b1c30]">Explorar catálogo completo</h3>
            <p className="text-xs text-[#737686]">Revisá los cursos de Python, JavaScript, Java y más.</p>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={onUpdateProfile}
      />
    </div>
  );
};