import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

function resolveEnvFile(): string | undefined {
  const candidates = [
    path.resolve(__dirname, '../../../.env'), // dev: backend/src/config -> repo root
    path.resolve(__dirname, '../../.env'), // prod: dist/config -> /app/.env
    path.resolve(process.cwd(), '.env'),
  ];
  return candidates.find((p) => fs.existsSync(p));
}

dotenv.config({ path: resolveEnvFile() });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  port: Number(process.env.PORT ?? 3001),
  adminUsername: process.env.ADMIN_USERNAME ?? process.env.ADMIN_EMAIL?.split('@')[0],
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminName: process.env.ADMIN_NAME ?? 'Administrador',
  uploadsDir: process.env.UPLOADS_DIR ?? path.resolve(process.cwd(), 'uploads'),
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 15),
  dailyDigestHour: Number(process.env.DAILY_DIGEST_HOUR ?? 8),
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  vapidSubject: process.env.VAPID_SUBJECT ?? 'mailto:no-reply@marketing-tracker.local',
  // Lista de origens permitidas pro CORS, separadas por vírgula. Vazio/ausente
  // = libera qualquer origem (ok pra dev local; em produção defina isso pro
  // domínio real, ex: https://meuapp.duckdns.org).
  corsOrigins: process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean),
};
