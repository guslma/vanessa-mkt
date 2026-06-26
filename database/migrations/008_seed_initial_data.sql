WITH ins_emp AS (
  INSERT INTO empreendimentos (nome, tipo, fase_atual, data_lancamento, responsavel_comercial)
  SELECT * FROM (VALUES
    ('Residencial Vista Verde', 'residencial'::empreendimento_tipo, 'em_obras'::empreendimento_fase, '2025-03-15'::date, 'Carlos Souza'),
    ('Edifício Horizonte', 'comercial'::empreendimento_tipo, 'pre_lancamento'::empreendimento_fase, '2026-08-15'::date, 'Ana Paula'),
    ('Parque das Flores', 'residencial'::empreendimento_tipo, 'pronto_para_morar'::empreendimento_fase, '2024-01-10'::date, 'Marcelo Lima')
  ) AS v(nome, tipo, fase_atual, data_lancamento, responsavel_comercial)
  WHERE NOT EXISTS (SELECT 1 FROM empreendimentos)
  RETURNING id, nome
)
INSERT INTO tarefas (empreendimento_id, categoria, titulo, responsavel, prioridade, status, data_inicio, prazo, data_conclusao, observacoes)
SELECT e.id, t.categoria, t.titulo, t.responsavel, t.prioridade, t.status, t.data_inicio, t.prazo, t.data_conclusao, t.observacoes
FROM (VALUES
  ('Residencial Vista Verde', 'redes_sociais'::tarefa_categoria, 'Criar cronograma de posts do mês', 'Equipe Social Media', 'alta'::tarefa_prioridade, 'em_andamento'::tarefa_status, '2026-07-01'::date, '2026-07-10'::date, NULL::date, 'Foco em vídeos de obra'),
  ('Residencial Vista Verde', 'material_grafico'::tarefa_categoria, 'Atualizar folder de vendas', 'Designer', 'media'::tarefa_prioridade, 'a_fazer'::tarefa_status, '2026-07-05'::date, '2026-07-20'::date, NULL::date, NULL),
  ('Edifício Horizonte', 'lancamento'::tarefa_categoria, 'Planejar evento de lançamento', 'Coordenadora de Marketing', 'alta'::tarefa_prioridade, 'a_fazer'::tarefa_status, '2026-07-01'::date, '2026-08-15'::date, NULL::date, 'Verificar orçamento com financeiro'),
  ('Edifício Horizonte', 'midia_paga'::tarefa_categoria, 'Configurar campanha no Meta Ads', 'Agência', 'alta'::tarefa_prioridade, 'em_andamento'::tarefa_status, '2026-06-10'::date, '2026-06-20'::date, NULL::date, 'Aguardando aprovação de criativos'),
  ('Parque das Flores', 'stand_de_vendas'::tarefa_categoria, 'Briefing de decoração do stand', 'Coordenadora de Marketing', 'media'::tarefa_prioridade, 'concluido'::tarefa_status, '2026-05-01'::date, '2026-05-30'::date, '2026-05-30'::date, NULL)
) AS t(emp_nome, categoria, titulo, responsavel, prioridade, status, data_inicio, prazo, data_conclusao, observacoes)
JOIN ins_emp e ON e.nome = t.emp_nome;
