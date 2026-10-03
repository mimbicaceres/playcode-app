import { UserProfile, UserRole } from '../types';

// Shape returned by the backend (server/src/lib/users.ts → PublicUser).
export interface ApiUser {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role: UserRole;
  school: string | null;
  grade: string | null;
  avatarUrl: string | null;
  streakDays: number;
  totalXp: number;
  // Deactivated accounts cannot sign in.
  isActive: boolean;
  // CODIX courses assigned by an administrator.
  courseIds: string[];
  createdAt: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const TOKEN_KEY = 'codix_token';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const storeToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Realiza una petición HTTP genérica al backend.
 * @param path Ruta del endpoint (ej. '/auth/login').
 * @param init Opciones de RequestInit, como método, headers y cuerpo.
 * @returns La respuesta del servidor deserializada como tipo genérico T.
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const body = await res.json().catch(() => ({})); // Parse JSON safely, fallback a objeto vacío
  if (!res.ok) {
    throw new ApiError(res.status, body.error ?? `HTTP ${res.status}`);
  }
  return body as T;
}

/**
 * Envía una solicitud de inicio de sesión al backend.
 * @param email Correo electrónico del usuario.
 * @param password Contraseña del usuario.
 * @returns Promesa con el usuario autenticado y el token JWT.
 */
export function loginRequest(email: string, password: string) {
  return request<{ user: ApiUser; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Public registration: the backend always creates the account as 'student',
// so no role is sent from here.
export interface RegisterData {
  name: string;
  lastName: string;
  email: string;
  password: string;
  school: string | null;
}

/**
 * Envía una solicitud de registro de nuevo estudiante.
 * @param data Información requerida para crear la cuenta.
 * @returns Promesa con el usuario creado y su token de autenticación.
 */
export function registerRequest(data: RegisterData) {
  return request<{ user: ApiUser; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Obtiene la información del usuario autenticado.
 * @param token Token JWT almacenado.
 * @returns Promesa con el objeto ApiUser del usuario.
 */
export function fetchMe(token: string) {
  return request<{ user: ApiUser }>('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Recupera los IDs de los cursos asignados al usuario.
 * @param token Token JWT.
 * @returns Promesa con un objeto que contiene un arreglo de courseIds.
 */
export function fetchMyCourses(token: string) {
  return request<{ courseIds: string[] }>('/users/me/courses', {
    headers: { Authorization: `Bearer ${token}` },
  });
}


// Admin only (GET /api/users).
/**
 * Obtiene la lista de todos los usuarios (solo admin).
 * @param token Token JWT con privilegios de administrador.
 * @returns Promesa con un arreglo de ApiUser.
 */
export function fetchUsers(token: string) {
  return request<{ users: ApiUser[] }>('/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Admin only (POST /api/users/teachers). The backend always creates the account as 'teacher'.
export interface NewTeacherData {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Crea un nuevo usuario con rol de docente.
 * @param token Token JWT del administrador.
 * @param data Datos del docente a crear.
 * @returns Promesa con el usuario docente creado.
 */
export function createTeacherRequest(token: string, data: NewTeacherData) {
  return request<{ user: ApiUser }>('/users/teachers', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

// Admin only: profile data an administrator can edit (never the role or password).
export interface UserEditData {
  name: string;
  lastName: string;
  email: string;
  school: string | null;
  grade: string | null;
}

/**
 * Actualiza los datos editables de un usuario (admin).
 * @param token Token JWT con permisos de administrador.
 * @param id ID del usuario a editar.
 * @param data Campos que pueden modificarse.
 * @returns Promesa con el usuario actualizado.
 */
export function updateUserRequest(token: string, id: string, data: UserEditData) {
  return request<{ user: ApiUser }>(`/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

/**
 * Cambia el estado activo/inactivo de una cuenta de usuario.
 * @param token Token JWT del administrador.
 * @param id ID del usuario.
 * @param isActive Nuevo estado activo.
 * @returns Promesa con el usuario actualizado.
 */
export function setUserActiveRequest(token: string, id: string, isActive: boolean) {
  return request<{ user: ApiUser }>(`/users/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ isActive }),
  });
}

/**
 * Asigna un conjunto de cursos a un usuario.
 * @param token Token JWT del administrador.
 * @param id ID del usuario.
 * @param courseIds Arreglo de IDs de cursos a asignar.
 * @returns Promesa con el usuario actualizado.
 */
export function setUserCoursesRequest(token: string, id: string, courseIds: string[]) {
  return request<{ user: ApiUser }>(`/users/${id}/courses`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ courseIds }),
  });
}

// Teacher only: the teacher's assigned courses with the students of each one.
export interface TeachingCourse {
  courseId: string;
  students: ApiUser[];
}

/**
 * Obtiene los cursos que imparte el docente y los estudiantes matriculados.
 * @param token Token JWT del docente.
 * @returns Promesa con un arreglo de TeachingCourse.
 */
export function fetchTeaching(token: string) {
  return request<{ courses: TeachingCourse[] }>('/users/me/teaching', { headers: authHeaders(token) });
}

/**
 * Asigna un curso a un alumno (admin o docente).
 * @param token Token JWT con permisos adecuados.
 * @param studentId ID del estudiante al que se asigna el curso.
 * @param courseId ID del curso a asignar.
 * @returns Promesa con el usuario actualizado.
 */
export async function assignCourseToStudent(token: string, studentId: string, courseId: string) {
  return request<{ user: ApiUser }>(
    '/users/me/assign',
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ studentId, courseId }),
    },
  );
}


/**
 * Convierte un ApiUser (respuesta del backend) a la estructura interna UserProfile.
 * @param user Objeto ApiUser recibido del backend.
 * @returns Objeto UserProfile listo para usar en la UI.
 */
export function toUserProfile(user: ApiUser): UserProfile {
  return {
    id: user.id,
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    school: user.school ?? '',
    grade: user.grade ?? undefined,
    avatarUrl: user.avatarUrl ?? '',
    streakDays: user.streakDays,
    totalXp: user.totalXp,
    generalProgress: 0,
    assignedCourseIds: user.courseIds ?? [],
  };
}

// Submit exercise result to backend
/**
 * Envía el resultado de un intento de ejercicio al backend.
 * @param token Token JWT del usuario.
 * @param exerciseId ID del ejercicio.
 * @param code Código fuente enviado por el estudiante.
 * @param success Indica si el intento fue exitoso.
 * @returns Promesa con datos de éxito, XP ganado, intentos y estado de completado.
 */
export async function submitExercise(
  token: string,
  exerciseId: string,
  code: string,
  success: boolean
): Promise<{ success: boolean; xpEarned: number; attempts: number; completed: boolean }> {
  return request<{ success: boolean; xpEarned: number; attempts: number; completed: boolean }>(
    `/exercises/${exerciseId}/submit`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code, success })
    }
  );
}

// Fetch student progress from backend
export interface UserProgress {
  totalXp: number;
  totalCompleted: number;
  totalAttempts: number;
  byExercise: {
    exerciseId: string;
    unitId: string | null;
    courseId: string | null;
    completed: boolean;
    attempts: number;
    xpEarned: number;
    completedAt: string | null;
    lastAttempt: string | null;
  }[];
}

/**
 * Recupera el progreso del estudiante (XP, ejercicios completados, etc.).
 * @param token Token JWT del estudiante.
 * @returns Promesa con el objeto UserProgress.
 */
export function fetchMyProgress(token: string): Promise<UserProgress> {
  return request<UserProgress>('/users/me/progress', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

