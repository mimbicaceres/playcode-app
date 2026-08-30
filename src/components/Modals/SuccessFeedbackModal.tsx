import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MASCOT_IMAGES } from '../../data/mockData';

interface SuccessFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextExercise: () => void;
  rewardXp?: number;
}

export const SuccessFeedbackModal: React.FC<SuccessFeedbackModalProps> = ({
  isOpen,
  onClose,
  onNextExercise,
  rewardXp = 20
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#10B981', '#F59E0B', '#6cf8bb', '#ffddb8']
        });
      } catch (err) {
        console.log('Confetti triggered', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 relative p-6 md:p-8 text-center animate-scale-up">
        {/* Mascot Image Celebrating */}
        <div className="w-40 h-40 mx-auto mb-4 relative animate-bounce" style={{ animationDuration: '2s' }}>
          <img 
            src={MASCOT_IMAGES.mainHero} 
            alt="Carpincho Celebrating" 
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        {/* Title */}
        <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-[#004ac6] mb-3">
          ¡Excelente!
        </h1>

        {/* XP Badge */}
        <div className="inline-flex items-center justify-center bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full mb-6 mx-auto border border-amber-300 shadow-sm">
          <span className="material-symbols-outlined mr-1.5 text-amber-500 fill text-lg">
            star
          </span>
          <span className="text-sm font-bold">+{rewardXp} XP</span>
        </div>

        {/* Motivational Speech Bubble */}
        <div className="bg-[#f8f9ff] border border-blue-100 rounded-2xl p-5 mb-8 shadow-sm relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#f8f9ff] border-t border-l border-blue-100 rotate-45" />
          <p className="text-sm md:text-base text-[#0b1c30] relative z-10 leading-relaxed font-medium">
            ¡Tu lógica es impecable! Estás dominando estas estructuras de control como un verdadero programador.
          </p>
        </div>

        {/* Continue Button with Pulse Effect */}
        <button
          onClick={() => {
            onClose();
            onNextExercise();
          }}
          className="w-full py-4 px-6 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-base rounded-xl shadow-lg pulse-btn transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continuar</span>
          <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
