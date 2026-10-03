import React, { useEffect, useMemo, useState } from 'react';
import { ApiUser, fetchUsers, getStoredToken } from '../auth/api';
import { buildStudentProgressRecord } from '../data/realStudentData';
import { StudentProgressView } from './StudentProgressView';

// Real "Progreso" for the admin: same frontend as the demo, fed with the
// registered students from the backend (GET /api/users).
export const AdminStudentProgressView: React.FC<{ initialStudentId?: string | null }> = ({ initialStudentId = null }) => {
  /** Lista de usuarios obtenidos del backend; null mientras se cargan. */
const [users, setUsers] = useState<ApiUser[] | null>(null);
  /** Indica si ocurrió un error al cargar los usuarios. */
const [loadError, setLoadError] = useState(false);

  /** Ejecuta la carga de usuarios al montar el componente. */
useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    fetchUsers(token)
      .then(({ users: list }) => setUsers(list))
      .catch(() => setLoadError(true));
  }, []);

  /** Calcula la lista de estudiantes a partir de los usuarios cargados, memoizando el resultado. */
const students = useMemo(
    () => (users ?? []).filter((u) => u.role === 'student').map((u) => buildStudentProgressRecord(u)),
    [users]
  );

  /** Renderiza la vista de progreso de estudiantes con los datos calculados. */
return (
    <StudentProgressView
      students={students}
      initialStudentId={initialStudentId}
      emptyLabel={loadError ? 'No se pudieron cargar los alumnos' : users === null ? 'Cargando alumnos...' : 'No hay alumnos registrados'}
    />
  );
};
