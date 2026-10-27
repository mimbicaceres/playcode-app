import React, { useEffect, useRef, useState } from 'react';
import type { AdminExercise, ExerciseFormInput } from '../../auth/api';
import {
  AuthoringCase, HTML_CHECK_KINDS, HtmlCheck, HtmlCheckKind, LANGUAGE_CHOICES, SQL_SAMPLE_SETUP, STARTER_TEMPLATES,
  casesFromExercise, casesToPayload, languageLabel, newCase, runCases, validateCases,
} from '../../lib/exerciseAuthoring';

// Editor de un ejercicio (crear o editar) para CUALQUIER lenguaje del curso. El admin escribe
// la consigna, el codigo inicial, una solucion de referencia y los casos; los resultados
// esperados se calculan ejecutando esa solucion con el mismo ejecutor que usan los alumnos.

interface ExerciseEditorModalProps {
  /** Ejercicio a editar; sin esto se crea uno nuevo. */
  exercise?: AdminExercise;
  /** Lenguaje del curso (el de un ejercicio nuevo). */
  courseLanguage: string;
  onSave: (data: ExerciseFormInput) => Promise<string | null>;
  onClose: () => void;
}

const INPUT = 'w-full px-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-600 transition-colors bg-white';
const MONO = `${INPUT} font-mono text-xs py-2 leading-relaxed`;
const LABEL = 'text-xs font-semibold text-[#434655]';

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <span className={LABEL}>{label}</span>
    {children}
    {hint && <span className="text-[11px] text-slate-500 leading-snug">{hint}</span>}
  </div>
);

export const ExerciseEditorModal: React.FC<ExerciseEditorModalProps> = ({ exercise, courseLanguage, onSave, onClose }) => {
  const [language, setLanguage] = useState(exercise?.language ?? courseLanguage);
  const [title, setTitle] = useState(exercise?.title ?? '');
  const [prompt, setPrompt] = useState(exercise?.prompt ?? '');
  const [starterCode, setStarterCode] = useState(exercise?.starterCode ?? STARTER_TEMPLATES[exercise?.language ?? courseLanguage] ?? '');
  const [rewardXp, setRewardXp] = useState(exercise?.rewardXp ?? 10);
  const [hint, setHint] = useState(exercise?.hint ?? '');
  // Solucion de referencia: solo sirve para calcular los resultados esperados, NO se guarda.
  const [solution, setSolution] = useState('');
  const [sqlOrdered, setSqlOrdered] = useState(exercise?.testCases[0]?.compareMode === 'rows_ordered');
  const [cases, setCases] = useState<AuthoringCase[]>(() =>
    exercise && exercise.testCases.length > 0 ? casesFromExercise(exercise) : [newCase({ setup: courseLanguage === 'sql' ? SQL_SAMPLE_SETUP : '' })],
  );
  const [computing, setComputing] = useState(false);
  const [computeNotice, setComputeNotice] = useState<{ kind: 'ok' | 'warn'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Si hay un error, la pantalla baja sola hasta el mensaje (el formulario es largo y podria quedar fuera de vista).
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [error]);

  const isCode = language === 'python' || language === 'javascript';
  const isQuiz = language === 'quiz';
  const isNew = !exercise;
  const languageChanged = !!exercise && language !== exercise.language;

  const updateCase = (key: string, patch: Partial<AuthoringCase>) => {
    setCases((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));
    setComputeNotice(null);
  };
  const addCase = () =>
    setCases((prev) => [...prev, newCase({ setup: language === 'sql' ? prev[0]?.setup ?? SQL_SAMPLE_SETUP : '', checks: language === 'html' ? [] : [] })]);
  const removeCase = (key: string) => setCases((prev) => prev.filter((c) => c.key !== key));

  const changeLanguage = (next: string) => {
    if (next === language) return;
    setLanguage(next);
    // Los casos de un lenguaje no sirven en otro: se arma uno nuevo.
    setCases([newCase({ setup: next === 'sql' ? SQL_SAMPLE_SETUP : '' })]);
    if (!starterCode.trim() || Object.values(STARTER_TEMPLATES).includes(starterCode)) setStarterCode(STARTER_TEMPLATES[next] ?? '');
    setComputeNotice(null);
  };

  // Calcula la salida esperada de cada caso ejecutando la solucion de referencia.
  const compute = async (): Promise<string[] | null> => {
    setError(null);
    if (!solution.trim()) {
      setError('Escribí la solución de referencia para calcular los resultados esperados.');
      return null;
    }
    setComputing(true);
    setComputeNotice(null);
    try {
      const solved = await runCases(language, solution, cases);
      if (solved.error || !solved.outputs) {
        setError(solved.error ?? 'No se pudo calcular.');
        return null;
      }
      const outputs = solved.outputs;
      setCases((prev) => prev.map((c, i) => ({ ...c, expectedOutput: outputs[i] })));

      // Aviso (no bloquea): si el codigo inicial ya da el mismo resultado, el ejercicio viene resuelto.
      const starter = starterCode.trim() ? await runCases(language, starterCode, cases) : null;
      const starterSolves = !!starter?.outputs && starter.outputs.every((o, i) => o === outputs[i]);
      setComputeNotice(
        starterSolves
          ? { kind: 'warn', text: 'Resultados calculados. Ojo: el código inicial ya da el resultado esperado, así que el ejercicio vendría resuelto.' }
          : { kind: 'ok', text: `Resultados calculados para ${cases.length} ${cases.length === 1 ? 'caso' : 'casos'}.` },
      );
      return outputs;
    } finally {
      setComputing(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!title.trim() || !prompt.trim()) {
      setError('Completá el título y la consigna.');
      return;
    }
    const problem = validateCases(language, cases);
    if (problem) {
      setError(problem);
      return;
    }

    // Opcion multiple: no hay nada que ejecutar; se guardan las opciones y la correcta.
    if (isQuiz) {
      setSaving(true);
      const quizError = await onSave({
        title: title.trim(),
        prompt: prompt.trim(),
        starterCode: '',
        language,
        rewardXp,
        hint: hint.trim() || undefined,
        testCases: casesToPayload('quiz', cases, false),
      });
      setSaving(false);
      if (quizError) setError(quizError);
      else onClose();
      return;
    }

    // SQL y HTML/CSS: el resultado esperado SIEMPRE sale de ejecutar la solucion, nunca se escribe a mano.
    let finalCases = cases;
    const missing = cases.some((c) => !c.expectedOutput.trim());
    if (!isCode && (missing || solution.trim())) {
      const outputs = await compute();
      if (!outputs) return;
      finalCases = cases.map((c, i) => ({ ...c, expectedOutput: outputs[i] }));
    } else if (isCode && solution.trim() && missing) {
      const outputs = await compute();
      if (!outputs) return;
      finalCases = cases.map((c, i) => ({ ...c, expectedOutput: outputs[i] }));
    }
    if (finalCases.some((c) => !c.expectedOutput.trim())) {
      setError(isCode ? 'Cada caso necesita su salida esperada: escribila o calculala con tu solución de referencia.' : 'Escribí la solución de referencia para calcular los resultados esperados.');
      return;
    }

    setSaving(true);
    const saveError = await onSave({
      title: title.trim(),
      prompt: prompt.trim(),
      starterCode,
      language,
      rewardXp,
      hint: hint.trim() || undefined,
      testCases: casesToPayload(language, finalCases, sqlOrdered),
    });
    setSaving(false);
    if (saveError) setError(saveError);
    else onClose();
  };

  // Chequeos de HTML/CSS de un caso.
  const updateCheck = (caseKey: string, index: number, patch: Partial<HtmlCheck>) =>
    updateCase(caseKey, { checks: (cases.find((c) => c.key === caseKey)?.checks ?? []).map((ck, i) => (i === index ? { ...ck, ...patch } : ck)), expectedOutput: '' });
  const addCheck = (caseKey: string) =>
    updateCase(caseKey, { checks: [...(cases.find((c) => c.key === caseKey)?.checks ?? []), { selector: '', kind: 'count' as HtmlCheckKind, property: '' }], expectedOutput: '' });
  const removeCheck = (caseKey: string, index: number) =>
    updateCase(caseKey, { checks: (cases.find((c) => c.key === caseKey)?.checks ?? []).filter((_, i) => i !== index), expectedOutput: '' });

  const busy = computing || saving;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-3 sm:p-6 bg-[#0b1c30]/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4 flex flex-col">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="font-heading font-bold text-lg text-[#0b1c30]">{isNew ? 'Nuevo ejercicio' : 'Editar ejercicio'}</h2>
            <p className="text-xs text-slate-500">Lenguaje: {languageLabel(language)}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer" aria-label="Cerrar">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} noValidate className="p-5 flex flex-col gap-5">
          {/* Datos del ejercicio */}
          <section className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Field label="Título">
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className={`${INPUT} h-10`} placeholder="Ej.: Suma de dos números" />
                </Field>
              </div>
              <Field label="Lenguaje">
                <select value={language} onChange={(e) => changeLanguage(e.target.value)} className={`${INPUT} h-10 cursor-pointer`}>
                  {LANGUAGE_CHOICES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </Field>
            </div>
            {languageChanged && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Cambiaste el lenguaje: los casos de prueba se reemplazan por casos nuevos. Cargá de nuevo la solución de referencia.
              </p>
            )}
            <Field label="Consigna" hint="Lo que lee el alumno. Para SQL y HTML/CSS decí los nombres exactos de columnas, clases o textos que se esperan.">
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className={`${INPUT} py-2`} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="XP al resolverlo">
                <input type="number" min={0} max={1000} value={rewardXp} onChange={(e) => setRewardXp(Math.max(0, Number(e.target.value) || 0))} className={`${INPUT} h-10`} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Pista" hint="Se le muestra al alumno cuando se equivoca, en lugar del error técnico.">
                  <input value={hint} onChange={(e) => setHint(e.target.value)} className={`${INPUT} h-10`} placeholder="Ej.: Usá el operador % para el resto" />
                </Field>
              </div>
            </div>
            {!isQuiz && (
            <Field label="Código inicial" hint="Lo que el alumno ve al abrir el ejercicio.">
              <textarea value={starterCode} onChange={(e) => setStarterCode(e.target.value)} rows={4} className={MONO} spellCheck={false} />
            </Field>
            )}
          </section>

          {!isQuiz && (
          <>
          {/* Solucion de referencia */}
          <section className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
            <Field
              label="Solución de referencia (no se guarda)"
              hint={isCode
                ? 'Escribí una solución correcta y apretá "Calcular". Se ejecuta con cada entrada y se guarda lo que imprime como salida esperada.'
                : language === 'sql'
                  ? 'Escribí la consulta correcta. Se ejecuta sobre la base de cada caso y su resultado (columnas y filas) pasa a ser el esperado.'
                  : 'Escribí el HTML y CSS correcto. Se dibuja y se miden los chequeos de cada caso; esas mediciones pasan a ser las esperadas.'}
            >
              <textarea value={solution} onChange={(e) => setSolution(e.target.value)} rows={5} className={MONO} spellCheck={false} />
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={compute}
                disabled={busy || !solution.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">{computing ? 'hourglass_top' : 'play_arrow'}</span>
                {computing ? 'Calculando…' : 'Calcular resultados esperados'}
              </button>
              {language === 'sql' && (
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={sqlOrdered} onChange={(e) => setSqlOrdered(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                  El orden de las filas importa (la consigna pide ORDER BY)
                </label>
              )}
              {computeNotice && (
                <span className={`text-xs font-semibold flex items-center gap-1 ${computeNotice.kind === 'ok' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  <span className="material-symbols-outlined text-sm">{computeNotice.kind === 'ok' ? 'check_circle' : 'warning'}</span>
                  {computeNotice.text}
                </span>
              )}
            </div>
          </section>
          </>
          )}

          {isQuiz && cases[0] && (
            <section className="flex flex-col gap-3">
              <div>
                <h3 className="font-heading font-bold text-sm text-[#0b1c30]">Opciones de respuesta</h3>
                <p className="text-[11px] text-slate-500">Escribí entre 2 y 6 opciones y marcá la correcta. El alumno las ve en el orden en que las cargues; la respuesta correcta no viaja a su pantalla.</p>
              </div>
              {cases[0].options.map((option, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="quiz-correct"
                    checked={cases[0].correct === i}
                    onChange={() => updateCase(cases[0].key, { correct: i })}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    aria-label={`La opción ${i + 1} es la correcta`}
                  />
                  <span className="text-xs font-bold text-slate-400 w-5">{String.fromCharCode(65 + i)}</span>
                  <input
                    value={option}
                    onChange={(e) => updateCase(cases[0].key, { options: cases[0].options.map((o, k) => (k === i ? e.target.value : o)) })}
                    placeholder={`Opción ${i + 1}`}
                    className={`${INPUT} h-10`}
                  />
                  {cases[0].options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => updateCase(cases[0].key, {
                        options: cases[0].options.filter((_, k) => k !== i),
                        correct: cases[0].correct === i ? 0 : cases[0].correct > i ? cases[0].correct - 1 : cases[0].correct,
                      })}
                      className="text-slate-400 hover:text-red-600 cursor-pointer"
                      aria-label="Quitar opción"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between">
                {cases[0].options.length < 6 ? (
                  <button type="button" onClick={() => updateCase(cases[0].key, { options: [...cases[0].options, ''] })} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
                    <span className="material-symbols-outlined text-sm">add</span> Agregar opción
                  </button>
                ) : <span />}
                <span className="text-[11px] text-emerald-700 font-semibold">Correcta: opción {String.fromCharCode(65 + cases[0].correct)}</span>
              </div>
            </section>
          )}

          {!isQuiz && (
          <>
          {/* Casos de prueba */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-[#0b1c30]">Casos de prueba</h3>
                <p className="text-[11px] text-slate-500">El alumno aprueba cuando su resultado coincide en TODOS los casos. Los ocultos no se le muestran como ejemplo.</p>
              </div>
              <button type="button" onClick={addCase} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
                <span className="material-symbols-outlined text-sm">add</span> Agregar caso
              </button>
            </div>

            {cases.map((c, index) => (
              <div key={c.key} className="border border-slate-200 rounded-xl p-3.5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0b1c30]">Caso {index + 1}</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={c.isHidden} onChange={(e) => updateCase(c.key, { isHidden: e.target.checked })} className="w-4 h-4 accent-blue-600" />
                      Oculto
                    </label>
                    {cases.length > 1 && (
                      <button type="button" onClick={() => removeCase(c.key)} className="text-xs text-red-600 hover:text-red-700 cursor-pointer">Quitar</button>
                    )}
                  </div>
                </div>

                {isCode && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Entrada (lo que lee input(), una línea por valor)">
                      <textarea value={c.input} onChange={(e) => updateCase(c.key, { input: e.target.value, expectedOutput: '' })} rows={3} className={MONO} spellCheck={false} />
                    </Field>
                    <Field label="Salida esperada" hint="Podés calcularla con la solución de referencia o escribirla.">
                      <textarea value={c.expectedOutput} onChange={(e) => updateCase(c.key, { expectedOutput: e.target.value })} rows={3} className={MONO} spellCheck={false} />
                    </Field>
                  </div>
                )}

                {language === 'sql' && (
                  <div className="flex flex-col gap-3">
                    <Field label="Base de datos de este caso (script SQL)" hint="CREATE TABLE e INSERT. Usá datos distintos en el caso oculto para que no se pueda aprobar escribiendo los valores a mano.">
                      <textarea value={c.setup} onChange={(e) => updateCase(c.key, { setup: e.target.value, expectedOutput: '' })} rows={7} className={MONO} spellCheck={false} />
                    </Field>
                    <div className="flex items-center justify-between">
                      <button type="button" onClick={() => updateCase(c.key, { setup: SQL_SAMPLE_SETUP, expectedOutput: '' })} className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                        Insertar base de ejemplo
                      </button>
                      <ComputedResult value={c.expectedOutput} />
                    </div>
                  </div>
                )}

                {language === 'html' && (
                  <div className="flex flex-col gap-2.5">
                    <span className={LABEL}>Qué se revisa en la página</span>
                    {c.checks.length === 0 && <p className="text-[11px] text-slate-400">Todavía no hay chequeos. Agregá uno.</p>}
                    {c.checks.map((check, i) => {
                      const kind = HTML_CHECK_KINDS.find((k) => k.id === check.kind);
                      return (
                        <div key={i} className="grid grid-cols-12 gap-2 items-center">
                          <input value={check.selector} onChange={(e) => updateCheck(c.key, i, { selector: e.target.value })} placeholder="Selector (h1, .boton, nav > ul…)" className={`${INPUT} h-9 text-xs font-mono col-span-12 sm:col-span-4`} />
                          <select value={check.kind} onChange={(e) => updateCheck(c.key, i, { kind: e.target.value as HtmlCheckKind })} className={`${INPUT} h-9 text-xs col-span-6 sm:col-span-4 cursor-pointer`}>
                            {HTML_CHECK_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
                          </select>
                          <input
                            value={check.property}
                            onChange={(e) => updateCheck(c.key, i, { property: e.target.value })}
                            disabled={!kind?.needsProperty}
                            placeholder={kind?.needsProperty ? 'href, color…' : '—'}
                            className={`${INPUT} h-9 text-xs font-mono col-span-5 sm:col-span-3 disabled:bg-slate-50 disabled:text-slate-300`}
                          />
                          <button type="button" onClick={() => removeCheck(c.key, i)} className="text-slate-400 hover:text-red-600 col-span-1 flex justify-center cursor-pointer" aria-label="Quitar chequeo">
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between">
                      <button type="button" onClick={() => addCheck(c.key)} className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer w-fit">
                        <span className="material-symbols-outlined text-sm">add</span> Agregar chequeo
                      </button>
                      <ComputedResult value={c.expectedOutput} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>
          </>
          )}

          {error && (
            <div ref={errorRef} role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
              <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
              <p className="text-xs font-medium whitespace-pre-line">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancelar</button>
            <button type="submit" disabled={busy} className="btn-game-primary px-5 py-2.5 text-xs disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Guardando…' : isNew ? 'Crear ejercicio' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/** Vista corta del resultado calculado de un caso (SQL / HTML): el admin no lo edita. */
const ComputedResult: React.FC<{ value: string }> = ({ value }) => {
  if (!value) return <span className="text-[11px] text-slate-400">Resultado esperado: sin calcular</span>;
  let summary = 'calculado';
  try {
    const parsed = JSON.parse(value);
    if (parsed && Array.isArray(parsed.rows)) summary = `${parsed.rows.length} ${parsed.rows.length === 1 ? 'fila' : 'filas'} · columnas: ${(parsed.columns ?? []).join(', ')}`;
    else if (Array.isArray(parsed)) summary = `${parsed.length} ${parsed.length === 1 ? 'medición' : 'mediciones'}`;
  } catch { /* se deja el texto generico */ }
  return (
    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 truncate max-w-[60%]" title={value}>
      <span className="material-symbols-outlined text-sm">check_circle</span>
      Resultado esperado: {summary}
    </span>
  );
};
