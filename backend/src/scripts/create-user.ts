import bcrypt from 'bcryptjs';
import { pool } from '../db/pool';

interface Args {
  email?: string;
  name?: string;
  password?: string;
  role?: string;
}

function parseArgs(): Args {
  const args: Args = {};
  for (const arg of process.argv.slice(2)) {
    const [key, value] = arg.replace(/^--/, '').split('=');
    (args as Record<string, string>)[key] = value;
  }
  return args;
}

async function main() {
  const { email, name, password, role = 'admin' } = parseArgs();

  if (!email || !name || !password) {
    console.error('Uso: npm run create-user -- --email=... --name=... --password=... [--role=admin|member]');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO users (email, name, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, role = EXCLUDED.role
     RETURNING id, email, name, role`,
    [email.toLowerCase(), name, passwordHash, role],
  );

  console.log('Usuário criado/atualizado:', rows[0]);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
