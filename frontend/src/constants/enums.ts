export const EMPREENDIMENTO_TIPO_LABELS: Record<string, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  loteamento: 'Loteamento',
  misto: 'Misto',
};

export const EMPREENDIMENTO_FASE_LABELS: Record<string, string> = {
  pre_lancamento: 'Pré-lançamento',
  lancamento: 'Lançamento',
  em_obras: 'Em obras',
  pronto_para_morar: 'Pronto para morar',
  entregue: 'Entregue',
};

export const TAREFA_CATEGORIA_LABELS: Record<string, string> = {
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
};

export const TAREFA_PRIORIDADE_LABELS: Record<string, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export const TAREFA_STATUS_LABELS: Record<string, string> = {
  a_fazer: 'A fazer',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const PRIORIDADE_COLOR: Record<string, string> = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-amber-100 text-amber-700',
  baixa: 'bg-emerald-100 text-emerald-700',
};

export const STATUS_COLOR: Record<string, string> = {
  a_fazer: 'bg-slate-100 text-slate-700',
  em_andamento: 'bg-blue-100 text-blue-700',
  concluido: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-slate-100 text-slate-400',
};

export const TAREFA_RECORRENCIA_LABELS: Record<string, string> = {
  nenhuma: 'Não repete',
  semanal: 'Toda semana',
  quinzenal: 'A cada 2 semanas',
  mensal: 'Todo mês',
};

export const USER_FUNCAO_LABELS: Record<string, string> = {
  gerente_marketing: 'Gerente de Marketing',
  coordenador_marketing: 'Coordenador de Marketing',
  social_media: 'Social Media',
  designer: 'Designer',
  trafego_pago: 'Tráfego Pago',
  copywriter: 'Copywriter',
  video_fotografia: 'Vídeo / Fotografia',
  atendimento: 'Atendimento / SDR',
  comercial: 'Comercial',
  agencia: 'Agência',
  outro: 'Outro',
};
