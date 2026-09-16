import React, { useState } from 'react';
import { ScreenView, UserProfile } from '../types';
import { BADGES, MASCOT_IMAGES } from '../data/mockData';
import { EditProfileModal } from './Modals/EditProfileModal';
import { StatusHud } from './ui/StatusHud';
import { ColorBlockHero } from './ui/ColorBlockHero';

interface StudentProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (view: ScreenView) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  user,
  onUpdateProfile,
  onNavigate
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 pb-32 flex flex-col gap-6">
      {/* Top Status HUD */}
      <StatusHud
        avatarUrl={user.avatarUrl || MASCOT_IMAGES.roundAvatar}
        badgeText="Perfil de Usuario"
        title={`${user.name} ${user.lastName}`}
        subtitle={`${user.school} • ${user.grade || '4to Año'}`}
        onAvatarClick={() => setIsEditModalOpen(true)}
      >
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-100 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition-all border border-white/15 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">settings</span>
          <span>Configuración</span>
        </button>
      </StatusHud>

      {/* Profile Summary with ColorBlockHero (Avatar Variant) */}
      <ColorBlockHero
        tag="Estudiante PlayCode"
        tagIcon="verified"
        title={`${user.name} ${user.lastName}`}
        description={`Alumno regular en ${user.school}. Ha alcanzado un ${user.generalProgress || 78}% de progreso general en la plataforma con una racha activa constante.`}
        imageSrc={user.avatarUrl || MASCOT_IMAGES.roundAvatar}
        imageAlt={`Foto de ${user.name}`}
        imageVariant="avatar"
        progressElement={
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md pt-1">
            <div className="bg-[#0b1c30]/50 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
                🔥
              </div>
              <div>
                <p className="text-[11px] font-semibold text-blue-200">Racha Actual</p>
                <p className="font-heading font-extrabold text-xl text-[#ffb95f]">{user.streakDays} días</p>
              </div>
            </div>

            <div className="bg-[#0b1c30]/50 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber-300 text-2xl fill">stars</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-blue-200">Experiencia Total</p>
                <p className="font-heading font-extrabold text-xl text-white">{user.totalXp.toLocaleString()} XP</p>
              </div>
            </div>
          </div>
        }
        actions={
          <>
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-xs font-semibold text-blue-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">dashboard</span>
              <span>Volver al Dashboard</span>
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn-game-amber px-5 py-2.5 text-xs flex items-center gap-1.5"
            >
              <span>Editar Perfil</span>
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </>
        }
      />

      {/* Badges / Insignias Section (Circular Medallions) */}
      <section className="bg-white rounded-3xl border border-[#e2e8f0] shadow-sm p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-heading font-bold text-2xl text-[#0b1c30] flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 fill text-2xl">
                military_tech
              </span>
              Insignias &amp; Logros
            </h2>
            <p className="text-xs text-[#737686] mt-0.5">
              Medallones desbloqueados al completar módulos y sostener rachas de aprendizaje.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full self-start sm:self-auto">
            3 / 4 Desbloqueadas
          </span>
        </div>

        {/* Circular Medallions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-start justify-items-center">
          {BADGES.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center text-center gap-2.5 group">
              {/* Circular Medallion */}
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-[#fff7ed] via-[#ffedd5] to-[#fde68a] border-3 border-[#ffb95f] shadow-[0_4px_16px_rgba(255,185,95,0.45)] group-hover:scale-105 group-hover:shadow-[0_6px_22px_rgba(255,185,95,0.6)]'
                    : 'bg-slate-100 border-2 border-dashed border-slate-300 opacity-55'
                }`}
                title={badge.unlocked ? `Desbloqueado: ${badge.title}` : `Bloqueado: ${badge.title}`}
              >
                {/* Glow ring for unlocked medals */}
                {badge.unlocked && (
                  <div className="absolute inset-0 rounded-full border border-amber-300/60 animate-ping opacity-25 pointer-events-none" />
                )}

                <span
                  className={`material-symbols-outlined text-3xl sm:text-4xl ${badge.unlocked ? 'fill text-amber-600' : 'text-slate-400'}`}
                >
                  {badge.iconName}
                </span>
              </div>

              {/* Title & Status */}
              <div>
                <h3 className="font-heading font-bold text-sm text-[#0b1c30]">
                  {badge.title}
                </h3>
                <p className="text-[11px] font-semibold mt-0.5" style={{ color: badge.unlocked ? '#b45309' : '#94a3b8' }}>
                  {badge.unlocked ? (badge.unlockedAt ? `Obtenida: ${badge.unlockedAt}` : 'Completado') : 'Bloqueado'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mis Cursos & Activity Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Course Card */}
        <div 
          onClick={() => onNavigate('course_roadmap')}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-heading font-bold text-lg">
                HTML
              </div>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-md border border-blue-200 uppercase">
                En curso
              </span>
            </div>
            <h3 className="font-heading font-bold text-lg text-[#0b1c30] group-hover:text-[#2563eb] transition-colors">
              Programación 1: HTML &amp; CSS
            </h3>
            <p className="text-xs text-[#434655] mt-1 mb-4">
              Fundamentos de programación, variables y estructuras web.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs font-semibold text-[#434655] mb-1">
              <span>Progreso del curso</span>
              <span className="text-[#2563eb] font-bold">50%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#2563eb] rounded-full w-1/2" />
            </div>
          </div>
        </div>

        {/* Explore More Courses */}
        <div 
          onClick={() => onNavigate('courses_map')}
          className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center hover:border-[#2563eb] hover:bg-blue-50/30 transition-all cursor-pointer min-h-[160px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-2xl">
              explore
            </span>
          </div>
          <h3 className="font-heading font-bold text-base text-[#0b1c30]">
            Explorar Catálogo Completo
          </h3>
          <p className="text-xs text-[#737686] mt-1">
            Revisa los cursos de Python, JavaScript, Java y más.
          </p>
        </div>
      </section>

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
