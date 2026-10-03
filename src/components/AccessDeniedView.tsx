import React from 'react';

/**
 * Vista mostrada cuando el usuario no tiene permisos para acceder a una sección.
 * Recibe una función `onGoHome` como prop para volver al panel principal.
 */
interface AccessDeniedViewProps {

  onGoHome: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ onGoHome }) => {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="soft-card p-8 max-w-md w-full text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-500 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <h1 className="font-heading font-bold text-2xl text-[#0b1c30]">Acceso denegado</h1>
        <p className="text-sm text-[#434655]">
          Tu cuenta no tiene permisos para ver esta sección.
        </p>
        <button onClick={onGoHome} className="btn-game-primary py-3 px-6 text-sm">
          Ir a mi panel
        </button>
      </div>
    </div>
  );
};
