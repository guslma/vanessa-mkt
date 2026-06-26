import { apiFetch } from './client';

export function getNotificationsStatus() {
  return apiFetch<{ configured: boolean }>('/notifications/status');
}

export function sendDigestNow() {
  return apiFetch<{ sent: boolean; reason?: string; recipients?: string[] }>('/notifications/send-now', {
    method: 'POST',
  });
}
