import React, { useState } from 'react';
import { ScreenView, UserProfile } from '../types';
import { BADGES, MASCOT_IMAGES } from '../data/mockData';
import { EditProfileModal } from './Modals/EditProfileModal';

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
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-32">
      <main className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Profile Card & Badges */}
        <section className="md:col-span-4 lg:col-span-4 flex flex-col gap-5">
          {/* Main User Card */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-[0px_4px_16px_rgba(0,0,0,0.04)] p-6 flex flex-col items-center text-center relative">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Configuración de perfil"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>

            <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-blue-100 shadow-sm">
              <img 
                src={user.avatarUrl || MASCOT_IMAGES.roundAvatar} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="font-heading font-bold text-2xl text-[#0b1c30] mb-0.5">
              {user.name} {user.lastName}
            </h1>
            <p className="text-xs md:text-sm text-[#434655] flex items-center gap-1 justify-center mb-4">
              <span className="material-symbols-outlined text-base text-[#2563eb]">school</span>
              {user.school} • {user.grade || '4to Año'}
            </p>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full py-2.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.25)] border-b-2 border-[#1e40af] active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Editar Perfil
            </button>
          </div>

          {/* Quick Streak & XP Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-amber-500 text-3xl mb-1 fill">
                local_fire_department
              </span>
              <span className="font-heading font-extrabold text-2xl text-[#0b1c30]">
                {user.streakDays}
              </span>
              <span className="text-xs font-semibold text-[#737686]">Racha de Días</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[#2563eb] text-3xl mb-1 fill">
                star
              </span>
              <span className="font-heading font-extrabold text-2xl text-[#0b1c30]">
                {user.totalXp.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-[#737686]">XP Total</span>
            </div>
          </div>

          {/* Recent Badges / Medallas Recientes */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5">
            <h2 className="font-heading font-bold text-base text-[#0b1c30] mb-3">
              Medallas Recientes
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {BADGES.map((badge) => (
                <div
                  key={badge.id}
                  className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105 ${
                    badge.unlocked 
                      ? 'border border-slate-200 shadow-sm' 
                      : 'border-2 border-dashed border-slate-300 opacity-50 bg-slate-50'
                  }`}
                  style={{ backgroundColor: badge.unlocked ? badge.bgColor : undefined }}
                  title={badge.title}
                >
                  <span 
                    className={`material-symbols-outlined text-2xl ${badge.unlocked ? 'fill' : ''}`}
                    style={{ color: badge.unlocked ? badge.color : '#94a3b8' }}
                  >
                    {badge.iconName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Enrolled Courses & Tips */}
        <section className="md:col-span-8 lg:col-span-8 flex flex-col gap-6">
          <h2 className="font-heading font-bold text-2xl text-[#0b1c30]">
            Mis Cursos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Course 1: JavaScript */}
            <div 
              onClick={() => onNavigate('course_roadmap')}
              className="bg-white rounded-2xl border-2 border-[#2563eb] shadow-[0px_4px_16px_rgba(37,99,235,0.08)] p-5 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0" />
              
              <div className="z-10">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-heading font-bold text-lg">
                    JS
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-[#003ea8] font-bold text-[11px] rounded-lg">
                    En progreso
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-[#0b1c30] group-hover:text-[#2563eb] transition-colors">
                  Fundamentos de JavaScript
                </h3>
                <p className="text-xs text-[#434655] mt-1 mb-4">
                  Variables, ciclos y tu primer script en el navegador.
                </p>
              </div>

              <div className="z-10 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs font-semibold text-[#434655] mb-1">
                  <span>Progreso</span>
                  <span className="text-[#2563eb] font-bold">65%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563eb] rounded-full w-[65%]" />
                </div>
              </div>
            </div>

            {/* Course 2: CSS */}
            <div 
              onClick={() => onNavigate('course_roadmap')}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="z-10">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-heading font-bold text-lg">
                    CSS
                  </div>
                </div>
                <h3 className="font-heading font-bold text-lg text-[#0b1c30] group-hover:text-[#2563eb] transition-colors">
                  Diseño Web con CSS
                </h3>
                <p className="text-xs text-[#434655] mt-1 mb-4">
                  Colores, layouts modernos y Flexbox.
                </p>
              </div>

              <div className="z-10 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs font-semibold text-[#434655] mb-1">
                  <span>Progreso</span>
                  <span className="text-[#2563eb] font-bold">20%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563eb] rounded-full w-[20%]" />
                </div>
              </div>
            </div>

            {/* Course 3: Explorar más */}
            <div 
              onClick={() => onNavigate('courses_map')}
              className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center opacity-75 hover:opacity-100 hover:border-[#2563eb] transition-all cursor-pointer col-span-1 md:col-span-2 min-h-[120px]"
            >
              <span className="material-symbols-outlined text-3xl text-[#2563eb] mb-1">
                add_circle
              </span>
              <h3 className="font-heading font-bold text-base text-[#0b1c30]">
                Explorar más cursos
              </h3>
            </div>
          </div>

          {/* Tip de Carpincho Card */}
          <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center gap-5 shadow-sm">
            <div className="w-20 h-20 flex-shrink-0 hidden sm:block">
              <img 
                src={MASCOT_IMAGES.cornerPeek} 
                alt="Carpincho Tip" 
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-[#004ac6] mb-1 flex items-center gap-1.5">
                <span className="text-base">🦫</span>
                Tip de Carpincho
              </h4>
              <p className="text-xs md:text-sm text-[#434655] leading-relaxed">
                ¡Estás muy cerca de completar tu primer módulo de JavaScript! Dedica 15 minutos hoy para ganar tu próxima medalla de <strong>Mago del Código</strong>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={onUpdateProfile}
      />
    </div>
  );
};
