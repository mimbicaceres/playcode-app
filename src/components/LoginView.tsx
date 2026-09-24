import React, { useState } from 'react';
import { ScreenView } from '../types';
import { MASCOT_IMAGES } from '../data/mockData';

interface LoginViewProps {
  onNavigate: (view: ScreenView) => void;
  // Resolves to an error message to display, or null on success (App redirects by role).
  onLogin: (email: string, password: string) => Promise<string | null>;
}

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
      {/* Left Column - Gradient with mascot */}
      <div className="flex flex-col items-center justify-end bg-gradient-to-b from-[#2563eb] to-[#0b1c30] text-white md:w-1/2 p-6 md:p-12">
        <img
          src={MASCOT_IMAGES.mainHero}
          alt="Carpincho Mascota"
          className="w-48 h-48 md:w-64 md:h-64 object-contain mb-4"
        />
        <p className="font-heading text-xl text-center">Bienvenido de vuelta!</p>
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
