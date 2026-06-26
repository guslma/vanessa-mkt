CREATE TABLE tarefas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empreendimento_id  uuid NOT NULL REFERENCES empreendimentos(id) ON DELETE CASCADE,
  categoria         tarefa_categoria NOT NULL,
  titulo            text NOT NULL,
  responsavel       text,
  prioridade        tarefa_prioridade NOT NULL DEFAULT 'media',
  status            tarefa_status NOT NULL DEFAULT 'a_fazer',
  data_inicio       date,
  prazo             date,
  data_conclusao    date,
  observacoes       text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tarefas_empreendimento ON tarefas (empreendimento_id);
CREATE INDEX idx_tarefas_status ON tarefas (status);
CREATE INDEX idx_tarefas_prazo ON tarefas (prazo);
