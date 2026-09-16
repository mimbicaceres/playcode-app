import React from 'react';
import { ScreenView, UserProfile } from '../types';
import { MASCOT_IMAGES } from '../data/mockData';
import { StatusHud } from './ui/StatusHud';
import { ColorBlockHero } from './ui/ColorBlockHero';
import { SegmentedProgressBar } from './ui/SegmentedProgressBar';

interface StudentDashboardProps {
  user: UserProfile;
  onNavigate: (view: ScreenView) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onNavigate }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 pb-28 md:pb-12 flex flex-col gap-6">
      {/* Top Status HUD */}
      <StatusHud
        avatarUrl={user.avatarUrl || MASCOT_IMAGES.roundAvatar}
        badgeText="Estudiante"
        title={`¡Hola, ${user.name}!`}
        subtitle={`${user.school} • ${user.grade || '4to Año'}`}
        onAvatarClick={() => onNavigate('profile')}
      >
        <button 
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-100 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition-all border border-white/15 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">person</span>
          <span>Ver Perfil</span>
        </button>
      </StatusHud>

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

      {/* Continue Learning Hero Block */}
      <section className="flex flex-col gap-3">
        <h2 className="font-heading font-bold text-xl text-[#0b1c30]">
          Continuar aprendiendo
        </h2>

        <ColorBlockHero
          tag="Python"
          tagIcon="code"
          title="Unidad 2 - Variables"
          description="Aprende a guardar información en la memoria de tu programa."
          imageSrc={MASCOT_IMAGES.thumbsUp}
          imageAlt="Carpincho"
          progressElement={
            <SegmentedProgressBar 
              completedSegments={9}
              totalSegments={20}
              percentage={45}
              label="Progreso de la unidad"
            />
          }
          actions={
            <>
              <button
                onClick={() => onNavigate('unit_detail')}
                className="text-xs font-semibold text-blue-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">list_alt</span>
                <span>Ver ejercicios de la unidad</span>
              </button>

              <button
                onClick={() => onNavigate('exercise')}
                className="btn-game-amber px-6 py-2.5 text-sm flex items-center gap-2"
              >
                <span>Continuar</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </>
          }
        />
      </section>

      {/* Tus Cursos List */}
      <section className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="font-heading font-bold text-xl text-[#0b1c30]">
            Tus Cursos
          </h2>
          <button
            onClick={() => onNavigate('courses_map')}
            className="text-xs font-bold text-[#2563eb] hover:underline flex items-center gap-0.5 cursor-pointer"
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