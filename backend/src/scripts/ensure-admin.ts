import bcrypt from 'bcryptjs';
import { pool } from '../db/pool';
import { env } from '../config/env';

async function main() {
  if (!env.adminUsername || !env.adminEmail || !env.adminPassword) {
    console.log('ADMIN_USERNAME/ADMIN_EMAIL/ADMIN_PASSWORD não definidos — pulando criação do admin inicial.');
    await pool.end();
    return;
  }

  const { rows } = await pool.query('SELECT id FROM users WHERE username = $1', [env.adminUsername.toLowerCase()]);
  if (rows[0]) {
    console.log('Admin inicial já existe, nada a fazer.');
    await pool.end();
    return;
  }

  const passwordHash = await bcrypt.hash(env.adminPassword, 12);
  await pool.query(
    `INSERT INTO users (username, email, name, password_hash, role) VALUES ($1, $2, $3, $4, 'admin')`,
    [env.adminUsername.toLowerCase(), env.adminEmail.toLowerCase(), env.adminName, passwordHash],
  );
  console.log(`Admin inicial criado: ${env.adminUsername}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
