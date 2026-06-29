import { FormEvent, useState } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useComentarioMutations, useComentarios } from '../../hooks/useComentarios';
import { useAuth } from '../../context/AuthContext';

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function TarefaComentarios({ tarefaId }: { tarefaId: string }) {
  const { user } = useAuth();
  const { data, isLoading } = useComentarios(tarefaId);
  const { create, remove } = useComentarioMutations(tarefaId);
  const [texto, setTexto] = useState('');

  const comentarios = data?.comentarios ?? [];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    create.mutate(texto.trim(), { onSuccess: () => setTexto('') });
  }

  return (
    <div className="mt-5 border-t border-slate-100 dark:border-slate-700/60 pt-4">
      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
        <MessageSquare size={14} /> Comentários
      </div>

      {isLoading && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Carregando...</p>}
      {!isLoading && comentarios.length === 0 && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Nenhum comentário ainda.</p>}

      <ul className="mt-2 flex max-h-48 flex-col gap-2 overflow-y-auto">
        {comentarios.map((c) => {
          const canDelete = user?.role === 'admin' || user?.id === c.user_id;
          return (
            <li key={c.id} className="rounded-lg bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="text-slate-700 dark:text-slate-200">{c.texto}</p>
                {canDelete && (
                  <button type="button" onClick={() => remove.mutate(c.id)} className="shrink-0 text-slate-400 dark:text-slate-500 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{c.user_name ?? 'Usuário removido'} · {formatDateTime(c.created_at)}</p>
            </li>
          );
        })}
      </ul>

      <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escrever um comentário..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-base md:text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={create.isPending || !texto.trim()}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
