import React, { useState } from 'react';
import { ScreenView } from '../types';
import { MASCOT_IMAGES } from '../data/mockData';

interface LoginViewProps {
  onNavigate: (view: ScreenView) => void;
  onLoginSuccess: (email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('estudiante@ejemplo.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 4) {
      setShowError(true);
      return;
    }
    // Success login
    setShowError(false);
    onLoginSuccess(email);
    onNavigate('dashboard');
  };

  return (
    <div className="bg-[#f8f9ff] min-h-[calc(100vh-40px)] flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Brand Header */}
      <header className="flex flex-col items-center mb-6">
        <div 
          onClick={() => onNavigate('welcome')}
          className="cursor-pointer flex flex-col items-center group"
        >
          <div className="w-24 h-24 mb-2 relative flex items-center justify-center">
            <img 
              src={MASCOT_IMAGES.mainHero} 
              alt="Carpincho Mascot" 
              className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform"
            />
          </div>
          <h1 className="font-heading font-extrabold text-4xl text-[#004ac6] tracking-tight">
            CODIX
          </h1>
        </div>
      </header>

      {/* Main Form Card */}
      <main className="w-full max-w-md relative">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.06)] border border-[#e2e8f0] relative z-10">
          <h2 className="font-heading font-bold text-2xl text-center text-[#0b1c30] mb-6">
            ¡Bienvenido de vuelta!
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#434655]" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (showError) setShowError(false);
                  }}
                  placeholder="estudiante@ejemplo.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-[#f8f9ff] focus:bg-white focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all text-sm outline-none text-[#0b1c30]"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#434655]" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (showError) setShowError(false);
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border ${showError ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-[#f8f9ff]'} focus:bg-white focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all text-sm outline-none text-[#0b1c30]`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Mostrar contraseña"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error Message banner */}
            {showError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 animate-shake">
                <span className="material-symbols-outlined text-red-600 text-[20px] fill">
                  error
                </span>
                <p className="text-sm font-medium">Email o contraseña incorrectos</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-12 mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.25)] border-b-2 border-[#1e40af] active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Ingresar</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>

            {/* Toggle simulate error button for testing UI */}
            <div className="flex justify-between items-center text-xs mt-2">
              <button
                type="button"
                onClick={() => setShowError(!showError)}
                className="text-slate-400 hover:text-slate-600 underline"
              >
                {showError ? 'Ocultar error' : 'Simular error'}
              </button>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Se ha enviado un enlace de recuperación a tu email.'); }} className="text-[#2563eb] font-medium hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>

          {/* Mascot Hint speech bubble */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-3 bg-blue-50/60 p-3 rounded-xl">
            <span className="text-xl">💡</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Tip:</strong> Puedes ingresar con cualquier email para explorar el curso de Python y ejercicios interactivos.
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center text-sm text-[#434655]">
          <span>¿No tienes una cuenta? </span>
          <button
            onClick={() => onNavigate('register')}
            className="text-[#2563eb] font-bold hover:underline"
          >
            Regístrate aquí
          </button>
        </div>
      </main>
    </div>
  );
};
