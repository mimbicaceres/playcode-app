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
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 p-6 text-center animate-scale-up">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3 text-amber-600">
          <span className="material-symbols-outlined text-3xl">lightbulb</span>
        </div>

        <h3 className="font-heading font-bold text-xl text-[#0b1c30] mb-2">
          Pista del Carpincho
        </h3>

        <div className="flex items-center gap-3 bg-blue-50/70 p-4 rounded-xl border border-blue-100 text-left mb-6">
          <img 
            src={MASCOT_IMAGES.faceCorner} 
            alt="Carpincho" 
            className="w-12 h-12 object-contain shrink-0"
          />
          <p className="text-xs md:text-sm text-[#0b1c30] font-mono leading-relaxed">
            {hintText}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#2563eb] text-white font-semibold text-sm rounded-xl hover:bg-[#1d4ed8] transition-colors"
        >
          ¡Entendido, volver al código!
        </button>
      </div>
    </div>
  );
};
