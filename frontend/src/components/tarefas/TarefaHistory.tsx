import { History } from 'lucide-react';
import { useTarefaEventos } from '../../hooks/useTarefas';

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function TarefaHistory({ tarefaId }: { tarefaId: string }) {
  const { data, isLoading } = useTarefaEventos(tarefaId);
  const eventos = data?.eventos ?? [];

  return (
    <div className="mt-5 border-t border-slate-100 dark:border-slate-700/60 pt-4">
      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
        <History size={14} /> Histórico
      </div>
      {isLoading && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Carregando...</p>}
      {!isLoading && eventos.length === 0 && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Sem atividade registrada ainda.</p>}
      <ul className="mt-2 flex max-h-32 flex-col gap-1.5 overflow-y-auto text-xs">
        {eventos.map((ev) => (
          <li key={ev.id} className="text-slate-500 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500">{formatDateTime(ev.created_at)}</span>
            {' · '}
            <span className="font-medium text-slate-600 dark:text-slate-300">{ev.user_name ?? 'Sistema'}</span>
            {' — '}{ev.descricao}
          </li>
        ))}
      </ul>
    </div>
  );
}
