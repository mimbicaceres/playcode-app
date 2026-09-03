import React, { useState, useRef, useEffect } from 'react';
import { ScreenView, UserProfile, UserRole } from '../types';

interface NavigationProps {
  currentView: ScreenView;
  onNavigate: (view: ScreenView) => void;
  user: UserProfile;
  onRoleChange: (role: UserRole) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onNavigate, 
  user, 
  onRoleChange 
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

  const navItems = [
    { id: 'dashboard' as ScreenView, label: 'Inicio' },
    { id: 'courses_map' as ScreenView, label: 'Cursos' },
    { id: 'reports' as ScreenView, label: 'Progreso' },
    { id: 'profile' as ScreenView, label: 'Perfil' },
  ];

  const panelItems = [
    { id: 'dashboard' as ScreenView, role: 'student' as UserRole, label: 'Panel Alumno', icon: '🎓' },
    { id: 'teacher_dashboard' as ScreenView, role: 'teacher' as UserRole, label: 'Panel Docente', icon: '👨‍🏫' },
    { id: 'admin_dashboard' as ScreenView, role: 'admin' as UserRole, label: 'Admin Institucional', icon: '⚙️' },
  ];

  return (
    <header className="bg-[#0a1c30] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between relative">
        
        {/* Izquierda: Menú Hamburguesa + Logo */}
        <div className="flex items-center gap-4">
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
                  const isActive = currentView === panel.id;
                  return (
                    <button
                      key={panel.id}
                      onClick={() => {
                        onRoleChange(panel.role); // 👈 CAMBIA EL ROL GLOBAL
                        onNavigate(panel.id);     // 👈 CAMBIA LA PANTALLA
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

          <div 
            onClick={() => {
              onRoleChange('student');
              onNavigate('dashboard');
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-lg font-bold tracking-tight text-blue-400">PlayCode</span>
          </div>
        </div>

        {/* Centro: Navegación Principal */}
        <nav className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (user.role !== 'student') onRoleChange('student');
                  onNavigate(item.id);
                }}
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

        {/* Derecha: Perfil de usuario dinámico */}
        <div 
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img 
            src={user.avatarUrl || "https://api.dicebear.com/8.x/notionists/svg?seed=Facundo"} 
            alt="Avatar" 
            className="w-8 h-8 rounded-full border border-white/20 bg-slate-800 object-cover"
          />
          <div className="text-xs">
            <div className="font-semibold">{user.name}</div>
            <div className="text-blue-300 capitalize">{user.role === 'student' ? (user.grade || '4to Año') : user.role}</div>
          </div>
        </div>

      </div>
    </header>
  );
};