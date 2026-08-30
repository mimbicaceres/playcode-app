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
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 relative animate-scale-up">
        {/* Top red accent line */}
        <div className="h-2 w-full bg-[#ba1a1a]" />

        <div className="p-6 md:p-8 flex flex-col items-center text-center">
          {/* Mascot Image */}
          <div className="w-32 h-32 mb-4 relative">
            <img 
              src={MASCOT_IMAGES.mainHero} 
              alt="Carpincho Tutor" 
              className="w-full h-full object-contain drop-shadow"
            />
          </div>

          {/* Title */}
          <h3 className="font-heading font-bold text-2xl text-[#0b1c30] mb-3">
            ¡Casi lo tienes!
          </h3>

          {/* Feedback error box */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 w-full text-left">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ba1a1a] text-xl fill mt-0.5 shrink-0">
                error
              </span>
              <p className="text-sm text-[#434655] leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={onClose}
              className="w-full py-3.5 px-6 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.25)] border-b-2 border-[#1e40af] active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Volver a intentar
            </button>

            <button
              onClick={() => {
                onClose();
                onShowHint();
              }}
              className="w-full py-3.5 px-6 bg-white hover:bg-blue-50/60 text-[#2563eb] border-2 border-[#2563eb] font-semibold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">lightbulb</span>
              <span>Ver una pista</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
