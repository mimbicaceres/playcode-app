import React, { useState, useEffect } from 'react';
import { ScreenView, Exercise } from '../types';
import { COURSES_DATA, MASCOT_IMAGES } from '../data/mockData';
import { ErrorFeedbackModal } from './Modals/ErrorFeedbackModal';
import { SuccessFeedbackModal } from './Modals/SuccessFeedbackModal';
import { HintModal } from './Modals/HintModal';

interface ExerciseCodingViewProps {
  onNavigate: (view: ScreenView) => void;
  onAddXp?: (xp: number) => void;
  currentExerciseId?: string;
}

export const ExerciseCodingView: React.FC<ExerciseCodingViewProps> = ({
  onNavigate,
  onAddXp,
  currentExerciseId = 'ex1'
}) => {
  // Find current exercise or default to Ex 1
  const unit2 = COURSES_DATA[0].units[1];
  const [exerciseIndex, setExerciseIndex] = useState(() => {
    const idx = unit2.exercises.findIndex(e => e.id === currentExerciseId);
    return idx !== -1 ? idx : 0;
  });

  const exercise: Exercise = unit2.exercises[exerciseIndex] || unit2.exercises[0];

  const [code, setCode] = useState(exercise.initialCode);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [customErrorMsg, setCustomErrorMsg] = useState(exercise.errorMessage);

  // Update code when exercise changes
  useEffect(() => {
    setCode(exercise.initialCode);
    setCustomErrorMsg(exercise.errorMessage);
  }, [exerciseIndex, exercise]);

  const handleReset = () => {
    setCode(exercise.initialCode);
  };

  const handleRunCode = () => {
    const trimmed = code.trim();

    // Logic validation per exercise
    if (exercise.id === 'ex1') {
      // Expecting: nombre = "..." or '...'
      const validStringRegex = /nombre\s*=\s*(["'])[\s\S]*?\1/;
      const unquotedRegex = /nombre\s*=\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ_]+/;

      if (validStringRegex.test(trimmed)) {
        if (onAddXp) onAddXp(exercise.rewardXp);
        setShowSuccessModal(true);
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
        if (onAddXp) onAddXp(exercise.rewardXp);
        setShowSuccessModal(true);
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
        if (onAddXp) onAddXp(exercise.rewardXp);
        setShowSuccessModal(true);
      } else {
        setCustomErrorMsg('Revisa si asignaste el valor numérico 100 a la variable puntos (ej: puntos = 100).');
        setShowErrorModal(true);
      }
    } else {
      // Ex 4 or generic
      if (trimmed.includes('=')) {
        if (onAddXp) onAddXp(exercise.rewardXp);
        setShowSuccessModal(true);
      } else {
        setShowErrorModal(true);
      }
    }
  };

  const handleNextExercise = () => {
    if (exerciseIndex < unit2.exercises.length - 1) {
      setExerciseIndex(prev => prev + 1);
    } else {
      onNavigate('unit_detail');
    }
  };

  return (
    <div className="bg-[#f8f9ff] min-h-screen flex flex-col antialiased">
      {/* Top App Bar (Exercise Context) */}
      <header className="bg-white sticky top-[37px] z-40 border-b border-slate-200">
        <div className="flex items-center justify-between px-4 md:px-8 py-3 w-full max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('unit_detail')}
            className="text-[#434655] hover:bg-slate-100 rounded-full p-2 transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
            aria-label="Cerrar ejercicio"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-[#737686] uppercase tracking-wider">
              Programación 1
            </span>
            <h1 className="font-heading font-bold text-lg text-[#004ac6] tracking-tight">
              Unidad 2: Variables
            </h1>
          </div>

          {/* Quick exercise switcher pill */}
          <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full text-xs font-semibold text-[#434655]">
            <span>Ex {exerciseIndex + 1}/{unit2.exercises.length}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100">
          <div 
            className="h-full bg-[#2563eb] rounded-r-full transition-all duration-500" 
            style={{ width: `${((exerciseIndex + 1) / unit2.exercises.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Coding Canvas */}
      <main className="flex-grow flex flex-col items-center px-4 py-6 w-full max-w-3xl mx-auto gap-5 pb-32">
        {/* Instruction Card with Carpincho avatar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-[0px_4px_16px_rgba(0,0,0,0.04)] w-full flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400 shadow-sm bg-blue-50">
            <img 
              src={MASCOT_IMAGES.roundAvatar} 
              alt="Carpincho" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow">
            <div className="bg-[#eff4ff] p-4 rounded-2xl rounded-tl-none relative border border-blue-100">
              <span className="text-[11px] font-bold text-[#2563eb] uppercase tracking-wider block mb-1">
                {exercise.title}
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
            <span className="text-xs font-semibold text-[#434655] flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-sm text-[#2563eb]">code</span>
              main.py
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHintModal(true)}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">lightbulb</span>
                Pista
              </button>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-[#004ac6] hover:text-[#2563eb] flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">refresh</span>
                Reiniciar
              </button>
            </div>
          </div>

          {/* Dark Mac-style Code Window */}
          <div className="bg-[#0f172a] rounded-2xl overflow-hidden shadow-xl flex flex-col border border-slate-800 focus-within:ring-2 focus-within:ring-[#2563eb]/60 transition-all">
            {/* Window Header */}
            <div className="bg-[#1e293b] px-4 py-2.5 flex items-center justify-between border-b border-slate-700/60">
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
              <div className="w-10 bg-[#1e293b]/40 text-right pr-3 py-4 text-slate-500 select-none border-r border-slate-800 text-xs">
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
                  className="w-full h-full min-h-[190px] bg-transparent text-[#e2e8f0] font-mono text-sm leading-[26px] focus:outline-none resize-none caret-blue-400 selection:bg-blue-600/40"
                  spellCheck={false}
                  placeholder="# Escribe tu código aquí..."
                />
              </div>
            </div>
          </div>

          {/* Quick test preset helpers */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 pt-1 gap-2">
            <span className="text-[11px]">Pruebas rápidas:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCode('nombre = "Facu"')}
                className="px-2 py-0.5 rounded bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-[11px] font-mono"
              >
                nombre = "Facu" (correcto)
              </button>
              <button
                type="button"
                onClick={() => setCode('nombre = Facundo')}
                className="px-2 py-0.5 rounded bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-mono"
              >
                nombre = Facundo (sin comillas)
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full pt-2">
          <button
            onClick={handleRunCode}
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-base py-4 rounded-xl shadow-[0_4px_16px_rgba(37,99,235,0.3)] border-b-4 border-[#1e40af] active:border-b-0 active:translate-y-1 transition-all flex justify-center items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl fill">play_arrow</span>
            <span>Ejecutar Código</span>
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
          <span className="text-[11px] font-semibold text-[#737686]">Progreso</span>
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
