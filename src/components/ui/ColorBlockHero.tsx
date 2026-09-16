import React from 'react';

export interface ColorBlockHeroProps {
  tag?: string;
  tagIcon?: string;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  progressElement?: React.ReactNode;
  actions?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  imageClassName?: string;
  imageVariant?: 'mascot' | 'avatar' | 'custom';
  imageSlot?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const ColorBlockHero: React.FC<ColorBlockHeroProps> = ({
  tag,
  tagIcon,
  title,
  description,
  progressElement,
  actions,
  imageSrc,
  imageAlt = 'Visual destacado',
  imageClassName = '',
  imageVariant = 'mascot',
  imageSlot,
  children,
  className = ''
}) => {
  const hasRightColumn = Boolean(imageSlot || imageSrc);

  return (
    <div className={`rounded-[2rem] bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#0b1c30] text-white p-6 md:p-8 relative overflow-hidden shadow-[0_12px_32px_rgba(11,28,48,0.25)] border border-blue-400/30 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end relative z-10">
        {/* Left Column: Content, Progress, Actions */}
        <div className={`${hasRightColumn ? 'md:col-span-7 lg:col-span-8' : 'md:col-span-12'} flex flex-col gap-4`}>
          {tag && (
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ffb95f]/20 text-[#ffb95f] border border-[#ffb95f]/40 backdrop-blur-xs">
                {tagIcon && <span className="material-symbols-outlined text-sm">{tagIcon}</span>}
                {tag}
              </span>
            </div>
          )}

          <div>
            {typeof title === 'string' ? (
              <h3 className="font-heading font-bold text-2xl md:text-3xl text-white mt-1">
                {title}
              </h3>
            ) : (
              title
            )}
            {description && (
              typeof description === 'string' ? (
                <p className="text-sm text-blue-100/90 mt-1 max-w-lg leading-relaxed">
                  {description}
                </p>
              ) : (
                description
              )
            )}
          </div>

          {progressElement}
          {children}

          {actions && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/15 mt-1">
              {actions}
            </div>
          )}
        </div>

        {/* Right Column: Mascot, Avatar photo, or Custom slot */}
        {hasRightColumn && (
          <div className="md:col-span-5 lg:col-span-4 flex justify-center md:justify-end items-end h-full">
            {imageSlot ? (
              imageSlot
            ) : imageVariant === 'avatar' ? (
              <div className="flex flex-col items-center md:items-end justify-center py-2">
                <div className={`w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-4 border-white/30 shadow-[0_12px_28px_rgba(0,0,0,0.35)] bg-white/10 backdrop-blur-md flex items-center justify-center ${imageClassName}`}>
                  <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="w-full h-full object-cover select-none"
                  />
                </div>
              </div>
            ) : (
              <div className={`w-48 sm:w-56 md:w-64 max-w-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)] translate-y-3 md:translate-y-6 ${imageClassName}`}>
                <img 
                  src={imageSrc} 
                  alt={imageAlt} 
                  className="w-full h-auto object-contain select-none pointer-events-none"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
