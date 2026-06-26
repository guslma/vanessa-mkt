import { apiFetch } from './client';

export interface DashboardSummary {
  total_tarefas: number;
  em_andamento: number;
  concluidas: number;
  atrasadas: number;
  alta_prioridade_em_aberto: number;
}

export function getSummary() {
  return apiFetch<DashboardSummary>('/dashboard/summary');
}
