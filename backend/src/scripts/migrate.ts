import fs from 'fs';
import path from 'path';
import { pool } from '../db/pool';

function resolveMigrationsDir(): string {
  if (process.env.MIGRATIONS_DIR) return process.env.MIGRATIONS_DIR;
  const candidates = [
    path.resolve(__dirname, '../../../database/migrations'), // dev: backend/src/scripts -> repo root
    path.resolve(__dirname, '../../database/migrations'), // prod: dist/scripts -> /app/database
    path.resolve(process.cwd(), 'database/migrations'),
  ];
  const found = candidates.find((dir) => fs.existsSync(dir));
  if (!found) {
    throw new Error(`Diretório de migrations não encontrado. Tentativas: ${candidates.join(', ')}`);
  }
  return found;
}

const MIGRATIONS_DIR = resolveMigrationsDir();

async function waitForDatabase(retries = 20, delayMs = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`Banco de dados indisponível, tentando novamente (${attempt}/${retries})...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function main() {
  await waitForDatabase();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const { rows } = await pool.query('SELECT filename FROM schema_migrations');
  const applied = new Set(rows.map((r) => r.filename));

  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip  ${file} (já aplicada)`);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`apply ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`erro ao aplicar ${file}`);
      throw err;
    } finally {
      client.release();
    }
  }

  console.log('Migrations concluídas.');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
