import React from 'react';
import { ScreenView } from '../types';

interface UnitDetailViewProps {
  onNavigate: (view: ScreenView) => void;
  onSelectExercise?: (exerciseId: string) => void;
}

type ExerciseStatus = 'completed' | 'active' | 'locked';

interface UnitExercise {
  id: string;
  number: number;
  title: string;
  description: string;
  status: ExerciseStatus;
}

// Example exercises of the demo unit.
const UNIT_EXERCISES: UnitExercise[] = [
  { id: 'ex1', number: 1, title: 'Tu primera variable', description: 'Declara una variable simple de texto usando comillas.', status: 'completed' },
  { id: 'ex2', number: 2, title: 'Números enteros', description: 'Trabaja con valores numéricos sin comillas para operaciones.', status: 'completed' },
  { id: 'ex3', number: 3, title: 'Cambiando valores', description: 'Aprende cómo actualizar el valor de una variable que ya ha sido declarada.', status: 'active' },
  { id: 'ex4', number: 4, title: 'Booleanos', description: 'Verdadero o falso: el tipo de dato lógico más simple.', status: 'locked' },
];

const completedCount = UNIT_EXERCISES.filter((e) => e.status === 'completed').length;
const progressPercent = Math.round((completedCount / UNIT_EXERCISES.length) * 100);

/**
 * Detalle de una unidad: cabecera, objetivos con progreso y ejercicios.
 * Pensada para verse completa en pantalla (sin desplazarse) en escritorio.
 */
export const UnitDetailView: React.FC<UnitDetailViewProps> = ({ onNavigate, onSelectExercise }) => {
  const openExercise = (id: string) => {
    if (onSelectExercise) onSelectExercise(id);
    onNavigate('exercise');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-28 md:pb-5 flex-1 flex flex-col gap-4">
      {/* Row 1: unit header */}
      <div className="w-full bg-gradient-to-r from-[#0b1c30] via-[#0d223a] to-[#122e4e] px-4 py-3 rounded-2xl border border-white/10 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white/10 border-2 border-white/20 text-blue-200 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">code_blocks</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="font-heading font-bold text-white leading-tight truncate text-lg xl:text-xl">
                Variables &amp; Asignaciones
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold text-blue-300 uppercase tracking-wider bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 rounded-md shrink-0">
                Programación 1 • Unidad 2
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate">
              Aprende a guardar y transformar información en la memoria de tu programa
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('course_roadmap')}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-100 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl transition-all border border-white/15 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Volver a la Ruta</span>
        </button>
      </div>

      {/* Row 2: objectives + progress */}
      <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-heading font-bold text-base xl:text-lg text-[#0b1c30]">Objetivos de la Unidad</h2>
          <p className="text-xs xl:text-sm text-[#434655] mt-1 max-w-3xl leading-relaxed">
            Las variables son contenedores para almacenar valores de datos (texto, números y booleanos). Al completar estos {UNIT_EXERCISES.length} ejercicios dominarás la declaración, actualización y tipos básicos.
          </p>
        </div>

        <div className="bg-[#f8f9ff] px-4 py-3 rounded-2xl border border-[#e2e8f0] flex flex-col gap-1.5 min-w-[220px] shrink-0">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-[#434655]">Progreso</span>
            <span className="text-[#2563eb] font-bold">{progressPercent}% ({completedCount}/{UNIT_EXERCISES.length})</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2563eb] rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Row 3: exercises (grow to fill the screen height, with a cap) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch lg:flex-1 lg:max-h-[320px]">
        {UNIT_EXERCISES.map((exercise) => {
          const isCompleted = exercise.status === 'completed';
          const isActive = exercise.status === 'active';
          const isLocked = exercise.status === 'locked';

          const cardClass = isActive
            ? 'bg-white border-2 border-[#2563eb] shadow-[0px_4px_16px_rgba(37,99,235,0.08)]'
            : isCompleted
              ? 'bg-white border-l-4 border-l-[#10B981] border-t border-r border-b border-slate-200 shadow-sm'
              : 'bg-slate-50/80 opacity-60 border border-dashed border-slate-300';

          return (
            <div key={exercise.id} className={`rounded-2xl p-4 flex flex-col gap-2 min-h-[190px] ${cardClass}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isLocked ? 'text-slate-400' : 'text-[#737686]'}`}>
                  Ejercicio {exercise.number}
                </span>
                {isActive && (
                  <span className="text-[10px] font-bold text-[#2563eb] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Actual
                  </span>
                )}
                {isCompleted && (
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Completado
                  </span>
                )}
              </div>

              {/* Status icon fills the free space of the card */}
              <div className="flex-1 flex items-center justify-center py-1">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                    isCompleted
                      ? 'bg-emerald-50 text-[#10B981] border-emerald-200'
                      : isActive
                        ? 'bg-blue-50 text-[#2563eb] border-blue-200 animate-pulse'
                        : 'bg-slate-200 text-slate-500 border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl fill">
                    {isCompleted ? 'check_circle' : isActive ? 'play_arrow' : 'lock'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className={`font-heading font-bold text-sm ${isLocked ? 'text-slate-500' : 'text-[#0b1c30]'}`}>
                  {exercise.title}
                </h3>
                <p className={`text-xs mt-0.5 leading-snug ${isLocked ? 'text-slate-500' : 'text-[#434655]'}`}>
                  {exercise.description}
                </p>
              </div>

              {isLocked ? (
                <div className="w-full py-2 flex items-center justify-center text-slate-400 font-semibold text-xs bg-slate-100 rounded-xl">
                  Bloqueado
                </div>
              ) : (
                <button
                  onClick={() => openExercise(exercise.id)}
                  className={`w-full py-2 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-[#434655]'
                  }`}
                >
                  <span>{isActive ? 'Resolver ejercicio' : 'Revisar solución'}</span>
                  {isActive && <span className="material-symbols-outlined text-sm">play_arrow</span>}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};