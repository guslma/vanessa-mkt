CREATE OR REPLACE VIEW tarefas_view AS
SELECT
  t.*,
  (t.status NOT IN ('concluido', 'cancelado') AND t.prazo IS NOT NULL AND t.prazo < CURRENT_DATE) AS atrasado
FROM tarefas t;
