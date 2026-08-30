import React from 'react';
import { ScreenView } from '../types';
import { MASCOT_IMAGES } from '../data/mockData';

interface WelcomeViewProps {
  onNavigate: (view: ScreenView) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#f8f9ff] min-h-[calc(100vh-40px)] flex flex-col items-center justify-center relative overflow-hidden bg-tech-pattern px-4 py-12">
      {/* Decorative gradient blur orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#dbe1ff] rounded-full blur-[100px] opacity-60 -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[320px] h-[320px] bg-[#ffddb8] rounded-full blur-[90px] opacity-50 -z-10 pointer-events-none" />

      <main className="w-full max-w-md px-4 py-8 flex flex-col items-center justify-center text-center z-10">
        {/* Mascot Container */}
        <div className="mb-6 relative w-60 h-60 md:w-64 md:h-64 flex items-center justify-center animate-float">
          <div className="absolute inset-0 bg-white rounded-full shadow-[0px_8px_32px_rgba(37,99,235,0.12)] border border-slate-100" />
          <img 
            src={MASCOT_IMAGES.mainHero} 
            alt="Carpincho Programador mascot" 
            className="relative z-10 w-full h-full object-contain p-4 drop-shadow-md transition-transform hover:scale-105 duration-300"
          />
        </div>

        {/* Branding & Headline */}
        <h1 className="font-heading font-extrabold text-5xl md:text-6xl text-[#004ac6] tracking-tight mb-2">
          CODIX
        </h1>
        <p className="text-lg md:text-xl text-[#434655] font-medium mb-10 max-w-[280px]">
          Aprendé a programar, paso a paso.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-4">
          <button
            onClick={() => onNavigate('register')}
            className="w-full h-14 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-base rounded-xl shadow-[0px_4px_14px_rgba(37,99,235,0.25)] border-b-4 border-[#1e40af] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Crear cuenta</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>

          <button
            onClick={() => onNavigate('login')}
            className="w-full h-14 bg-white hover:bg-blue-50/60 text-[#2563eb] font-semibold text-base rounded-xl border-2 border-[#2563eb] shadow-[0px_4px_12px_rgba(0,0,0,0.03)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Iniciar sesión</span>
          </button>
        </div>

        {/* Quick exploratory shortcuts */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 w-full flex items-center justify-center gap-3 text-xs text-slate-500">
          <span>¿Quieres probar la plataforma?</span>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="text-blue-600 font-semibold hover:underline"
          >
            Entrar como Invitado →
          </button>
        </div>
      </main>
    </div>
  );
};
