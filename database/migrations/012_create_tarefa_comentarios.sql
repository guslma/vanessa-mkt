CREATE TABLE tarefa_comentarios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id   uuid NOT NULL REFERENCES tarefas(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  texto       text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tarefa_comentarios_tarefa ON tarefa_comentarios (tarefa_id, created_at);
