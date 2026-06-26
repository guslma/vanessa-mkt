import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CreateUserInput, UpdateUserInput, createUser, deleteUser, listUsers, updateUser } from '../api/users';
import { errorMessage } from '../lib/errorMessage';

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: listUsers });
}

export function useUserMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] });

  const create = useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => { invalidate(); toast.success('Usuário criado'); },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível criar o usuário')),
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => updateUser(id, input),
    onSuccess: () => { invalidate(); toast.success('Usuário atualizado'); },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível salvar o usuário')),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => { invalidate(); toast.success('Usuário excluído'); },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível excluir o usuário')),
  });

  return { create, update, remove };
}
