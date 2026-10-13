import React from 'react';
import { Course, Exercise, ScreenView, Unit } from '../types';

interface TeacherExerciseViewProps {
  onNavigate: (view: ScreenView) => void;
  course: Course;
  unit: Unit;
  exercise: Exercise;
}

/**
 * Vista de solo lectura de un ejercicio para el docente: consigna, código
 * inicial y los casos de prueba de ejemplo (no los ocultos). El docente
 * nunca puede resolver ni enviar un ejercicio, solo leer en qué consiste.
 */
export const TeacherExerciseView: React.FC<TeacherExerciseViewProps> = ({ onNavigate, course, unit, exercise }) => {
  const exerciseIndex = unit.exercises.findIndex((e) => e.id === exercise.id);
  const visibleTestCases = exercise.testCases?.filter((tc) => !tc.isHidden) ?? [];

  return (
    <div className="bg-[#f8f9ff] flex-1 flex flex-col antialiased">
      <header className="bg-[#0b1c30] text-white sticky top-16 z-40 border-b border-white/10 shadow-md">
        <div className="flex items-center justify-between px-4 md:px-8 py-2 w-full max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('unit_detail')}
            className="text-slate-300 hover:text-white hover:bg-white/10 rounded-xl p-1.5 transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
            aria-label="Volver a la unidad"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-300 uppercase tracking-wider">
              {course.title} • {unit.title}
            </span>
            <h1 className="font-heading font-bold text-base sm:text-lg text-white tracking-tight leading-tight">
              {exercise.title}
            </h1>
          </div>
          <div className="flex items-center gap-1 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs font-semibold text-blue-100">
            <span>Ej. {exerciseIndex + 1}/{unit.exercises.length}</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center px-4 py-4 w-full max-w-4xl mx-auto gap-3">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm w-full">
          <span className="text-[11px] font-bold text-[#2563eb] uppercase tracking-wider block mb-1.5">Consigna</span>
          <p className="text-sm text-[#0b1c30] leading-relaxed whitespace-pre-line">{exercise.prompt}</p>
        </div>

        <div className="w-full flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[#434655] flex items-center gap-1.5 font-mono px-2">
            <span className="material-symbols-outlined text-sm text-[#2563eb]">code</span>
            Código inicial
          </span>
          <pre className="bg-[#0b1c30] text-[#e2e8f0] rounded-2xl p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
            {exercise.starterCode}
          </pre>
        </div>

        {visibleTestCases.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#434655] px-2">Casos de prueba de ejemplo</span>
            {visibleTestCases.map((tc) => (
              <div key={tc.id} className="bg-white border border-slate-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400">Entrada:</span>
                  <pre className="whitespace-pre-wrap text-[#0b1c30]">{tc.input || '(sin entrada)'}</pre>
                </div>
                <div>
                  <span className="text-slate-400">Salida esperada:</span>
                  <pre className="whitespace-pre-wrap text-[#0b1c30]">{tc.expectedOutput}</pre>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="w-full flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
          <span className="material-symbols-outlined text-base">visibility</span>
          Estás viendo este ejercicio en modo lectura, como docente. No se puede resolver desde esta pantalla.
        </div>
      </main>
    </div>
  );
};
