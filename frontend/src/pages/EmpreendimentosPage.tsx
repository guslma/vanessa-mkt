import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useEmpreendimentoMutations, useEmpreendimentos } from '../hooks/useEmpreendimentos';
import { EmpreendimentosTable } from '../components/empreendimentos/EmpreendimentosTable';
import { EmpreendimentoFormModal } from '../components/empreendimentos/EmpreendimentoFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { QueryError } from '../components/common/QueryError';
import { ImportButton } from '../components/common/ImportButton';
import { Empreendimento, EmpreendimentoInput } from '../api/empreendimentos';

export function EmpreendimentosPage() {
  const { data, isLoading, isError, error, refetch } = useEmpreendimentos();
  const { create, update, remove, regenerate } = useEmpreendimentoMutations();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Empreendimento | null>(null);
  const [deleting, setDeleting] = useState<Empreendimento | null>(null);

  const empreendimentos = data?.empreendimentos ?? [];

  function handleSubmit(input: EmpreendimentoInput) {
    const onSuccess = () => setModalOpen(false);
    if (editing) {
      update.mutate({ id: editing.id, input }, { onSuccess });
    } else {
      create.mutate(input, { onSuccess });
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Empreendimentos</h1>
        <div className="flex items-center gap-2">
          <Link to="/mapa" className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/60">
            <MapPin size={14} /> Ver mapa
          </Link>
          <ImportButton />
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700">
            + Novo empreendimento
          </button>
        </div>
      </div>

      {isError ? (
        <QueryError error={error} onRetry={refetch} />
      ) : isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Carregando...</p>
      ) : (
        <EmpreendimentosTable
          empreendimentos={empreendimentos}
          onEdit={(e) => { setEditing(e); setModalOpen(true); }}
          onDelete={setDeleting}
        />
      )}

      <EmpreendimentoFormModal
        open={modalOpen}
        empreendimento={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        onRegenerateToken={() => {
          if (editing) regenerate.mutate(editing.id, { onSuccess: ({ empreendimento }) => setEditing(empreendimento) });
        }}
        regenerating={regenerate.isPending}
        saving={create.isPending || update.isPending}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir empreendimento?"
        description={deleting ? `Todas as tarefas de "${deleting.nome}" também serão excluídas.` : undefined}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
