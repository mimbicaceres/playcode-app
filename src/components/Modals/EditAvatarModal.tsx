import React, { useRef, useState } from 'react';
import { MASCOT_IMAGES } from '../../data/mockData';

interface EditAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  // Devuelve un mensaje de error para mostrar, o null si se guardo bien.
  onSave: (avatarDataUrl: string) => Promise<string | null>;
}

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB de archivo original

export const EditAvatarModal: React.FC<EditAvatarModalProps> = ({ isOpen, onClose, currentAvatarUrl, onSave }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setPreview(null);
    setError(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Elegí un archivo de imagen (JPG, PNG, etc.).');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('La imagen no puede superar los 2MB.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!preview) return;
    setBusy(true);
    const saveError = await onSave(preview);
    setBusy(false);
    if (saveError) setError(saveError);
    else resetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 p-6 animate-scale-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-bold text-xl text-[#0b1c30]">Foto de perfil</h3>
          <button onClick={resetAndClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50">
            <img
              src={preview || currentAvatarUrl || MASCOT_IMAGES.roundAvatar}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">upload</span>
            Elegir una imagen
          </button>

          {error && (
            <div className="w-full flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
              <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={resetAndClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!preview || busy}
            className="btn-game-primary px-5 py-2.5 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? 'Guardando...' : 'Guardar foto'}
          </button>
        </div>
      </div>
    </div>
  );
};
