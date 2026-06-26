import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  KanbanBoard, TarefaFilters, TarefaInput, createTarefa, deleteTarefa, getEventos, getKanban, listTarefas,
  updateTarefa, updateTarefaStatus,
} from '../api/tarefas';
import { errorMessage } from '../lib/errorMessage';

export function useTarefas(filters: TarefaFilters) {
  return useQuery({ queryKey: ['tarefas', filters], queryFn: () => listTarefas(filters) });
}

export function useKanban() {
  return useQuery<KanbanBoard>({ queryKey: ['kanban'], queryFn: getKanban, refetchInterval: 30_000 });
}

export function useTarefaEventos(id: string | undefined) {
  return useQuery({
    queryKey: ['tarefa-eventos', id],
    queryFn: () => getEventos(id!),
    enabled: !!id,
  });
}

export function useTarefaMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['tarefas'] });
    qc.invalidateQueries({ queryKey: ['kanban'] });
    qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
    qc.invalidateQueries({ queryKey: ['tarefa-eventos'] });
  };

  const create = useMutation({
    mutationFn: (input: TarefaInput) => createTarefa(input),
    onSuccess: () => { invalidate(); toast.success('Tarefa criada'); },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível criar a tarefa')),
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: TarefaInput }) => updateTarefa(id, input),
    onSuccess: () => { invalidate(); toast.success('Tarefa atualizada'); },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível salvar a tarefa')),
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateTarefaStatus(id, status),
    onSuccess: invalidate,
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível mudar o status')),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteTarefa(id),
    onSuccess: () => { invalidate(); toast.success('Tarefa excluída'); },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível excluir a tarefa')),
  });

  return { create, update, updateStatus, remove };
}
