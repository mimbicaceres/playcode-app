import React, { useState } from 'react';
import { ScreenView, Course, Unit, Exercise } from '../types';
import { MASCOT_IMAGES } from '../data/mockData';
import { ErrorFeedbackModal } from './Modals/ErrorFeedbackModal';
import { SuccessFeedbackModal } from './Modals/SuccessFeedbackModal';
import { HintModal } from './Modals/HintModal';
import { ApiError, getStoredToken, submitCodeExercise, GradedTestCaseResult } from '../auth/api';
import { runExercise } from '../lib/codeRunner';
import { languageInfo } from '../lib/languages';

interface CodeExerciseViewProps {
  onNavigate: (view: ScreenView) => void;
  course: Course;
  unit: Unit;
  exercise: Exercise;
  onExerciseCompleted?: () => void;
  // Vuelve a pedir el contenido del curso (statuses actualizados) antes de
  // volver a la unidad, para que el siguiente ejercicio aparezca desbloqueado.
  onRefreshContent?: () => Promise<void>;
}

// La devolucion de error es propia de cada ejercicio: usa la pista (hint)
// que se escribio para esa consigna especifica, en vez de mostrarle al
// alumno el traceback crudo de Python (que no le dice nada util a alguien
// que recien esta aprendiendo). Esta pista reemplaza por completo lo que
// Pyodide reporta como error tecnico.
// HTML/CSS: busca la primera medicion que no coincide y la explica.
function describeDomMismatch(actual: string, expected: string | undefined): string {
  const fallback = 'tu página no cumple con lo que pide la consigna';
  try {
    const got = JSON.parse(actual) as Record<string, unknown>[];
    const want = expected ? (JSON.parse(expected) as Record<string, unknown>[]) : [];
    const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
    for (let i = 0; i < want.length; i++) {
      const w = want[i];
      const g = got[i] ?? {};
      const sel = `${w.selector}`;
      if ('count' in w && !same(g.count, w.count)) {
        return `encontramos ${g.count} elemento(s) que coinciden con "${sel}" y se esperaba${w.count === 1 ? '' : 'n'} ${w.count}`;
      }
      for (const key of ['text', 'texts', 'hasText'] as const) {
        if (key in w && !same(g[key], w[key])) {
          return key === 'hasText' ? `el elemento "${sel}" no tiene texto` : `el texto de "${sel}" no es el esperado (se esperaba ${JSON.stringify(w[key])} y encontramos ${JSON.stringify(g[key])})`;
        }
      }
      for (const key of ['attrs', 'attrsAll', 'styles', 'stylesAll'] as const) {
        const wantGroup = (w[key] ?? {}) as Record<string, unknown>;
        const gotGroup = (g[key] ?? {}) as Record<string, unknown>;
        for (const name of Object.keys(wantGroup)) {
          if (!same(gotGroup[name], wantGroup[name])) {
            const what = key.startsWith('attrs') ? 'el atributo' : 'el estilo';
            return `${what} ${name} de "${sel}" es ${JSON.stringify(gotGroup[name] ?? null)} y se esperaba ${JSON.stringify(wantGroup[name])}`;
          }
        }
      }
      if ('rects' in w && !same(g.rects, w.rects)) return `la posición o el tamaño de "${sel}" no es el esperado`;
    }
  } catch {
    // Si el resultado no se puede interpretar, se usa el mensaje general.
  }
  return fallback;
}

// Descripcion del desvio para los modos que no comparan texto plano (SQL y
// HTML/CSS): el JSON crudo no le sirve al alumno, asi que se resume.
function describeMismatch(mode: string | undefined, actual: string, expected: string | undefined): string {
  if (mode === 'dom') return describeDomMismatch(actual, expected);
  try {
    const a = JSON.parse(actual) as { columns: string[]; rows: unknown[] };
    const e = expected ? (JSON.parse(expected) as { columns: string[]; rows: unknown[] }) : null;
    if (!e) return 'tu consulta devolvió un resultado distinto del esperado';
    if (a.columns.join(',').toLowerCase() !== e.columns.join(',').toLowerCase()) {
      return `tu consulta devolvió las columnas (${a.columns.join(', ')}) y se esperaban (${e.columns.join(', ')})`;
    }
    if (a.rows.length !== e.rows.length) {
      return `tu consulta devolvió ${a.rows.length} filas y se esperaban ${e.rows.length}`;
    }
    return 'tu consulta devolvió las filas esperadas en cantidad, pero con valores u orden distintos';
  } catch {
    return 'tu consulta no devolvió un resultado válido';
  }
}

function buildErrorMessage(exercise: Exercise, results: GradedTestCaseResult[]): string {
  const hintSuffix = exercise.hint ? ` Pista: ${exercise.hint}` : '';
  const failedVisible = results.find((r) => !r.passed && !r.isHidden);
  if (failedVisible) {
    const testCase = exercise.testCases?.find((t) => t.id === failedVisible.testCaseId);
    const inputPart = testCase?.input ? ` Con la entrada "${testCase.input.replace(/\n/g, ', ')}"` : ' En este caso';
    if (failedVisible.timedOut) {
      return `${inputPart}, tu código no terminó a tiempo. Revisá si tiene un bucle infinito.${hintSuffix}`;
    }
    if (failedVisible.stderr) {
      return `${inputPart}, tu código tuvo un error al ejecutarse y no llegó a dar un resultado.${hintSuffix}`;
    }
    const mode = testCase?.compareMode;
    if (mode && mode !== 'text') {
      return `${inputPart}, ${describeMismatch(mode, failedVisible.actualOutput, failedVisible.expectedOutput)}.${hintSuffix}`;
    }
    return `${inputPart}, tu código imprimió "${failedVisible.actualOutput}" pero se esperaba "${failedVisible.expectedOutput}".${hintSuffix}`;
  }
  if (results.some((r) => !r.passed)) {
    return `Tu código funciona con el ejemplo, pero no con otros casos. Revisá que tu solución funcione para cualquier valor, no solo para el que ves acá.${hintSuffix}`;
  }
  return `Algo no salió bien. Revisá tu código e intentá de nuevo.${hintSuffix}`;
}

export const CodeExerciseView: React.FC<CodeExerciseViewProps> = ({
  onNavigate,
  course,
  unit,
  exercise,
  onExerciseCompleted,
  onRefreshContent,
}) => {
  const [code, setCode] = useState(exercise.starterCode ?? '');
  const [running, setRunning] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [infraErrorMessage, setInfraErrorMessage] = useState<string | null>(null);
  const [lastResults, setLastResults] = useState<GradedTestCaseResult[] | null>(null);

  const lang = languageInfo(exercise.codeLanguage);
  const exerciseIndex = unit.exercises.findIndex((e) => e.id === exercise.id);

  const handleReset = () => setCode(exercise.starterCode ?? '');

  const handleRun = async () => {
    const token = getStoredToken();
    if (!token) return;
    setRunning(true);
    setInfraErrorMessage(null);
    try {
      const testCases = exercise.testCases ?? [];
      const { outputs, infraError } = await runExercise(
        exercise.codeLanguage,
        code,
        testCases.map((testCase) => ({ id: testCase.id, input: testCase.input ?? '', spec: testCase.spec })),
      );

      const result = infraError
        ? await submitCodeExercise(token, exercise.id, code, { infraError })
        : await submitCodeExercise(token, exercise.id, code, { outputs });

      setLastResults(result.results);
      if (result.success) {
        setShowSuccessModal(true);
        onExerciseCompleted?.();
      } else {
        setErrorMessage(buildErrorMessage(exercise, result.results));
        setShowErrorModal(true);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        setInfraErrorMessage('No pudimos verificar tu código. Reintentá en unos segundos.');
      } else {
        setInfraErrorMessage('Ocurrió un error inesperado al verificar tu código. Reintentá.');
      }
    } finally {
      setRunning(false);
    }
  };

  const handleContinue = async () => {
    if (onRefreshContent) await onRefreshContent();
    onNavigate('unit_detail');
  };

  return (
    <div className="bg-[#f8f9ff] flex-1 flex flex-col antialiased">
      <header className="bg-[#0b1c30] text-white sticky top-16 z-40 border-b border-white/10 shadow-md">
        <div className="flex items-center justify-between px-4 md:px-8 py-2 w-full max-w-5xl mx-auto">
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

        <div className="w-full h-1 bg-white/10">
          <div
            className="h-full bg-[#ffb95f] transition-all duration-500 shadow-[0_0_8px_rgba(255,185,95,0.7)]"
            style={{ width: `${((exerciseIndex + 1) / unit.exercises.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center px-4 py-3 w-full max-w-4xl mx-auto gap-3">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-3 shadow-[0px_4px_16px_rgba(0,0,0,0.04)] w-full flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl overflow-hidden border-2 border-blue-200 shadow-xs bg-blue-50 flex items-center justify-center">
            <img src={MASCOT_IMAGES.roundAvatar} alt="Carpincho Tutor" className="w-full h-full object-cover" />
          </div>
          <div className="flex-grow min-w-0">
            <div className="bg-[#eff4ff] px-3.5 py-2.5 rounded-2xl rounded-tl-none relative border border-blue-100">
              <span className="text-[11px] font-bold text-[#2563eb] uppercase tracking-wider block mb-1">
                Consigna
              </span>
              <p className="text-sm md:text-[15px] text-[#0b1c30] leading-snug whitespace-pre-line">
                {exercise.prompt}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-1.5">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-semibold text-[#434655] flex items-center gap-1.5 font-mono">
              <span className="material-symbols-outlined text-sm text-[#2563eb]">code</span>
              {lang.fileName}
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

          <div className="bg-[#0b1c30] rounded-2xl overflow-hidden shadow-xl flex flex-col border border-slate-700/80 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
            <div className="bg-[#071322] px-4 py-2 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/90" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/90" />
                <div className="w-3 h-3 rounded-full bg-green-500/90" />
              </div>
              <span className="text-slate-400 text-xs font-mono">{lang.label}</span>
            </div>

            <div className="flex w-full min-h-[200px] text-[#e2e8f0] font-mono text-sm">
              <div className="w-10 bg-[#071322]/60 text-right pr-3 py-3 text-slate-500 select-none border-r border-white/10 text-xs">
                {code.split('\n').map((_, i) => (
                  <div key={i} className="leading-[26px]">
                    {i + 1}
                  </div>
                ))}
              </div>

              <div className="flex-grow p-3 relative">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full min-h-[180px] bg-transparent text-[#e2e8f0] font-mono text-sm leading-[26px] focus:outline-none resize-none caret-[#ffb95f] selection:bg-blue-600/40"
                  spellCheck={false}
                  placeholder={lang.placeholder}
                />
              </div>
            </div>
          </div>

          {infraErrorMessage && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <span className="material-symbols-outlined text-base">wifi_off</span>
              <span>{infraErrorMessage}</span>
            </div>
          )}

          {lastResults && (
            <div className="flex flex-wrap items-center gap-2 px-1">
              <span className="text-[11px] font-semibold text-slate-500">Casos de prueba:</span>
              {lastResults.map((result, i) => (
                <span
                  key={result.testCaseId}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                    result.passed
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">{result.passed ? 'check' : 'close'}</span>
                  {result.isHidden ? `Caso oculto ${i + 1}` : `Caso ${i + 1}`}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="w-full">
          <button
            onClick={handleRun}
            disabled={running}
            className="btn-game-amber w-full py-2.5 text-sm flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-xl fill">{running ? 'hourglass_top' : 'play_arrow'}</span>
            <span>{running ? 'Verificando…' : 'Ejecutar y Verificar Código'}</span>
          </button>
        </div>
      </main>

      <footer className="sticky bottom-0 w-full bg-white border-t border-[#e2e8f0] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-6 py-2.5 flex justify-between items-center z-40">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-1.5 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600 fill text-xl">star</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-semibold text-[#737686]">Recompensa</span>
            <span className="text-sm font-extrabold text-[#784b00]">+{exercise.rewardXp} XP</span>
          </div>
        </div>

        <div className="flex flex-col items-end leading-tight">
          <span className="text-[11px] font-semibold text-[#737686]">Progreso en unidad</span>
          <span className="text-sm font-extrabold text-[#2563eb]">
            {exerciseIndex + 1} / {unit.exercises.length}
          </span>
        </div>
      </footer>

      <ErrorFeedbackModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onShowHint={() => setShowHintModal(true)}
        errorMessage={errorMessage}
      />

      <SuccessFeedbackModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onNextExercise={handleContinue}
        rewardXp={exercise.rewardXp}
      />

      <HintModal
        isOpen={showHintModal}
        onClose={() => setShowHintModal(false)}
        hintText={exercise.hint || 'Este ejercicio no tiene una pista adicional todavía.'}
      />
    </div>
  );
};
