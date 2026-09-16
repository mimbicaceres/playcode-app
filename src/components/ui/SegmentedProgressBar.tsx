import React from 'react';

export interface SegmentedProgressBarProps {
  totalSegments?: number;
  completedSegments?: number;
  percentage?: number;
  label?: string;
  activeColor?: string;
  className?: string;
}

export const SegmentedProgressBar: React.FC<SegmentedProgressBarProps> = ({
  totalSegments = 20,
  completedSegments,
  percentage,
  label = 'Progreso de la unidad',
  activeColor = '#ffb95f',
  className = ''
}) => {
  const calculatedFilled = completedSegments !== undefined
    ? completedSegments
    : percentage !== undefined
    ? Math.round((percentage / 100) * totalSegments)
    : 0;

  const displayPercent = percentage !== undefined
    ? percentage
    : Math.round((calculatedFilled / totalSegments) * 100);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-blue-200">{label}</span>
        <span className="text-[#ffb95f] font-bold text-sm">{displayPercent}%</span>
      </div>
      
      <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1 sm:gap-1.5 bg-[#0b1c30]/50 p-2 rounded-xl border border-white/15 backdrop-blur-xs">
        {Array.from({ length: totalSegments }).map((_, index) => {
          const isFilled = index < calculatedFilled;
          return (
            <div
              key={index}
              className={`h-3.5 rounded-[3px] transition-all duration-300 ${
                isFilled
                  ? 'bg-[#ffb95f] shadow-[0_0_8px_rgba(255,185,95,0.6)]'
                  : 'bg-white/10 border border-white/5'
              }`}
              title={`Segmento ${index + 1} de ${totalSegments} (${Math.round(((index + 1) / totalSegments) * 100)}%)`}
            />
          );
        })}
      </div>
    </div>
  );
};
