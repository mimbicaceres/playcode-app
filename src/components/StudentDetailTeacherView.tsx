import React, { useState } from 'react';
import { ScreenView } from '../types';
import { AVATAR_IMAGES, EXERCISE_HISTORY, BADGES } from '../data/mockData';

interface StudentDetailTeacherViewProps {
  onNavigate: (view: ScreenView) => void;
}

export const StudentDetailTeacherView: React.FC<StudentDetailTeacherViewProps> = ({ onNavigate }) => {
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setShowMessageBox(false);
      setMessageText('');
    }, 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-32">
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={() => onNavigate('teacher_dashboard')}
          className="inline-flex items-center text-xs font-semibold text-[#004ac6] hover:text-[#2563eb] transition-colors group"
        >
          <span className="material-symbols-outlined text-sm mr-1 group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          Volver a Lista de Alumnos
        </button>
      </div>

      <main className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Student Profile & Badges (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-blue-100 shadow-md">
              <img 
                src={AVATAR_IMAGES.facuPhoto} 
                alt="Facundo G." 
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="font-heading font-bold text-2xl text-[#0b1c30] mb-1">
              Facundo G.
            </h1>
            <p className="text-sm text-[#434655] mb-5">
              Colegio San Martín - 4to Año
            </p>

            <div className="w-full flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-[#434655]">Progreso General</span>
              <span className="text-[#2563eb] font-bold">78%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-[#2563eb] rounded-full w-[78%]" />
            </div>

            <button
              onClick={() => setShowMessageBox(!showMessageBox)}
              className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-[#004ac6] font-semibold text-xs rounded-xl border border-blue-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              <span>Enviar Mensaje Pedagógico</span>
            </button>

            {showMessageBox && (
              <form onSubmit={handleSendMessage} className="w-full mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escribe una devolución para Facundo..."
                  className="w-full h-20 p-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#2563eb] outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-[#2563eb] text-white text-xs font-semibold rounded-xl"
                >
                  {messageSent ? '¡Mensaje Enviado!' : 'Enviar'}
                </button>
              </form>
            )}
          </div>

          {/* Gamification Badges Card */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
            <h2 className="font-heading font-bold text-base text-[#0b1c30] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 fill text-xl">
                workspace_premium
              </span>
              Logros Recientes
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center mb-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[#2563eb] text-2xl">
                    code_blocks
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#434655] leading-tight">
                  Mago del HTML
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-amber-600 text-2xl fill">
                    local_fire_department
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#434655] leading-tight">
                  Racha 7 Días
                </span>
              </div>

              <div className="flex flex-col items-center text-center opacity-40">
                <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center mb-1.5">
                  <span className="material-symbols-outlined text-slate-400 text-2xl">
                    lock
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#737686] leading-tight">
                  CSS Guru
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Charts & History (8 cols) */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* XP Growth Card */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 flex flex-col">
              <h3 className="text-xs font-bold text-[#737686] uppercase tracking-wider mb-3">
                Crecimiento de XP
              </h3>
              <div className="h-36 w-full bg-slate-50 rounded-xl relative overflow-hidden flex items-end px-3 gap-3 pb-2 border border-slate-100">
                <div className="w-full bg-[#2563eb]/30 rounded-t h-[25%] relative group hover:bg-[#2563eb]/50 transition-colors">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100">120</span>
                </div>
                <div className="w-full bg-[#2563eb]/45 rounded-t h-[40%] relative group hover:bg-[#2563eb]/60 transition-colors">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100">250</span>
                </div>
                <div className="w-full bg-[#2563eb]/40 rounded-t h-[35%] relative group hover:bg-[#2563eb]/60 transition-colors">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100">210</span>
                </div>
                <div className="w-full bg-[#2563eb]/65 rounded-t h-[65%] relative group hover:bg-[#2563eb]/80 transition-colors">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100">450</span>
                </div>
                <div className="w-full bg-[#2563eb] rounded-t h-[88%] relative group transition-colors">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100">620</span>
                </div>
              </div>
            </div>

            {/* Average Accuracy Card */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 flex flex-col">
              <h3 className="text-xs font-bold text-[#737686] uppercase tracking-wider mb-3">
                Precisión Promedio
              </h3>
              <div className="flex items-center justify-center h-36">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.8"
                    />
                    <path
                      className="text-[#006c49]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="85, 100"
                      strokeLinecap="round"
                      strokeWidth="3.8"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-heading font-extrabold text-2xl text-[#0b1c30]">85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="p-5 border-b border-[#e2e8f0] flex justify-between items-center bg-slate-50/50">
              <h3 className="font-heading font-bold text-base text-[#0b1c30]">
                Historial de Ejercicios
              </h3>
              <button className="text-[#2563eb] text-xs font-semibold hover:underline flex items-center gap-1">
                Ver todo <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-[#e2e8f0] text-xs font-semibold text-[#737686]">
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Curso - Unidad</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Tiempo</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium text-[#0b1c30]">
                  {EXERCISE_HISTORY.map((hist) => (
                    <tr key={hist.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 text-slate-500 whitespace-nowrap">{hist.date}</td>
                      <td className="p-4">
                        <div className="font-bold text-sm text-[#0b1c30]">{hist.course}</div>
                        <div className="text-xs text-slate-500">{hist.unit}</div>
                      </td>
                      <td className="p-4">
                        {hist.status === 'correct' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Correcto
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-800 border border-red-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            Incorrecto
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 font-mono">{hist.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
