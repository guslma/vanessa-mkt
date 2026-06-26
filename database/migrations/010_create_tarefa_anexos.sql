CREATE TABLE tarefa_anexos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id       uuid NOT NULL REFERENCES tarefas(id) ON DELETE CASCADE,
  nome_original   text NOT NULL,
  caminho_arquivo text NOT NULL,
  mime_type       text,
  tamanho_bytes   integer,
  uploaded_by     uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tarefa_anexos_tarefa ON tarefa_anexos (tarefa_id);
