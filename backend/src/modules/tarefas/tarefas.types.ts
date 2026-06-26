import { z } from 'zod';

export const tarefaSchema = z.object({
  empreendimento_id: z.string().uuid(),
  categoria: z.enum([
    'redes_sociais', 'material_grafico', 'lancamento', 'midia_paga', 'evento',
    'stand_de_vendas', 'site', 'email_marketing', 'fotos_e_videos', 'outros',
  ]),
  titulo: z.string().min(1),
  responsavel: z.string().nullable().optional(),
  prioridade: z.enum(['alta', 'media', 'baixa']).default('media'),
  status: z.enum(['a_fazer', 'em_andamento', 'concluido', 'cancelado']).default('a_fazer'),
  data_inicio: z.string().date().nullable().optional(),
  prazo: z.string().date().nullable().optional(),
  data_conclusao: z.string().date().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  recorrencia: z.enum(['nenhuma', 'semanal', 'quinzenal', 'mensal']).default('nenhuma'),
});

export const statusUpdateSchema = z.object({
  status: z.enum(['a_fazer', 'em_andamento', 'concluido', 'cancelado']),
});

export type TarefaInput = z.infer<typeof tarefaSchema>;
