import React, { useState } from 'react';
import { ScreenView } from '../types';

interface LoginViewProps {
  onNavigate: (view: ScreenView) => void;
  // Resolves to an error message to display, or null on success (App redirects by role).
  onLogin: (email: string, password: string) => Promise<string | null>;
}

const LOGIN_MASCOT = '/login-mascot.png';

// Welcome scene of the login: the mascot typing on a laptop, with a plant,
// books and floating code/chart cards around it, positioned in percentages so
// it scales with the column width.
const LoginIllustration: React.FC = () => (
  <div className="relative w-full max-w-[620px] aspect-[44/34] translate-y-[12%]" aria-hidden="true">
    {/* Floating code card */}
    <div className="absolute left-[9%] top-[7%] w-[31%] h-[24%] rounded-2xl bg-white/5 border border-white/15 backdrop-blur-sm shadow-[0_8px_30px_rgba(15,23,42,0.35)] p-[3%] flex flex-col justify-center gap-[9%]">
      {[
        ['w-[45%]', 'bg-sky-400'],
        ['w-[65%]', 'bg-pink-300'],
        ['w-[55%]', 'bg-sky-300'],
        ['w-[75%]', 'bg-violet-300'],
      ].map(([width, color], i) => (
        <div key={i} className="flex items-center gap-[6%]">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
          <span className={`h-2 rounded-full ${width} ${color}`} />
        </div>
      ))}
    </div>

    {/* Dotted grid */}
    <div className="absolute right-[6%] top-[5%] grid grid-cols-4 gap-3 opacity-40">
      {Array.from({ length: 12 }, (_, i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-100" />)}
    </div>

    {/* Floating chart card */}
    <div className="absolute right-[2%] top-[44%] w-[17%] aspect-square rounded-2xl bg-white/5 border border-white/15 backdrop-blur-sm shadow-[0_8px_30px_rgba(15,23,42,0.35)] flex items-center justify-center">
      <svg className="w-[46%]" viewBox="0 0 40 40" fill="#38bdf8">
        <rect x="2" y="24" width="8" height="14" rx="2" />
        <rect x="16" y="15" width="8" height="23" rx="2" />
        <rect x="30" y="4" width="8" height="34" rx="2" />
      </svg>
    </div>

    {/* Sparkles next to the mascot's cap */}
    <svg className="absolute left-[76%] top-[14%] w-[6%]" viewBox="0 0 30 30" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
      <path d="M4 12 L9 4" />
      <path d="M14 18 L24 14" />
    </svg>

    {/* Books and plant (behind the laptop's left corner) */}
    <svg className="absolute left-[3%] top-[38%] w-[22%]" viewBox="0 0 100 110">
      {/* Leaves */}
      <path d="M50 48 C30 40 18 22 22 6 C38 12 50 28 50 48 Z" fill="#22c55e" stroke="#14532d" strokeWidth="2" />
      <path d="M52 48 C60 26 76 14 92 14 C88 32 72 46 52 48 Z" fill="#4ade80" stroke="#14532d" strokeWidth="2" />
      <path d="M50 48 C46 34 48 24 56 12" stroke="#14532d" strokeWidth="2" fill="none" />
      {/* Pot */}
      <path d="M30 46 H72 L68 70 Q67 74 62 74 H40 Q35 74 34 70 Z" fill="#f1f5f9" stroke="#1e2a55" strokeWidth="2.5" />
      {/* Books */}
      <rect x="8" y="74" width="86" height="15" rx="4" fill="#3b82f6" stroke="#1e2a55" strokeWidth="2.5" />
      <rect x="14" y="89" width="80" height="15" rx="4" fill="#1d4ed8" stroke="#1e2a55" strokeWidth="2.5" />
      <path d="M14 81 H86 M20 96 H88" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
    </svg>

    {/* Mascot typing on its laptop */}
    <img
      src={LOGIN_MASCOT}
      alt=""
      className="absolute left-[17%] top-[2%] w-[70%] drop-shadow-[0_14px_28px_rgba(15,23,42,0.5)]"
    />
  </div>
);

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('estudiante@ejemplo.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Email o contrasena incorrectos');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 4) {
      setErrorMessage('Email o contrasena incorrectos');
      setShowError(true);
      return;
    }
    setShowError(false);
    setIsSubmitting(true);
    const error = await onLogin(email, password);
    setIsSubmitting(false);
    if (error) {
      setErrorMessage(error);
      setShowError(true);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Column - Gradient with the mascot working on its laptop */}
      <div className="relative overflow-hidden flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#1d4ed8] via-[#1e3a8a] to-[#0b1c30] text-white md:w-1/2 px-6 py-8 md:px-10 md:py-8">
        {/* Background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[640px] h-[220px] rounded-[100%] bg-blue-500/10 blur-2xl" />

        <div className="relative translate-y-8 flex flex-col items-center gap-1">
          <span className="font-heading font-bold text-3xl text-white tracking-tight">PlayCode</span>
          <p className="text-sm font-medium tracking-wide text-blue-100/80">Gestioná · Aprendé · Crecé</p>
        </div>

        <LoginIllustration />

        <div className="relative -mt-10 flex flex-col items-center gap-2 text-center">
          <h1 className="font-heading font-bold text-3xl md:text-4xl leading-tight">
            ¡Bienvenido <span className="text-sky-400">de vuelta</span>!
          </h1>
          <p className="text-sm md:text-base text-blue-100/85">Seguimos construyendo tu aprendizaje juntos</p>
          <span className="mt-2 w-10 h-1 rounded-full bg-sky-400/80" />
        </div>
      </div>
      {/* Right Column - Form Card */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f8f9ff] p-6">
        <main className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
            <h2 className="font-heading font-bold text-2xl text-center text-[#0b1c30] mb-6">Bienvenido de vuelta!</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#434655]" htmlFor="login-email">Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">mail</span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (showError) setShowError(false); }}
                    placeholder="estudiante@ejemplo.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-[#f8f9ff] focus:bg-white focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all text-sm outline-none text-[#0b1c30]"
                    required
                  />
                </div>
              </div>
              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#434655]" htmlFor="login-password">Contrasena</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (showError) setShowError(false); }}
                    placeholder="secreta"
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border ${showError ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-[#f8f9ff]'} focus:bg-white focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all text-sm outline-none text-[#0b1c30]`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Mostrar contrasena"
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>
              {/* Error Banner */}
              {showError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                  <span className="material-symbols-outlined text-red-600 text-[20px]">error</span>
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              )}
              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.25)] border-b-2 border-[#1e40af] active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                <span>{isSubmitting ? 'Ingresando...' : 'Ingresar'}</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <div className="flex justify-end text-xs mt-1">
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('Se ha enviado un enlace de recuperacion a tu email.'); }}
                  className="text-[#2563eb] font-medium hover:underline"
                >
                  Olvidaste tu contrasena?
                </a>
              </div>
            </form>
            {/* Tip */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-3 bg-blue-50/60 p-3 rounded-xl">
              <span className="text-xl">&#128161;</span>
              <p className="text-xs text-slate-600 leading-relaxed"><strong>Tip:</strong> En desarrollo podés usar las cuentas demo estudiante@ejemplo.com, docente@ejemplo.com o admin@ejemplo.com (contraseña: password123).</p>
            </div>
          </div>
          {/* Footer Link */}
          <div className="mt-6 text-center text-sm text-[#434655]">
            <span>No tienes una cuenta? </span>
            <button onClick={() => onNavigate('register')} className="text-[#2563eb] font-bold hover:underline">Registrate aqui</button>
          </div>
        </main>
      </div>
    </div>
  );
};
