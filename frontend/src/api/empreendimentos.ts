import { apiFetch } from './client';

export interface Empreendimento {
  id: string;
  nome: string;
  tipo: string;
  fase_atual: string;
  data_lancamento: string | null;
  responsavel_comercial: string | null;
  link_materiais: string | null;
  observacoes: string | null;
  endereco: string | null;
  public_token: string;
  created_at: string;
  updated_at: string;
}

export type EmpreendimentoInput = Omit<Empreendimento, 'id' | 'public_token' | 'created_at' | 'updated_at'>;

export function listEmpreendimentos() {
  return apiFetch<{ empreendimentos: Empreendimento[] }>('/empreendimentos');
}

export function createEmpreendimento(input: EmpreendimentoInput) {
  return apiFetch<{ empreendimento: Empreendimento }>('/empreendimentos', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateEmpreendimento(id: string, input: EmpreendimentoInput) {
  return apiFetch<{ empreendimento: Empreendimento }>(`/empreendimentos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteEmpreendimento(id: string) {
  return apiFetch<void>(`/empreendimentos/${id}`, { method: 'DELETE' });
}

export function regenerateToken(id: string) {
  return apiFetch<{ empreendimento: Empreendimento }>(`/empreendimentos/${id}/regenerate-token`, {
    method: 'PATCH',
  });
}
