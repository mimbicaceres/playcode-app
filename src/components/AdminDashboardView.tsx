import React, { useState } from 'react';
import { ScreenView, UserRole } from '../types';
import { StatusHud } from './ui/StatusHud';

interface AdminDashboardViewProps {
  onNavigate: (view: ScreenView) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  /** Estado activo de la pestaña seleccionada: usuarios, instituciones, gamificación o sistema. */
  const [activeTab, setActiveTab] = useState<'users' | 'schools' | 'gamification' | 'system'>('users');
  /** Filtro de rol para la lista de usuarios; 'all' muestra todos, de lo contrario filtra por el rol especificado. */
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  /** Texto de búsqueda ingresado para filtrar usuarios por nombre, email o institución. */
  const [searchQuery, setSearchQuery] = useState('');
  /** Multiplicador global de XP aplicado a la resolución de ejercicios. */
  const [xpMultiplier, setXpMultiplier] = useState(1.5);
  /** Bandera que muestra temporalmente un aviso de guardado exitoso de la configuración de gamificación. */
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  const [usersList, setUsersList] = useState([
    { id: 'u1', name: 'Facundo Gómez', email: 'facu.gomez@escuela.edu.ar', role: 'student' as UserRole, school: 'Colegio San Martín', status: 'Activo', xp: 1250 },
    { id: 'u2', name: 'Prof. Santiago Ramos', email: 'santiago.ramos@escuela.edu.ar', role: 'teacher' as UserRole, school: 'Colegio San Martín', status: 'Activo', xp: 9400 },
    { id: 'u3', name: 'Ana Belén Martínez', email: 'ana.martinez@tecnica1.edu.ar', role: 'student' as UserRole, school: 'Escuela Técnica N°1', status: 'Activo', xp: 2180 },
    { id: 'u4', name: 'Prof. Carla Véliz', email: 'carla.veliz@itba.edu.ar', role: 'teacher' as UserRole, school: 'Instituto Tecnológico', status: 'Activo', xp: 14200 },
    { id: 'u5', name: 'Martín Bossi', email: 'm.bossi@sanmartin.edu.ar', role: 'student' as UserRole, school: 'Colegio San Martín', status: 'Pendiente', xp: 450 },
    { id: 'u6', name: 'Admin Root PlayCode', email: 'admin@playcode.edu', role: 'admin' as UserRole, school: 'Ministerio de Educación', status: 'Activo', xp: 25000 },
  ]);

  const [schoolsList] = useState([
    { id: 's1', name: 'Colegio San Martín', province: 'Buenos Aires', studentsCount: 420, teachersCount: 14, plan: 'Plan Educativo Pro', status: 'Activo' },
    { id: 's2', name: 'Escuela Técnica N°1 "Ing. Huergo"', province: 'Córdoba', studentsCount: 680, teachersCount: 22, plan: 'Plan Educativo Pro', status: 'Activo' },
    { id: 's3', name: 'Instituto Tecnológico Belgrano', province: 'Santa Fe', studentsCount: 310, teachersCount: 9, plan: 'Estándar', status: 'Activo' },
    { id: 's4', name: 'Colegio Nacional de La Plata', province: 'Buenos Aires', studentsCount: 540, teachersCount: 18, plan: 'Plan Educativo Pro', status: 'Activo' },
  ]);

  /** Lista de usuarios filtrada según el rol seleccionado y la cadena de búsqueda (nombre, email o institución). */
  const filteredUsers = usersList.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.school.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  /** Handler que guarda la configuración de gamificación, muestra una notificación y la oculta tras 3 s. */
  const handleSaveGamification = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-5 md:py-6 pb-32 flex flex-col gap-5">
      
      {/* Ultra-compact StatusHud for minimum vertical space & maximum table space */}
      <StatusHud
        compact={true}
        avatarIcon="admin_panel_settings"
        badgeText="Super Admin"
        title="Panel de Administración General"
        subtitle="PlayCode Platform v2.4 • Gestión de Usuarios, Instituciones y Motor de Reglas"
      >
        <button
          onClick={() => onNavigate('teacher_dashboard')}
          className="text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/15 transition-colors cursor-pointer"
        >
          Vista Docente
        </button>
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          Vista Alumno
        </button>
      </StatusHud>

      {/* Global Compact Stats Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Usuarios Totales</span>
            <span className="font-sans font-bold text-xl text-[#0b1c30]">1,240</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            +18% mes
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cursos & Módulos</span>
            <span className="font-sans font-bold text-xl text-[#0b1c30]">48</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">12 en edición</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sandbox Uptime</span>
            <span className="font-sans font-bold text-xl text-emerald-700">99.98%</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Operacional" />
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ejercicios Evaluados</span>
            <span className="font-mono font-bold text-xl text-[#0b1c30]">18,450</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">120ms avg</span>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-base">manage_accounts</span>
          <span>Gestión de Usuarios ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schools')}
          className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'schools'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-base">domain</span>
          <span>Instituciones ({schoolsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gamification')}
          className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'gamification'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-base">tune</span>
          <span>Reglas de Gamificación</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'system'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-base">terminal</span>
          <span>Monitoreo de Nodos</span>
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {/* Filters Bar */}
          <div className="p-3.5 md:p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-white px-3 py-2 rounded-xl border border-slate-200 focus-within:border-blue-600 transition-colors shadow-2xs">
              <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Buscar usuario por nombre, correo o institución..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs w-full outline-none text-[#0b1c30] placeholder:text-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filtrar Rol:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0b1c30] outline-none cursor-pointer focus:border-blue-600 transition-colors shadow-2xs"
              >
                <option value="all">Todos los Roles</option>
                <option value="student">Estudiantes</option>
                <option value="teacher">Docentes</option>
                <option value="admin">Administradores</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Rol del Sistema</th>
                  <th className="py-3 px-4">Institución</th>
                  <th className="py-3 px-4">XP Acumulado</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-sm text-[#0b1c30]">{u.name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                        u.role === 'admin' 
                          ? 'bg-purple-50 text-purple-800 border-purple-200' 
                          : u.role === 'teacher'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : u.role === 'teacher' ? 'Docente' : 'Alumno'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{u.school}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{u.xp.toLocaleString()} XP</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                        u.status === 'Activo' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Activo' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button 
                        onClick={() => alert(`Editando usuario ${u.name}`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" 
                        title="Editar permisos"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`¿Desactivar acceso a ${u.name}?`)) {
                            setUsersList(usersList.filter(item => item.id !== u.id));
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                        title="Suspender cuenta"
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
            <div key={school.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-heading font-bold text-base text-[#0b1c30]">
                    {school.name}
                  </h3>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {school.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  {school.province} • {school.plan}
                </p>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Estudiantes</span>
                    <span className="font-sans font-bold text-lg text-[#0b1c30]">{school.studentsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Docentes</span>
                    <span className="font-sans font-bold text-lg text-[#0b1c30]">{school.teachersCount}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                  Gestionar Licencias & Cupos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: GAMIFICATION SETTINGS */}
      {activeTab === 'gamification' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl">
          <h2 className="font-heading font-bold text-lg text-[#0b1c30] mb-1">
            Motor de Recompensas & Multiplicadores
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Ajustes globales de puntuación, experiencia base y bonificación por continuidad.
          </p>

          {savedSettingsNotice && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
              <span>Parámetros de gamificación actualizados exitosamente en toda la plataforma.</span>
            </div>
          )}

          <form onSubmit={handleSaveGamification} className="space-y-4">
            <div className="flex flex-col gap-1.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">
                  Multiplicador Global de XP
                </label>
                <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {xpMultiplier.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={xpMultiplier}
                onChange={(e) => setXpMultiplier(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer mt-1"
              />
              <span className="text-[11px] text-slate-500">
                Aplica a la resolución de ejercicios en todas las instituciones.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">XP Base por Ejercicio</label>
                <input
                  type="number"
                  defaultValue={15}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Bonus por Racha Diaria (XP)</label>
                <input
                  type="number"
                  defaultValue={50}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Guardar Configuración
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: SYSTEM MONITORING */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-[#0b1c30] mb-1">
                Clústeres Sandbox Python & JavaScript
              </h3>
              <p className="text-xs text-slate-500 mb-4">Estado y latencia de los entornos de ejecución aislados</p>
              
              <div className="space-y-2.5">
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs border border-slate-100">
                  <span className="font-mono text-slate-700">cluster-runner-ar-01</span>
                  <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">100% OK (12ms)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs border border-slate-100">
                  <span className="font-mono text-slate-700">cluster-runner-ar-02</span>
                  <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">100% OK (15ms)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs border border-slate-100">
                  <span className="font-mono text-slate-700">cluster-evaluator-backup</span>
                  <span className="text-slate-600 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Standby OK</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center text-[11px] text-slate-400">
              <span>Auto-scaling: Activo (AWS sa-east-1)</span>
              <span className="font-mono">Latencia avg: 13.5ms</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
            <h3 className="font-heading font-bold text-base text-[#0b1c30] mb-1">
              Registro de Actividad del Core
            </h3>
            <p className="text-xs text-slate-500 mb-3">Logs de eventos en tiempo real</p>
            <div className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl h-52 overflow-y-auto space-y-1 shadow-inner">
              <div className="text-slate-400">[SYSTEM] Core cluster init: 14 nodes ready.</div>
              <div>[AUTH] JWT session verified for user u1 (Facundo Gómez).</div>
              <div>[EXEC] Sandbox container runner-01 executed main.py in 18ms.</div>
              <div>[EVAL] Test suite passed (4/4 assertions valid).</div>
              <div>[REWARD] +20 XP dispatched to user u1.</div>
              <div className="text-slate-400">[INFO] Database replica sync completed without lag.</div>
              <div>[HEARTBEAT] All clusters operational at 100% health.</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
