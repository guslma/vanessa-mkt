import { apiFetch } from './client';

export interface AppUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  funcao: string | null;
  active: boolean;
  created_at: string;
}

export interface CreateUserInput {
  username: string;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'member';
  funcao?: string | null;
}

export interface UpdateUserInput {
  name?: string;
  role?: 'admin' | 'member';
  active?: boolean;
  password?: string;
  funcao?: string | null;
}

export function listUsers() {
  return apiFetch<{ users: AppUser[] }>('/users');
}

export function createUser(input: CreateUserInput) {
  return apiFetch<{ user: AppUser }>('/users', { method: 'POST', body: JSON.stringify(input) });
}

export function updateUser(id: string, input: UpdateUserInput) {
  return apiFetch<{ user: AppUser }>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function deleteUser(id: string) {
  return apiFetch<void>(`/users/${id}`, { method: 'DELETE' });
}
