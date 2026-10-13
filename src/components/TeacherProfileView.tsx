import React, { useState } from 'react';
import { ScreenView, TeacherCourseRecord, UserProfile } from '../types';
import { MASCOT_IMAGES } from '../data/mockData';
import { EditAvatarModal } from './Modals/EditAvatarModal';

interface TeacherProfileViewProps {
  user: UserProfile;
  courses: TeacherCourseRecord[];
  // Nombre, apellido, escuela son de solo lectura para el docente (los
  // cambia el admin); lo único que puede actualizar es su foto.
  onUpdateAvatar: (avatarDataUrl: string) => Promise<string | null>;
  onNavigate: (view: ScreenView) => void;
}

/**
 * Perfil del docente: identidad (foto editable, datos de solo lectura) y
 * los cursos que tiene a cargo. Mismo criterio que el perfil del alumno:
 * solo el admin puede cambiar nombre/apellido/institución.
 */
export const TeacherProfileView: React.FC<TeacherProfileViewProps> = ({ user, courses, onUpdateAvatar, onNavigate }) => {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const fullName = `${user.name} ${user.lastName}`.trim();
  const totalStudents = new Set(courses.flatMap((c) => c.students.map((s) => s.id))).size;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-28 md:pb-5 flex-1 flex flex-col gap-4">
      {/* Identidad */}
      <div className="bg-gradient-to-r from-[#0b1c30] via-[#0d223a] to-[#122e4e] px-4 py-3 rounded-2xl border border-white/10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={() => setIsAvatarModalOpen(true)}
            className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 bg-white/10 shrink-0 shadow-md cursor-pointer hover:border-white/40 transition-colors"
            aria-label="Cambiar foto de perfil"
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
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-blue-300 uppercase tracking-wider bg-blue-500/15 border border-blue-400/40 px-2 py-0.5 rounded-md shrink-0">
                <span className="material-symbols-outlined text-xs">co_present</span>
                Docente
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate">{user.school || 'Sin institución asignada'}</p>
            <p className="text-xs text-blue-100/80 mt-1 leading-snug">
              {courses.length > 0
                ? `A cargo de ${courses.length} curso${courses.length === 1 ? '' : 's'}, con ${totalStudents} alumno${totalStudents === 1 ? '' : 's'}.`
                : 'Todavía no tiene cursos a cargo.'}
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-stretch gap-2 shrink-0">
          <button
            onClick={() => setIsAvatarModalOpen(true)}
            className="btn-game-amber px-4 py-1.5 text-xs flex items-center justify-center gap-1.5"
          >
            <span>Cambiar foto</span>
            <span className="material-symbols-outlined text-sm">photo_camera</span>
          </button>
          <button
            onClick={() => onNavigate('teacher_dashboard')}
            className="text-xs font-semibold text-blue-200 hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Volver al Inicio</span>
          </button>
        </div>
      </div>

      {/* Cursos a cargo */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm px-4 py-3 flex flex-col gap-2.5">
        <h2 className="font-heading font-bold text-sm text-[#0b1c30] flex items-center gap-1.5">
          <span className="material-symbols-outlined fill text-lg text-blue-600">menu_book</span>
          Cursos a cargo
        </h2>
        {courses.length === 0 ? (
          <p className="text-xs text-[#737686]">Todavía no tenés cursos asignados. Cuando un administrador te asigne uno, va a aparecer acá.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0b1c30] truncate">{course.name}</p>
                  <p className="text-[11px] text-slate-500">{course.students.length} alumno{course.students.length === 1 ? '' : 's'}</p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 shrink-0">
                  {course.averageProgress}%
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <EditAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={user.avatarUrl}
        onSave={onUpdateAvatar}
      />
    </div>
  );
};
