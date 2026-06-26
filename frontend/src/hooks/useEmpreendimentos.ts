import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  EmpreendimentoInput, createEmpreendimento, deleteEmpreendimento, listEmpreendimentos, regenerateToken, updateEmpreendimento,
} from '../api/empreendimentos';
import { errorMessage } from '../lib/errorMessage';

export function useEmpreendimentos() {
  return useQuery({ queryKey: ['empreendimentos'], queryFn: listEmpreendimentos });
}

export function useEmpreendimentoMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['empreendimentos'] });

  const create = useMutation({
    mutationFn: (input: EmpreendimentoInput) => createEmpreendimento(input),
    onSuccess: () => { invalidate(); toast.success('Empreendimento criado'); },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível criar o empreendimento')),
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: EmpreendimentoInput }) => updateEmpreendimento(id, input),
    onSuccess: () => { invalidate(); toast.success('Empreendimento atualizado'); },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível salvar o empreendimento')),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteEmpreendimento(id),
    onSuccess: () => { invalidate(); toast.success('Empreendimento excluído'); },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível excluir o empreendimento')),
  });

  const regenerate = useMutation({
    mutationFn: (id: string) => regenerateToken(id),
    onSuccess: () => { invalidate(); toast.success('Link público renovado — o link antigo deixou de funcionar'); },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível renovar o link')),
  });

  return { create, update, remove, regenerate };
}
