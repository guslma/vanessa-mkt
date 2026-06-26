CREATE TYPE tarefa_recorrencia AS ENUM ('nenhuma', 'semanal', 'quinzenal', 'mensal');

ALTER TABLE tarefas ADD COLUMN recorrencia tarefa_recorrencia NOT NULL DEFAULT 'nenhuma';

-- tarefas_view foi criada com "SELECT t.*", que fixa a lista de colunas no
-- momento da criação — precisa ser recriada para incluir a coluna nova.
-- CREATE OR REPLACE não permite inserir coluna no meio da lista existente,
-- por isso dropamos e recriamos.
DROP VIEW tarefas_view;
CREATE VIEW tarefas_view AS
SELECT
  t.*,
  (t.status NOT IN ('concluido', 'cancelado') AND t.prazo IS NOT NULL AND t.prazo < CURRENT_DATE) AS atrasado
FROM tarefas t;
