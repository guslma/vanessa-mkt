CREATE INDEX idx_tarefas_prioridade ON tarefas (prioridade);
CREATE INDEX idx_tarefas_emp_status ON tarefas (empreendimento_id, status);
CREATE INDEX idx_empreendimentos_tipo ON empreendimentos (tipo);
CREATE INDEX idx_tarefa_eventos_user ON tarefa_eventos (user_id);
CREATE INDEX idx_tarefa_anexos_uploaded_by ON tarefa_anexos (uploaded_by);
CREATE INDEX idx_tarefa_comentarios_user ON tarefa_comentarios (user_id);
