import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Anexo, deleteAnexo, downloadAnexo, getAnexos, uploadAnexo } from '../api/tarefas';
import { errorMessage } from '../lib/errorMessage';

export function useAnexos(tarefaId: string | undefined) {
  return useQuery({
    queryKey: ['tarefa-anexos', tarefaId],
    queryFn: () => getAnexos(tarefaId!),
    enabled: !!tarefaId,
  });
}

export function useAnexoMutations(tarefaId: string | undefined) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['tarefa-anexos', tarefaId] });
    qc.invalidateQueries({ queryKey: ['tarefa-eventos', tarefaId] });
  };

  const upload = useMutation({
    mutationFn: (file: File) => uploadAnexo(tarefaId!, file),
    onSuccess: () => { invalidate(); toast.success('Arquivo enviado'); },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível enviar o arquivo')),
  });

  const download = useMutation({
    mutationFn: (anexo: Anexo) => downloadAnexo(anexo),
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível baixar o arquivo')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAnexo(id),
    onSuccess: () => { invalidate(); toast.success('Arquivo excluído'); },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível excluir o arquivo')),
  });

  return { upload, download, remove };
}
