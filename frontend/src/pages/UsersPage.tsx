import { useState } from 'react';
import { useUserMutations, useUsers } from '../hooks/useUsers';
import { UserFormModal } from '../components/users/UserFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AppUser, CreateUserInput } from '../api/users';
import { Badge } from '../components/common/Badge';
import { QueryError } from '../components/common/QueryError';
import { NotificationsPanel } from '../components/users/NotificationsPanel';
import { USER_FUNCAO_LABELS } from '../constants/enums';

export function UsersPage() {
  const { data, isLoading, isError, error, refetch } = useUsers();
  const { create, update, remove } = useUserMutations();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState<AppUser | null>(null);

  const users = data?.users ?? [];

  function handleSubmit(input: CreateUserInput) {
    const onSuccess = () => setModalOpen(false);
    if (editing) {
      const { email, username, ...patch } = input;
      const cleanPatch = patch.password ? patch : { name: patch.name, role: patch.role, funcao: patch.funcao };
      update.mutate({ id: editing.id, input: cleanPatch }, { onSuccess });
    } else {
      create.mutate(input, { onSuccess });
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Usuários</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700">
          + Novo usuário
        </button>
      </div>

      <NotificationsPanel />

      {isError ? (
        <QueryError error={error} onRetry={refetch} />
      ) : isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{u.name} {!u.active && <span className="text-xs text-slate-400 dark:text-slate-500">(inativo)</span>}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">@{u.username} · {u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {u.funcao && <Badge label={USER_FUNCAO_LABELS[u.funcao] ?? u.funcao} colorClass="bg-slate-100 text-slate-600 dark:text-slate-300" />}
                <Badge label={u.role === 'admin' ? 'Administrador' : 'Equipe / Agência'} colorClass={u.role === 'admin' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 dark:text-slate-200'} />
                <button onClick={() => { setEditing(u); setModalOpen(true); }} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100">Editar</button>
                <button
                  onClick={() => update.mutate({ id: u.id, input: { active: !u.active } })}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
                >
                  {u.active ? 'Desativar' : 'Ativar'}
                </button>
                <button onClick={() => setDeleting(u)} className="text-xs text-red-500 hover:text-red-700">Excluir</button>
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum usuário cadastrado.</p>}
        </div>
      )}

      <UserFormModal
        open={modalOpen}
        user={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        saving={create.isPending || update.isPending}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir usuário?"
        description={deleting ? `O acesso de "${deleting.name}" será removido permanentemente.` : undefined}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
