export const EMPREENDIMENTO_TIPO_LABELS = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  loteamento: 'Loteamento',
  misto: 'Misto',
} as const;

export const EMPREENDIMENTO_FASE_LABELS = {
  pre_lancamento: 'Pré-lançamento',
  lancamento: 'Lançamento',
  em_obras: 'Em obras',
  pronto_para_morar: 'Pronto para morar',
  entregue: 'Entregue',
} as const;

export const TAREFA_CATEGORIA_LABELS = {
  redes_sociais: 'Redes Sociais',
  material_grafico: 'Material Gráfico',
  lancamento: 'Lançamento',
  midia_paga: 'Mídia Paga',
  evento: 'Evento',
  stand_de_vendas: 'Stand de Vendas',
  site: 'Site',
  email_marketing: 'E-mail Marketing',
  fotos_e_videos: 'Fotos e Vídeos',
  outros: 'Outros',
} as const;

export const TAREFA_PRIORIDADE_LABELS = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
} as const;

export const TAREFA_STATUS_LABELS = {
  a_fazer: 'A fazer',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
} as const;

export type EmpreendimentoTipo = keyof typeof EMPREENDIMENTO_TIPO_LABELS;
export type EmpreendimentoFase = keyof typeof EMPREENDIMENTO_FASE_LABELS;
export type TarefaCategoria = keyof typeof TAREFA_CATEGORIA_LABELS;
export type TarefaPrioridade = keyof typeof TAREFA_PRIORIDADE_LABELS;
export type TarefaStatus = keyof typeof TAREFA_STATUS_LABELS;
