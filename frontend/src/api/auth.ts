import { apiFetch } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export function login(email: string, password: string) {
  return apiFetch<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function me() {
  return apiFetch<{ user: User }>('/auth/me');
}
