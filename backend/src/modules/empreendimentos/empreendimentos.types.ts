import { z } from 'zod';

export const empreendimentoSchema = z.object({
  nome: z.string().min(1),
  tipo: z.enum(['residencial', 'comercial', 'loteamento', 'misto']),
  fase_atual: z.enum(['pre_lancamento', 'lancamento', 'em_obras', 'pronto_para_morar', 'entregue']),
  data_lancamento: z.string().date().nullable().optional(),
  responsavel_comercial: z.string().nullable().optional(),
  link_materiais: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
});

export type EmpreendimentoInput = z.infer<typeof empreendimentoSchema>;
