import { apiFetch } from './client';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
}

export function login(username: string, password: string) {
  return apiFetch<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function me() {
  return apiFetch<{ user: User }>('/auth/me');
}
