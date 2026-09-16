import React, { useState } from 'react';
import { ScreenView } from '../types';
import { RECENT_ACTIVITIES } from '../data/mockData';
import { StatusHud } from './ui/StatusHud';
import { NewCourseModal } from './Modals/NewCourseModal';

interface TeacherDashboardProps {
  onNavigate: (view: ScreenView) => void;
  onSelectStudentDetail: () => void;
}

interface TeacherCourseItem {
  id: string;
  name: string;
  students: number;
  progress: number;
  icon: string;
  category: string;
  status: 'Activo' | 'Pausado';
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigate,
  onSelectStudentDetail
}) => {
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [coursesList, setCoursesList] = useState<TeacherCourseItem[]>([
    { id: 'c1', name: 'Introducción a HTML/CSS', students: 45, progress: 82, icon: 'html', category: 'Frontend', status: 'Activo' },
    { id: 'c2', name: 'Lógica con JavaScript', students: 38, progress: 45, icon: 'javascript', category: 'Lógica', status: 'Activo' },
    { id: 'c3', name: 'Estructuras de Datos', students: 59, progress: 60, icon: 'data_object', category: 'Algoritmos', status: 'Activo' },
    { id: 'c4', name: 'Bases de Datos SQL', students: 24, progress: 15, icon: 'database', category: 'Backend', status: 'Pausado' }
  ]);

  const handleAddCourse = (newCourse: { title: string; category: string; description: string }) => {
    setCoursesList(prev => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        name: newCourse.title,
        students: 0,
        progress: 0,
        icon: 'code',
        category: newCourse.category,
        status: 'Activo'
      }
    ]);
  };

  const toggleCourseStatus = (courseId: string) => {
    setCoursesList(prev =>
      prev.map(c =>
        c.id === courseId
          ? { ...c, status: c.status === 'Activo' ? 'Pausado' : 'Activo' }
          : c
      )
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-[#f8f9ff]">
      {/* Teacher Sidebar Navigation - Professional & Clean */}
      <aside className="w-full md:w-64 bg-white border-r border-[#e2e8f0] flex flex-col shrink-0 shadow-xs">
        {/* Brand in Sidebar */}
        <div className="p-5 border-b border-[#e2e8f0] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#004ac6]">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <div className="min-w-0">
            <span className="font-heading font-extrabold text-lg text-[#004ac6] tracking-tight block leading-tight">
              PlayCode
            </span>
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Gestión Docente
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <button 
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs text-left shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px]">dashboard</span>
            <span>Panel de Control</span>
          </button>

          <button 
            onClick={() => onNavigate('courses_map')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-blue-700 font-semibold text-xs transition-colors text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px]">menu_book</span>
            <span>Cursos Asignados</span>
          </button>

          <button 
            onClick={onSelectStudentDetail}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-blue-700 font-semibold text-xs transition-colors text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px]">groups</span>
            <span>Alumnos (Auditoría)</span>
          </button>

          <button 
            onClick={() => onNavigate('reports')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-blue-700 font-semibold text-xs transition-colors text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px]">analytics</span>
            <span>Reportes & Rendimiento</span>
          </button>

          <button 
            onClick={() => onNavigate('admin_dashboard')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-blue-700 font-semibold text-xs transition-colors text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px]">shield_person</span>
            <span>Administración General</span>
          </button>
        </nav>

        {/* Teacher profile at bottom */}
        <div className="p-4 border-t border-[#e2e8f0] bg-slate-50/60">
          <button 
            onClick={() => onNavigate('profile')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-white hover:shadow-xs text-xs font-semibold text-left transition-all cursor-pointer border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              SR
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800 truncate text-xs">Prof. Santiago R.</p>
              <p className="text-[10px] text-slate-500 truncate">Docente Titular</p>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-sm">settings</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-32">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Status HUD in compact mode */}
          <StatusHud
            compact={true}
            avatarIcon="school"
            badgeText="Portal Docente"
            title="Prof. Santiago Ramos"
            subtitle="Colegio San Martín • Dpto. Ciencias de la Computación"
          >
            <button
              onClick={() => setIsNewCourseModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Nuevo Curso</span>
            </button>
          </StatusHud>

          {/* Key Metrics - Clean Soft-cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Metric 1 */}
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Alumnos</span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <span className="material-symbols-outlined text-xl">groups</span>
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-sans font-bold text-3xl text-[#0b1c30]">142</span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs">trending_up</span> +12%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Distribuidos en 4 comisiones activas</p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progreso Medio Curricular</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <span className="material-symbols-outlined text-xl">insights</span>
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-sans font-bold text-3xl text-[#0b1c30]">68%</span>
                  <span className="text-xs text-slate-500 font-medium">Promedio de cohortes</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ejercicios Entregados Hoy</span>
                <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-sans font-bold text-3xl text-[#0b1c30]">34</span>
                  <span className="text-slate-600 bg-slate-100 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                    2 pendientes de feedback
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Última entrega registrada hace 12 min</p>
              </div>
            </div>
          </section>

          {/* Main Grid: Cursos Activos & Actividad Reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Active Courses Table (2/3 width) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col">
              <div className="p-5 border-b border-[#e2e8f0] flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#0b1c30]">
                    Cursos a Cargo
                  </h2>
                  <p className="text-xs text-slate-500">Gestión de cohortes, estado y avance por módulo</p>
                </div>
                <button 
                  onClick={() => onNavigate('courses_map')}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Ver mapa completo</span>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-xs font-semibold text-slate-500 border-b border-[#e2e8f0]">
                      <th className="py-3 px-4">Curso / Área</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Alumnos</th>
                      <th className="py-3 px-4">Progreso</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium text-[#0b1c30] divide-y divide-slate-100">
                    {coursesList.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold shrink-0 border border-slate-200">
                              <span className="material-symbols-outlined text-base">{c.icon}</span>
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-sm text-[#0b1c30] block truncate">{c.name}</span>
                              <span className="text-[11px] text-slate-500">{c.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleCourseStatus(c.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors border ${
                              c.status === 'Activo'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                            }`}
                            title="Haz clic para alternar estado"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Activo' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                            {c.status}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-sans font-semibold">
                          {c.students}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${c.status === 'Activo' ? 'bg-emerald-600' : 'bg-slate-400'}`} 
                                style={{ width: `${c.progress}%` }} 
                              />
                            </div>
                            <span className="font-mono text-xs font-semibold text-slate-700 min-w-[32px]">{c.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button 
                            onClick={() => onNavigate('unit_detail')}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar contenidos de unidad"
                          >
                            <span className="material-symbols-outlined text-base">edit_note</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity List (1/3 width) - Dense & Clean */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col">
              <div className="p-5 border-b border-[#e2e8f0] bg-slate-50/50">
                <h2 className="font-heading font-bold text-lg text-[#0b1c30]">
                  Actividad Reciente
                </h2>
                <p className="text-xs text-slate-500">Eventos de alumnos en tiempo real</p>
              </div>

              <div className="p-3 flex-1 divide-y divide-slate-100">
                {RECENT_ACTIVITIES.map((act) => (
                  <div
                    key={act.id}
                    onClick={onSelectStudentDetail}
                    className="py-3 px-2 flex gap-3 items-start hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group"
                  >
                    <img 
                      src={act.studentAvatar} 
                      alt={act.studentName} 
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#0b1c30] leading-snug">
                        <strong className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{act.studentName}</strong>{' '}
                        <span className="text-slate-600">{act.action}</span>{' '}
                        <span className={`font-semibold ${act.isError ? 'text-red-700' : 'text-slate-800'}`}>
                          {act.highlightText}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{act.timeAgo}</p>
                    </div>

                    {act.isError && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 shrink-0">
                        Atención
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3.5 border-t border-[#e2e8f0] bg-slate-50/30 text-center">
                <button
                  onClick={onSelectStudentDetail}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
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
