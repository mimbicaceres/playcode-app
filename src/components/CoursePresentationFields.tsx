import React from 'react';
import { languageInfo } from '../lib/languages';

// Opciones de presentacion de un curso (todas opcionales): categoria libre, nivel, duracion
// estimada, icono y color. Las usan el asistente de "Crear curso" y el creador de cursos.

export interface CoursePresentation {
  category: string;
  level: string;
  estimatedHours: string;
  iconName: string;
  color: string;
}

export const EMPTY_PRESENTATION: CoursePresentation = { category: '', level: '', estimatedHours: '', iconName: '', color: '' };

export const LEVEL_OPTIONS = [
  { id: 'principiante', label: 'Principiante' },
  { id: 'intermedio', label: 'Intermedio' },
  { id: 'avanzado', label: 'Avanzado' },
];

export const levelLabel = (id: string | null | undefined) => LEVEL_OPTIONS.find((l) => l.id === id)?.label ?? null;

const ICON_CHOICES = [
  'code', 'javascript', 'html', 'database', 'terminal', 'data_object', 'web', 'memory', 'hub', 'bug_report',
  'psychology', 'calculate', 'science', 'school', 'rocket_launch', 'extension', 'smart_toy', 'cloud', 'security', 'menu_book',
];

const COLOR_CHOICES = ['#2563EB', '#16A34A', '#CA8A04', '#EA580C', '#DC2626', '#7C3AED', '#DB2777', '#0891B2'];

const INPUT = 'w-full px-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-600 transition-colors bg-white h-10';

/** Valores del formulario → lo que recibe el servidor (texto vacio = sin valor). */
export function presentationToPayload(p: CoursePresentation) {
  const hours = parseInt(p.estimatedHours, 10);
  return {
    category: p.category.trim() || null,
    level: p.level || null,
    estimatedHours: Number.isFinite(hours) && hours > 0 ? hours : null,
    iconName: p.iconName || null,
    color: p.color || null,
  };
}

interface CoursePresentationFieldsProps {
  value: CoursePresentation;
  onChange: (next: CoursePresentation) => void;
  /** Lenguaje del curso: sus valores por defecto se muestran de referencia. */
  language: string;
}

export const CoursePresentationFields: React.FC<CoursePresentationFieldsProps> = ({ value, onChange, language }) => {
  const info = languageInfo(language);
  const set = (patch: Partial<CoursePresentation>) => onChange({ ...value, ...patch });
  const activeColor = value.color || info.color;
  const activeIcon = value.iconName || info.iconName;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#434655]" htmlFor="cp-category">Categoría</label>
          <input id="cp-category" value={value.category} maxLength={40} onChange={(e) => set({ category: e.target.value })} placeholder={info.category} className={INPUT} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#434655]" htmlFor="cp-level">Nivel</label>
          <select id="cp-level" value={value.level} onChange={(e) => set({ level: e.target.value })} className={`${INPUT} cursor-pointer`}>
            <option value="">Sin indicar</option>
            {LEVEL_OPTIONS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#434655]" htmlFor="cp-hours">Duración (horas)</label>
          <input id="cp-hours" type="number" min={1} max={500} value={value.estimatedHours} onChange={(e) => set({ estimatedHours: e.target.value })} placeholder="Ej.: 20" className={INPUT} />
        </div>
      </div>
      <p className="text-[11px] text-slate-500 -mt-1.5">
        La categoría es la etiqueta que ve el alumno en la tarjeta del curso (por ejemplo "Java" o "Algoritmos"). Si la dejás vacía se usa "{info.category}".
      </p>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-[#434655]">Ícono</span>
        <div className="flex flex-wrap gap-1.5">
          {ICON_CHOICES.map((icon) => (
            <button
              key={icon}
              type="button"
              title={icon}
              aria-label={`Ícono ${icon}`}
              aria-pressed={value.iconName === icon}
              onClick={() => set({ iconName: value.iconName === icon ? '' : icon })}
              className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-colors ${value.iconName === icon ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-[#434655]">Color</span>
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_CHOICES.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              aria-label={`Color ${color}`}
              aria-pressed={value.color === color}
              onClick={() => set({ color: value.color === color ? '' : color })}
              className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform ${value.color === color ? 'border-[#0b1c30] scale-110' : 'border-white shadow-sm hover:scale-105'}`}
              style={{ backgroundColor: color }}
            />
          ))}
          {(value.color || value.iconName) && (
            <button type="button" onClick={() => set({ color: '', iconName: '' })} className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer ml-1">
              Usar los del lenguaje
            </button>
          )}
        </div>
      </div>

      {/* Vista previa de la tarjeta que va a ver el alumno */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 bg-slate-50">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${activeColor}1a`, borderColor: `${activeColor}55`, color: activeColor }}>
          <span className="material-symbols-outlined text-2xl">{activeIcon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: activeColor }}>{value.category.trim() || info.category}</p>
          <p className="text-[11px] text-slate-500">
            Así se ve la etiqueta del curso
            {levelLabel(value.level) ? ` · ${levelLabel(value.level)}` : ''}
            {value.estimatedHours ? ` · ${value.estimatedHours} h` : ''}
          </p>
        </div>
      </div>
    </div>
  );
};
