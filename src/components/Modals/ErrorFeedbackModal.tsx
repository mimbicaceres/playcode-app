import React from 'react';
import { MASCOT_IMAGES } from '../../data/mockData';

interface ErrorFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowHint: () => void;
  errorMessage: string;
}

export const ErrorFeedbackModal: React.FC<ErrorFeedbackModalProps> = ({
  isOpen,
  onClose,
  onShowHint,
  errorMessage
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-visible flex flex-col border border-slate-200 relative pt-14 p-6 md:p-8 animate-scale-up text-center">
        {/* Protagonist Mascot Peeking / Breaking Top Border */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-28 h-28 pointer-events-none drop-shadow-md animate-peek">
          <img 
            src={MASCOT_IMAGES.mainHero} 
            alt="Carpincho Tutor" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Title */}
        <h3 className="font-heading font-bold text-2xl md:text-3xl text-[#0b1c30] mb-2 mt-2">
          ¡Casi lo tienes!
        </h3>

        {/* Feedback error box */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#ba1a1a] text-xl fill mt-0.5 shrink-0">
              error
            </span>
            <p className="text-xs md:text-sm text-[#434655] leading-relaxed">
              {errorMessage}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          {/* Primary High-Commitment 3D Tactile CTA */}
          <button
            onClick={onClose}
            className="btn-game-primary w-full py-3.5 px-6 text-sm"
          >
            Volver a intentar
          </button>

          {/* Secondary Flat Action */}
          <button
            onClick={() => {
              onClose();
              onShowHint();
            }}
            className="w-full py-3 px-6 bg-white hover:bg-blue-50/60 text-[#2563eb] border border-[#2563eb] font-semibold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">lightbulb</span>
            <span>Ver una pista</span>
          </button>
        </div>
      </div>
    </div>
  );
};
