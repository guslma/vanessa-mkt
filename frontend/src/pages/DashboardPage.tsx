import { CheckCircle2, Clock, Flame, ListTodo } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { UpcomingTasks } from '../components/dashboard/UpcomingTasks';
import { QueryError } from '../components/common/QueryError';

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboard();

  if (isError) {
    return <QueryError error={error} onRetry={refetch} />;
  }

  if (isLoading || !data) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Carregando resumo...</p>;
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-700 dark:text-slate-200 md:hidden">Painel de Marketing</h1>
      <div className="mt-3 grid grid-cols-2 gap-3 md:mt-0 md:grid-cols-4">
        <SummaryCard label="Total de Tarefas" value={data.total_tarefas} Icon={ListTodo} tone="brand" />
        <SummaryCard label="Em Andamento" value={data.em_andamento} Icon={Clock} />
        <SummaryCard label="Concluídas" value={data.concluidas} Icon={CheckCircle2} tone="success" />
        <SummaryCard label="Atrasadas" value={data.atrasadas} Icon={Clock} tone={data.atrasadas > 0 ? 'danger' : 'default'} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <SummaryCard
          label="Tarefas de Alta Prioridade em Aberto"
          value={data.alta_prioridade_em_aberto}
          Icon={Flame}
          tone={data.alta_prioridade_em_aberto > 0 ? 'warning' : 'default'}
        />
      </div>
      <div className="mt-3">
        <UpcomingTasks />
      </div>
    </div>
  );
}
