import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MASCOT_IMAGES } from '../../data/mockData';
import { GamificationDelta } from '../../auth/api';

interface SuccessFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextExercise: () => void;
  rewardXp?: number;
  // Gamificacion real (alumnos): racha, nivel y logros que se ganaron con este ejercicio.
  streakDays?: number;
  bonusXp?: number;
  gamification?: GamificationDelta;
  // El ejercicio ya estaba resuelto (se esta repasando): no suma XP de nuevo.
  alreadySolved?: boolean;
}

export const SuccessFeedbackModal: React.FC<SuccessFeedbackModalProps> = ({
  isOpen,
  onClose,
  onNextExercise,
  rewardXp = 20,
  streakDays,
  bonusXp = 0,
  gamification,
  alreadySolved = false,
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
          <span className="text-sm font-bold">{alreadySolved ? 'Ya lo habías resuelto' : `+${rewardXp} XP`}</span>
          {!alreadySolved && bonusXp > 0 && <span className="ml-2 text-[11px] font-bold text-orange-600">incluye +{bonusXp} de bonus diario</span>}
        </div>

        {/* Gamificacion: racha, nivel y logros nuevos */}
        {(streakDays !== undefined || gamification) && (
          <div className="flex flex-col gap-2 mb-4">
            {streakDays !== undefined && streakDays > 0 && (
              <p className="text-xs font-bold text-orange-600 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-base fill">local_fire_department</span>
                Racha de {streakDays} {streakDays === 1 ? 'día' : 'días'}
              </p>
            )}
            {gamification?.leveledUp && (
              <div className="rounded-xl bg-gradient-to-r from-violet-100 to-amber-100 border border-violet-200 px-3 py-2 text-sm font-bold text-violet-800 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined fill text-xl">military_tech</span>
                ¡Subiste al nivel {gamification.level}! {gamification.levelTitle}
              </div>
            )}
            {gamification && !gamification.leveledUp && (
              <div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-amber-300 transition-all duration-700" style={{ width: `${gamification.percentToNextLevel}%` }} />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Nivel {gamification.level} · te faltan {gamification.xpToNextLevel} XP para el siguiente</p>
              </div>
            )}
            {(gamification?.newBadges ?? []).map((badge) => (
              <div key={badge.id} className="rounded-xl border-2 px-3 py-2 flex items-center gap-3 text-left" style={{ borderColor: `${badge.color}66`, backgroundColor: badge.bgColor }}>
                <span className="material-symbols-outlined fill text-3xl" style={{ color: badge.color }}>{badge.iconName}</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: badge.color }}>¡Logro desbloqueado!</p>
                  <p className="text-sm font-extrabold text-[#0b1c30] leading-tight">{badge.title}</p>
                  <p className="text-[11px] text-slate-600">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

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
