import { CalendarClock, Building2 } from 'lucide-react';
import { useTarefas } from '../../hooks/useTarefas';
import { daysUntil, getDueStatus } from '../../lib/dueStatus';
import { TAREFA_CATEGORIA_LABELS } from '../../constants/enums';

export function UpcomingTasks() {
  const { data, isLoading } = useTarefas({ sort: 'prazo:asc' });

  const upcoming = (data?.tarefas ?? [])
    .filter((t) => t.status !== 'concluido' && t.status !== 'cancelado' && t.prazo)
    .filter((t) => {
      const d = daysUntil(t.prazo!);
      return d >= 0 && d <= 7;
    });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <CalendarClock size={16} className="text-brand-600" />
        <h2 className="text-sm font-semibold text-slate-700">Vencendo nos próximos 7 dias</h2>
      </div>

      {isLoading && <p className="mt-3 text-sm text-slate-400">Carregando...</p>}

      {!isLoading && upcoming.length === 0 && (
        <p className="mt-3 text-sm text-slate-400">Nenhuma tarefa vencendo essa semana 🎉</p>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {upcoming.map((t) => {
          const due = getDueStatus(t);
          const d = daysUntil(t.prazo!);
          return (
            <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <Building2 size={12} className="text-brand-600" /> {t.empreendimento_nome}
                </p>
                <p className="text-xs text-slate-500">{t.titulo} · {TAREFA_CATEGORIA_LABELS[t.categoria] ?? t.categoria}</p>
              </div>
              <span className={`text-xs font-medium ${due === 'vencendo' ? 'text-amber-600' : 'text-slate-500'}`}>
                {d === 0 ? 'Hoje' : d === 1 ? 'Amanhã' : `Em ${d} dias`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
