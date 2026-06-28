import webpush from 'web-push';
import { pool } from '../../db/pool';
import { env } from '../../config/env';

export function isPushConfigured() {
  return Boolean(env.vapidPublicKey && env.vapidPrivateKey);
}

function ensureVapid() {
  if (!isPushConfigured()) return false;
  webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey!, env.vapidPrivateKey!);
  return true;
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function saveSubscription(userId: string, subscription: PushSubscriptionInput) {
  await pool.query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint) DO UPDATE SET user_id = $1, p256dh = $3, auth = $4`,
    [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth],
  );
}

export async function removeSubscription(endpoint: string) {
  await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
}

async function getAdminSubscriptions() {
  const { rows } = await pool.query(`
    SELECT ps.id, ps.endpoint, ps.p256dh, ps.auth
    FROM push_subscriptions ps
    JOIN users u ON u.id = ps.user_id
    WHERE u.active = true AND u.role = 'admin'
  `);
  return rows;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushToAdmins(payload: PushPayload): Promise<{ sent: number; failed: number }> {
  if (!ensureVapid()) return { sent: 0, failed: 0 };

  const subscriptions = await getAdminSubscriptions();
  let sent = 0, failed = 0;

  await Promise.all(subscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      );
      sent++;
    } catch (err: any) {
      failed++;
      // Inscrição expirada/revogada pelo navegador — remove para não tentar de novo.
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await removeSubscription(sub.endpoint);
      }
    }
  }));

  return { sent, failed };
}
