import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEmpreendimentos } from '../hooks/useEmpreendimentos';
import { useTarefaMutations, useTarefas } from '../hooks/useTarefas';
import { TarefasFiltersBar } from '../components/tarefas/TarefasFilters';
import { TarefasTable } from '../components/tarefas/TarefasTable';
import { TarefaFormModal } from '../components/tarefas/TarefaFormModal';
import { ExportMenu } from '../components/tarefas/ExportMenu';
import { QuickTaskInput } from '../components/tarefas/QuickTaskInput';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { QueryError } from '../components/common/QueryError';
import { toDateOnly } from '../lib/formatDate';
import { Tarefa, TarefaFilters, TarefaInput } from '../api/tarefas';

export function TarefasPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<TarefaFilters>(() => {
    const empreendimentoId = searchParams.get('empreendimento_id');
    return empreendimentoId ? { empreendimento_id: empreendimentoId } : {};
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tarefa | null>(null);
  const [duplicateDraft, setDuplicateDraft] = useState<TarefaInput | null>(null);
  const [deleting, setDeleting] = useState<Tarefa | null>(null);

  const { data: empData } = useEmpreendimentos();
  const { data: tarData, isLoading, isError, error, refetch } = useTarefas(filters);
  const { create, update, remove } = useTarefaMutations();

  const empreendimentos = empData?.empreendimentos ?? [];
  const tarefas = tarData?.tarefas ?? [];

  function handleNew() {
    setEditing(null);
    setDuplicateDraft(null);
    setModalOpen(true);
  }

  function handleEdit(tarefa: Tarefa) {
    setEditing(tarefa);
    setDuplicateDraft(null);
    setModalOpen(true);
  }

  function handleDuplicate(tarefa: Tarefa) {
    const { id, empreendimento_nome, atrasado, created_at, updated_at, ...rest } = tarefa as any;
    setEditing(null);
    setDuplicateDraft({
      ...rest,
      status: 'a_fazer',
      data_inicio: toDateOnly(rest.data_inicio) || null,
      prazo: toDateOnly(rest.prazo) || null,
      data_conclusao: null,
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

  const filteredEmpreendimento = empreendimentos.find((e) => e.id === filters.empreendimento_id);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Tarefas</h1>
          {filteredEmpreendimento && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
              Filtrando por <span className="font-medium text-brand-700">{filteredEmpreendimento.nome}</span>
              <button onClick={() => setFilters({ ...filters, empreendimento_id: undefined })} className="text-xs text-slate-400 underline hover:text-slate-600">
                limpar
              </button>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu filters={filters} />
          <button onClick={handleNew} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700">+ Nova tarefa</button>
        </div>
      </div>

      <QuickTaskInput
        empreendimentos={empreendimentos}
        defaultEmpreendimentoId={filters.empreendimento_id}
        onCreate={(input) => create.mutate(input)}
        creating={create.isPending}
      />

      <TarefasFiltersBar filters={filters} onChange={setFilters} empreendimentos={empreendimentos} />

      {isError ? (
        <QueryError error={error} onRetry={refetch} />
      ) : isLoading ? (
        <p className="text-sm text-slate-500">Carregando tarefas...</p>
      ) : (
        <TarefasTable tarefas={tarefas} onEdit={handleEdit} onDuplicate={handleDuplicate} onDelete={setDeleting} />
      )}

      <TarefaFormModal
        open={modalOpen}
        tarefa={editing}
        prefill={duplicateDraft}
        empreendimentos={empreendimentos}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        saving={create.isPending || update.isPending}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir tarefa?"
        description={deleting ? `"${deleting.titulo}" será excluída permanentemente.` : undefined}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
