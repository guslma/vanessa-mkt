CREATE TABLE tarefa_eventos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id   uuid NOT NULL REFERENCES tarefas(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  descricao   text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tarefa_eventos_tarefa ON tarefa_eventos (tarefa_id, created_at DESC);
