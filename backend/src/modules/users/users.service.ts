import bcrypt from 'bcryptjs';
import { pool } from '../../db/pool';
import { HttpError } from '../../middleware/errorHandler';

export interface CreateUserInput {
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

export async function listUsers() {
  const { rows } = await pool.query(
    'SELECT id, email, name, role, funcao, active, created_at FROM users ORDER BY name',
  );
  return rows;
}

export async function createUser(input: CreateUserInput) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, name, password_hash, role, funcao)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, funcao, active, created_at`,
      [input.email.toLowerCase(), input.name, passwordHash, input.role, input.funcao ?? null],
    );
    return rows[0];
  } catch (err: any) {
    if (err.code === '23505') {
      throw new HttpError(409, 'Já existe um usuário com este e-mail');
    }
    throw err;
  }
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${i++}`);
    values.push(input.name);
  }
  if (input.role !== undefined) {
    fields.push(`role = $${i++}`);
    values.push(input.role);
  }
  if (input.funcao !== undefined) {
    fields.push(`funcao = $${i++}`);
    values.push(input.funcao);
  }
  if (input.active !== undefined) {
    fields.push(`active = $${i++}`);
    values.push(input.active);
  }
  if (input.password) {
    const passwordHash = await bcrypt.hash(input.password, 12);
    fields.push(`password_hash = $${i++}`);
    values.push(passwordHash);
  }

  if (fields.length === 0) {
    throw new HttpError(400, 'Nenhum campo para atualizar');
  }

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${i}
     RETURNING id, email, name, role, funcao, active, created_at`,
    values,
  );
  if (!rows[0]) {
    throw new HttpError(404, 'Usuário não encontrado');
  }
  return rows[0];
}

export async function deleteUser(id: string) {
  const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  if (!rowCount) {
    throw new HttpError(404, 'Usuário não encontrado');
  }
}
