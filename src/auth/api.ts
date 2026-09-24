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

export function fetchMe(token: string) {
  return request<{ user: ApiUser }>('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
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
  };
}
