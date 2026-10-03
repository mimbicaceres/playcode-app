import React, { useState, useEffect } from 'react';
import { ScreenView, Exercise } from '../types';
import { COURSES_DATA, MASCOT_IMAGES } from '../data/mockData';
import { ErrorFeedbackModal } from './Modals/ErrorFeedbackModal';
import { SuccessFeedbackModal } from './Modals/SuccessFeedbackModal';
import { HintModal } from './Modals/HintModal';
import { submitExercise, getStoredToken } from '../auth/api';

interface ExerciseCodingViewProps {
  onNavigate: (view: ScreenView) => void;
  onAddXp?: (xp: number) => void;
  currentExerciseId?: string;
  onExerciseCompleted?: () => void;

}

export const ExerciseCodingView: React.FC<ExerciseCodingViewProps> = ({
  onNavigate,
  onAddXp,
  onExerciseCompleted,
  currentExerciseId = 'ex1'
}) => {
  // Find current exercise or default to Ex 1
  const unit2 = COURSES_DATA[0].units[1];
  /**
   * Índice del ejercicio actual dentro de la unidad.
   * Se inicializa buscando el ejercicio cuyo id coincide con currentExerciseId.
   */
  const [exerciseIndex, setExerciseIndex] = useState(() => {
    const idx = unit2.exercises.findIndex(e => e.id === currentExerciseId);
    return idx !== -1 ? idx : 0;
  });

  const exercise: Exercise = unit2.exercises[exerciseIndex] || unit2.exercises[0];

  /**
   * Código del editor, inicializado con el código base del ejercicio.
   */
  const [code, setCode] = useState(exercise.initialCode);
  // Estado para controlar la visibilidad del modal de error.
  const [showErrorModal, setShowErrorModal] = useState(false);
  // Estado para controlar la visibilidad del modal de éxito.
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // Estado para controlar la visibilidad del modal de pista.
  const [showHintModal, setShowHintModal] = useState(false);
  // Mensaje de error personalizado que se muestra según la validación del ejercicio.
  const [customErrorMsg, setCustomErrorMsg] = useState(exercise.errorMessage);
  // Resultado de la sumisión al backend: XP ganado, número de intentos y si se completó.
  const [submitResult, setSubmitResult] = useState<{ xpEarned: number; attempts: number; completed: boolean } | null>(null);

  // Update code when exercise changes
  // Cuando cambia el ejercicio seleccionado, reinicializa el código y el mensaje de error.
  useEffect(() => {
    setCode(exercise.initialCode);
    setCustomErrorMsg(exercise.errorMessage);
  }, [exerciseIndex, exercise]);

  /**
   * Restablece el editor al código inicial del ejercicio.
   */
  const handleReset = () => {
    setCode(exercise.initialCode);
  };

  // Submit exercise result, update XP, and handle completion
  /**
   * Envía la solución al backend, actualiza XP y muestra el modal de éxito.
   * Si ocurre un error en la petición, se muestra igualmente el modal de éxito según requisitos.
   */
  const handleSuccess = async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const result = await submitExercise(token, exercise.id, code, true);
      if (onAddXp) onAddXp(result.xpEarned);
      setSubmitResult(result);
      setShowSuccessModal(true);
      if (onExerciseCompleted) onExerciseCompleted();
    } catch (err) {
      console.error('Exercise submit failed:', err);
      // Still show success modal per requirements
      setShowSuccessModal(true);
      if (onExerciseCompleted) onExerciseCompleted();
    }
  };

  /**
   * Valida el código escrito según el ejercicio actual y muestra errores o confirma éxito.
   */
  const handleRunCode = async () => {
    const trimmed = code.trim();

    // Logic validation per exercise
    if (exercise.id === 'ex1') {
      // Expecting: nombre = "..." or '...'
      const validStringRegex = /nombre\s*=\s*(["'])[\s\S]*?\1/;
      const unquotedRegex = /nombre\s*=\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ_]+/;

      if (validStringRegex.test(trimmed)) {
        await handleSuccess();
      } else if (unquotedRegex.test(trimmed)) {
        setCustomErrorMsg('Revisa si pusiste las comillas en el nombre. Las cadenas de texto (strings) siempre necesitan comillas ("texto" o \'texto\').');
        setShowErrorModal(true);
      } else {
        setCustomErrorMsg('Asegúrate de escribir: nombre = "TuNombre"');
        setShowErrorModal(true);
      }
    } else if (exercise.id === 'ex2') {
      // Expecting: edad = 16 (number without quotes)
      const validNumberRegex = /edad\s*=\s*\d+/;
      const quotedNumberRegex = /edad\s*=\s*(["'])\d+\1/;

      if (validNumberRegex.test(trimmed) && !quotedNumberRegex.test(trimmed)) {
        await handleSuccess();
      } else if (quotedNumberRegex.test(trimmed)) {
        setCustomErrorMsg('Los números enteros no deben ir entre comillas, ya que sino la computadora los interpreta como texto.');
        setShowErrorModal(true);
      } else {
        setCustomErrorMsg('Declara una variable con número, por ejemplo: edad = 16');
        setShowErrorModal(true);
      }
    } else if (exercise.id === 'ex3') {
      // Expecting: puntos = 100
      if (trimmed.includes('puntos') && trimmed.includes('100')) {
        await handleSuccess();
      } else {
        setCustomErrorMsg('Revisa si asignaste el valor numérico 100 a la variable puntos (ej: puntos = 100).');
        setShowErrorModal(true);
      }
    } else {
      // Ex 4 or generic
      if (trimmed.includes('=')) {
        await handleSuccess();
      } else {
        setShowErrorModal(true);
      }
    }
  };

  /**
   * Avanza al siguiente ejercicio o navega a la vista de detalle de unidad al terminar.
   */
  const handleNextExercise = () => {
    if (exerciseIndex < unit2.exercises.length - 1) {
      setExerciseIndex(prev => prev + 1);
    } else {
      onNavigate('unit_detail');
    }
  };

  return (
    <div className="bg-[#f8f9ff] flex-1 flex flex-col antialiased">
      {/* Top Chrome / Navy Context Bar (sits right below the global h-16 Navigation) */}
      <header className="bg-[#0b1c30] text-white sticky top-16 z-40 border-b border-white/10 shadow-md">
        <div className="flex items-center justify-between px-4 md:px-8 py-3 w-full max-w-5xl mx-auto">
          <button
            onClick={() => onNavigate('unit_detail')}
            className="text-slate-300 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
            aria-label="Volver a la unidad"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>

          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-300 uppercase tracking-wider">
              Programación 1 • Unidad 2
            </span>
            <h1 className="font-heading font-bold text-base sm:text-lg text-white tracking-tight">
              {exercise.title}
            </h1>
          </div>

          {/* Quick exercise switcher pill */}
          <div className="flex items-center gap-1 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs font-semibold text-blue-100">
            <span>Ej. {exerciseIndex + 1}/{unit2.exercises.length}</span>
          </div>
        </div>

        {/* Navy Sub-progress Bar */}
        <div className="w-full h-1 bg-white/10">
          <div 
            className="h-full bg-[#ffb95f] transition-all duration-500 shadow-[0_0_8px_rgba(255,185,95,0.7)]" 
            style={{ width: `${((exerciseIndex + 1) / unit2.exercises.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Coding Canvas */}
      <main className="flex-grow flex flex-col items-center px-4 py-6 w-full max-w-4xl mx-auto gap-5 pb-32">
        {/* Instruction Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 md:p-5 shadow-[0px_4px_16px_rgba(0,0,0,0.04)] w-full flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden border-2 border-blue-200 shadow-xs bg-blue-50 flex items-center justify-center">
            <img 
              src={MASCOT_IMAGES.roundAvatar} 
              alt="Carpincho Tutor" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow min-w-0">
            <div className="bg-[#eff4ff] p-4 rounded-2xl rounded-tl-none relative border border-blue-100">
              <span className="text-[11px] font-bold text-[#2563eb] uppercase tracking-wider block mb-1">
                Instrucción
              </span>
              <p className="text-sm md:text-base text-[#0b1c30] leading-relaxed">
                {exercise.instruction}
              </p>
            </div>
          </div>
        </div>

        {/* Code Editor Container */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-semibold text-[#434655] flex items-center gap-1.5 font-mono">
              <span className="material-symbols-outlined text-sm text-[#2563eb]">code</span>
              main.py
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHintModal(true)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-amber-600">lightbulb</span>
                Pista
              </button>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-slate-600 hover:text-[#2563eb] bg-white border border-slate-200 hover:border-blue-200 px-3 py-1 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Reiniciar
              </button>
            </div>
          </div>

          {/* Dark Mac-style Code Window */}
          <div className="bg-[#0b1c30] rounded-2xl overflow-hidden shadow-xl flex flex-col border border-slate-700/80 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
            {/* Window Header */}
            <div className="bg-[#071322] px-4 py-2.5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/90" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/90" />
                <div className="w-3 h-3 rounded-full bg-green-500/90" />
              </div>
              <span className="text-slate-400 text-xs font-mono">Python 3.11</span>
            </div>

            {/* Editor Body */}
            <div className="flex w-full min-h-[220px] text-[#e2e8f0] font-mono text-sm">
              {/* Line Numbers */}
              <div className="w-10 bg-[#071322]/60 text-right pr-3 py-4 text-slate-500 select-none border-r border-white/10 text-xs">
                {code.split('\n').map((_, i) => (
                  <div key={i} className="leading-[26px]">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <div className="flex-grow p-4 relative">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full min-h-[190px] bg-transparent text-[#e2e8f0] font-mono text-sm leading-[26px] focus:outline-none resize-none caret-[#ffb95f] selection:bg-blue-600/40"
                  spellCheck={false}
                  placeholder="# Escribe tu código aquí..."
                />
              </div>
            </div>
          </div>

          {/* Quick test preset helpers */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 pt-1 gap-2">
            <span className="text-[11px] font-medium">Pruebas rápidas:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCode('nombre = "Facu"')}
                className="px-2.5 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-[11px] font-mono cursor-pointer transition-colors"
              >
                nombre = "Facu" (correcto)
              </button>
              <button
                type="button"
                onClick={() => setCode('nombre = Facundo')}
                className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-mono cursor-pointer transition-colors"
              >
                nombre = Facundo (sin comillas)
              </button>
            </div>
          </div>
        </div>

        {/* 3D Tactile Action CTA Button */}
        <div className="w-full pt-3">
          <button
            onClick={handleRunCode}
            className="btn-game-amber w-full py-4 text-base flex justify-center items-center gap-2"
          >
            <span className="material-symbols-outlined text-2xl fill">play_arrow</span>
            <span>Ejecutar y Verificar Código</span>
          </button>
        </div>
      </main>

      {/* Bottom Context Bar */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-[#e2e8f0] shadow-lg px-6 py-4 flex justify-between items-center z-40">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600 fill text-xl">star</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-[#737686]">Recompensa</span>
            <span className="text-sm font-extrabold text-[#784b00]">+{exercise.rewardXp} XP</span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[11px] font-semibold text-[#737686]">Progreso en unidad</span>
          <span className="text-sm font-extrabold text-[#2563eb]">
            {exerciseIndex + 1} / {unit2.exercises.length}
          </span>
        </div>
      </footer>

      {/* Modals */}
      <ErrorFeedbackModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onShowHint={() => setShowHintModal(true)}
        errorMessage={customErrorMsg}
      />

      <SuccessFeedbackModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onNextExercise={handleNextExercise}
        rewardXp={exercise.rewardXp}
      />

      <HintModal
        isOpen={showHintModal}
        onClose={() => setShowHintModal(false)}
        hintText={exercise.hint}
      />
    </div>
  );
};
