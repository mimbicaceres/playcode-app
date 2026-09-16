import React from 'react';
import { ScreenView } from '../types';
import { MASCOT_IMAGES } from '../data/mockData';

interface WelcomeViewProps {
  onNavigate: (view: ScreenView) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onNavigate }) => {

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Column – Gradient block with mascot */}
      <div className="flex flex-col items-center justify-end bg-gradient-to-b from-[#2563eb] to-[#0b1c30] text-white md:w-1/2 p-6 md:p-12">
        <img
          src={MASCOT_IMAGES.mainHero}
          alt="Carpincho Mascota"
          className="w-48 h-48 md:w-64 md:h-64 object-contain mb-4"
        />
        <p className="font-heading text-xl text-center">Tu futuro comienza aquí</p>
      </div>

      {/* Right Column – Card with actions */}
      <div className="flex flex-1 items-center justify-center bg-[#f8f9ff] p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <h1 className="font-heading font-extrabold text-4xl text-[#004ac6] text-center mb-6">
            PlayCode
          </h1>
          <p className="text-lg text-[#434655] text-center mb-8">
            Aprendé a programar, paso a paso.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => onNavigate('register')}
              className="w-full h-12 btn-game-primary flex items-center justify-center gap-2"
            >
              <span>Crear cuenta</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="w-full h-12 bg-white hover:bg-blue-50 text-[#2563eb] font-semibold rounded-xl border-2 border-[#2563eb] shadow-md flex items-center justify-center gap-2"
            >
              <span>Iniciar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
