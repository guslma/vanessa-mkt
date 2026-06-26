import { toDateOnly } from './formatDate';

export type DueStatus = 'atrasado' | 'vencendo' | 'normal';

interface DueInput {
  status: string;
  prazo: string | null;
  atrasado?: boolean;
}

const VENCENDO_EM_DIAS = 3;

function toLocalDate(value: string): Date {
  return new Date(`${toDateOnly(value)}T00:00:00`);
}

export function getDueStatus(tarefa: DueInput): DueStatus {
  if (tarefa.status === 'concluido' || tarefa.status === 'cancelado') return 'normal';
  if (tarefa.atrasado) return 'atrasado';
  if (!tarefa.prazo) return 'normal';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const prazo = toLocalDate(tarefa.prazo);
  const diffDays = Math.round((prazo.getTime() - today.getTime()) / 86_400_000);

  if (diffDays >= 0 && diffDays <= VENCENDO_EM_DIAS) return 'vencendo';
  return 'normal';
}

export function daysUntil(prazo: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = toLocalDate(prazo);
  return Math.round((date.getTime() - today.getTime()) / 86_400_000);
}
