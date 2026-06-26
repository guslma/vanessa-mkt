import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createComentario, deleteComentario, getComentarios } from '../api/tarefas';
import { errorMessage } from '../lib/errorMessage';

export function useComentarios(tarefaId: string | undefined) {
  return useQuery({
    queryKey: ['tarefa-comentarios', tarefaId],
    queryFn: () => getComentarios(tarefaId!),
    enabled: !!tarefaId,
  });
}

export function useComentarioMutations(tarefaId: string | undefined) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['tarefa-comentarios', tarefaId] });

  const create = useMutation({
    mutationFn: (texto: string) => createComentario(tarefaId!, texto),
    onSuccess: invalidate,
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível enviar o comentário')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteComentario(id),
    onSuccess: invalidate,
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível excluir o comentário')),
  });

  return { create, remove };
}
