import { useRef } from 'react';
import { Download, Paperclip, Trash2, Upload } from 'lucide-react';
import { useAnexoMutations, useAnexos } from '../../hooks/useAnexos';

function formatSize(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TarefaAnexos({ tarefaId }: { tarefaId: string }) {
  const { data, isLoading } = useAnexos(tarefaId);
  const { upload, download, remove } = useAnexoMutations(tarefaId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const anexos = data?.anexos ?? [];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload.mutate(file);
    e.target.value = '';
  }

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
          <Paperclip size={14} /> Anexos
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={upload.isPending}
          className="flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800 disabled:opacity-50"
        >
          <Upload size={13} /> {upload.isPending ? 'Enviando...' : 'Adicionar arquivo'}
        </button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      </div>

      {isLoading && <p className="mt-2 text-xs text-slate-400">Carregando...</p>}
      {!isLoading && anexos.length === 0 && <p className="mt-2 text-xs text-slate-400">Nenhum arquivo anexado ainda.</p>}

      <ul className="mt-2 flex flex-col gap-1.5">
        {anexos.map((anexo) => (
          <li key={anexo.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-2.5 py-1.5 text-xs">
            <span className="truncate text-slate-700">{anexo.nome_original} <span className="text-slate-400">({formatSize(anexo.tamanho_bytes)})</span></span>
            <span className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => download.mutate(anexo)} className="text-slate-400 hover:text-brand-700">
                <Download size={14} />
              </button>
              <button type="button" onClick={() => remove.mutate(anexo.id)} className="text-slate-400 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
