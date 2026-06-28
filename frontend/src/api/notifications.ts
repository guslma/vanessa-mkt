import { apiFetch } from './client';

export function getNotificationsStatus() {
  return apiFetch<{ configured: boolean; publicKey: string | null }>('/notifications/status');
}

export function sendDigestNow() {
  return apiFetch<{ sent: boolean; reason?: string; enviados?: number; falhas?: number }>('/notifications/send-now', {
    method: 'POST',
  });
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export function subscribePush(subscription: PushSubscriptionPayload) {
  return apiFetch<{ ok: true }>('/notifications/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
  });
}

export function unsubscribePush(endpoint: string) {
  return apiFetch<void>('/notifications/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ endpoint }),
  });
}
