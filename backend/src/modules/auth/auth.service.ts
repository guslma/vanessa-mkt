import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../db/pool';
import { env } from '../../config/env';
import { HttpError } from '../../middleware/errorHandler';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'member';
  active: boolean;
}

export async function login(email: string, password: string) {
  const { rows } = await pool.query<UserRecord>(
    'SELECT id, email, password_hash, name, role, active FROM users WHERE email = $1',
    [email.toLowerCase()],
  );
  const user = rows[0];
  if (!user || !user.active) {
    throw new HttpError(401, 'E-mail ou senha inválidos');
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new HttpError(401, 'E-mail ou senha inválidos');
  }
  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function getUserById(id: string) {
  const { rows } = await pool.query(
    'SELECT id, email, name, role FROM users WHERE id = $1 AND active = true',
    [id],
  );
  return rows[0] ?? null;
}
