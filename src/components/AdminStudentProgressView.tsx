import React, { useEffect, useMemo, useState } from 'react';
import { ApiUser, CourseProgressSummary, fetchStudentProgressByCourse, fetchUsers, getStoredToken } from '../auth/api';
import { buildStudentProgressRecord } from '../data/realStudentData';
import { StudentProgressView } from './StudentProgressView';

// Real "Progreso" for the admin: same frontend as the demo, fed with the
// registered students from the backend (GET /api/users) plus their real
// progress by course (GET /api/users/:id/progress/by-course, dynamic
// courses only).
export const AdminStudentProgressView: React.FC<{ initialStudentId?: string | null }> = ({ initialStudentId = null }) => {
  /** Lista de usuarios obtenidos del backend; null mientras se cargan. */
const [users, setUsers] = useState<ApiUser[] | null>(null);
  /** Indica si ocurrió un error al cargar los usuarios. */
const [loadError, setLoadError] = useState(false);
  /** Progreso real por alumno, agrupado por curso dinamico. */
  const [progressByStudent, setProgressByStudent] = useState<Map<string, CourseProgressSummary[]>>(new Map());

  /** Ejecuta la carga de usuarios al montar el componente. */
useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    fetchUsers(token)
      .then(({ users: list }) => setUsers(list))
      .catch(() => setLoadError(true));
  }, []);

  // Una vez que estan los usuarios, pide el progreso real de cada alumno.
  useEffect(() => {
    const token = getStoredToken();
    if (!token || !users) return;
    const studentIds = users.filter((u) => u.role === 'student').map((u) => u.id);
    if (studentIds.length === 0) return;
    Promise.all(
      studentIds.map((id) =>
        fetchStudentProgressByCourse(token, id)
          .then((progress): [string, CourseProgressSummary[]] => [id, progress])
          .catch((): [string, CourseProgressSummary[]] => [id, []]),
      ),
    ).then((entries) => setProgressByStudent(new Map(entries)));
  }, [users]);

  /** Calcula la lista de estudiantes a partir de los usuarios cargados, memoizando el resultado. */
const students = useMemo(
    () => (users ?? []).filter((u) => u.role === 'student').map((u) => buildStudentProgressRecord(u, undefined, progressByStudent.get(u.id) ?? [])),
    [users, progressByStudent]
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
