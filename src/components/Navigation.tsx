import React, { useState, useRef, useEffect } from 'react';
import { ScreenView, UserProfile } from '../types';
import { canAccessView, canUseDemo, getHomeView } from '../auth/access';
import { DemoPerspective } from '../routes';

interface NavigationProps {
  currentView: ScreenView;
  onNavigate: (view: ScreenView) => void;
  user: UserProfile;
  isDemo: boolean;
  // Demo only: the panel currently shown (chosen from the hamburger menu).
  demoPerspective?: DemoPerspective;
  // Real teacher: whether a course is selected ("Ver curso"). "Alumnos" and
  // "Progreso" depend on that course, so they only appear when there is one.
  teacherCourseSelected?: boolean;
  onOpenDemo: () => void;
  onExitDemo: () => void;
  onLogout: () => void;
}

const ROLE_LABELS = { teacher: 'Docente', admin: 'Administrador' };

// Demo navbar per panel: it adapts to the perspective chosen in the demo,
// so the options of different roles are never mixed.
const DEMO_NAV_ITEMS: Record<DemoPerspective, { id: ScreenView; label: string }[]> = {
  admin: [
    { id: 'admin_dashboard', label: 'Inicio' },
    { id: 'student_progress', label: 'Progreso' },
    { id: 'reports', label: 'Reporte' },
  ],
  teacher: [
    { id: 'teacher_dashboard', label: 'Inicio' },
    { id: 'courses_map', label: 'Cursos' },
    { id: 'teacher_student_detail', label: 'Alumnos' },
    { id: 'student_progress', label: 'Progreso' },
    { id: 'reports', label: 'Reporte' },
  ],
  student: [
    { id: 'dashboard', label: 'Inicio' },
    { id: 'courses_map', label: 'Cursos' },
    { id: 'profile', label: 'Perfil' },
  ],
};

const DEMO_PANEL_BY_PERSPECTIVE: Record<DemoPerspective, ScreenView> = {
  admin: 'admin_dashboard',
  teacher: 'teacher_dashboard',
  student: 'dashboard',
};

export const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onNavigate, 
  user,
  isDemo,
  demoPerspective = 'admin',
  teacherCourseSelected = false,
  onOpenDemo,
  onExitDemo,
  onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // The role comes from the authenticated session; the UI never changes it.
  // Only views this role may open in the current mode (real or demo) are offered;
  // the router guard enforces the same rules.
  // Teachers navigate only with this bar: Inicio | Cursos | Reporte, plus
  // Alumnos | Progreso once a course is selected.
  const homeView = getHomeView(user.role);
  const canOpen = (view: ScreenView) => canAccessView(view, user.role, isDemo);

  // Teacher panel (real or demo): "Alumnos" and "Progreso" need a selected course.
  const needsCourse = (id: ScreenView) => id === 'teacher_student_detail' || id === 'student_progress';
  const demoItems = DEMO_NAV_ITEMS[demoPerspective].filter(
    (item) => demoPerspective !== 'teacher' || teacherCourseSelected || !needsCourse(item.id)
  );

  const navItems = (isDemo ? demoItems : [
    { id: homeView, label: 'Inicio' },
    { id: 'courses_map' as ScreenView, label: 'Cursos' },
    ...(user.role === 'teacher' && teacherCourseSelected ? [{ id: 'teacher_student_detail' as ScreenView, label: 'Alumnos' }] : []),
    ...(user.role !== 'teacher' || teacherCourseSelected ? [{ id: 'student_progress' as ScreenView, label: 'Progreso' }] : []),
    // Students can open /alumno/progreso (their own report), but it is intentionally not in their navbar.
    ...(user.role !== 'student' ? [{ id: 'reports' as ScreenView, label: 'Reporte' }] : []),
    { id: 'profile' as ScreenView, label: 'Perfil' },
  ]).filter((item) => canOpen(item.id));

  const panelItems = [
    { id: 'dashboard' as ScreenView, label: 'Panel Alumno', icon: '🎓' },
    { id: 'teacher_dashboard' as ScreenView, label: 'Panel Docente', icon: '👨‍🏫' },
    { id: 'admin_dashboard' as ScreenView, label: 'Admin Institucional', icon: '⚙️' },
  ].filter((panel) => canOpen(panel.id));

  return (
    <header className="bg-[#0a1c30] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between relative">
        
        {/* Izquierda: Menú Hamburguesa + Logo */}
        <div className="flex items-center gap-4">
          {panelItems.length > 1 && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/55 transition-colors focus:outline-none cursor-pointer"
              title="Paneles del Sistema"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-800 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Cambiar Panel
                </div>
                {panelItems.map((panel) => {
                  const isActive = isDemo
                    ? DEMO_PANEL_BY_PERSPECTIVE[demoPerspective] === panel.id
                    : currentView === panel.id;
                  return (
                    <button
                      key={panel.id}
                      onClick={() => {
                        onNavigate(panel.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-3 transition-colors cursor-pointer
                        ${isActive 
                          ? 'bg-blue-600/20 text-blue-400 font-medium' 
                          : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                      <span className="text-base">{panel.icon}</span>
                      {panel.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          )}

          <div 
            onClick={() => onNavigate(isDemo ? DEMO_PANEL_BY_PERSPECTIVE[demoPerspective] : homeView)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="font-heading font-bold text-xl tracking-wide text-blue-400">PlayCode</span>
          </div>
        </div>

        {/* Centro: Navegación Principal */}
        <nav className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
                  }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Derecha: Perfil de usuario dinámico + cerrar sesión */}
        <div className="flex items-center gap-3">
        {canUseDemo(user.role) && (
          <button
            onClick={isDemo ? onExitDemo : onOpenDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-300/40 text-amber-200 hover:bg-amber-400/15 hover:text-amber-100 transition-colors cursor-pointer"
            title={isDemo ? 'Volver a los datos reales' : 'Ver las pantallas con datos de ejemplo'}
          >
            <span className="material-symbols-outlined text-base">slideshow</span>
            {isDemo ? 'Salir de demo' : 'Demo'}
          </button>
        )}
        <div
          onClick={() => canOpen('profile') && onNavigate('profile')}
          className={`flex items-center gap-3 transition-opacity ${canOpen('profile') ? 'cursor-pointer hover:opacity-90' : ''}`}
        >
          <img 
            src={user.avatarUrl || `https://api.dicebear.com/8.x/notionists/svg?seed=${encodeURIComponent(user.name)}`} 
            alt="Avatar" 
            className="w-8 h-8 rounded-full border border-white/20 bg-slate-800 object-cover"
          />
          <div className="text-xs">
            <div className="font-semibold">{user.name}</div>
            <div className="text-blue-300 capitalize">{user.role === 'student' ? (user.grade || 'Alumno') : ROLE_LABELS[user.role]}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/55 transition-colors cursor-pointer"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
        </button>
        </div>

      </div>
    </header>
  );
};