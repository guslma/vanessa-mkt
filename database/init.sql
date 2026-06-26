-- Bootstrap executado automaticamente pelo Postgres (docker-entrypoint-initdb.d)
-- em um volume de dados novo. Contém apenas extensões + schema (sem seed).
-- O seed e o controle de versões de schema ficam a cargo do migration
-- runner (scripts/migrate.ts), que roda em todo start do backend.

CREATE TABLE IF NOT EXISTS schema_migrations (
  filename   text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

\i /docker-entrypoint-initdb.d/migrations/001_init_extensions.sql
\i /docker-entrypoint-initdb.d/migrations/002_create_enums.sql
\i /docker-entrypoint-initdb.d/migrations/003_create_users.sql
\i /docker-entrypoint-initdb.d/migrations/004_create_empreendimentos.sql
\i /docker-entrypoint-initdb.d/migrations/005_create_tarefas.sql
\i /docker-entrypoint-initdb.d/migrations/006_create_triggers_updated_at.sql
\i /docker-entrypoint-initdb.d/migrations/007_create_view_tarefas_view.sql

INSERT INTO schema_migrations (filename) VALUES
  ('001_init_extensions.sql'),
  ('002_create_enums.sql'),
  ('003_create_users.sql'),
  ('004_create_empreendimentos.sql'),
  ('005_create_tarefas.sql'),
  ('006_create_triggers_updated_at.sql'),
  ('007_create_view_tarefas_view.sql')
ON CONFLICT DO NOTHING;
