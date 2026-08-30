import React from 'react';
import { ScreenView, UserRole } from '../types';
import { MASCOT_IMAGES } from '../data/mockData';

interface NavigationProps {
  currentView: ScreenView;
  onNavigate: (view: ScreenView) => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  notificationsCount?: number;
  onOpenNotifications?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  userRole,
  onChangeRole,
  notificationsCount = 2,
  onOpenNotifications
}) => {
  const isAuthOrExercise = ['welcome', 'login', 'register', 'exercise'].includes(currentView);

  return (
    <>
      {/* Top Floating Demo Toolbar to easily jump to ANY of the 13 mockup screens */}
      <div className="bg-slate-900 text-slate-200 text-xs px-3 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-50 sticky top-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-blue-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">visibility</span>
            Vistas de CODIX:
          </span>
          
          {/* Student Flow */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => onNavigate('welcome')}
              className={`px-2 py-1 rounded text-xs transition-colors ${currentView === 'welcome' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              title="Pantalla inicial / Bienvenida"
            >
              Bienvenida
            </button>
            <button
              onClick={() => onNavigate('login')}
              className={`px-2 py-1 rounded text-xs transition-colors ${currentView === 'login' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              title="Iniciar Sesión"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate('register')}
              className={`px-2 py-1 rounded text-xs transition-colors ${currentView === 'register' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              title="Registro de usuario"
            >
              Registro
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-2 py-1 rounded text-xs transition-colors ${currentView === 'dashboard' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              title="Inicio Alumno"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('courses_map')}
              className={`px-2 py-1 rounded text-xs transition-colors ${currentView === 'courses_map' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              title="Mapa de Cursos"
            >
              Cursos
            </button>
            <button
              onClick={() => onNavigate('course_roadmap')}
              className={`px-2 py-1 rounded text-xs transition-colors ${currentView === 'course_roadmap' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              title="Camino de Aprendizaje / Roadmap"
            >
              Roadmap
            </button>
            <button
              onClick={() => onNavigate('unit_detail')}
              className={`px-2 py-1 rounded text-xs transition-colors ${currentView === 'unit_detail' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              title="Detalle Unidad 2"
            >
              Unidad 2
            </button>
            <button
              onClick={() => onNavigate('exercise')}
              className={`px-2 py-1 rounded text-xs transition-colors ${currentView === 'exercise' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-300 hover:text-white'}`}
              title="Editor de Código Interactivo"
            >
              💻 Ejercicio
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className={`px-2 py-1 rounded text-xs transition-colors ${currentView === 'reports' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              title="Reportes & Analíticas"
            >
              Progreso
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className={`px-2 py-1 rounded text-xs transition-colors ${currentView === 'profile' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              title="Perfil de Estudiante"
            >
              Perfil
            </button>
          </div>

          {/* Teacher & Admin */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => {
                onChangeRole('teacher');
                onNavigate('teacher_dashboard');
              }}
              className={`px-2 py-1 rounded text-xs transition-colors ${currentView === 'teacher_dashboard' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              title="Panel Docente"
            >
              Panel Docente
            </button>
            <button
              onClick={() => onNavigate('teacher_student_detail')}
              className={`px-2 py-1 rounded text-xs transition-colors ${currentView === 'teacher_student_detail' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              title="Vista Detallada Alumno (Facundo G.)"
            >
              Detalle Alumno
            </button>
            <button
              onClick={() => {
                onChangeRole('admin');
                onNavigate('admin_dashboard');
              }}
              className={`px-2 py-1 rounded text-xs transition-colors ${currentView === 'admin_dashboard' ? 'bg-purple-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              title="Panel Institucional / Colegio San José"
            >
              Admin Institucional
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px]">
            Rol: <strong className="text-white capitalize">{userRole}</strong>
          </span>
        </div>
      </div>

      {/* Main Standard Top App Bar (used across standard student / institutional views) */}
      {!isAuthOrExercise && (
        <header className="sticky top-[37px] w-full z-40 bg-[#f8f9ff]/90 backdrop-blur-md border-b border-[#e2e8f0]">
          <div className="flex justify-between items-center px-4 md:px-8 py-3 w-full max-w-7xl mx-auto">
            <div 
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => onNavigate('dashboard')}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center border-2 border-blue-500 shadow-sm">
                <img 
                  src={MASCOT_IMAGES.roundAvatar} 
                  alt="Carpincho Programador" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-2xl font-bold font-heading text-[#004ac6] tracking-tight">
                CODIX
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`font-semibold text-sm transition-colors px-3 py-1.5 rounded-lg ${currentView === 'dashboard' ? 'text-[#004ac6] bg-blue-50' : 'text-[#434655] hover:text-[#004ac6]'}`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('courses_map')}
                className={`font-semibold text-sm transition-colors px-3 py-1.5 rounded-lg ${currentView === 'courses_map' || currentView === 'course_roadmap' || currentView === 'unit_detail' ? 'text-[#004ac6] bg-blue-50' : 'text-[#434655] hover:text-[#004ac6]'}`}
              >
                Courses
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className={`font-semibold text-sm transition-colors px-3 py-1.5 rounded-lg ${currentView === 'reports' ? 'text-[#004ac6] bg-blue-50' : 'text-[#434655] hover:text-[#004ac6]'}`}
              >
                Progress
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className={`font-semibold text-sm transition-colors px-3 py-1.5 rounded-lg ${currentView === 'profile' ? 'text-[#004ac6] bg-blue-50' : 'text-[#434655] hover:text-[#004ac6]'}`}
              >
                Profile
              </button>
            </nav>

            {/* Notification Button */}
            <div className="flex items-center gap-2">
              <button 
                onClick={onOpenNotifications}
                className="w-10 h-10 rounded-full hover:bg-blue-50 transition-colors flex items-center justify-center relative text-[#004ac6] active:scale-90"
                aria-label="Notificaciones"
              >
                <span className="material-symbols-outlined text-[24px]">notifications</span>
                {notificationsCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Bottom Navigation Bar (Visible on mobile) */}
      {!isAuthOrExercise && (
        <nav className="fixed bottom-0 left-0 w-full z-40 bg-white border-t border-[#e2e8f0] shadow-lg flex justify-around items-center px-2 py-2 md:hidden rounded-t-2xl">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-[#2563eb] text-white' : 'text-[#434655] hover:text-[#004ac6]'}`}
          >
            <span className="material-symbols-outlined text-[22px]">home</span>
            <span className="text-[11px] font-semibold mt-0.5">Home</span>
          </button>

          <button
            onClick={() => onNavigate('courses_map')}
            className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${['courses_map', 'course_roadmap', 'unit_detail'].includes(currentView) ? 'bg-[#2563eb] text-white' : 'text-[#434655] hover:text-[#004ac6]'}`}
          >
            <span className="material-symbols-outlined text-[22px]">menu_book</span>
            <span className="text-[11px] font-semibold mt-0.5">Courses</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${currentView === 'reports' ? 'bg-[#2563eb] text-white' : 'text-[#434655] hover:text-[#004ac6]'}`}
          >
            <span className="material-symbols-outlined text-[22px]">leaderboard</span>
            <span className="text-[11px] font-semibold mt-0.5">Progress</span>
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${currentView === 'profile' ? 'bg-[#2563eb] text-white' : 'text-[#434655] hover:text-[#004ac6]'}`}
          >
            <span className="material-symbols-outlined text-[22px]">person</span>
            <span className="text-[11px] font-semibold mt-0.5">Profile</span>
          </button>
        </nav>
      )}
    </>
  );
};
