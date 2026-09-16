import React from 'react';
import { ScreenView } from '../types';
import { MASCOT_IMAGES } from '../data/mockData';
import { StatusHud } from './ui/StatusHud';
import { SegmentedProgressBar } from './ui/SegmentedProgressBar';

interface CourseRoadmapViewProps {
  onNavigate: (view: ScreenView) => void;
}

export const CourseRoadmapView: React.FC<CourseRoadmapViewProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 pb-28 md:pb-12 flex flex-col gap-6">
      {/* Top Status HUD */}
      <StatusHud
        avatarIcon="terminal"
        badgeText="Ruta de Aprendizaje"
        title="Programación 1"
        subtitle="Fundamentos y lógica de programación • Nivel Inicial"
      >
        <button
          onClick={() => onNavigate('courses_map')}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-100 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition-all border border-white/15 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Volver a Cursos</span>
        </button>
      </StatusHud>

      {/* Segmented Progress Card (20 segments) */}
      <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <SegmentedProgressBar
          totalSegments={20}
          completedSegments={5}
          percentage={25}
          label="Progreso general del curso"
        />
      </div>

      {/* PROTAGONIST: Learning Path Tree & Sendero */}
      <div className="relative py-8 px-4 bg-sendero-pattern rounded-3xl border border-[#e2e8f0]/90 shadow-sm">
        {/* Central connecting pathway line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-12 bottom-20 w-1 border-r-2 border-dashed border-blue-300/70 z-0">
          <div className="w-full bg-[#2563eb] h-[42%] rounded-full transition-all duration-1000" />
        </div>

        {/* Unit 1: Completed */}
        <div 
          onClick={() => onNavigate('unit_detail')}
          className="relative z-10 flex flex-col items-center mb-12 group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-md border-4 border-white z-10 mb-2 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-2xl fill">
              check_circle
            </span>
          </div>
          <div className="soft-card rounded-2xl p-4 border-emerald-200 w-full max-w-sm text-center group-hover:border-emerald-400 transition-colors shadow-xs">
            <span className="text-[11px] font-bold text-[#00714d] uppercase tracking-wider">Completado</span>
            <h3 className="font-heading font-bold text-lg text-[#0b1c30]">
              Unidad 1
            </h3>
            <p className="text-xs text-[#434655]">Introducción & Estructura HTML</p>
          </div>
        </div>

        {/* Unit 2: In Progress (Active) - Mascot stands HERE exclusively */}
        <div className="relative z-10 flex flex-col items-center mb-12 group">
          <div 
            onClick={() => onNavigate('unit_detail')}
            className="w-16 h-16 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-lg border-4 border-white z-10 mb-2 ring-4 ring-blue-100 cursor-pointer transition-transform group-hover:scale-105"
          >
            <span className="material-symbols-outlined text-3xl fill ml-0.5">
              play_arrow
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-[#2563eb] shadow-[0px_8px_24px_rgba(37,99,235,0.12)] w-full max-w-sm text-center relative overflow-visible">
            {/* Single Mascot placement on active node */}
            <div className="absolute -top-10 right-4 w-18 h-18 animate-peek pointer-events-none drop-shadow-md">
              <img 
                src={MASCOT_IMAGES.thumbsUp} 
                alt="Carpincho en progreso" 
                className="w-full h-full object-contain"
              />
            </div>

            <span className="inline-block text-[11px] font-bold text-[#2563eb] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              En Curso • 50%
            </span>
            <h3 className="font-heading font-bold text-xl text-[#0b1c30] mt-2">
              Unidad 2
            </h3>
            <p className="text-xs font-semibold text-[#2563eb] mb-4">Variables & Lógica</p>
            
            {/* 3D Tactile CTA */}
            <button
              onClick={() => onNavigate('unit_detail')}
              className="btn-game-primary py-3 px-6 text-sm w-full flex items-center justify-center gap-2"
            >
              <span>Continuar Unidad</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Unit 3: Locked */}
        <div className="relative z-10 flex flex-col items-center mb-12 opacity-60">
          <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shadow-xs border-4 border-white z-10 mb-2">
            <span className="material-symbols-outlined text-2xl fill">
              lock
            </span>
          </div>
          <div className="soft-card rounded-2xl p-4 border-slate-200 w-full max-w-sm text-center">
            <h3 className="font-heading font-bold text-base text-slate-700">
              Unidad 3
            </h3>
            <p className="text-xs text-slate-500">Condicionales (if / else)</p>
          </div>
        </div>

        {/* Unit 4: Locked */}
        <div className="relative z-10 flex flex-col items-center opacity-60">
          <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shadow-xs border-4 border-white z-10 mb-2">
            <span className="material-symbols-outlined text-2xl fill">
              lock
            </span>
          </div>
          <div className="soft-card rounded-2xl p-4 border-slate-200 w-full max-w-sm text-center">
            <h3 className="font-heading font-bold text-base text-slate-700">
              Unidad 4
            </h3>
            <p className="text-xs text-slate-500">Bucles (for & while)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
