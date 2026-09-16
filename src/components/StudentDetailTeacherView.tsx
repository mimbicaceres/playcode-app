import React, { useState } from 'react';
import { ScreenView } from '../types';
import { AVATAR_IMAGES, EXERCISE_HISTORY, BADGES } from '../data/mockData';
import { StatusHud } from './ui/StatusHud';
import { SegmentedProgressBar } from './ui/SegmentedProgressBar';

interface StudentDetailTeacherViewProps {
  onNavigate: (view: ScreenView) => void;
}

export const StudentDetailTeacherView: React.FC<StudentDetailTeacherViewProps> = ({ onNavigate }) => {
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setShowMessageBox(false);
      setMessageText('');
    }, 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-32 flex flex-col gap-6">
      
      {/* Top Status HUD in compact mode - Student being audited */}
      <StatusHud
        compact={true}
        avatarUrl={AVATAR_IMAGES.facuPhoto}
        badgeText="Auditoría de Alumno"
        title="Facundo G."
        subtitle="Colegio San Martín • 4to Año 'A' • Registro Académico: #EST-8492"
      >
        <button
          onClick={() => onNavigate('teacher_dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl border border-white/15 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Volver al Panel</span>
        </button>

        <button
          onClick={() => setShowMessageBox(!showMessageBox)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">mail</span>
          <span>{showMessageBox ? 'Cerrar Mensaje' : 'Enviar Devolución'}</span>
        </button>
      </StatusHud>

      {/* Message Form (Collapsible) */}
      {showMessageBox && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
              <span className="material-symbols-outlined text-lg">edit_note</span>
              <span>Mensaje Pedagógico / Feedback Directo para Facundo</span>
            </div>
            <button
              onClick={() => setShowMessageBox(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <form onSubmit={handleSendMessage} className="space-y-3">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Escribe una observación, consejo técnico o felicitación para el alumno..."
              className="w-full h-24 p-3 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-slate-800 resize-none font-sans"
              required
            />
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                El mensaje se notificará directamente en el panel del estudiante.
              </span>
              <button
                type="submit"
                disabled={messageSent}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {messageSent ? (
                  <>
                    <span className="material-symbols-outlined text-sm">check</span>
                    <span>¡Mensaje Enviado con Éxito!</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">send</span>
                    <span>Enviar al Alumno</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Left Column (Summary & Badges) vs Right Column (Analytics & History) */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* General Progress Card using SegmentedProgressBar */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-base text-[#0b1c30]">
                Rendimiento Curricular
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                78% Global
              </span>
            </div>

            <SegmentedProgressBar
              percentage={78}
              totalSegments={20}
              label="Avance en Plan de Estudios Anual"
              activeColor="#2563eb"
            />

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Ejercicios Resueltos</span>
                <span className="font-sans font-bold text-xl text-[#0b1c30] mt-0.5 block">28 / 36</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Tiempo en Plataforma</span>
                <span className="font-sans font-bold text-xl text-[#0b1c30] mt-0.5 block">14h 20m</span>
              </div>
            </div>
          </div>

          {/* Badges Audit List (Dense table/list, not big celebratory medallions) */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e2e8f0] bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="font-heading font-bold text-base text-[#0b1c30]">
                  Insignias & Logros del Alumno
                </h2>
                <p className="text-[11px] text-slate-500">Auditoría de competencias desbloqueadas</p>
              </div>
              <span className="font-mono text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                3 / 4 Desbloqueadas
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {BADGES.map((badge) => (
                <div 
                  key={badge.id}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      badge.unlocked 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      <span className="material-symbols-outlined text-base">
                        {badge.unlocked ? badge.iconName : 'lock'}
                      </span>
                    </div>
                    <div>
                      <span className={`text-xs font-semibold block ${badge.unlocked ? 'text-[#0b1c30]' : 'text-slate-500'}`}>
                        {badge.title}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {badge.unlocked ? `Desbloqueado ${badge.unlockedAt || 'recientemente'}` : 'Requisito pendiente'}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                    badge.unlocked
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {badge.unlocked ? 'Acreditado' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (7 cols): Performance Metrics & History Table */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Metrics Row: XP Growth & Accuracy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* XP Growth Card */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-4 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Crecimiento de XP</span>
                <span className="font-mono text-xs font-bold text-blue-700">2,450 XP Total</span>
              </div>
              <div className="h-28 w-full bg-slate-50 rounded-xl relative overflow-hidden flex items-end px-3 gap-2.5 pb-2 border border-slate-100">
                <div className="w-full bg-blue-200 rounded-t h-[25%] relative group hover:bg-blue-300 transition-colors">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100">120</span>
                </div>
                <div className="w-full bg-blue-300 rounded-t h-[40%] relative group hover:bg-blue-400 transition-colors">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100">250</span>
                </div>
                <div className="w-full bg-blue-300 rounded-t h-[35%] relative group hover:bg-blue-400 transition-colors">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100">210</span>
                </div>
                <div className="w-full bg-blue-400 rounded-t h-[65%] relative group hover:bg-blue-500 transition-colors">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100">450</span>
                </div>
                <div className="w-full bg-blue-600 rounded-t h-[88%] relative group transition-colors">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100">620</span>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 px-1">
                <span>Sem 1</span>
                <span>Sem 2</span>
                <span>Sem 3</span>
                <span>Sem 4</span>
                <span className="text-blue-600 font-semibold">Actual</span>
              </div>
            </div>

            {/* Average Accuracy Card */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Precisión Promedio</span>
                <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Alta</span>
              </div>
              <div className="flex items-center justify-center py-2">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-emerald-600"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="85, 100"
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-sans font-bold text-2xl text-[#0b1c30]">85%</span>
                    <span className="text-[10px] text-slate-500 font-medium">Asertividad</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 text-center">1 error registrado en 4 entregas</p>
            </div>

          </div>

          {/* Dense Exercise History Table */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col flex-1">
            <div className="p-4 border-b border-[#e2e8f0] bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="font-heading font-bold text-base text-[#0b1c30]">
                  Historial Detallado de Ejercicios
                </h2>
                <p className="text-[11px] text-slate-500">Registro cronológico de evaluaciones y envíos</p>
              </div>
              <span className="text-xs text-slate-500 font-medium">4 registros</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-[#e2e8f0] text-xs font-semibold text-slate-500">
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Curso & Unidad</th>
                    <th className="py-3 px-4">Resultado</th>
                    <th className="py-3 px-4 text-right">Tiempo</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium text-[#0b1c30] divide-y divide-slate-100">
                  {EXERCISE_HISTORY.map((hist) => (
                    <tr key={hist.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {hist.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{hist.course}</div>
                        <div className="text-[11px] text-slate-500">{hist.unit}</div>
                      </td>
                      <td className="py-3 px-4">
                        {hist.status === 'correct' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                            <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
                            Correcto
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                            <span className="material-symbols-outlined text-xs text-red-600">cancel</span>
                            Incorrecto
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono text-[11px]">
                        {hist.duration}
                      </td>
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
