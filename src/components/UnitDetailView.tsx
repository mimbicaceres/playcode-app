import React from 'react';
import { ScreenView } from '../types';
import { StatusHud } from './ui/StatusHud';

interface UnitDetailViewProps {
  onNavigate: (view: ScreenView) => void;
  onSelectExercise?: (exerciseId: string) => void;
}

export const UnitDetailView: React.FC<UnitDetailViewProps> = ({ onNavigate, onSelectExercise }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 pb-32 flex flex-col gap-6">
      {/* Top Status HUD */}
      <StatusHud
        avatarIcon="code_blocks"
        badgeText="Programación 1 • Unidad 2"
        title="Variables & Asignaciones"
        subtitle="Aprende a guardar y transformar información en la memoria de tu programa"
      >
        <button
          onClick={() => onNavigate('course_roadmap')}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-100 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition-all border border-white/15 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Volver a la Ruta</span>
        </button>
      </StatusHud>

      {/* Unit Overview Card */}
      <div className="soft-card p-6 md:p-8 rounded-3xl border border-[#e2e8f0] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-xl md:text-2xl text-[#0b1c30]">
              Objetivos de la Unidad
            </h2>
            <p className="text-xs md:text-sm text-[#434655] mt-1 max-w-2xl leading-relaxed">
              Las variables son contenedores para almacenar valores de datos (texto, números y booleanos). Al completar estos 4 ejercicios dominarás la declaración, actualización y tipos básicos.
            </p>
          </div>

          <div className="bg-[#f8f9ff] p-3.5 rounded-2xl border border-[#e2e8f0] flex flex-col gap-1.5 min-w-[200px]">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[#434655]">Progreso</span>
              <span className="text-[#2563eb] font-bold">50% (2/4)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#2563eb] rounded-full w-1/2 transition-all duration-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Exercises Bento List (Sober Soft-Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Exercise 1 (Completed) */}
        <div className="bg-white rounded-2xl p-5 flex flex-col justify-between border-l-4 border-l-[#10B981] border-t border-r border-b border-slate-200 shadow-sm transition-all">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-heading font-bold text-[#0b1c30] text-base">
                Ejercicio 1: Tu primera variable
              </h3>
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0 border border-emerald-200">
                <span className="material-symbols-outlined text-sm fill">
                  check_circle
                </span>
              </div>
            </div>
            <p className="text-xs text-[#434655] mb-4">
              Declara una variable simple de texto usando comillas.
            </p>
          </div>
          <button 
            onClick={() => {
              if (onSelectExercise) onSelectExercise('ex1');
              onNavigate('exercise');
            }}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-[#434655] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Revisar solución
          </button>
        </div>

        {/* Exercise 2 (Completed) */}
        <div className="bg-white rounded-2xl p-5 flex flex-col justify-between border-l-4 border-l-[#10B981] border-t border-r border-b border-slate-200 shadow-sm transition-all">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-heading font-bold text-[#0b1c30] text-base">
                Ejercicio 2: Números enteros
              </h3>
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0 border border-emerald-200">
                <span className="material-symbols-outlined text-sm fill">
                  check_circle
                </span>
              </div>
            </div>
            <p className="text-xs text-[#434655] mb-4">
              Trabaja con valores numéricos sin comillas para operaciones.
            </p>
          </div>
          <button 
            onClick={() => {
              if (onSelectExercise) onSelectExercise('ex2');
              onNavigate('exercise');
            }}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-[#434655] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Revisar solución
          </button>
        </div>

        {/* Exercise 3 (Active) */}
        <div className="bg-white rounded-2xl p-5 flex flex-col justify-between border-2 border-[#2563eb] shadow-[0px_4px_16px_rgba(37,99,235,0.08)] relative">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] animate-pulse" />
                <h3 className="font-heading font-bold text-[#0b1c30] text-base">
                  Ejercicio 3: Cambiando valores
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#2563eb] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                Actual
              </span>
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
            className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Resolver ejercicio</span>
            <span className="material-symbols-outlined text-sm">play_arrow</span>
          </button>
        </div>

        {/* Exercise 4 (Locked) */}
        <div className="bg-slate-50/80 rounded-2xl p-5 flex flex-col justify-between opacity-60 border border-dashed border-slate-300">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-heading font-bold text-slate-500 text-base">
                Ejercicio 4: Booleanos
              </h3>
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-slate-500 text-sm fill">
                  lock
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Verdadero o falso: el tipo de dato lógico más simple.
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
