import React from 'react';

export interface StatusHudProps {
  avatarUrl?: string;
  avatarIcon?: string;
  badgeText?: string;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
  onAvatarClick?: () => void;
}

export const StatusHud: React.FC<StatusHudProps> = ({
  avatarUrl,
  avatarIcon,
  badgeText,
  title,
  subtitle,
  children,
  className = '',
  compact = false,
  onAvatarClick
}) => {
  return (
    <div 
      className={`w-full bg-gradient-to-r from-[#0b1c30] via-[#0d223a] to-[#122e4e] ${
        compact ? 'p-3.5 md:p-4 rounded-2xl' : 'p-5 md:p-6 rounded-3xl'
      } border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}
    >
      {/* Left Column: Avatar + Identity */}
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
        {(avatarUrl || avatarIcon) && (
          <div 
            onClick={onAvatarClick}
            className={`${
              compact ? 'w-11 h-11 md:w-12 md:h-12 rounded-xl' : 'w-14 h-14 md:w-16 md:h-16 rounded-2xl'
            } overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center shrink-0 shadow-md ${
              onAvatarClick ? 'cursor-pointer hover:border-white/40 transition-colors' : ''
            }`}
          >
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className={`material-symbols-outlined text-white ${compact ? 'text-2xl' : 'text-3xl'}`}>
                {avatarIcon}
              </span>
            )}
          </div>
        )}
        <div className="min-w-0">
          {badgeText && (
            <span className="inline-block text-[10px] sm:text-[11px] font-bold text-blue-300 uppercase tracking-wider bg-blue-500/20 border border-blue-400/30 px-2.5 py-0.5 rounded-md mb-1">
              {badgeText}
            </span>
          )}
          {typeof title === 'string' ? (
            <h1 className={`font-heading font-bold text-white leading-tight truncate ${
              compact ? 'text-lg sm:text-xl md:text-2xl' : 'text-xl sm:text-2xl md:text-3xl'
            }`}>
              {title}
            </h1>
          ) : (
            title
          )}
          {subtitle && (
            typeof subtitle === 'string' ? (
              <p className="text-xs text-slate-300 mt-0.5 truncate">
                {subtitle}
              </p>
            ) : (
              subtitle
            )
          )}
        </div>
      </div>

      {/* Right Slot: Badges, Actions, Navigation buttons */}
      {children && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};
