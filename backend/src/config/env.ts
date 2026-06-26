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
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminName: process.env.ADMIN_NAME ?? 'Administrador',
  uploadsDir: process.env.UPLOADS_DIR ?? path.resolve(process.cwd(), 'uploads'),
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 15),
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpFrom: process.env.SMTP_FROM ?? 'Marketing Tracker <no-reply@marketing-tracker.local>',
  dailyDigestHour: Number(process.env.DAILY_DIGEST_HOUR ?? 8),
};
