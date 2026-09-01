import React, { useState } from 'react';
import { ScreenView } from '../types';
import { MASCOT_IMAGES, RECENT_ACTIVITIES } from '../data/mockData';
import { NewCourseModal } from './Modals/NewCourseModal';

interface TeacherDashboardProps {
  onNavigate: (view: ScreenView) => void;
  onSelectStudentDetail: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigate,
  onSelectStudentDetail
}) => {
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [coursesList, setCoursesList] = useState([
    { id: 'c1', name: 'Introducción a HTML/CSS', students: 45, progress: 82, icon: 'html', colorBg: 'bg-blue-100 text-blue-700' },
    { id: 'c2', name: 'Lógica con JavaScript', students: 38, progress: 45, icon: 'javascript', colorBg: 'bg-amber-100 text-amber-700' },
    { id: 'c3', name: 'Estructuras de Datos', students: 59, progress: 60, icon: 'data_object', colorBg: 'bg-emerald-100 text-emerald-700' }
  ]);

  const handleAddCourse = (newCourse: { title: string; category: string; description: string }) => {
    setCoursesList(prev => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        name: newCourse.title,
        students: 1,
        progress: 0,
        icon: 'code',
        colorBg: 'bg-purple-100 text-purple-700'
      }
    ]);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-40px)] bg-[#f8f9ff]">
      {/* Teacher Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-[#e2e8f0] flex flex-col shrink-0 shadow-sm">
        {/* Brand in Sidebar */}
        <div className="p-5 border-b border-[#e2e8f0] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-50 border border-blue-200 flex items-center justify-center">
            <img 
              src={MASCOT_IMAGES.typingLaptop} 
              alt="Carpincho Docente" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-heading font-extrabold text-xl text-[#004ac6] tracking-tight">
              PlayCode
            </span>
            <span className="block text-[10px] font-bold text-[#737686] uppercase tracking-wider">
              Portal Docente
            </span>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#2563eb] text-white font-semibold text-xs transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span>Panel Docente</span>
          </button>

          <button 
            onClick={() => onNavigate('courses_map')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#434655] hover:bg-slate-100 hover:text-[#004ac6] font-semibold text-xs transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
            <span>Cursos</span>
          </button>

          <button 
            onClick={onSelectStudentDetail}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#434655] hover:bg-slate-100 hover:text-[#004ac6] font-semibold text-xs transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[20px]">groups</span>
            <span>Alumnos (Facundo G.)</span>
          </button>

          <button 
            onClick={() => onNavigate('reports')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#434655] hover:bg-slate-100 hover:text-[#004ac6] font-semibold text-xs transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[20px]">leaderboard</span>
            <span>Progreso</span>
          </button>

          <button 
            onClick={() => onNavigate('admin_dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#434655] hover:bg-slate-100 hover:text-[#004ac6] font-semibold text-xs transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
            <span>Reportes Institucionales</span>
          </button>
        </nav>

        {/* Teacher profile at bottom */}
        <div className="p-4 border-t border-[#e2e8f0]">
          <button 
            onClick={() => onNavigate('profile')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#434655] hover:bg-slate-100 text-xs font-semibold text-left"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span>Prof. Santiago R.</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-32">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#0b1c30]">
                Panel Docente
              </h1>
              <p className="text-xs md:text-sm text-[#434655] mt-1">
                Resumen general del rendimiento de tus alumnos en tiempo real.
              </p>
            </div>

            <button
              onClick={() => setIsNewCourseModalOpen(true)}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Nuevo Curso</span>
            </button>
          </div>

          {/* Summary Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-blue-50 text-[#2563eb] rounded-xl">
                  <span className="material-symbols-outlined text-2xl">groups</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#737686]">Total de Alumnos</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="font-heading font-extrabold text-3xl text-[#0b1c30]">142</h2>
                  <span className="text-[#00714d] text-xs font-bold flex items-center">
                    <span className="material-symbols-outlined text-sm">arrow_upward</span> 12%
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-emerald-50 text-[#00714d] rounded-xl">
                  <span className="material-symbols-outlined text-2xl">trending_up</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#737686]">Progreso Promedio</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="font-heading font-extrabold text-3xl text-[#0b1c30]">68%</h2>
                  <span className="text-slate-500 text-xs">Global</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col justify-between hover:border-amber-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                  <span className="material-symbols-outlined text-2xl">notifications_active</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#737686]">Ejercicios Entregados Hoy</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="font-heading font-extrabold text-3xl text-[#0b1c30]">34</h2>
                  <span className="text-[#00714d] text-xs font-semibold">Listos para revisión</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid: Cursos Activos & Actividad Reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Courses Table (2/3 width) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-[#e2e8f0] flex justify-between items-center">
                <h3 className="font-heading font-bold text-lg text-[#0b1c30]">
                  Cursos Activos
                </h3>
                <button 
                  onClick={() => onNavigate('courses_map')}
                  className="text-[#2563eb] hover:bg-blue-50 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  Ver todos <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-semibold text-[#737686] border-b border-[#e2e8f0]">
                      <th className="p-4">Curso</th>
                      <th className="p-4">Alumnos</th>
                      <th className="p-4">Progreso Medio</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium text-[#0b1c30]">
                    {coursesList.map((c) => (
                      <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${c.colorBg}`}>
                              <span className="material-symbols-outlined text-base">{c.icon}</span>
                            </div>
                            <span className="font-bold text-sm text-[#0b1c30]">{c.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-[#434655] font-semibold">{c.students}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.progress}%` }} />
                            </div>
                            <span className="font-bold text-slate-700">{c.progress}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => onNavigate('unit_detail')}
                            className="p-1.5 text-slate-400 hover:text-[#2563eb] rounded-lg transition-colors"
                            title="Editar o ver detalles"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity List (1/3 width) */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col">
              <div className="p-5 border-b border-[#e2e8f0]">
                <h3 className="font-heading font-bold text-lg text-[#0b1c30]">
                  Actividad Reciente
                </h3>
              </div>

              <div className="p-4 flex-1 divide-y divide-slate-100">
                {RECENT_ACTIVITIES.map((act) => (
                  <div
                    key={act.id}
                    onClick={onSelectStudentDetail}
                    className="py-3 flex gap-3 items-start hover:bg-blue-50/50 p-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <img 
                      src={act.studentAvatar} 
                      alt={act.studentName} 
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#0b1c30] leading-snug">
                        <strong className="font-bold group-hover:text-[#2563eb] transition-colors">{act.studentName}</strong>{' '}
                        {act.action}{' '}
                        <span className={act.isError ? 'text-red-600 font-bold' : 'text-[#2563eb] font-semibold'}>
                          {act.highlightText}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">{act.timeAgo}</p>
                    </div>

                    {act.isError && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-1 animate-pulse" title="Requiere ayuda" />
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-[#e2e8f0] text-center">
                <button
                  onClick={onSelectStudentDetail}
                  className="text-xs font-semibold text-[#2563eb] hover:underline"
                >
                  Ver registro completo de alumnos
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <NewCourseModal
        isOpen={isNewCourseModalOpen}
        onClose={() => setIsNewCourseModalOpen(false)}
        onCreateCourse={handleAddCourse}
      />
    </div>
  );
};
