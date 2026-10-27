import React, { useEffect, useState } from 'react';
import {
  AdminCourseContent, AdminExercise, AdminUnit, ApiError, ExerciseFormInput, createExerciseRequest, createUnitRequest,
  deleteCourseRequest, deleteExerciseRequest, deleteUnitRequest, duplicateExerciseRequest, duplicateUnitRequest, fetchAdminCourseContent, getStoredToken,
  reorderExercisesRequest, reorderUnitsRequest, updateCourseRequest, updateExerciseRequest, updateUnitRequest,
} from '../auth/api';
import { LANGUAGE_CHOICES, languageLabel } from '../lib/exerciseAuthoring';
import { ExerciseEditorModal } from './Modals/ExerciseEditorModal';
import { CoursePresentation, CoursePresentationFields, EMPTY_PRESENTATION, levelLabel, presentationToPayload } from './CoursePresentationFields';

// Creador / editor de un curso (pantalla completa, solo admin): datos del curso, unidades
// y ejercicios, con todo lo necesario para dejarlo listo y asignarlo a los alumnos.

interface AdminCourseBuilderProps {
  courseId: string;
  onClose: () => void;
  /** Avisa al panel que el contenido cambio (para refrescar contadores y listas). */
  onChanged: () => void;
  /** Avisa que el curso se borro (el panel cierra el creador y refresca). */
  onDeleted: () => void;
  /** Abre la asignacion de este curso a alumnos y docentes. */
  onAssign: (courseId: string) => void;
}

const INPUT = 'w-full px-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-600 transition-colors bg-white';

const errorMessage = (error: unknown) => (error instanceof ApiError ? error.message : 'No se pudo completar la acción. Intentá de nuevo.');

const IconButton: React.FC<{ icon: string; title: string; onClick: () => void; disabled?: boolean; danger?: boolean }> = ({ icon, title, onClick, disabled, danger }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    disabled={disabled}
    onClick={onClick}
    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${danger ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
  >
    <span className="material-symbols-outlined text-[18px]">{icon}</span>
  </button>
);

export const AdminCourseBuilder: React.FC<AdminCourseBuilderProps> = ({ courseId, onClose, onChanged, onDeleted, onAssign }) => {
  const [content, setContent] = useState<AdminCourseContent | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Datos del curso (formulario).
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('python');
  const [presentation, setPresentation] = useState<CoursePresentation>(EMPTY_PRESENTATION);
  const [showPresentation, setShowPresentation] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [renamingUnit, setRenamingUnit] = useState<{ id: string; title: string } | null>(null);
  const [exerciseModal, setExerciseModal] = useState<{ unit: AdminUnit; exercise?: AdminExercise } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  const load = () =>
    fetchAdminCourseContent(getStoredToken() ?? '', courseId)
      .then((course) => {
        setContent(course);
        setTitle(course.title ?? '');
        setDescription(course.description ?? '');
        setLanguage(course.language ?? 'python');
        setPresentation({
          category: course.category ?? '',
          level: course.level ?? '',
          estimatedHours: course.estimatedHours ? String(course.estimatedHours) : '',
          iconName: course.iconName ?? '',
          color: course.color ?? '',
        });
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  useEffect(() => { load(); }, [courseId]);

  // Ejecuta una accion, muestra el error si falla y, si sale bien, recarga el curso y avisa al panel.
  const run = async (action: (token: string) => Promise<unknown>, success?: string): Promise<boolean> => {
    const token = getStoredToken();
    if (!token) {
      setError('Tu sesión expiró. Volvé a iniciar sesión.');
      return false;
    }
    setError(null);
    try {
      await action(token);
      await load();
      onChanged();
      if (success) {
        setNotice(success);
        setTimeout(() => setNotice(null), 3000);
      }
      return true;
    } catch (e) {
      setError(errorMessage(e));
      return false;
    }
  };

  const saveInfo = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('El título del curso es obligatorio.');
      return;
    }
    setSavingInfo(true);
    await run(
      (token) => updateCourseRequest(token, courseId, { title: title.trim(), description: description.trim(), language, ...presentationToPayload(presentation) }),
      'Datos del curso guardados.',
    );
    setSavingInfo(false);
  };

  const addUnit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newUnitTitle.trim()) return;
    if (await run((token) => createUnitRequest(token, courseId, newUnitTitle.trim()))) setNewUnitTitle('');
  };

  // Crea varias unidades de una vez (una por linea).
  const addBulkUnits = async (event: React.FormEvent) => {
    event.preventDefault();
    const titles = bulkText.split('\n').map((t) => t.trim()).filter(Boolean);
    if (titles.length === 0) return;
    const ok = await run(async (token) => {
      for (const unitTitle of titles) await createUnitRequest(token, courseId, unitTitle);
    }, `${titles.length} ${titles.length === 1 ? 'unidad creada' : 'unidades creadas'}.`);
    if (ok) {
      setBulkText('');
      setBulkOpen(false);
    }
  };

  const renameUnit = async () => {
    if (!renamingUnit) return;
    if (!renamingUnit.title.trim()) {
      setError('El título de la unidad no puede estar vacío.');
      return;
    }
    if (await run((token) => updateUnitRequest(token, renamingUnit.id, renamingUnit.title.trim()))) setRenamingUnit(null);
  };

  const removeUnit = (unit: AdminUnit) => {
    const exercises = unit.exercises.length;
    const text = exercises > 0
      ? `¿Eliminar la unidad "${unit.title}" con sus ${exercises} ejercicios? También se borra el avance de los alumnos en ellos.`
      : `¿Eliminar la unidad "${unit.title}"?`;
    if (window.confirm(text)) run((token) => deleteUnitRequest(token, unit.id), 'Unidad eliminada.');
  };

  const removeExercise = (exercise: AdminExercise) => {
    if (window.confirm(`¿Eliminar el ejercicio "${exercise.title}"? También se borra el avance de los alumnos en él.`)) {
      run((token) => deleteExerciseRequest(token, exercise.id), 'Ejercicio eliminado.');
    }
  };

  // Mueve un elemento una posicion arriba (-1) o abajo (+1) y guarda el nuevo orden.
  const moveUnit = (index: number, delta: -1 | 1) => {
    if (!content) return;
    const ids = content.units.map((u) => u.id);
    [ids[index], ids[index + delta]] = [ids[index + delta], ids[index]];
    run((token) => reorderUnitsRequest(token, courseId, ids));
  };
  const moveExercise = (unit: AdminUnit, index: number, delta: -1 | 1) => {
    const ids = unit.exercises.map((e) => e.id);
    [ids[index], ids[index + delta]] = [ids[index + delta], ids[index]];
    run((token) => reorderExercisesRequest(token, unit.id, ids));
  };

  const saveExercise = async (data: ExerciseFormInput): Promise<string | null> => {
    if (!exerciseModal) return null;
    const token = getStoredToken();
    if (!token) return 'Tu sesión expiró. Volvé a iniciar sesión.';
    try {
      if (exerciseModal.exercise) await updateExerciseRequest(token, exerciseModal.exercise.id, data);
      else await createExerciseRequest(token, exerciseModal.unit.id, data);
      await load();
      onChanged();
      setNotice(exerciseModal.exercise ? 'Ejercicio actualizado.' : 'Ejercicio creado.');
      setTimeout(() => setNotice(null), 3000);
      return null;
    } catch (e) {
      return errorMessage(e);
    }
  };

  const deleteCourse = async () => {
    if (await run((token) => deleteCourseRequest(token, courseId))) onDeleted();
  };

  // ─── Estado del curso ───
  const units = content?.units ?? [];
  const exerciseCount = units.reduce((sum, u) => sum + u.exercises.length, 0);
  const totalXp = units.reduce((sum, u) => sum + u.exercises.reduce((s, e) => s + e.rewardXp, 0), 0);
  const assigned = content?._count?.assignments ?? 0;
  const emptyUnits = units.filter((u) => u.exercises.length === 0);
  const pending: string[] = [];
  if (units.length === 0) pending.push('Agregá al menos una unidad.');
  if (emptyUnits.length > 0) pending.push(`Cargá ejercicios en: ${emptyUnits.map((u) => u.title).join(', ')}.`);
  const ready = pending.length === 0 && exerciseCount > 0;
  const savedPresentation = content
    ? {
        category: content.category ?? '',
        level: content.level ?? '',
        estimatedHours: content.estimatedHours ? String(content.estimatedHours) : '',
        iconName: content.iconName ?? '',
        color: content.color ?? '',
      }
    : EMPTY_PRESENTATION;
  const presentationChanged = (Object.keys(savedPresentation) as (keyof CoursePresentation)[]).some((k) => presentation[k].trim() !== savedPresentation[k]);
  const infoChanged = !!content && (title.trim() !== (content.title ?? '') || description.trim() !== (content.description ?? '') || language !== content.language || presentationChanged);

  return (
    <div className="fixed inset-0 z-[60] bg-[#f8f9ff] overflow-y-auto">
      {/* Barra superior */}
      <div className="sticky top-0 z-10 bg-[#0b1c30] text-white border-b border-white/10 shadow-md">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center gap-3">
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center cursor-pointer" aria-label="Volver">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Creador de cursos</p>
            <h1 className="font-heading font-bold text-base truncate">{content?.title ?? 'Curso'}</h1>
            {content && (
              <p className="text-[11px] text-blue-200/90 truncate">
                {content.category?.trim() || languageLabel(content.language)}
                {levelLabel(content.level) ? ` · ${levelLabel(content.level)}` : ''}
                {content.estimatedHours ? ` · ${content.estimatedHours} h` : ''}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAssign(courseId)}
            className="bg-[#ffb95f] hover:bg-[#ffc980] text-[#0b1c30] px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">playlist_add</span>
            Asignar curso
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-5">
        {loadError && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">No se pudo cargar el curso.</div>}
        {!content && !loadError && <p className="text-center text-slate-500 py-10">Cargando…</p>}

        {content && (
          <>
            {notice && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>{notice}
              </div>
            )}
            {error && (
              <div className="flex items-start justify-between gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                <span className="flex items-start gap-2"><span className="material-symbols-outlined text-base text-red-600">error</span>{error}</span>
                <button type="button" onClick={() => setError(null)} className="cursor-pointer" aria-label="Cerrar"><span className="material-symbols-outlined text-base">close</span></button>
              </div>
            )}

            {/* Resumen y estado */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Unidades', value: units.length, icon: 'layers' },
                { label: 'Ejercicios', value: exerciseCount, icon: 'assignment' },
                { label: 'XP total', value: totalXp, icon: 'stars' },
                { label: 'Asignado a', value: `${assigned} ${assigned === 1 ? 'usuario' : 'usuarios'}`, icon: 'groups' },
              ].map((item) => (
                <div key={item.label} className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-blue-600">{item.icon}</span>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="font-bold text-lg text-[#0b1c30] leading-tight">{item.value}</p>
                  </div>
                </div>
              ))}
            </section>

            <div className={`rounded-2xl border p-3.5 text-xs flex items-start gap-2.5 ${ready ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
              <span className={`material-symbols-outlined text-xl ${ready ? 'text-emerald-600' : 'text-amber-600'}`}>{ready ? 'task_alt' : 'pending_actions'}</span>
              <div>
                <p className="font-bold">{ready ? (assigned > 0 ? 'Curso listo y en uso' : 'Curso listo para asignar') : 'Falta completar el curso'}</p>
                {ready
                  ? <p>{assigned > 0 ? 'Los alumnos asignados ya lo ven.' : 'Apretá "Asignar curso" para que lo vean los alumnos y docentes que elijas.'}</p>
                  : <ul className="list-disc pl-4 mt-0.5">{pending.map((p) => <li key={p}>{p}</li>)}</ul>}
              </div>
            </div>

            {/* Datos del curso */}
            <form onSubmit={saveInfo} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
              <h2 className="font-heading font-bold text-base text-[#0b1c30]">Datos del curso</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#434655]" htmlFor="cb-title">Título</label>
                  <input id="cb-title" value={title} onChange={(e) => setTitle(e.target.value)} className={`${INPUT} h-10`} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#434655]" htmlFor="cb-language">Lenguaje</label>
                  <select id="cb-language" value={language} onChange={(e) => setLanguage(e.target.value)} className={`${INPUT} h-10 cursor-pointer`}>
                    {LANGUAGE_CHOICES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#434655]" htmlFor="cb-description">Descripción</label>
                <textarea id="cb-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${INPUT} py-2`} />
                <span className="text-[11px] text-slate-500">Es lo que lee el alumno en la tarjeta del curso. El lenguaje define el editor, la categoría y el color; los ejercicios nuevos lo usan por defecto.</span>
              </div>
              <div className="border border-slate-200 rounded-2xl">
                <button type="button" onClick={() => setShowPresentation((v) => !v)} aria-expanded={showPresentation} className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer">
                  <span>
                    <span className="block text-sm font-bold text-[#0b1c30]">Presentación del curso</span>
                    <span className="block text-[11px] text-slate-500">Categoría, nivel, duración, ícono y color</span>
                  </span>
                  <span className="material-symbols-outlined text-slate-400">{showPresentation ? 'expand_less' : 'expand_more'}</span>
                </button>
                {showPresentation && (
                  <div className="px-4 pb-4">
                    <CoursePresentationFields value={presentation} onChange={setPresentation} language={language} />
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={savingInfo || !infoChanged} className="btn-game-primary px-5 py-2.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                  {savingInfo ? 'Guardando…' : 'Guardar datos'}
                </button>
              </div>
            </form>

            {/* Unidades y ejercicios */}
            <section className="flex flex-col gap-3">
              <h2 className="font-heading font-bold text-base text-[#0b1c30]">Unidades y ejercicios</h2>
              {units.length === 0 && (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300">layers</span>
                  <p className="text-sm font-semibold text-slate-600 mt-1">Este curso todavía no tiene unidades</p>
                  <p className="text-xs text-slate-400">Una unidad agrupa ejercicios de un mismo tema. Creá la primera abajo.</p>
                </div>
              )}

              {units.map((unit, unitIndex) => (
                <div key={unit.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{unitIndex + 1}</span>
                    {renamingUnit?.id === unit.id ? (
                      <form onSubmit={(e) => { e.preventDefault(); renameUnit(); }} className="flex-1 flex items-center gap-2">
                        <input autoFocus value={renamingUnit.title} onChange={(e) => setRenamingUnit({ id: unit.id, title: e.target.value })} className={`${INPUT} h-8 text-sm`} />
                        <button type="submit" className="text-xs font-semibold text-blue-600 cursor-pointer">Guardar</button>
                        <button type="button" onClick={() => setRenamingUnit(null)} className="text-xs text-slate-500 cursor-pointer">Cancelar</button>
                      </form>
                    ) : (
                      <h3 className="font-semibold text-sm text-[#0b1c30] flex-1 truncate">{unit.title}</h3>
                    )}
                    <span className="text-[11px] text-slate-500 whitespace-nowrap hidden sm:inline">{unit.exercises.length} {unit.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}</span>
                    <IconButton icon="arrow_upward" title="Subir unidad" onClick={() => moveUnit(unitIndex, -1)} disabled={unitIndex === 0} />
                    <IconButton icon="arrow_downward" title="Bajar unidad" onClick={() => moveUnit(unitIndex, 1)} disabled={unitIndex === units.length - 1} />
                    <IconButton icon="edit" title="Renombrar unidad" onClick={() => setRenamingUnit({ id: unit.id, title: unit.title ?? '' })} />
                    <IconButton icon="content_copy" title="Duplicar unidad (con sus ejercicios)" onClick={() => run((token) => duplicateUnitRequest(token, unit.id), 'Unidad duplicada.')} />
                    <IconButton icon="delete" title="Eliminar unidad" danger onClick={() => removeUnit(unit)} />
                  </div>

                  <ul className="divide-y divide-slate-100">
                    {unit.exercises.length === 0 && <li className="px-4 py-3 text-xs text-slate-400">Todavía no tiene ejercicios.</li>}
                    {unit.exercises.map((exercise, exIndex) => (
                      <li key={exercise.id} className="px-4 py-2.5 flex items-center gap-2 hover:bg-slate-50/70">
                        <span className="text-[11px] font-bold text-slate-400 w-5 text-right">{exIndex + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0b1c30] truncate">{exercise.title}</p>
                          <p className="text-[11px] text-slate-500">
                            {languageLabel(exercise.language)} · {exercise.testCases.length} {exercise.testCases.length === 1 ? 'caso' : 'casos'}
                            {' '}({exercise.testCases.filter((t) => t.isHidden).length} ocultos) · {exercise.rewardXp} XP
                            {!exercise.hint && <span className="text-amber-600"> · sin pista</span>}
                          </p>
                        </div>
                        <IconButton icon="arrow_upward" title="Subir ejercicio" onClick={() => moveExercise(unit, exIndex, -1)} disabled={exIndex === 0} />
                        <IconButton icon="arrow_downward" title="Bajar ejercicio" onClick={() => moveExercise(unit, exIndex, 1)} disabled={exIndex === unit.exercises.length - 1} />
                        <IconButton icon="edit" title="Editar ejercicio" onClick={() => setExerciseModal({ unit, exercise })} />
                        <IconButton icon="content_copy" title="Duplicar ejercicio" onClick={() => run((token) => duplicateExerciseRequest(token, exercise.id), 'Ejercicio duplicado.')} />
                        <IconButton icon="delete" title="Eliminar ejercicio" danger onClick={() => removeExercise(exercise)} />
                      </li>
                    ))}
                  </ul>
                  <div className="px-4 py-2.5 border-t border-slate-100">
                    <button type="button" onClick={() => setExerciseModal({ unit })} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
                      <span className="material-symbols-outlined text-sm">add</span> Agregar ejercicio
                    </button>
                  </div>
                </div>
              ))}

              <form onSubmit={addUnit} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-end gap-2">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#434655]" htmlFor="cb-new-unit">Nueva unidad</label>
                  <input id="cb-new-unit" value={newUnitTitle} onChange={(e) => setNewUnitTitle(e.target.value)} placeholder="Ej.: Variables y operadores" className={`${INPUT} h-10`} />
                </div>
                <button type="submit" disabled={!newUnitTitle.trim()} className="btn-game-primary px-4 py-2.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Agregar unidad</button>
              </form>
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                {!bulkOpen ? (
                  <button type="button" onClick={() => setBulkOpen(true)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
                    <span className="material-symbols-outlined text-sm">playlist_add</span> Agregar varias unidades de una vez
                  </button>
                ) : (
                  <form onSubmit={addBulkUnits} className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#434655]" htmlFor="cb-bulk">Unidades (una por línea)</label>
                    <textarea id="cb-bulk" value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={4} placeholder={'Introducción\nVariables\nCondicionales'} className={`${INPUT} py-2`} autoFocus />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => { setBulkOpen(false); setBulkText(''); }} className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancelar</button>
                      <button type="submit" disabled={!bulkText.trim()} className="btn-game-primary px-4 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Crear unidades</button>
                    </div>
                  </form>
                )}
              </div>
            </section>

            {/* Zona de peligro */}
            <section className="bg-white border border-red-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-heading font-bold text-sm text-red-700">Eliminar curso</h2>
                <p className="text-xs text-slate-500">Borra el curso, sus unidades y ejercicios, las asignaciones y el avance de los alumnos. No se puede deshacer.</p>
              </div>
              <button type="button" onClick={() => { setConfirmDelete(true); setDeleteText(''); }} className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer">
                Eliminar curso
              </button>
            </section>
          </>
        )}
      </div>

      {exerciseModal && content && (
        <ExerciseEditorModal
          exercise={exerciseModal.exercise}
          courseLanguage={content.language}
          onSave={saveExercise}
          onClose={() => setExerciseModal(null)}
        />
      )}

      {confirmDelete && content && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#0b1c30]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-3xl text-red-500">warning</span>
              <div>
                <h3 className="font-heading font-bold text-base text-[#0b1c30]">¿Eliminar "{content.title}"?</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Se borran {units.length} {units.length === 1 ? 'unidad' : 'unidades'}, {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
                  {assigned > 0 ? `, la asignación de ${assigned} ${assigned === 1 ? 'usuario' : 'usuarios'}` : ''} y el avance de los alumnos. No se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434655]" htmlFor="cb-delete-confirm">Para confirmar, escribí el nombre del curso</label>
              <input id="cb-delete-confirm" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} placeholder={content.title ?? ''} className={`${INPUT} h-10`} autoFocus />
            </div>
            <div className="flex justify-end gap-2.5">
              <button type="button" onClick={() => setConfirmDelete(false)} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancelar</button>
              <button
                type="button"
                disabled={deleteText.trim() !== (content.title ?? '').trim()}
                onClick={deleteCourse}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Eliminar definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
