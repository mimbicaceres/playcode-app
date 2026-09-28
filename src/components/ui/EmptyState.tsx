import React from 'react';

export interface EmptyStateProps {
  imageSrc?: string;
  icon?: string;
  title: string;
  message: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ imageSrc, icon, title, message, children }) => {
  return (
    <div className="soft-card p-8 md:p-10 w-full flex flex-col items-center text-center gap-4">
      {imageSrc ? (
        <img src={imageSrc} alt="" className="w-36 h-36 object-contain animate-float" />
      ) : icon ? (
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563eb] flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
      ) : null}
      <h2 className="font-heading font-bold text-2xl text-[#0b1c30]">{title}</h2>
      <p className="text-sm text-[#434655] max-w-md leading-relaxed">{message}</p>
      {children && <div className="flex flex-wrap items-center justify-center gap-3 pt-2">{children}</div>}
    </div>
  );
};
