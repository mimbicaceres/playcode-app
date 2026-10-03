import React, { useState } from 'react';
import { AdminInstituteData, UserRole } from '../types';
import type { UserEditData } from '../auth/api';
import { StatusHud } from './ui/StatusHud';
import {
  AssignCoursesModal, CourseAssignModal, CourseDetailModal, EditUserModal, ToggleActiveModal, UserProfileModal,
} from './Modals/AdminInstituteModals';

// Admin actions. The real panel saves them in the backend; the demo saves them
// in a temporary demo state (never in the backend). Each save returns an error
// message to show, or null on success.
export interface AdminInstituteActions {
  createTeacher: () => void;
  updateUser: (userId: string, data: UserEditData) => Promise<string | null>;
  setUserActive: (userId: string, isActive: boolean) => Promise<string | null>;
  setUserCourses: (userId: string, courseIds: string[]) => Promise<string | null>;
}

interface AdminInstituteViewProps {
  // Built from the backend (see AdminHomeView / buildAdminInstituteData) or the demo state.
  data: AdminInstituteData;
  actions: AdminInstituteActions;
  // The signed-in admin, who cannot deactivate their own account.
  currentUserId?: string;
  // Opens the "Progreso" of a student (the eye of the student rows).
  onViewStudentProgress?: (studentId: string) => void;
  // Optional message shown under the stats (e.g. "teacher created").
  banner?: React.ReactNode;
  // Shown inside the users table when it has no rows (e.g. while loading).
  usersEmptyMessage?: string;
}

// The general report is the "Reporte" section of the top navbar.
type AdminTab = 'users' | 'courses' | 'activities' | 'settings';

const SOON = 'Disponible próximamente';

type OpenModal =
  | { type: 'profile' | 'edit' | 'courses' | 'status'; userId: string }
  | { type: 'course'; courseId: string }
  | { type: 'assign'; courseId?: string };

const TABS: { id: AdminTab; icon: string; label: string }[] = [
  { id: 'users', icon: 'manage_accounts', label: 'Usuarios' },
  { id: 'courses', icon: 'menu_book', label: 'Cursos' },
  { id: 'activities', icon: 'assignment', label: 'Actividades' },
  { id: 'settings', icon: 'settings', label: 'Configuración' },
];

const ROLE_BADGES: Record<UserRole, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-purple-50 text-purple-800 border-purple-200' },
  teacher: { label: 'Docente', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  student: { label: 'Alumno', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
};

const RowAction: React.FC<{ icon: string; title: string; onClick: () => void; disabledReason?: string; danger?: boolean }> = ({
  icon, title, onClick, disabledReason, danger,
}) => (
  <button
    onClick={onClick}
    disabled={!!disabledReason}
    aria-label={title}
    title={disabledReason ?? title}
    className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
      danger ? 'text-slate-500 hover:text-red-600 hover:bg-red-50' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
    }`}
  >
    <span className="material-symbols-outlined text-base">{icon}</span>
  </button>
);

const EmptyCard: React.FC<{ icon: string; text: string; detail: string }> = ({ icon, text, detail }) => (
  <div className="py-10 px-4 text-center">
    <span className="material-symbols-outlined text-3xl text-slate-300 block mb-1">{icon}</span>
    <p className="text-sm font-semibold text-slate-600">{text}</p>
    <p className="text-[11px] text-slate-400 mt-0.5">{detail}</p>
  </div>
);

export const AdminInstituteView: React.FC<AdminInstituteViewProps> = ({
  data,
  actions,
  currentUserId,
  onViewStudentProgress,
  banner,
  usersEmptyMessage = 'Sin usuarios para mostrar.',
}) => {
  /** Pestaña activa del panel: usuarios, cursos, actividades o configuración. */
const [activeTab, setActiveTab] = useState<AdminTab>('users');
  /** Filtro de rol para la tabla de usuarios; 'all' muestra todos. */
const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  /** Texto de búsqueda ingresado para filtrar usuarios por nombre o email. */
const [searchQuery, setSearchQuery] = useState('');
  /** Multiplicador global de XP para la gamificación. */
const [xpMultiplier, setXpMultiplier] = useState(data.gamification.xpMultiplier);
  /** Bandera que muestra temporalmente el aviso de guardado exitoso de la configuración. */
const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);
  /** Estado que controla el modal abierto y sus parámetros. */
const [modal, setModal] = useState<OpenModal | null>(null);
  /** Mensaje de notificación que se muestra tras acciones exitosas. */
const [notice, setNotice] = useState<string | null>(null);

  /** Cierra cualquier modal abierto, restableciendo el estado a null. */
const closeModal = () => setModal(null);
  const modalUser = modal && 'userId' in modal ? data.users.find((u) => u.id === modal.userId) : undefined;
  const modalCourse = modal?.type === 'course' ? data.courses.find((c) => c.id === modal.courseId) : undefined;
  // Runs an action and shows a confirmation above the tabs when it succeeds.
  /** Ejecuta una acción asíncrona y muestra un mensaje si ésta no devuelve error. */
const withNotice = async (message: string, save: () => Promise<string | null>) => {
    const error = await save();
    if (!error) setNotice(message);
    return error;
  };

  /** Lista de usuarios filtrada según rol seleccionado y texto de búsqueda. */
const filteredUsers = data.users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const query = searchQuery.toLowerCase();
    return matchesRole && (u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
  });

  /** Handler del formulario de configuración de gamificación; muestra aviso y lo oculta después de 3 s. */
const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  /** Estadísticas generales del instituto mostradas en tarjetas superiores. */
const stats = [
    { label: 'Alumnos', value: data.studentsCount, icon: 'school', iconClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Docentes', value: data.teachersCount, icon: 'co_present', iconClass: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Cursos activos', value: data.activeCoursesCount, icon: 'menu_book', iconClass: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Actividades', value: data.activitiesCount, icon: 'assignment', iconClass: 'bg-violet-50 text-violet-700 border-violet-200' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-5 md:py-6 pb-32 flex flex-col gap-5">

      <StatusHud
        compact={true}
        avatarIcon="admin_panel_settings"
        title="Panel de Administración General"
        subtitle="Gestión de alumnos, docentes, cursos y actividades"
      />

      {/* Institute stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{stat.label}</span>
              <span className="font-sans font-bold text-xl text-[#0b1c30]">{stat.value.toLocaleString('es-AR')}</span>
            </div>
            <span className={`w-9 h-9 rounded-lg border flex items-center justify-center ${stat.iconClass}`}>
              <span className="material-symbols-outlined text-lg">{stat.icon}</span>
            </span>
          </div>
        ))}
      </section>

      {banner}

      {notice && (
        <div className="flex items-start justify-between gap-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold" role="status">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
            <span>{notice}</span>
          </span>
          <button onClick={() => setNotice(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer" aria-label="Cerrar mensaje">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span>{tab.id === 'users' ? `${tab.label} (${data.users.length})` : tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-3.5 md:p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-white px-3 py-2 rounded-xl border border-slate-200 focus-within:border-blue-600 transition-colors shadow-2xs">
              <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Buscar usuario por nombre o correo..."
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
                onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0b1c30] outline-none cursor-pointer focus:border-blue-600 transition-colors shadow-2xs"
              >
                <option value="all">Todos los Roles</option>
                <option value="student">Alumnos</option>
                <option value="teacher">Docentes</option>
                <option value="admin">Administradores</option>
              </select>
              <button
                onClick={actions.createTeacher}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Crear docente</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Curso / Cursos asignados</th>
                  <th className="py-3 px-4">Progreso</th>
                  <th className="py-3 px-4">Última actividad</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 px-4 text-center text-slate-400">{usersEmptyMessage}</td>
                  </tr>
                )}
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-sm text-[#0b1c30]">{u.name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${ROLE_BADGES[u.role].className}`}>
                        {ROLE_BADGES[u.role].label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {u.role === 'teacher'
                        ? `${u.assignedCourses ?? 0} asignados`
                        : u.courseName ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {u.role === 'student' && u.progress !== undefined ? `${u.progress}%` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{u.lastActivity ?? '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                        u.status === 'Activo' ? 'text-emerald-700' : 'text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Activo' ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {u.role === 'student' && onViewStudentProgress ? (
                        <RowAction icon="visibility" title="Ver progreso" onClick={() => onViewStudentProgress(u.id)} />
                      ) : (
                        <RowAction icon="visibility" title="Ver perfil" onClick={() => setModal({ type: 'profile', userId: u.id })} />
                      )}
                      <RowAction icon="edit" title="Editar usuario" onClick={() => setModal({ type: 'edit', userId: u.id })} />
                      {u.role !== 'admin' && (
                        <RowAction icon="playlist_add" title="Asignar cursos" onClick={() => setModal({ type: 'courses', userId: u.id })} />
                      )}
                      {u.status === 'Activo' ? (
                        <RowAction
                          icon="block"
                          title="Desactivar usuario"
                          danger
                          onClick={() => setModal({ type: 'status', userId: u.id })}
                          disabledReason={u.id === currentUserId ? 'No podés desactivar tu propia cuenta' : undefined}
                        />
                      ) : (
                        <RowAction icon="check_circle" title="Activar usuario" onClick={() => setModal({ type: 'status', userId: u.id })} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: COURSES */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-3.5 md:p-4 border-b border-slate-200 flex justify-between items-center gap-3 bg-slate-50/50">
            <div>
              <h2 className="font-heading font-bold text-base text-[#0b1c30]">Cursos disponibles</h2>
              <p className="text-[11px] text-slate-500">Cursos de CODIX: asignalos a docentes y alumnos del instituto</p>
            </div>
            <button
              onClick={() => setModal({ type: 'assign' })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base">playlist_add</span>
              <span>Asignar curso</span>
            </button>
          </div>
          {data.courses.length === 0 ? (
            <EmptyCard icon="menu_book" text="Todavía no hay cursos disponibles." detail="Los cursos, unidades y actividades los provee CODIX. Cuando estén disponibles, vas a poder asignarlos a docentes y alumnos desde acá." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {data.courses.map((course) => (
                <div key={course.id} className="p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-heading font-bold text-base text-[#0b1c30]">{course.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      course.status === 'Activo' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>{course.status}</span>
                  </div>
                  <p className="text-xs text-slate-500">Docente: {course.teacherName ?? 'Sin asignar'}</p>
                  <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    {[
                      { label: 'Alumnos', value: course.studentsCount },
                      { label: 'Unidades', value: course.unitsCount },
                      { label: 'Actividades', value: course.activitiesCount },
                    ].map((item) => (
                      <div key={item.label}>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{item.label}</span>
                        <span className="font-sans font-bold text-lg text-[#0b1c30]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <RowAction icon="visibility" title="Ver curso" onClick={() => setModal({ type: 'course', courseId: course.id })} />
                    <RowAction icon="playlist_add" title="Asignar curso" onClick={() => setModal({ type: 'assign', courseId: course.id })} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-3.5 md:p-4 border-b border-slate-200 flex justify-between items-center gap-3 bg-slate-50/50">
            <div>
              <h2 className="font-heading font-bold text-base text-[#0b1c30]">Actividades de los cursos</h2>
              <p className="text-[11px] text-slate-500">Ejercicios y actividades incluidos en las unidades de cada curso de CODIX</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Actividad</th>
                  <th className="py-3 px-4">Curso</th>
                  <th className="py-3 px-4">Unidad</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Dificultad</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {data.activities.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyCard icon="assignment" text="Todavía no hay actividades disponibles." detail="Las actividades vienen incluidas en las unidades de los cursos de CODIX." />
                    </td>
                  </tr>
                )}
                {data.activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-sm text-[#0b1c30]">{activity.name}</td>
                    <td className="py-3 px-4 text-slate-700">{activity.courseName}</td>
                    <td className="py-3 px-4 text-slate-700">{activity.unitName}</td>
                    <td className="py-3 px-4 text-slate-700">{activity.type}</td>
                    <td className="py-3 px-4 text-slate-700">{activity.difficulty}</td>
                    <td className="py-3 px-4 text-slate-700">{activity.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SETTINGS (institute data + gamification) */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="font-heading font-bold text-lg text-[#0b1c30] mb-1">Datos del instituto</h2>
            <p className="text-xs text-slate-500 mb-5">Información general del instituto.</p>
            <div className="flex flex-col gap-4">
              {['Nombre del instituto', 'Dirección', 'Correo de contacto'].map((label) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">{label}</label>
                  <input
                    type="text"
                    disabled
                    placeholder="Sin configurar"
                    title={SOON}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 text-slate-400 cursor-not-allowed"
                  />
                </div>
              ))}
              <p className="text-[11px] text-slate-400">La edición de los datos del instituto estará disponible próximamente.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="font-heading font-bold text-lg text-[#0b1c30] mb-1">Gamificación</h2>
            <p className="text-xs text-slate-500 mb-5">XP, rachas e insignias que motivan el aprendizaje de los alumnos.</p>

            {savedSettingsNotice && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-amber-600">info</span>
                <span>La configuración de gamificación todavía no se guarda en el servidor.</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="flex flex-col gap-1.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Multiplicador Global de XP</label>
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
                <span className="text-[11px] text-slate-500">Aplica a la resolución de ejercicios de todos los cursos.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">XP Base por Ejercicio</label>
                  <input
                    type="number"
                    defaultValue={data.gamification.baseXp}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Bonus por Racha Diaria (XP)</label>
                  <input
                    type="number"
                    defaultValue={data.gamification.streakBonusXp}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-700">Insignias</p>
                  <p className="text-[11px] text-slate-500">La gestión de insignias estará disponible próximamente.</p>
                </div>
                <span className="material-symbols-outlined text-2xl text-slate-300">military_tech</span>
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
        </div>
      )}

      {modal?.type === 'profile' && modalUser && (
        <UserProfileModal user={modalUser} courses={data.courses} onClose={closeModal} />
      )}
      {modal?.type === 'edit' && modalUser && (
        <EditUserModal
          user={modalUser}
          onClose={closeModal}
          onSave={(values) => withNotice(
            `Datos de ${values.name} ${values.lastName} actualizados.`,
            () => actions.updateUser(modalUser.id, values)
          )}
        />
      )}
      {modal?.type === 'courses' && modalUser && (
        <AssignCoursesModal
          user={modalUser}
          courses={data.courses}
          onClose={closeModal}
          onSave={(courseIds) => withNotice(
            `Cursos de ${modalUser.name} actualizados.`,
            () => actions.setUserCourses(modalUser.id, courseIds)
          )}
        />
      )}
      {modal?.type === 'status' && modalUser && (
        <ToggleActiveModal
          user={modalUser}
          onClose={closeModal}
          onConfirm={() => withNotice(
            modalUser.status === 'Activo' ? `${modalUser.name} fue desactivado.` : `${modalUser.name} fue activado.`,
            () => actions.setUserActive(modalUser.id, modalUser.status !== 'Activo')
          )}
        />
      )}
      {modal?.type === 'course' && modalCourse && (
        <CourseDetailModal course={modalCourse} users={data.users} onClose={closeModal} />
      )}
      {modal?.type === 'assign' && (
        <CourseAssignModal
          courses={data.courses}
          users={data.users}
          initialCourseId={modal.courseId}
          onClose={closeModal}
          onSave={(changes) => withNotice('Asignación del curso actualizada.', async () => {
            for (const change of changes) {
              const error = await actions.setUserCourses(change.userId, change.courseIds);
              if (error) return error;
            }
            return null;
          })}
        />
      )}
    </div>
  );
};
