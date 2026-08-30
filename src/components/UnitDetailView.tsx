import React from 'react';
import { ScreenView } from '../types';
import { MASCOT_IMAGES } from '../data/mockData';

interface UnitDetailViewProps {
  onNavigate: (view: ScreenView) => void;
  onSelectExercise?: (exerciseId: string) => void;
}

export const UnitDetailView: React.FC<UnitDetailViewProps> = ({ onNavigate, onSelectExercise }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 pb-32">
      {/* Back Navigation */}
      <div className="mb-4">
        <button
          onClick={() => onNavigate('course_roadmap')}
          className="inline-flex items-center text-xs font-semibold text-[#004ac6] hover:text-[#2563eb] transition-colors group"
        >
          <span className="material-symbols-outlined text-sm mr-1 group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          Volver al curso
        </button>
      </div>

      {/* Unit Header Glass Card */}
      <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden mb-6 border border-slate-200/80 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] bg-white/90">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-200/30 rounded-bl-full pointer-events-none transform translate-x-8 -translate-y-8" />
        
        <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb] bg-blue-50 px-2.5 py-1 rounded-full inline-block mb-2">
          Programación 1
        </span>
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#0b1c30] mb-2">
          Unidad 2: Variables
        </h1>
        <p className="text-sm md:text-base text-[#434655] mb-5 max-w-2xl leading-relaxed">
          Aprende a guardar información en la memoria de tu programa. Las variables son como cajas donde puedes guardar datos para usarlos más tarde.
        </p>

        {/* Progress Bar */}
        <div className="flex items-center gap-4 w-full max-w-md">
          <div className="flex-grow bg-slate-100 rounded-full h-3 overflow-hidden relative">
            <div className="h-full bg-[#2563eb] rounded-full w-1/2 transition-all duration-700" />
          </div>
          <span className="text-xs font-bold text-[#434655] whitespace-nowrap">
            50% completado
          </span>
        </div>
      </div>

      {/* Mascot Hint / Encouragement */}
      <div className="flex items-start gap-4 mb-8 max-w-2xl">
        <div className="w-16 h-16 flex-shrink-0 relative z-10 drop-shadow-md">
          <img 
            src={MASCOT_IMAGES.pointing} 
            alt="Carpincho Tutor" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="bg-white border border-blue-100 rounded-2xl rounded-tl-none p-4 shadow-sm relative mt-2 flex-1">
          <p className="text-sm text-[#0b1c30] leading-relaxed">
            ¡Estás a la mitad del camino! Las variables son clave, asegúrate de entender bien el ejercicio 3 antes de avanzar.
          </p>
        </div>
      </div>

      {/* Exercises Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Exercise 1 (Completed) */}
        <div className="bg-white rounded-2xl p-5 flex flex-col justify-between border-l-4 border-l-[#10B981] border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-heading font-bold text-[#0b1c30] text-base">
                Ejercicio 1: Tu primera variable
              </h3>
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#10B981] text-base fill">
                  check_circle
                </span>
              </div>
            </div>
            <p className="text-xs text-[#434655] mb-4">
              Declara una variable simple de texto.
            </p>
          </div>
          <button 
            onClick={() => {
              if (onSelectExercise) onSelectExercise('ex1');
              onNavigate('exercise');
            }}
            className="w-full py-2.5 bg-slate-100 text-[#434655] font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Revisar
          </button>
        </div>

        {/* Exercise 2 (Completed) */}
        <div className="bg-white rounded-2xl p-5 flex flex-col justify-between border-l-4 border-l-[#10B981] border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-heading font-bold text-[#0b1c30] text-base">
                Ejercicio 2: Números
              </h3>
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#10B981] text-base fill">
                  check_circle
                </span>
              </div>
            </div>
            <p className="text-xs text-[#434655] mb-4">
              Trabaja con variables numéricas enteras.
            </p>
          </div>
          <button 
            onClick={() => {
              if (onSelectExercise) onSelectExercise('ex2');
              onNavigate('exercise');
            }}
            className="w-full py-2.5 bg-slate-100 text-[#434655] font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Revisar
          </button>
        </div>

        {/* Exercise 3 (Active) */}
        <div className="bg-white rounded-2xl p-5 flex flex-col justify-between border-2 border-[#2563eb] shadow-[0px_4px_16px_rgba(37,99,235,0.12)] relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#2563eb] text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-bl-xl">
            ACTUAL
          </div>
          <div>
            <div className="flex items-start gap-2 mb-2 mt-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#2563eb] text-base">
                  code
                </span>
              </div>
              <h3 className="font-heading font-bold text-[#0b1c30] text-base leading-snug">
                Ejercicio 3: Cambiando valores
              </h3>
            </div>
            <p className="text-xs text-[#434655] mb-4">
              Aprende cómo actualizar el valor de una variable que ya ha sido declarada.
            </p>
          </div>
          <button 
            onClick={() => {
              if (onSelectExercise) onSelectExercise('ex3');
              onNavigate('exercise');
            }}
            className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.25)] border-b-2 border-[#1e40af] active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Empezar Ejercicio</span>
            <span className="material-symbols-outlined text-sm">play_arrow</span>
          </button>
        </div>

        {/* Exercise 4 (Locked) */}
        <div className="bg-slate-50/70 rounded-2xl p-5 flex flex-col justify-between opacity-70 border border-dashed border-slate-300">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-heading font-bold text-slate-500 text-base">
                Ejercicio 4: Booleanos
              </h3>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-slate-500 text-base fill">
                  lock
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Verdadero o falso: el tipo de dato más simple.
            </p>
          </div>
          <div className="w-full py-2.5 flex items-center justify-center text-slate-400 font-semibold text-xs bg-slate-100 rounded-xl">
            Bloqueado
          </div>
        </div>
      </div>
    </div>
  );
};
