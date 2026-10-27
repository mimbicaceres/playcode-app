import { ReportsData, UserProfile, UserRole } from '../types';

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
  // Ultimo intento de ejercicio (exito o no); null si nunca hizo ninguno.
  lastActivityAt: string | null;
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

export interface NewStudentData {
  name: string;
  lastName: string;
  email: string;
  password: string;
  school?: string;
  grade?: string;
}

/**
 * Crea un nuevo usuario con rol de alumno, sin que el alumno se autorregistre.
 * @param token Token JWT del administrador.
 * @param data Datos del alumno a crear.
 */
export function createStudentRequest(token: string, data: NewStudentData) {
  return request<{ user: ApiUser }>('/users/students', {
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
 * Cambia la foto de perfil del propio usuario (cualquier rol). Es lo único
 * que un alumno/docente puede modificar de su cuenta; nombre, apellido,
 * escuela y año son de solo lectura (los edita el admin con updateUserRequest).
 * @param token Token JWT del usuario.
 * @param avatarDataUrl Imagen codificada como data:image/...;base64,... (hasta ~2MB).
 */
export function updateMyAvatarRequest(token: string, avatarDataUrl: string) {
  return request<{ user: ApiUser }>('/users/me/avatar', {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ avatarUrl: avatarDataUrl }),
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

// Resultado por test case de un ejercicio code_runner. expectedOutput viene
// undefined cuando el test case es oculto (nunca se expone al cliente).
export interface GradedTestCaseResult {
  testCaseId: string;
  passed: boolean;
  isHidden: boolean;
  expectedOutput?: string;
  actualOutput: string;
  stderr: string;
  timedOut: boolean;
}

// Logro de gamificacion (calculado por el backend a partir del avance real).
export interface GamificationBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  bgColor: string;
  unlocked: boolean;
  unlockedAt: string | null;
  // Progreso hacia el logro (p. ej. 7 de 10 ejercicios).
  current: number;
  target: number;
}

export interface Gamification {
  level: number;
  levelTitle: string;
  totalXp: number;
  levelStartXp: number;
  nextLevelXp: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  percentToNextLevel: number;
  streakDays: number;
  bestStreakDays: number;
  badges: GamificationBadge[];
  badgesUnlocked: number;
  badgesTotal: number;
}

// Que cambio al enviar un ejercicio, para celebrarlo en pantalla.
export interface GamificationDelta {
  leveledUp: boolean;
  level: number;
  levelTitle: string;
  newBadges: GamificationBadge[];
  percentToNextLevel: number;
  xpToNextLevel: number;
}

export interface SubmitCodeExerciseResponse {
  success: boolean;
  // XP otorgado en este envio (0 si repasaste un ejercicio ya resuelto), con los ajustes del admin.
  xpEarned: number;
  // Parte de xpEarned que es bonus por el primer ejercicio del dia.
  bonusXp?: number;
  attempts: number;
  completed: boolean;
  streakDays: number;
  results: GradedTestCaseResult[];
  gamification?: GamificationDelta;
}

// Envía la salida cruda (stdout/stderr por test case) que produjo el código
// del alumno al correrlo en Pyodide — nunca un veredicto de éxito. El
// backend es la única autoridad que decide si aprobó, comparando contra el
// expectedOutput real guardado en la base de datos.
//
// Si Pyodide no pudo ejecutar el código (fallo de infraestructura del
// navegador, no del alumno), se manda `infraError` en lugar de `outputs`:
// el backend responde 503 y no registra el intento como fallido. El
// llamador debe capturar el ApiError(503) resultante y ofrecer reintentar.
export async function submitCodeExercise(
  token: string,
  exerciseId: string,
  code: string,
  payload:
    | { outputs: { testCaseId: string; stdout: string; stderr: string; timedOut: boolean }[] }
    | { infraError: string },
  // Segundos que el alumno estuvo trabajando en el ejercicio (alimenta el tiempo de practica).
  timeSpentSec?: number,
): Promise<SubmitCodeExerciseResponse> {
  return request<SubmitCodeExerciseResponse>(`/exercises/${exerciseId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ code, ...payload, timeSpentSec }),
  });
}

// Contenido real de un curso dinamico (unidades/ejercicios en orden, con el
// status de avance ya calculado por el backend para el usuario autenticado).
export interface CourseContent {
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  language: string;
  // Opciones de presentacion (todas opcionales): categoria libre, nivel, duracion, icono y color.
  category: string | null;
  level: string | null;
  estimatedHours: number | null;
  iconName: string | null;
  color: string | null;
  progressPercent: number;
  units: {
    id: string;
    slug: string;
    title: string | null;
    order: number;
    exercises: {
      id: string;
      slug: string | null;
      title: string | null;
      type: 'fill_variable' | 'code_runner';
      order: number;
      prompt: string | null;
      starterCode: string | null;
      language: string;
      rewardXp: number;
      hint: string | null;
      status: 'completed' | 'active' | 'locked';
      testCases: { id: string; input: string | null; isHidden: boolean; compareMode?: string; spec?: unknown; expectedOutput?: string }[];
    }[];
  }[];
}

// Cursos reales (dinamicos) para el panel de admin, con contenido ya cargado.
export interface AdminCourseSummary {
  id: string;
  title: string | null;
  description: string | null;
  language: string;
  // Opciones de presentacion (todas opcionales): categoria libre, nivel, duracion, icono y color.
  category: string | null;
  level: string | null;
  estimatedHours: number | null;
  iconName: string | null;
  color: string | null;
  assignmentsCount: number;
  unitsCount: number;
  activitiesCount: number;
  units: { title: string; activities: number; exercises: { id: string; title: string }[] }[];
}

export async function fetchAdminCourses(token: string): Promise<AdminCourseSummary[]> {
  const { courses } = await request<{ courses: AdminCourseSummary[] }>('/courses', {
    headers: authHeaders(token),
  });
  return courses;
}

// Datos generales del instituto (un solo registro global). Solo admin.
export interface InstituteData {
  id: string;
  name: string | null;
  address: string | null;
  contactEmail: string | null;
  // Ajustes de gamificacion: XP otorgado = (XP del ejercicio + baseXp) x xpMultiplier,
  // mas streakBonusXp el primer ejercicio del dia. disabledBadges = logros desactivados.
  xpMultiplier: number;
  baseXp: number;
  streakBonusXp: number;
  disabledBadges: string[];
}

export interface BadgeCatalogItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  bgColor: string;
}

// Catalogo de logros disponibles (solo admin).
export async function fetchBadgeCatalog(token: string): Promise<BadgeCatalogItem[]> {
  const { badges } = await request<{ badges: BadgeCatalogItem[] }>('/institute/badges', {
    headers: authHeaders(token),
  });
  return badges;
}

// Reporte general del instituto (solo admin), calculado en el backend con los
// usuarios, asignaciones y progreso reales de los ultimos 30 dias.
export async function fetchInstituteReport(token: string): Promise<ReportsData> {
  const { report } = await request<{ report: ReportsData }>('/reports/institute', {
    headers: authHeaders(token),
  });
  return report;
}

export async function fetchInstitute(token: string): Promise<InstituteData> {
  const { institute } = await request<{ institute: InstituteData }>('/institute', {
    headers: authHeaders(token),
  });
  return institute;
}

export async function updateInstituteRequest(
  token: string,
  data: {
    name?: string;
    address?: string;
    contactEmail?: string;
    xpMultiplier?: number;
    baseXp?: number;
    streakBonusXp?: number;
    disabledBadges?: string[];
  },
): Promise<InstituteData> {
  const { institute } = await request<{ institute: InstituteData }>('/institute', {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return institute;
}

// Contenido completo de un curso dinamico para el editor de admin: a
// diferencia de CourseContent (alumno/docente), este SI expone el
// expectedOutput de los test cases ocultos (el admin los necesita editar).
export interface AdminTestCase {
  id: string;
  input: string | null;
  expectedOutput: string;
  isHidden: boolean;
  // "text" | "rows_ordered" | "rows_unordered" | "dom" y los datos del ejecutor (script SQL,
  // chequeos de HTML): hay que devolverlos al guardar para no perderlos.
  compareMode: string;
  spec: unknown;
}

export interface AdminExercise {
  id: string;
  title: string | null;
  prompt: string | null;
  starterCode: string | null;
  language: string;
  rewardXp: number;
  hint: string | null;
  testCases: AdminTestCase[];
}

export interface AdminUnit {
  id: string;
  title: string | null;
  exercises: AdminExercise[];
}

export interface AdminCourseContent {
  id: string;
  title: string | null;
  description: string | null;
  // Lenguaje del curso: python | javascript | sql | html.
  language: string;
  // Opciones de presentacion (todas opcionales): categoria libre, nivel, duracion, icono y color.
  category: string | null;
  level: string | null;
  estimatedHours: number | null;
  iconName: string | null;
  color: string | null;
  units: AdminUnit[];
  // Cuantos usuarios tienen el curso asignado.
  _count?: { assignments: number };
}

export async function fetchAdminCourseContent(token: string, courseId: string): Promise<AdminCourseContent> {
  const { course } = await request<{ course: AdminCourseContent }>(`/admin/courses/${courseId}`, {
    headers: authHeaders(token),
  });
  return course;
}

// Opciones de presentacion de un curso; con null (o texto vacio) se borra el valor.
export interface CoursePresentationInput {
  category?: string | null;
  level?: string | null;
  estimatedHours?: number | null;
  iconName?: string | null;
  color?: string | null;
}

export interface CreateCourseInput extends CoursePresentationInput {
  title: string;
  description?: string;
  language?: string;
  // Unidades con las que arranca el curso (un titulo por unidad).
  unitTitles?: string[];
  // Crear el curso como copia de otro (unidades, ejercicios y casos de prueba).
  duplicateFromCourseId?: string;
}

export async function createCourseRequest(token: string, data: CreateCourseInput) {
  const { course } = await request<{ course: { id: string } }>('/admin/courses', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return course;
}

export async function updateCourseRequest(token: string, courseId: string, data: Partial<Omit<CreateCourseInput, 'unitTitles' | 'duplicateFromCourseId'>>) {
  const { course } = await request<{ course: { id: string } }>(`/admin/courses/${courseId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return course;
}

export async function createUnitRequest(token: string, courseId: string, title: string): Promise<AdminUnit> {
  const { unit } = await request<{ unit: AdminUnit }>(`/admin/courses/${courseId}/units`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ title }),
  });
  return unit;
}

export async function updateUnitRequest(token: string, unitId: string, title: string): Promise<AdminUnit> {
  const { unit } = await request<{ unit: AdminUnit }>(`/admin/courses/units/${unitId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ title }),
  });
  return unit;
}

export interface ExerciseFormInput {
  title: string;
  prompt: string;
  starterCode: string;
  language?: string;
  rewardXp: number;
  hint?: string;
  testCases: { input?: string; expectedOutput: string; isHidden?: boolean; compareMode?: string; spec?: unknown }[];
}

export async function createExerciseRequest(token: string, unitId: string, data: ExerciseFormInput): Promise<AdminExercise> {
  const { exercise } = await request<{ exercise: AdminExercise }>(`/admin/courses/units/${unitId}/exercises`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return exercise;
}

export async function updateExerciseRequest(
  token: string,
  exerciseId: string,
  data: Partial<ExerciseFormInput>,
): Promise<AdminExercise> {
  const { exercise } = await request<{ exercise: AdminExercise }>(`/admin/courses/exercises/${exerciseId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return exercise;
}

export async function duplicateUnitRequest(token: string, unitId: string): Promise<AdminUnit> {
  const { unit } = await request<{ unit: AdminUnit }>(`/admin/courses/units/${unitId}/duplicate`, { method: 'POST', headers: authHeaders(token) });
  return unit;
}

export async function duplicateExerciseRequest(token: string, exerciseId: string): Promise<AdminExercise> {
  const { exercise } = await request<{ exercise: AdminExercise }>(`/admin/courses/exercises/${exerciseId}/duplicate`, { method: 'POST', headers: authHeaders(token) });
  return exercise;
}

export async function deleteUnitRequest(token: string, unitId: string): Promise<void> {
  await request<void>(`/admin/courses/units/${unitId}`, { method: 'DELETE', headers: authHeaders(token) });
}

// Borra el curso con sus unidades, ejercicios, asignaciones y el avance de los alumnos.
export async function deleteCourseRequest(token: string, courseId: string): Promise<void> {
  await request<void>(`/admin/courses/${courseId}`, { method: 'DELETE', headers: authHeaders(token) });
}

// `unitIds` / `exerciseIds`: todos los ids, en el nuevo orden.
export async function reorderUnitsRequest(token: string, courseId: string, unitIds: string[]): Promise<void> {
  await request<void>(`/admin/courses/${courseId}/units/order`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ unitIds }),
  });
}

export async function reorderExercisesRequest(token: string, unitId: string, exerciseIds: string[]): Promise<void> {
  await request<void>(`/admin/courses/units/${unitId}/exercises/order`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ exerciseIds }),
  });
}

export async function deleteExerciseRequest(token: string, exerciseId: string): Promise<void> {
  await request<void>(`/admin/courses/exercises/${exerciseId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

export async function fetchCourseContent(token: string, courseId: string): Promise<CourseContent> {
  const { course } = await request<{ course: CourseContent }>(`/courses/${courseId}/content`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return course;
}

// Progreso real agrupado por curso (solo cursos dinamicos con contenido
// real migrado — los cursos del catalogo estatico no aparecen acá).
export interface CourseProgressSummary {
  courseId: string;
  courseName: string | null;
  completedExercises: number;
  totalExercises: number;
  progressPercent: number;
  xpEarned: number;
  units: {
    unitId: string;
    unitName: string | null;
    completedExercises: number;
    totalExercises: number;
    percent: number;
  }[];
}

// XP ganado por dia (huso Argentina) en los ultimos 7 dias, del mas viejo
// al mas nuevo. Alimenta "Tendencias de XP & Actividad" en Reportes.
// Estadisticas de un alumno calculadas con su historial de intentos.
export interface StudentStats {
  accuracy: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalAttempts: number;
  lastActivityAt: string | null;
  isActive: boolean;
  // Ultimos 30 dias (la ventana de "Progreso").
  last30Days: { practiceMinutes: number; linesOfCode: number; incorrect: number };
  practice: {
    thisWeekMinutes: number;
    dailyAverageMinutes: number;
    // Ultimos 7 dias; el ultimo es hoy.
    byDay: { day: string; minutes: number }[];
  };
  attentionAreas: { title: string; detail: string; status: 'reinforce' | 'pending' }[];
  recentActivity: { exerciseTitle: string; courseId: string | null; courseName: string | null; correct: boolean; at: string }[];
  errorsByUnit: { topic: string; errors: number }[];
}

export interface ProgressByCourseResult {
  progress: CourseProgressSummary[];
  weeklyXp: number[];
  // Estadisticas de todos los cursos juntos y por curso (courseId).
  stats: { overall: StudentStats; byCourse: Record<string, StudentStats> };
  gamification: Gamification;
}

export async function fetchMyProgressByCourse(token: string): Promise<ProgressByCourseResult> {
  return request<ProgressByCourseResult>('/users/me/progress/by-course', {
    headers: authHeaders(token),
  });
}

// Docente/admin: progreso real de un alumno puntual (solo lectura).
export async function fetchStudentProgressByCourse(token: string, studentId: string): Promise<ProgressByCourseResult> {
  return request<ProgressByCourseResult>(`/users/${studentId}/progress-by-course`, {
    headers: authHeaders(token),
  });
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

