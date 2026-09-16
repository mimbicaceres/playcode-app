import React, { useState } from 'react';
import { ScreenView, UserRole } from '../types';
import { MASCOT_IMAGES } from '../data/mockData';

interface RegisterViewProps {
  onNavigate: (view: ScreenView) => void;
  onRegisterSuccess: (name: string, role: UserRole, school: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate, onRegisterSuccess }) => {
  const [nombre, setNombre] = useState('Facundo');
  const [apellido, setApellido] = useState('González');
  const [email, setEmail] = useState('estudiante@escuela.edu');
  const [password, setPassword] = useState('••••••••');
  const [institucion, setInstitucion] = useState('inst_2');
  const [rol, setRol] = useState<UserRole>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const schoolName = institucion === 'inst_2' ? 'Instituto Tecnológico' : 'Colegio San Martín';
    onRegisterSuccess(`${nombre} ${apellido.charAt(0)}.`, rol, schoolName);
    if (rol === 'teacher') {
      onNavigate('teacher_dashboard');
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Column - Gradient with mascot */}
      <div className="flex flex-col items-center justify-end bg-gradient-to-b from-[#2563eb] to-[#0b1c30] text-white md:w-1/2 p-6 md:p-12">
        <img
          src={MASCOT_IMAGES.mainHero}
          alt="Carpincho Mascota"
          className="w-48 h-48 md:w-64 md:h-64 object-contain mb-4"
        />
        <p className="font-heading text-xl text-center">¡Únete a la comunidad!</p>
      </div>
      {/* Right Column - Form Card */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f8f9ff] p-6">
        <main className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.06)] border border-[#e2e8f0] p-6 md:p-8 flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-2xl font-heading font-bold text-[#0b1c30] mb-1">Crear una cuenta</h2>
              <p className="text-sm text-[#434655]">Únete a la comunidad y empieza a programar.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Nombre y Apellido Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#434655]" htmlFor="reg-nombre">Nombre</label>
                  <input
                    id="reg-nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-[#f8f9ff] focus:bg-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-sm outline-none transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#434655]" htmlFor="reg-apellido">Apellido</label>
                  <input
                    id="reg-apellido"
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Tu apellido"
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-[#f8f9ff] focus:bg-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-sm outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#434655]" htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="estudiante@escuela.edu"
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-[#f8f9ff] focus:bg-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-sm outline-none transition-colors"
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#434655]" htmlFor="reg-password">Contraseña</label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-[#f8f9ff] focus:bg-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-sm outline-none transition-colors"
                  required
                />
              </div>

              {/* Institución Educativa */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#434655]" htmlFor="reg-institucion">Institución Educativa</label>
                <select
                  id="reg-institucion"
                  value={institucion}
                  onChange={(e) => setInstitucion(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-[#f8f9ff] focus:bg-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-sm outline-none transition-colors text-[#0b1c30]"
                >
                  <option value="inst_1">Escuela Técnica N°1</option>
                  <option value="inst_2">Instituto Tecnológico</option>
                  <option value="inst_3">Colegio San Martín</option>
                  <option value="inst_4">Liceo Nacional</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              {/* Rol */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#434655]" htmlFor="reg-rol">Rol</label>
                <select
                  id="reg-rol"
                  value={rol}
                  onChange={(e) => setRol(e.target.value as UserRole)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-[#f8f9ff] focus:bg-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-sm outline-none transition-colors text-[#0b1c30]"
                >
                  <option value="student">Estudiante</option>
                  <option value="teacher">Docente</option>
                  <option value="admin">Administrador Institucional</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-12 mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.25)] border-b-2 border-[#1e40af] active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Registrarse</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-sm text-[#434655]">
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => onNavigate('login')}
                  className="text-[#2563eb] font-semibold hover:underline"
                >
                  Inicia sesión
                </button>
              </p>
            </div>

            {/* Helpful Mascot Tip */}
            <div className="flex items-start gap-3 bg-blue-50/70 p-3 rounded-xl border border-blue-100/80">
              <span className="material-symbols-outlined text-amber-500 text-[24px] mt-0.5">tips_and_updates</span>
              <p className="text-xs text-[#434655] leading-relaxed">
                ¡Casi lo tienes! Crear una cuenta te permitirá guardar tu progreso en los cursos, desbloquear el editor de código y obtener insignias.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
