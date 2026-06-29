import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../db/pool';
import { env } from '../../config/env';
import { HttpError } from '../../middleware/errorHandler';

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'member';
  active: boolean;
}

export async function login(username: string, password: string) {
  const { rows } = await pool.query<UserRecord>(
    'SELECT id, username, email, password_hash, name, role, active FROM users WHERE username = $1',
    [username.toLowerCase()],
  );
  const user = rows[0];
  if (!user || !user.active) {
    throw new HttpError(401, 'Usuário ou senha inválidos');
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new HttpError(401, 'Usuário ou senha inválidos');
  }
  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
  return {
    token,
    user: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role },
  };
}

export async function getUserById(id: string) {
  const { rows } = await pool.query(
    'SELECT id, username, email, name, role FROM users WHERE id = $1 AND active = true',
    [id],
  );
  return rows[0] ?? null;
}
