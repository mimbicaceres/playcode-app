import React, { useState } from 'react';

interface NewCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCourse: (course: { title: string; category: string; description: string }) => void;
}

export const NewCourseModal: React.FC<NewCourseModalProps> = ({
  isOpen,
  onClose,
  onCreateCourse
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Programación Web');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onCreateCourse({ title, category, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 p-6 animate-scale-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-bold text-xl text-[#0b1c30]">
            Crear Nuevo Curso
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#434655]">Título del Curso</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Algoritmos Avanzados con Python"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2563eb]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#434655]">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2563eb]"
            >
              <option>Programación Web</option>
              <option>Python & Data Science</option>
              <option>Lógica & Estructuras de Datos</option>
              <option>Desarrollo Móvil</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#434655]">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve resumen del contenido y objetivos del curso..."
              className="w-full h-24 p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2563eb] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl shadow-sm"
            >
              Publicar Curso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
