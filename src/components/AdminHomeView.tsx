import React, { useEffect, useMemo, useState } from 'react';
import {
  AdminCourseSummary, ApiError, ApiUser, InstituteData, createCourseRequest, createExerciseRequest, createUnitRequest,
  deleteExerciseRequest, fetchAdminCourseContent, fetchAdminCourses, fetchInstitute, fetchUsers, getStoredToken,
  setUserActiveRequest, setUserCoursesRequest, updateExerciseRequest, updateInstituteRequest, updateUserRequest,
} from '../auth/api';
import { buildAdminInstituteData } from '../data/realAdminData';
import { AdminInstituteActions, AdminInstituteView } from './AdminInstituteView';
import { CreateTeacherModal } from './Modals/CreateTeacherModal';
import { CreateStudentModal } from './Modals/CreateStudentModal';

// Message for a failed admin action (null → success).
/**
 * Genera un mensaje de error legible para el usuario según el tipo de error recibido.
 * @param error - Error que puede ser una instancia de ApiError o cualquier otro tipo.
 * @returns Texto descriptivo del error.
 */
function actionError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return 'El email ya está registrado.';
    if (error.status === 400) return error.message.includes('own account')
      ? 'No podés desactivar tu propia cuenta.'
      : 'Revisá los datos ingresados e intentá de nuevo.';
    if (error.status === 401 || error.status === 403) return 'Tu sesión no tiene permisos para esta acción. Volvé a iniciar sesión.';
    if (error.status === 404) return 'El usuario ya no existe.';
  }
  return 'No se pudo conectar con el servidor. Intentá de nuevo.';
}

// Real /admin panel (institute management), fed with the registered users from
// the backend. The example panel for presentations is /demo/admin.
export const AdminHomeView: React.FC<{ currentUserId: string; onViewStudentProgress: (studentId: string) => void }> = ({
  currentUserId,
  onViewStudentProgress,
}) => {
  /** Lista de usuarios obtenidos del backend; null mientras se cargan. */
const [users, setUsers] = useState<ApiUser[] | null>(null);
  /** Indica si ocurrió un error al cargar los usuarios. */
const [loadError, setLoadError] = useState(false);
  /** Cursos reales (dinamicos) disponibles para asignar, ademas del catalogo CODIX. */
  const [dbCourses, setDbCourses] = useState<AdminCourseSummary[]>([]);
  /** Controla la visibilidad del modal para crear docentes. */
const [isCreateTeacherOpen, setIsCreateTeacherOpen] = useState(false);
  /** Controla la visibilidad del modal para crear alumnos. */
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  /** Datos generales del instituto (pestaña Configuración). */
  const [institute, setInstitute] = useState<InstituteData | undefined>(undefined);
  /** Mensaje de éxito que se muestra temporalmente al crear o actualizar datos. */
const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
 * Carga la lista de usuarios desde el backend.
 * Obtiene el token almacenado, llama a fetchUsers y actualiza el estado.
 * Si falla, marca loadError como true.
 */
const loadUsers = () => {
    const token = getStoredToken();
    if (!token) return;
    fetchUsers(token)
      .then(({ users: list }) => {
        setUsers(list);
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  };

  /** Ejecuta loadUsers una sola vez al montar el componente. */
useEffect(loadUsers, []);

  /** Carga los cursos reales (dinamicos) desde el backend. */
  const loadCourses = () => {
    const token = getStoredToken();
    if (!token) return;
    fetchAdminCourses(token).then(setDbCourses).catch(() => setDbCourses([]));
  };

  /** Ejecuta loadCourses una sola vez al montar el componente. */
  useEffect(loadCourses, []);

  /** Carga los datos del instituto una sola vez al montar el componente. */
  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    fetchInstitute(token).then(setInstitute).catch(() => {});
  }, []);

  const data = useMemo(() => buildAdminInstituteData(users ?? [], dbCourses), [users, dbCourses]);

  /**
 * Callback invocado cuando se crea un nuevo docente.
 * Muestra un mensaje de éxito y vuelve a cargar la lista de usuarios.
 * @param teacher - Objeto del docente recién creado.
 */
const handleTeacherCreated = (teacher: ApiUser) => {
    setSuccessMessage(
      `Docente ${teacher.name} ${teacher.lastName} creado. Ya puede iniciar sesión con ${teacher.email}.`
    );
    loadUsers();
  };

  /** Callback invocado cuando se crea un nuevo alumno. */
  const handleStudentCreated = (student: ApiUser) => {
    setSuccessMessage(
      `Alumno ${student.name} ${student.lastName} creado. Ya puede iniciar sesión con ${student.email}.`
    );
    loadUsers();
  };

  // Sends a change to the backend and replaces the user with the saved version.
  /**
 * Envía una solicitud de actualización de usuario al backend y actualiza el estado local.
 * @param send - Función que recibe el token y devuelve una promesa con el usuario actualizado.
 * @returns null si la operación fue exitosa, o un mensaje de error en caso contrario.
 */
const saveUser = async (send: (token: string) => Promise<{ user: ApiUser }>): Promise<string | null> => {
    const token = getStoredToken();
    if (!token) return 'Tu sesión expiró. Volvé a iniciar sesión.';
    try {
      const { user } = await send(token);
      setUsers((prev) => prev && prev.map((u) => (u.id === user.id ? user : u)));
      return null;
    } catch (error) {
      return actionError(error);
    }
  };

  // Fase B: contenido de cursos dinamicos (creados en la propia plataforma).
  // Siempre refrescan la lista de cursos para que las tarjetas del admin
  // muestren los conteos de unidades/actividades actualizados.
  const runCourseAction = async (send: (token: string) => Promise<unknown>): Promise<string | null> => {
    const token = getStoredToken();
    if (!token) return 'Tu sesión expiró. Volvé a iniciar sesión.';
    try {
      await send(token);
      loadCourses();
      return null;
    } catch (error) {
      return actionError(error);
    }
  };

  /** Acciónes disponibles para la vista de gestión de instituciones. */
const actions: AdminInstituteActions = {
    createTeacher: () => setIsCreateTeacherOpen(true),
    createStudent: () => setIsCreateStudentOpen(true),
    updateUser: (id, values) => saveUser((token) => updateUserRequest(token, id, values)),
    setUserActive: (id, isActive) => saveUser((token) => setUserActiveRequest(token, id, isActive)),
    setUserCourses: (id, courseIds) => saveUser((token) => setUserCoursesRequest(token, id, courseIds)),
    createCourse: (courseData) => runCourseAction((token) => createCourseRequest(token, courseData)),
    fetchCourseContent: (courseId) => {
      const token = getStoredToken();
      if (!token) return Promise.reject(new Error('Tu sesión expiró. Volvé a iniciar sesión.'));
      return fetchAdminCourseContent(token, courseId);
    },
    createUnit: (courseId, title) => runCourseAction((token) => createUnitRequest(token, courseId, title)),
    createExercise: (unitId, exerciseData) => runCourseAction((token) => createExerciseRequest(token, unitId, exerciseData)),
    updateExercise: (exerciseId, exerciseData) => runCourseAction((token) => updateExerciseRequest(token, exerciseId, exerciseData)),
    deleteExercise: (exerciseId) => runCourseAction((token) => deleteExerciseRequest(token, exerciseId)),
    updateInstitute: async (instituteData) => {
      const token = getStoredToken();
      if (!token) return 'Tu sesión expiró. Volvé a iniciar sesión.';
      try {
        const updated = await updateInstituteRequest(token, instituteData);
        setInstitute(updated);
        return null;
      } catch (error) {
        return actionError(error);
      }
    },
  };

  /** Banner que muestra el mensaje de éxito cuando successMessage tiene valor. */
const banner = successMessage && (
    <div className="flex items-start justify-between gap-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
      <span className="flex items-center gap-2">
        <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
        <span>{successMessage}</span>
      </span>
      <button
        onClick={() => setSuccessMessage(null)}
        className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
        aria-label="Cerrar mensaje"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );

  return (
    <>
      <AdminInstituteView
        data={data}
        actions={actions}
        currentUserId={currentUserId}
        onViewStudentProgress={onViewStudentProgress}
        banner={banner}
        institute={institute}
        usersEmptyMessage={
          loadError
            ? 'No se pudieron cargar los usuarios. Intentá de nuevo.'
            : users === null
            ? 'Cargando usuarios...'
            : 'Sin usuarios para mostrar.'
        }
      />
      <CreateTeacherModal
        isOpen={isCreateTeacherOpen}
        onClose={() => setIsCreateTeacherOpen(false)}
        onCreated={handleTeacherCreated}
      />
      <CreateStudentModal
        isOpen={isCreateStudentOpen}
        onClose={() => setIsCreateStudentOpen(false)}
        onCreated={handleStudentCreated}
      />
    </>
  );
};
