import React from 'react';
import { ScreenView } from '../types';
import { MASCOT_IMAGES } from '../data/mockData';

interface CourseRoadmapViewProps {
  onNavigate: (view: ScreenView) => void;
}

export const CourseRoadmapView: React.FC<CourseRoadmapViewProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-8 pb-32 relative">
      {/* Back button */}
      <button
        onClick={() => onNavigate('courses_map')}
        className="inline-flex items-center text-xs font-semibold text-[#004ac6] hover:text-[#2563eb] mb-4 gap-1 group"
      >
        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
          arrow_back
        </span>
        Volver al mapa de cursos
      </button>

      {/* Course Header Banner */}
      <div className="mb-10 text-center bg-white p-6 md:p-8 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-[#004ac6] mb-3 shadow-inner border border-blue-100">
          <span className="material-symbols-outlined text-4xl fill">
            terminal
          </span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-[#0b1c30] mb-1">
          Programación 1
        </h1>
        <p className="text-sm text-[#434655]">
          Fundamentos y lógica de programación
        </p>

        {/* Overall Progress */}
        <div className="mt-6 bg-[#f8f9ff] p-4 rounded-xl border border-[#e2e8f0] max-w-md mx-auto">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-[#434655]">Progreso del curso</span>
            <span className="text-[#2563eb] font-bold">25%</span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#2563eb] rounded-full w-1/4 transition-all duration-700" />
          </div>
        </div>
      </div>

      {/* Learning Path Tree */}
      <div className="relative py-4">
        {/* Central connecting line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-12 w-1 bg-slate-200 z-0">
          <div className="w-full bg-[#2563eb] h-[45%] rounded-full transition-all duration-1000" />
        </div>

        {/* Unit 1: Completed */}
        <div 
          onClick={() => onNavigate('unit_detail')}
          className="relative z-10 flex flex-col items-center mb-12 group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-md border-4 border-[#f8f9ff] z-10 mb-2 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-2xl fill">
              check_circle
            </span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm w-full max-w-sm text-center group-hover:border-emerald-400 transition-colors">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Completado</span>
            <h3 className="font-heading font-bold text-lg text-[#0b1c30]">
              Unidad 1
            </h3>
            <p className="text-xs text-[#434655]">Introducción & Estructura</p>
          </div>
        </div>

        {/* Unit 2: In Progress (Active) */}
        <div className="relative z-10 flex flex-col items-center mb-12 group">
          <div 
            onClick={() => onNavigate('unit_detail')}
            className="w-18 h-18 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-lg border-4 border-[#f8f9ff] z-10 mb-2 ring-4 ring-blue-200 cursor-pointer transition-transform group-hover:scale-105"
          >
            <span className="material-symbols-outlined text-4xl fill ml-0.5">
              play_arrow
            </span>
          </div>
          <div className="bg-white rounded-2xl p-5 border-2 border-[#2563eb] shadow-[0px_8px_24px_rgba(37,99,235,0.12)] w-full max-w-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2563eb] to-blue-400" />
            <span className="text-[11px] font-bold text-[#2563eb] uppercase tracking-wider">En Curso • 50%</span>
            <h3 className="font-heading font-bold text-xl text-[#0b1c30] mt-0.5">
              Unidad 2
            </h3>
            <p className="text-sm font-semibold text-[#2563eb] mb-3">Variables & Lógica</p>
            <button
              onClick={() => onNavigate('unit_detail')}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm py-2.5 px-6 rounded-xl w-full shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              Continuar Unidad
            </button>
          </div>
        </div>

        {/* Unit 3: Locked */}
        <div className="relative z-10 flex flex-col items-center mb-12 opacity-60">
          <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shadow-sm border-4 border-[#f8f9ff] z-10 mb-2">
            <span className="material-symbols-outlined text-2xl fill">
              lock
            </span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 w-full max-w-sm text-center">
            <h3 className="font-heading font-bold text-base text-slate-700">
              Unidad 3
            </h3>
            <p className="text-xs text-slate-500">Condicionales (if / else)</p>
          </div>
        </div>

        {/* Unit 4: Locked */}
        <div className="relative z-10 flex flex-col items-center opacity-60">
          <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shadow-sm border-4 border-[#f8f9ff] z-10 mb-2">
            <span className="material-symbols-outlined text-2xl fill">
              lock
            </span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 w-full max-w-sm text-center">
            <h3 className="font-heading font-bold text-base text-slate-700">
              Unidad 4
            </h3>
            <p className="text-xs text-slate-500">Bucles (for & while)</p>
          </div>
        </div>
      </div>

      {/* Mascot Hint Floating Bubble */}
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-30 flex items-end gap-2 animate-bounce" style={{ animationDuration: '3.5s' }}>
        <div className="bg-white p-3.5 rounded-2xl rounded-br-none shadow-lg border border-slate-200 w-48 text-xs text-[#0b1c30] leading-relaxed">
          ¡Sigue así! Estás a punto de dominar las variables.
        </div>
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#2563eb] shadow-lg bg-white shrink-0">
          <img 
            src={MASCOT_IMAGES.thumbsUp} 
            alt="Carpincho Thumbs Up" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
