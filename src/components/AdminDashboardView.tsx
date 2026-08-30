import React, { useState } from 'react';
import { ScreenView, UserRole } from '../types';
import { MASCOT_IMAGES } from '../data/mockData';

interface AdminDashboardViewProps {
  onNavigate: (view: ScreenView) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'schools' | 'gamification' | 'system'>('users');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [xpMultiplier, setXpMultiplier] = useState(1.5);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  const [usersList, setUsersList] = useState([
    { id: 'u1', name: 'Facundo Gómez', email: 'facu.gomez@escuela.edu.ar', role: 'student' as UserRole, school: 'Colegio San Martín', status: 'Activo', xp: 1250 },
    { id: 'u2', name: 'Prof. Santiago Ramos', email: 'santiago.ramos@escuela.edu.ar', role: 'teacher' as UserRole, school: 'Colegio San Martín', status: 'Activo', xp: 9400 },
    { id: 'u3', name: 'Ana Belén Martínez', email: 'ana.martinez@tecnica1.edu.ar', role: 'student' as UserRole, school: 'Escuela Técnica N°1', status: 'Activo', xp: 2180 },
    { id: 'u4', name: 'Prof. Carla Véliz', email: 'carla.veliz@itba.edu.ar', role: 'teacher' as UserRole, school: 'Instituto Tecnológico', status: 'Activo', xp: 14200 },
    { id: 'u5', name: 'Martín Bossi', email: 'm.bossi@sanmartin.edu.ar', role: 'student' as UserRole, school: 'Colegio San Martín', status: 'Pendiente', xp: 450 },
    { id: 'u6', name: 'Admin Root CODIX', email: 'admin@codix.edu', role: 'admin' as UserRole, school: 'Ministerio de Educación', status: 'Activo', xp: 25000 },
  ]);

  const [schoolsList] = useState([
    { id: 's1', name: 'Colegio San Martín', province: 'Buenos Aires', studentsCount: 420, teachersCount: 14, plan: 'Plan Educativo Pro', status: 'Activo' },
    { id: 's2', name: 'Escuela Técnica N°1 "Ing. Huergo"', province: 'Córdoba', studentsCount: 680, teachersCount: 22, plan: 'Plan Educativo Pro', status: 'Activo' },
    { id: 's3', name: 'Instituto Tecnológico Belgrano', province: 'Santa Fe', studentsCount: 310, teachersCount: 9, plan: 'Estándar', status: 'Activo' },
    { id: 's4', name: 'Colegio Nacional de La Plata', province: 'Buenos Aires', studentsCount: 540, teachersCount: 18, plan: 'Plan Educativo Pro', status: 'Activo' },
  ]);

  const filteredUsers = usersList.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.school.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleSaveGamification = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-32">
      {/* Header with Admin Badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center p-2">
            <img 
              src={MASCOT_IMAGES.typingLaptop} 
              alt="Admin Carpincho" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                Super Admin
              </span>
              <span className="text-xs font-semibold text-slate-500">CODIX Core v2.4</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#0b1c30] mt-1">
              Panel de Administración General
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('teacher_dashboard')}
            className="text-xs font-semibold text-[#004ac6] hover:bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl transition-colors"
          >
            Ver como Docente
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] px-3.5 py-2 rounded-xl transition-colors shadow-sm"
          >
            Ver como Alumno
          </button>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Usuarios Totales</span>
            <span className="material-symbols-outlined text-xl text-blue-600">group</span>
          </div>
          <p className="font-heading font-extrabold text-2xl md:text-3xl text-[#0b1c30]">1,240</p>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
            <span className="material-symbols-outlined text-sm">trending_up</span> +18% este mes
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cursos &amp; Módulos</span>
            <span className="material-symbols-outlined text-xl text-amber-600">menu_book</span>
          </div>
          <p className="font-heading font-extrabold text-2xl md:text-3xl text-[#0b1c30]">48</p>
          <span className="text-xs font-semibold text-slate-500 mt-1 block">
            12 en desarrollo
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sandbox Uptime</span>
            <span className="material-symbols-outlined text-xl text-emerald-600">dns</span>
          </div>
          <p className="font-heading font-extrabold text-2xl md:text-3xl text-[#0b1c30]">99.98%</p>
          <span className="text-xs font-semibold text-emerald-600 mt-1 block">
            Servidores operacionales
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ejercicios Evaluados</span>
            <span className="material-symbols-outlined text-xl text-indigo-600">terminal</span>
          </div>
          <p className="font-heading font-extrabold text-2xl md:text-3xl text-[#0b1c30]">18,450</p>
          <span className="text-xs font-semibold text-slate-500 mt-1 block">
            Latencia media: 120ms
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-[#2563eb] text-[#2563eb]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Gestión de Usuarios ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('schools')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'schools'
              ? 'border-[#2563eb] text-[#2563eb]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Instituciones &amp; Colegios ({schoolsList.length})
        </button>

        <button
          onClick={() => setActiveTab('gamification')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'gamification'
              ? 'border-[#2563eb] text-[#2563eb]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Gamificación &amp; Recompensas
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'system'
              ? 'border-[#2563eb] text-[#2563eb]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Monitoreo de Servidores
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Filters Bar */}
          <div className="p-4 md:p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Buscar por nombre, email o colegio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs w-full outline-none text-[#0b1c30]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filtrar:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0b1c30] outline-none"
              >
                <option value="all">Todos los Roles</option>
                <option value="student">Estudiantes</option>
                <option value="teacher">Docentes</option>
                <option value="admin">Administradores</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Institución</th>
                  <th className="p-4">Puntaje XP</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-[#0b1c30]">{u.name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase ${
                        u.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : u.role === 'teacher'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : u.role === 'teacher' ? 'Docente' : 'Alumno'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{u.school}</td>
                    <td className="p-4 font-bold text-amber-600">{u.xp.toLocaleString()} XP</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        u.status === 'Activo' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${u.status === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button 
                        onClick={() => alert(`Editando usuario ${u.name}`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg" 
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`¿Desactivar acceso a ${u.name}?`)) {
                            setUsersList(usersList.filter(item => item.id !== u.id));
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg" 
                        title="Suspender"
                      >
                        <span className="material-symbols-outlined text-base">block</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SCHOOLS */}
      {activeTab === 'schools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schoolsList.map((school) => (
            <div key={school.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-heading font-bold text-lg text-[#0b1c30]">
                    {school.name}
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {school.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  {school.province} • {school.plan}
                </p>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl mb-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Estudiantes</span>
                    <span className="font-heading font-bold text-base text-[#0b1c30]">{school.studentsCount}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Docentes</span>
                    <span className="font-heading font-bold text-base text-[#0b1c30]">{school.teachersCount}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button className="text-xs font-semibold text-[#2563eb] hover:bg-blue-50 px-3 py-1.5 rounded-lg">
                  Gestionar Licencias
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: GAMIFICATION */}
      {activeTab === 'gamification' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
          <h2 className="font-heading font-bold text-xl text-[#0b1c30] mb-2">
            Ajustes Globales del Motor de Gamificación
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Configura los parámetros de puntuación, rachas y multiplicadores de experiencia para todas las escuelas.
          </p>

          {savedSettingsNotice && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              Parámetros de gamificación actualizados exitosamente.
            </div>
          )}

          <form onSubmit={handleSaveGamification} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#434655]">
                Multiplicador Global de XP ({xpMultiplier}x)
              </label>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={xpMultiplier}
                onChange={(e) => setXpMultiplier(parseFloat(e.target.value))}
                className="w-full accent-[#2563eb] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#434655]">XP por Ejercicio Base</label>
                <input
                  type="number"
                  defaultValue={15}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#2563eb]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#434655]">Bonus por Racha Diaria (XP)</label>
                <input
                  type="number"
                  defaultValue={50}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#2563eb]"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-xl font-semibold text-xs shadow-sm cursor-pointer"
              >
                Guardar Configuración
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: SYSTEM */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-heading font-bold text-base text-[#0b1c30] mb-4">
              Estado de los Nodos Sandbox Python &amp; Node.js
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                <span className="font-mono text-slate-700">cluster-runner-ar-01</span>
                <span className="text-emerald-600 font-bold">100% OK (12ms)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                <span className="font-mono text-slate-700">cluster-runner-ar-02</span>
                <span className="text-emerald-600 font-bold">100% OK (15ms)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                <span className="font-mono text-slate-700">cluster-evaluator-backup</span>
                <span className="text-emerald-600 font-bold">Standby OK</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-heading font-bold text-base text-[#0b1c30] mb-4">
              Registro de Errores de Ejecución
            </h3>
            <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl h-48 overflow-y-auto space-y-1">
              <div>[INFO] System heartbeat OK - all 14 clusters reporting.</div>
              <div>[AUTH] JWT verified token for user u1 (Facundo Gómez).</div>
              <div>[EXEC] Sandbox container runner-01 executed main.py in 18ms.</div>
              <div>[REWARD] +20 XP dispatched to user u1.</div>
              <div>[INFO] Auto-backup completed. 0 anomalies detected.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
