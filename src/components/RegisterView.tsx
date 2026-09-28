import React, { useState } from 'react';
import { ScreenView } from '../types';
import { RegisterData } from '../auth/api';

const REGISTER_MASCOT = '/register-mascot.png';
const REGISTER_BOOKS = '/register-books.png';

// Welcome scene of the sign-up: the mascot on a bean bag with its laptop, with a
// code window, a plant, a "like" bubble and a stack of books around it,
// positioned in percentages so it scales with the column width.
const RegisterIllustration: React.FC = () => (
  <div className="relative w-full max-w-[620px] aspect-[44/34] translate-y-[6%]" aria-hidden="true">
    {/* Floating code window */}
    <div className="absolute left-[20%] top-[3%] w-[33%] h-[27%] rounded-2xl bg-white/5 border border-white/15 backdrop-blur-sm shadow-[0_8px_30px_rgba(15,23,42,0.35)] p-[3%] flex flex-col gap-[8%]">
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
      </div>
      {[
        ['ml-0 w-[55%]', 'bg-sky-400'],
        ['ml-[10%] w-[60%]', 'bg-violet-300'],
        ['ml-[10%] w-[40%]', 'bg-pink-300'],
        ['ml-0 w-[70%]', 'bg-sky-300'],
      ].map(([layout, color], i) => (
        <div key={i} className="flex items-center gap-[5%]">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
          <span className={`h-2 rounded-full ${layout} ${color}`} />
        </div>
      ))}
    </div>

    {/* "Like" bubble */}
    <div className="absolute left-[78%] top-[10%] w-[11%] aspect-square rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shadow-[0_8px_30px_rgba(15,23,42,0.35)] flex items-center justify-center">
      <svg className="w-[55%]" viewBox="0 0 24 24" fill="white">
        <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.6 1.2 4.4 2.6h2.4C14 6.2 15.6 5 17.6 5 21 5 23.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21z" />
      </svg>
      <span className="absolute -bottom-[14%] left-[22%] w-[22%] aspect-square rotate-45 bg-white/10 border-r border-b border-white/20" />
    </div>

    {/* Sparkles around the mascot's head */}
    <svg className="absolute left-[36%] top-[28%] w-[5%]" viewBox="0 0 30 30" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
      <path d="M22 6 L26 14" />
      <path d="M8 10 L18 16" />
    </svg>
    <svg className="absolute left-[72%] top-[26%] w-[5%]" viewBox="0 0 30 30" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
      <path d="M4 14 L9 6" />
      <path d="M12 20 L22 16" />
    </svg>

    {/* Plant */}
    <svg className="absolute left-[0%] top-[26%] w-[21%]" viewBox="0 0 100 150">
      <path d="M48 96 C20 88 4 60 8 30 C30 40 46 64 48 96 Z" fill="#22c55e" stroke="#14532d" strokeWidth="2" />
      <path d="M52 96 C54 60 70 30 96 20 C98 52 80 84 52 96 Z" fill="#4ade80" stroke="#14532d" strokeWidth="2" />
      <path d="M50 94 C40 60 42 30 58 4 C66 34 62 66 50 94 Z" fill="#16a34a" stroke="#14532d" strokeWidth="2" />
      <path d="M46 98 C28 96 10 84 2 70 C22 66 38 78 46 98 Z" fill="#4ade80" stroke="#14532d" strokeWidth="2" />
      <path d="M54 98 C70 94 86 84 96 70 C78 64 60 78 54 98 Z" fill="#22c55e" stroke="#14532d" strokeWidth="2" />
      <path d="M26 96 H74 L68 140 Q67 146 60 146 H40 Q33 146 32 140 Z" fill="#f1f5f9" stroke="#1e2a55" strokeWidth="2.5" />
    </svg>

    {/* Stack of books (Python, JavaScript, React), partly hidden behind the bean bag */}
    <img src={REGISTER_BOOKS} alt="" className="absolute right-[4%] top-[50%] w-[25%] drop-shadow-[0_10px_20px_rgba(15,23,42,0.45)]" />

    {/* Mascot on its bean bag */}
    <img
      src={REGISTER_MASCOT}
      alt=""
      className="absolute left-[13%] top-[14%] w-[70%] drop-shadow-[0_14px_28px_rgba(15,23,42,0.5)]"
    />
  </div>
);

interface RegisterViewProps {
  onNavigate: (view: ScreenView) => void;
  // Resolves to an error message to display, or null on success (App redirects to /alumno).
  onRegister: (data: RegisterData) => Promise<string | null>;
}

const INSTITUTIONS: Record<string, string | null> = {
  inst_1: 'Escuela Técnica N°1',
  inst_2: 'Instituto Tecnológico',
  inst_3: 'Colegio San Martín',
  inst_4: 'Liceo Nacional',
  other: null,
};

// Same rules the backend enforces (server/src/modules/auth/auth.controller.ts).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate, onRegister }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institucion, setInstitucion] = useState('inst_2');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): string | null => {
    const missing = [
      !nombre.trim() && 'nombre',
      !apellido.trim() && 'apellido',
      !email.trim() && 'email',
      !password && 'contraseña',
    ].filter(Boolean);
    if (missing.length > 0) return `Completá los campos obligatorios: ${missing.join(', ')}.`;
    if (!EMAIL_REGEX.test(email.trim())) return 'Ingresá un email válido.';
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      return `La contraseña no puede superar los ${MAX_PASSWORD_LENGTH} caracteres.`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    const error = await onRegister({
      name: nombre.trim(),
      lastName: apellido.trim(),
      email: email.trim(),
      password,
      school: INSTITUTIONS[institucion] ?? null,
    });
    setIsSubmitting(false);
    if (error) setErrorMessage(error);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Column - Gradient with the mascot relaxing with its laptop */}
      <div className="relative overflow-hidden flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#1d4ed8] via-[#1e3a8a] to-[#0b1c30] text-white md:w-1/2 px-6 py-8 md:px-10 md:py-8">
        {/* Background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[640px] h-[220px] rounded-[100%] bg-blue-500/10 blur-2xl" />

        <div className="relative translate-y-8 flex flex-col items-center gap-1">
          <span className="font-heading font-bold text-3xl text-white tracking-tight">PlayCode</span>
          <p className="text-sm font-medium tracking-wide text-blue-100/80">Gestioná · Aprendé · Crecé</p>
        </div>

        <RegisterIllustration />

        <div className="relative -mt-4 flex flex-col items-center gap-2 text-center">
          <h1 className="font-heading font-bold text-2xl md:text-3xl leading-tight">
            ¡Únete a la <span className="text-sky-400">comunidad</span>!
          </h1>
          <p className="max-w-md text-xs md:text-sm text-blue-100/85">
            Crea tu cuenta y empieza a programar, aprende y crece con nosotros
          </p>
          <span className="mt-2 w-10 h-1 rounded-full bg-sky-400/80" />
        </div>
      </div>
      {/* Right Column - Form Card */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f8f9ff] p-6">
        <main className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.06)] border border-[#e2e8f0] p-6 md:p-8 flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-2xl font-heading font-bold text-[#0b1c30] mb-1">Crear una cuenta</h2>
              <p className="text-sm text-[#434655]">Únete a la comunidad y empieza a programar.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
                  placeholder="Mínimo 8 caracteres"
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


              {/* Error Banner */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                  <span className="material-symbols-outlined text-red-600 text-[20px]">error</span>
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.25)] border-b-2 border-[#1e40af] active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                <span>{isSubmitting ? 'Creando cuenta...' : 'Registrarse'}</span>
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
          </div>
        </main>
      </div>
    </div>
  );
};
