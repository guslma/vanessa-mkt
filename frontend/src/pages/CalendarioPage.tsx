import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEmpreendimentos } from '../hooks/useEmpreendimentos';
import { useTarefaMutations, useTarefas } from '../hooks/useTarefas';
import { buildMonthGrid, MONTH_LABELS, WEEKDAY_LABELS } from '../lib/calendarGrid';
import { toDateOnly } from '../lib/formatDate';
import { getDueStatus } from '../lib/dueStatus';
import { QueryError } from '../components/common/QueryError';
import { TarefaFormModal } from '../components/tarefas/TarefaFormModal';
import { Tarefa, TarefaInput } from '../api/tarefas';

const CHIP_TONE: Record<string, string> = {
  atrasado: 'bg-red-100 text-red-700',
  vencendo: 'bg-amber-100 text-amber-700',
  normal: 'bg-slate-100 text-slate-600',
};

export function CalendarioPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [editing, setEditing] = useState<Tarefa | null>(null);
  const [newDraft, setNewDraft] = useState<TarefaInput | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: empData } = useEmpreendimentos();
  const { data, isLoading, isError, error, refetch } = useTarefas({ sort: 'prazo:asc' });
  const { create, update } = useTarefaMutations();

  const empreendimentos = empData?.empreendimentos ?? [];
  const tarefas = data?.tarefas ?? [];

  const tarefasPorDia = useMemo(() => {
    const map = new Map<string, Tarefa[]>();
    for (const t of tarefas) {
      if (!t.prazo) continue;
      const key = toDateOnly(t.prazo);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tarefas]);

  const days = useMemo(() => buildMonthGrid(year, month), [year, month]);

  function goToPrevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); } else { setMonth((m) => m - 1); }
  }
  function goToNextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); } else { setMonth((m) => m + 1); }
  }
  function goToToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  function openTarefa(tarefa: Tarefa) {
    setEditing(tarefa);
    setNewDraft(null);
    setModalOpen(true);
  }

  function openNewForDay(dateKey: string) {
    if (empreendimentos.length === 0) return;
    setEditing(null);
    setNewDraft({
      empreendimento_id: empreendimentos[0].id,
      categoria: 'outros',
      titulo: '',
      responsavel: '',
      prioridade: 'media',
      status: 'a_fazer',
      data_inicio: null,
      prazo: dateKey,
      data_conclusao: null,
      observacoes: '',
      recorrencia: 'nenhuma',
    });
    setModalOpen(true);
  }

  function handleSubmit(input: TarefaInput) {
    const onSuccess = () => setModalOpen(false);
    if (editing) {
      update.mutate({ id: editing.id, input }, { onSuccess });
    } else {
      create.mutate(input, { onSuccess });
    }
  }

  if (isError) return <QueryError error={error} onRetry={refetch} />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">{MONTH_LABELS[month]} {year}</h1>
        <div className="flex items-center gap-1">
          <button onClick={goToPrevMonth} className="rounded-lg border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50"><ChevronLeft size={16} /></button>
          <button onClick={goToToday} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Hoje</button>
          <button onClick={goToNextMonth} className="rounded-lg border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50"><ChevronRight size={16} /></button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Carregando calendário...</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-500">
            {WEEKDAY_LABELS.map((label) => <div key={label} className="py-2">{label}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dayTasks = tarefasPorDia.get(day.dateKey) ?? [];
              const visible = dayTasks.slice(0, 3);
              const extra = dayTasks.length - visible.length;
              return (
                <button
                  key={day.dateKey}
                  onClick={() => openNewForDay(day.dateKey)}
                  className={`flex min-h-[88px] flex-col items-stretch gap-1 border-b border-r border-slate-100 p-1.5 text-left align-top ${
                    day.inCurrentMonth ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <span className={`self-start rounded-full px-1.5 text-xs ${
                    day.isToday ? 'bg-brand-600 font-semibold text-white' : day.inCurrentMonth ? 'text-slate-600' : 'text-slate-300'
                  }`}>
                    {day.date.getDate()}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {visible.map((t) => {
                      const due = getDueStatus(t);
                      return (
                        <span
                          key={t.id}
                          onClick={(e) => { e.stopPropagation(); openTarefa(t); }}
                          className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${CHIP_TONE[due]}`}
                          title={t.titulo}
                        >
                          {t.titulo}
                        </span>
                      );
                    })}
                    {extra > 0 && <span className="px-1 text-[10px] text-slate-400">+{extra} mais</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <TarefaFormModal
        open={modalOpen}
        tarefa={editing}
        prefill={newDraft}
        empreendimentos={empreendimentos}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        saving={create.isPending || update.isPending}
      />
    </div>
  );
}
