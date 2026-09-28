import React, { useState } from 'react';
import { AdminInstituteCourseRow, AdminInstituteUserRow } from '../../types';
import type { UserEditData } from '../../auth/api';

// Modals of the admin panel actions (real /admin and /demo/admin). They only
// collect the data: saving is done by the caller (backend or demo state).
// Each save returns an error message to show, or null on success.
type SaveResult = Promise<string | null>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INPUT_CLASSES =
  'w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#2563eb] transition-colors';
const ROLE_LABELS = { student: 'Alumno', teacher: 'Docente', admin: 'Administrador' } as const;

const ModalShell: React.FC<{ title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({
  title, subtitle, onClose, children, wide,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm animate-fade-in"
    role="dialog"
    aria-modal="true"
    aria-label={title}
  >
    <div className={`bg-white w-full ${wide ? 'max-w-lg' : 'max-w-md'} max-h-[90vh] rounded-3xl shadow-2xl flex flex-col border border-slate-200 p-6 animate-scale-up`}>
      <div className="flex justify-between items-start gap-3 mb-4">
        <div>
          <h3 className="font-heading font-bold text-xl text-[#0b1c30]">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={onClose} aria-label="Cerrar" className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>
      <div className="overflow-y-auto -mx-1 px-1">{children}</div>
    </div>
  </div>
);

const ErrorBox: React.FC<{ message: string | null }> = ({ message }) => message ? (
  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
    <span className="material-symbols-outlined text-red-600 text-[20px]">error</span>
    <p className="text-sm font-medium">{message}</p>
  </div>
) : null;

const Footer: React.FC<{ onCancel: () => void; submitLabel: string; busyLabel: string; busy: boolean; danger?: boolean; disabled?: boolean }> = ({
  onCancel, submitLabel, busyLabel, busy, danger, disabled,
}) => (
  <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
    <button type="button" onClick={onCancel} className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
      Cancelar
    </button>
    <button
      type="submit"
      disabled={busy || disabled}
      className={`${danger ? 'bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer' : 'btn-game-primary'} px-5 py-2.5 text-xs disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {busy ? busyLabel : submitLabel}
    </button>
  </div>
);

// Runs a save, keeping the modal open with the error if it fails.
function useSave(onClose: () => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (save: () => SaveResult) => {
    setBusy(true);
    setError(null);
    const result = await save();
    setBusy(false);
    if (result) setError(result);
    else onClose();
  };
  return { busy, error, setError, run };
}

const courseNames = (ids: string[], courses: AdminInstituteCourseRow[]) =>
  ids.map((id) => courses.find((c) => c.id === id)?.name ?? id);

// ─── Ver perfil ─────────────────────────────────────────────────────────────
export const UserProfileModal: React.FC<{ user: AdminInstituteUserRow; courses: AdminInstituteCourseRow[]; onClose: () => void }> = ({
  user, courses, onClose,
}) => {
  const assigned = courseNames(user.courseIds, courses);
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'Email', value: <span className="font-mono text-xs">{user.email}</span> },
    { label: 'Rol', value: ROLE_LABELS[user.role] },
    { label: 'Estado', value: user.status },
    { label: 'Escuela', value: user.school || '—' },
    ...(user.role === 'student' ? [{ label: 'Curso / año', value: user.grade || '—' }] : []),
    ...(user.role !== 'admin' ? [{ label: 'Cursos asignados', value: assigned.length ? assigned.join(', ') : 'Ninguno' }] : []),
    ...(user.role === 'student' ? [
      { label: 'Progreso', value: user.progress !== undefined ? `${user.progress}%` : '—' },
      { label: 'Experiencia', value: `${(user.totalXp ?? 0).toLocaleString('es-AR')} XP` },
      { label: 'Racha', value: `${user.streakDays ?? 0} días` },
      { label: 'Última actividad', value: user.lastActivity ?? '—' },
    ] : []),
    ...(user.createdAt ? [{ label: 'Alta', value: new Date(user.createdAt).toLocaleDateString('es-AR') }] : []),
  ];
  return (
    <ModalShell title={user.name} subtitle="Perfil del usuario" onClose={onClose}>
      <dl className="divide-y divide-slate-100 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 py-2.5">
            <dt className="text-slate-500 text-xs font-semibold">{row.label}</dt>
            <dd className="text-[#0b1c30] font-medium text-right">{row.value}</dd>
          </div>
        ))}
      </dl>
    </ModalShell>
  );
};

// ─── Editar usuario ─────────────────────────────────────────────────────────
export const EditUserModal: React.FC<{ user: AdminInstituteUserRow; onSave: (data: UserEditData) => SaveResult; onClose: () => void }> = ({
  user, onSave, onClose,
}) => {
  const [form, setForm] = useState({
    name: user.firstName,
    lastName: user.lastName,
    email: user.email,
    school: user.school ?? '',
    grade: user.grade ?? '',
  });
  const { busy, error, setError, run } = useSave(onClose);
  const field = (key: keyof typeof form) => ({
    id: `edit-${key}`,
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value }),
    className: INPUT_CLASSES,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('Completá nombre, apellido y email.');
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError('Ingresá un email válido.');
      return;
    }
    run(() => onSave({
      name: form.name.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      school: form.school.trim() || null,
      grade: form.grade.trim() || null,
    }));
  };

  return (
    <ModalShell title="Editar usuario" subtitle={`${ROLE_LABELS[user.role]} · el rol y la contraseña no se modifican`} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]" htmlFor="edit-name">Nombre</label>
            <input type="text" {...field('name')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]" htmlFor="edit-lastName">Apellido</label>
            <input type="text" {...field('lastName')} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#434655]" htmlFor="edit-email">Email</label>
          <input type="email" {...field('email')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#434655]" htmlFor="edit-school">Escuela</label>
          <input type="text" {...field('school')} />
        </div>
        {user.role === 'student' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]" htmlFor="edit-grade">Curso / año</label>
            <input type="text" placeholder="Ej: 4to Año A" {...field('grade')} />
          </div>
        )}
        <ErrorBox message={error} />
        <Footer onCancel={onClose} submitLabel="Guardar cambios" busyLabel="Guardando..." busy={busy} />
      </form>
    </ModalShell>
  );
};

// ─── Asignar cursos (a un usuario) ──────────────────────────────────────────
export const AssignCoursesModal: React.FC<{
  user: AdminInstituteUserRow;
  courses: AdminInstituteCourseRow[];
  onSave: (courseIds: string[]) => SaveResult;
  onClose: () => void;
}> = ({ user, courses, onSave, onClose }) => {
  const [selected, setSelected] = useState<string[]>(user.courseIds);
  const { busy, error, run } = useSave(onClose);
  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <ModalShell
      title="Asignar cursos"
      subtitle={`${user.name} · ${user.role === 'teacher' ? 'cursos a cargo' : 'cursos que va a cursar'}`}
      onClose={onClose}
    >
      <form onSubmit={(e) => { e.preventDefault(); run(() => onSave(courses.map((c) => c.id).filter((id) => selected.includes(id)))); }} className="flex flex-col gap-3">
        <p className="text-[11px] text-slate-500">Cursos de CODIX. Sus unidades y actividades vienen predefinidas.</p>
        <div className="flex flex-col gap-2">
          {courses.map((course) => (
            <label
              key={course.id}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                selected.includes(course.id) ? 'border-blue-300 bg-blue-50/60' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(course.id)}
                onChange={() => toggle(course.id)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-[#0b1c30]">{course.name}</span>
                <span className="block text-[11px] text-slate-500">
                  {course.unitsCount} unidades · {course.activitiesCount} actividades
                </span>
              </span>
            </label>
          ))}
        </div>
        <ErrorBox message={error} />
        <Footer onCancel={onClose} submitLabel="Guardar asignación" busyLabel="Guardando..." busy={busy} />
      </form>
    </ModalShell>
  );
};

// ─── Activar / desactivar ───────────────────────────────────────────────────
export const ToggleActiveModal: React.FC<{ user: AdminInstituteUserRow; onConfirm: () => SaveResult; onClose: () => void }> = ({
  user, onConfirm, onClose,
}) => {
  const deactivating = user.status === 'Activo';
  const { busy, error, run } = useSave(onClose);
  return (
    <ModalShell title={deactivating ? 'Desactivar usuario' : 'Activar usuario'} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); run(onConfirm); }} className="flex flex-col gap-3">
        <p className="text-sm text-slate-600">
          {deactivating ? (
            <>¿Desactivar la cuenta de <strong>{user.name}</strong>? No va a poder iniciar sesión hasta que la vuelvas a activar. Sus datos y cursos asignados se conservan.</>
          ) : (
            <>¿Activar la cuenta de <strong>{user.name}</strong>? Va a poder volver a iniciar sesión.</>
          )}
        </p>
        <ErrorBox message={error} />
        <Footer
          onCancel={onClose}
          submitLabel={deactivating ? 'Desactivar' : 'Activar'}
          busyLabel={deactivating ? 'Desactivando...' : 'Activando...'}
          busy={busy}
          danger={deactivating}
        />
      </form>
    </ModalShell>
  );
};

// ─── Ver curso ──────────────────────────────────────────────────────────────
export const CourseDetailModal: React.FC<{ course: AdminInstituteCourseRow; users: AdminInstituteUserRow[]; onClose: () => void }> = ({
  course, users, onClose,
}) => {
  const teachers = users.filter((u) => u.role === 'teacher' && u.courseIds.includes(course.id));
  const students = users.filter((u) => u.role === 'student' && u.courseIds.includes(course.id));
  return (
    <ModalShell title={course.name} subtitle={`Curso de CODIX · ${course.status}`} onClose={onClose} wide>
      <div className="flex flex-col gap-4 text-sm">
        <section>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Unidades</h4>
          {course.units.length === 0 ? (
            <p className="text-xs text-slate-400">CODIX todavía no publicó las unidades de este curso.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {course.units.map((unit) => (
                <li key={unit.title} className="flex justify-between gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-[#0b1c30]">{unit.title}</span>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{unit.activities} actividades</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Docentes ({teachers.length})</h4>
          <p className="text-[#0b1c30]">{teachers.length ? teachers.map((t) => t.name).join(', ') : 'Sin asignar'}</p>
        </section>
        <section>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alumnos ({students.length})</h4>
          {students.length === 0 ? (
            <p className="text-xs text-slate-400">Todavía no hay alumnos asignados.</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {students.map((s) => (
                <li key={s.id} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-800">{s.name}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </ModalShell>
  );
};

// ─── Asignar curso (a varios usuarios) ──────────────────────────────────────
export const CourseAssignModal: React.FC<{
  courses: AdminInstituteCourseRow[];
  users: AdminInstituteUserRow[];
  initialCourseId?: string;
  // Saves the new course list of every user whose assignment changed.
  onSave: (changes: { userId: string; courseIds: string[] }[]) => SaveResult;
  onClose: () => void;
}> = ({ courses, users, initialCourseId, onSave, onClose }) => {
  const assignable = users.filter((u) => u.role !== 'admin');
  const [courseId, setCourseId] = useState(initialCourseId ?? courses[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const initialFor = (id: string) => new Set(assignable.filter((u) => u.courseIds.includes(id)).map((u) => u.id));
  const [selected, setSelected] = useState<Set<string>>(() => initialFor(courseId));
  const { busy, error, run } = useSave(onClose);

  const changeCourse = (id: string) => {
    setCourseId(id);
    setSelected(initialFor(id));
  };
  const toggle = (userId: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    return next;
  });

  const q = query.trim().toLowerCase();
  const visible = assignable.filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  const changes = assignable
    .filter((u) => u.courseIds.includes(courseId) !== selected.has(u.id))
    .map((u) => ({
      userId: u.id,
      courseIds: selected.has(u.id) ? [...u.courseIds, courseId] : u.courseIds.filter((id) => id !== courseId),
    }));

  const group = (role: 'teacher' | 'student', label: string) => {
    const list = visible.filter((u) => u.role === role);
    if (list.length === 0) return null;
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</span>
        {list.map((u) => (
          <label key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggle(u.id)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-[#0b1c30] truncate">{u.name}</span>
              <span className="block text-[11px] text-slate-400 font-mono truncate">{u.email}</span>
            </span>
            {u.status === 'Inactivo' && <span className="text-[10px] font-bold text-slate-400">Inactivo</span>}
          </label>
        ))}
      </div>
    );
  };

  return (
    <ModalShell title="Asignar curso" subtitle="Elegí el curso y marcá a los docentes y alumnos que lo tienen" onClose={onClose} wide>
      <form onSubmit={(e) => { e.preventDefault(); run(() => onSave(changes)); }} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#434655]" htmlFor="assign-course">Curso</label>
          <select id="assign-course" value={courseId} onChange={(e) => changeCourse(e.target.value)} className={`${INPUT_CLASSES} bg-white cursor-pointer`}>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 h-10 rounded-xl border border-slate-200 focus-within:border-blue-600 transition-colors">
          <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
          <input
            type="text"
            aria-label="Buscar usuario"
            placeholder="Buscar por nombre o correo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-sm w-full outline-none"
          />
        </div>
        <div className="max-h-72 overflow-y-auto border border-slate-100 rounded-xl p-1">
          {visible.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">{assignable.length ? 'Sin resultados.' : 'No hay docentes ni alumnos registrados.'}</p>
          ) : (
            <>
              {group('teacher', 'Docentes')}
              {group('student', 'Alumnos')}
            </>
          )}
        </div>
        <p className="text-[11px] text-slate-500">{changes.length ? `${changes.length} cambio${changes.length === 1 ? '' : 's'} sin guardar` : 'Sin cambios'}</p>
        <ErrorBox message={error} />
        <Footer onCancel={onClose} submitLabel="Guardar asignación" busyLabel="Guardando..." busy={busy} disabled={changes.length === 0} />
      </form>
    </ModalShell>
  );
};
