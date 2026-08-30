import React from 'react';
import { ScreenView, UserProfile } from '../types';
import { MASCOT_IMAGES } from '../data/mockData';

interface StudentDashboardProps {
  user: UserProfile;
  onNavigate: (view: ScreenView) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onNavigate }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 pb-28 md:pb-12 flex flex-col gap-6">
      {/* Top Banner / Welcome */}
      <div className="flex justify-between items-center bg-white p-4 md:p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#2563eb] shadow-sm bg-blue-50 flex items-center justify-center">
            <img 
              src={user.avatarUrl || MASCOT_IMAGES.roundAvatar} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#2563eb] uppercase tracking-wider">Estudiante</span>
            <h1 className="font-heading font-bold text-2xl text-[#0b1c30] leading-tight">
              ¡Hola, {user.name}!
            </h1>
            <p className="text-xs text-[#434655]">{user.school} • {user.grade || '4to Año'}</p>
          </div>
        </div>

        <button 
          onClick={() => onNavigate('profile')}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-sm">person</span>
          Ver Perfil
        </button>
      </div>

      {/* Gamification Widgets */}
      <section className="grid grid-cols-2 gap-4 w-full">
        {/* Racha Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-[0px_4px_12px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:border-amber-200 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-3xl shrink-0">
            🔥
          </div>
          <div>
            <p className="text-xs font-bold text-[#737686] uppercase tracking-wider">Racha</p>
            <p className="font-heading font-extrabold text-2xl text-[#0b1c30]">
              {user.streakDays} días
            </p>
          </div>
        </div>

        {/* Experiencia Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-[0px_4px_12px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:border-blue-200 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-amber-500 text-3xl fill">
              stars
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#737686] uppercase tracking-wider">Experiencia</p>
            <p className="font-heading font-extrabold text-2xl text-[#0b1c30]">
              {user.totalXp.toLocaleString()} XP
            </p>
          </div>
        </div>
      </section>

      {/* Continue Learning (Active Course) */}
      <section className="flex flex-col gap-3">
        <h2 className="font-heading font-bold text-xl text-[#0b1c30]">
          Continuar aprendiendo
        </h2>

        <div className="bg-white rounded-2xl border-2 border-[#2563eb] p-6 shadow-[0px_6px_20px_rgba(37,99,235,0.08)] flex flex-col gap-4 relative overflow-hidden group">
          {/* Subtle decorative background blur */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-100/60 rounded-full blur-2xl group-hover:bg-blue-200/60 transition-colors pointer-events-none" />

          <div className="flex justify-between items-start z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100/80 text-amber-900 border border-amber-200">
                <span className="material-symbols-outlined text-sm">code</span>
                Python
              </span>
              <h3 className="font-heading font-bold text-2xl text-[#0b1c30] mt-3">
                Unidad 2 - Variables
              </h3>
              <p className="text-sm text-[#434655] mt-1">
                Aprende a guardar información en la memoria de tu programa.
              </p>
            </div>

            <div className="hidden sm:block w-16 h-16 shrink-0 animate-float">
              <img 
                src={MASCOT_IMAGES.thumbsUp} 
                alt="Carpincho" 
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 z-10 mt-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[#434655]">Progreso de la unidad</span>
              <span className="text-[#2563eb] font-bold">45%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#2563eb] rounded-full transition-all duration-1000 ease-out" 
                style={{ width: '45%' }}
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between z-10 pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigate('unit_detail')}
              className="text-xs font-semibold text-[#434655] hover:text-[#2563eb] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">list_alt</span>
              Ver ejercicios de la unidad
            </button>

            <button
              onClick={() => onNavigate('exercise')}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.25)] border-b-2 border-[#1e40af] active:border-b-0 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Continuar</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tus Cursos List */}
      <section className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="font-heading font-bold text-xl text-[#0b1c30]">
            Tus Cursos
          </h2>
          <button
            onClick={() => onNavigate('courses_map')}
            className="text-xs font-bold text-[#2563eb] hover:underline flex items-center gap-0.5"
          >
            Ver catálogo completo <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Course 1: JS */}
          <div 
            onClick={() => onNavigate('course_roadmap')}
            className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
              <span className="font-heading font-extrabold text-xl text-amber-700">JS</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-base text-[#0b1c30] truncate group-hover:text-[#2563eb] transition-colors">
                JavaScript Básico
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                </div>
                <span className="text-xs font-bold text-emerald-600">100%</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-[#2563eb] group-hover:translate-x-0.5 transition-all">
              chevron_right
            </span>
          </div>

          {/* Course 2: C++ */}
          <div 
            onClick={() => onNavigate('course_roadmap')}
            className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
              <span className="font-heading font-extrabold text-base text-blue-700">C++</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-base text-[#0b1c30] truncate group-hover:text-[#2563eb] transition-colors">
                Introducción a C++
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563eb] rounded-full" style={{ width: '10%' }} />
                </div>
                <span className="text-xs font-bold text-[#2563eb]">10%</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-[#2563eb] group-hover:translate-x-0.5 transition-all">
              chevron_right
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
