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
      <div className="glass-card w-full max-w-md rounded-3xl shadow-2xl overflow-visible flex flex-col relative p-6 md:p-8 pt-16 text-center animate-scale-up">
        {/* Protagonist Mascot Celebrating breaking the top border */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 md:w-36 md:h-36 pointer-events-none drop-shadow-xl animate-float">
          <img 
            src={MASCOT_IMAGES.mainHero} 
            alt="Carpincho Celebrando" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-[#0b1c30] mb-2 mt-2">
          ¡Excelente!
        </h2>

        {/* Warm XP Badge */}
        <div className="inline-flex items-center justify-center bg-[#fff4e5] text-[#92400e] px-4 py-1.5 rounded-full mb-5 mx-auto border border-[#ffb95f] shadow-xs">
          <span className="material-symbols-outlined mr-1.5 text-amber-500 fill text-lg">
            stars
          </span>
          <span className="text-sm font-bold">+{rewardXp} XP</span>
        </div>

        {/* Motivational Speech Bubble */}
        <div className="bg-white/90 border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/90 border-t border-l border-slate-200 rotate-45" />
          <p className="text-xs md:text-sm text-[#434655] relative z-10 leading-relaxed font-medium">
            ¡Tu lógica es impecable! Estás dominando estas estructuras de control como un verdadero programador.
          </p>
        </div>

        {/* Continue Button with Tactile 3D and Pulse Effect */}
        <button
          onClick={() => {
            onClose();
            onNextExercise();
          }}
          className="btn-game-success w-full py-4 px-6 text-base rounded-xl pulse-btn flex items-center justify-center gap-2"
        >
          <span>Continuar</span>
          <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
