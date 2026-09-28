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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, body.error ?? `HTTP ${res.status}`);
  }
  return body as T;
}

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

export function registerRequest(data: RegisterData) {
  return request<{ user: ApiUser; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchMe(token: string) {
  return request<{ user: ApiUser }>('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Admin only (GET /api/users).
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

export function updateUserRequest(token: string, id: string, data: UserEditData) {
  return request<{ user: ApiUser }>(`/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export function setUserActiveRequest(token: string, id: string, isActive: boolean) {
  return request<{ user: ApiUser }>(`/users/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ isActive }),
  });
}

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

export function fetchTeaching(token: string) {
  return request<{ courses: TeachingCourse[] }>('/users/me/teaching', { headers: authHeaders(token) });
}

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
