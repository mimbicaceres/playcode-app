import React from 'react';
import { MASCOT_IMAGES } from '../../data/mockData';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hintText: string;
}

export const HintModal: React.FC<HintModalProps> = ({ isOpen, onClose, hintText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-visible flex flex-col border border-slate-200 p-6 md:p-8 pt-14 text-center animate-scale-up relative">
        {/* Protagonist Mascot Peeking over top border */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 pointer-events-none drop-shadow-md animate-peek">
          <img 
            src={MASCOT_IMAGES.mainHero} 
            alt="Carpincho Pista" 
            className="w-full h-full object-contain"
          />
        </div>

        <h3 className="font-heading font-bold text-2xl text-[#0b1c30] mb-3 mt-1">
          Pista del Carpincho
        </h3>

        <div className="bg-[#fff4e5] p-4 rounded-2xl border border-[#ffb95f]/70 text-left mb-6 shadow-xs">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-600 text-xl shrink-0 mt-0.5">
              lightbulb
            </span>
            <p className="text-xs md:text-sm text-[#0b1c30] font-mono leading-relaxed">
              {hintText}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn-game-primary w-full py-3.5 px-6 text-sm flex items-center justify-center gap-2"
        >
          <span>¡Entendido, volver al código!</span>
        </button>
      </div>
    </div>
  );
};
