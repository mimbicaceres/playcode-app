import React, { useState } from 'react';
import { ApiError, ApiUser, NewStudentData, createStudentRequest, getStoredToken } from '../../auth/api';

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (student: ApiUser) => void;
  // Demo only: saves the student somewhere else instead of the backend.
  // Returns an error message to show, or null on success.
  onSubmit?: (data: NewStudentData) => Promise<string | null>;
}

// Same rules the backend enforces (server/src/modules/auth/auth.validation.ts).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

const INPUT_CLASSES =
  'w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2563eb] transition-colors';

export const CreateStudentModal: React.FC<CreateStudentModalProps> = ({ isOpen, onClose, onCreated, onSubmit }) => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setSchool('');
    setGrade('');
    setErrorMessage(null);
    onClose();
  };

  const validate = (): string | null => {
    const missing = [
      !name.trim() && 'nombre',
      !lastName.trim() && 'apellido',
      !email.trim() && 'email',
      !password && 'contraseña inicial',
    ].filter(Boolean);
    if (missing.length > 0) return `Completá los campos obligatorios: ${missing.join(', ')}.`;
    if (!EMAIL_REGEX.test(email.trim())) return 'Ingresá un email válido.';
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      return `La contraseña no puede superar los ${MAX_PASSWORD_LENGTH} caracteres.`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const data = {
      name: name.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      school: school.trim() || undefined,
      grade: grade.trim() || undefined,
    };
    if (onSubmit) {
      setIsSubmitting(true);
      const error = await onSubmit(data);
      setIsSubmitting(false);
      if (error) setErrorMessage(error);
      else resetAndClose();
      return;
    }

    const token = getStoredToken();
    if (!token) {
      setErrorMessage('Tu sesión expiró. Volvé a iniciar sesión.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const { user } = await createStudentRequest(token, data);
      onCreated?.(user);
      resetAndClose();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrorMessage('El email ya está registrado.');
      } else if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setErrorMessage('No tenés permisos para crear alumnos.');
      } else if (error instanceof ApiError && error.status === 400) {
        setErrorMessage('Revisá los datos ingresados e intentá de nuevo.');
      } else {
        setErrorMessage('No se pudo conectar con el servidor. Intentá de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 p-6 md:p-8 animate-scale-up">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-heading font-bold text-2xl text-[#0b1c30]">
            Crear alumno
          </h3>
          <button onClick={resetAndClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434655]" htmlFor="student-name">Nombre</label>
              <input id="student-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASSES} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434655]" htmlFor="student-lastname">Apellido</label>
              <input id="student-lastname" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={INPUT_CLASSES} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]" htmlFor="student-email">Email</label>
            <input id="student-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alumno@escuela.edu" className={INPUT_CLASSES} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]" htmlFor="student-password">Contraseña inicial</label>
            <input id="student-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className={INPUT_CLASSES} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434655]" htmlFor="student-school">Escuela (opcional)</label>
              <input id="student-school" type="text" value={school} onChange={(e) => setSchool(e.target.value)} className={INPUT_CLASSES} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434655]" htmlFor="student-grade">Curso / año (opcional)</label>
              <input id="student-grade" type="text" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Ej: 4to Año" className={INPUT_CLASSES} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#434655]">Rol</span>
            <div className="h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-emerald-600">person</span>
              Alumno
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
              <span className="material-symbols-outlined text-red-600 text-[20px]">error</span>
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-game-primary px-5 py-2.5 text-xs disabled:opacity-60 disabled:cursor-wait"
            >
              {isSubmitting ? 'Creando...' : 'Crear alumno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
