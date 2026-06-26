import { useKanban, useTarefaMutations } from '../hooks/useTarefas';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { QueryError } from '../components/common/QueryError';

export function KanbanPage() {
  const { data, isLoading, isError, error, refetch } = useKanban();
  const { updateStatus } = useTarefaMutations();

  if (isError) {
    return <QueryError error={error} onRetry={refetch} />;
  }

  if (isLoading || !data) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Carregando quadro...</p>;
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-700 dark:text-slate-200 md:hidden">Quadro</h1>
      <p className="mb-4 mt-1 text-sm text-slate-500 dark:text-slate-400">Troque o status direto no card para mover a tarefa entre colunas.</p>
      <KanbanBoard board={data} onStatusChange={(id, status) => updateStatus.mutate({ id, status })} />
    </div>
  );
}
