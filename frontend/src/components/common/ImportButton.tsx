import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { importarPlanilha } from '../../api/importacao';
import { errorMessage } from '../../lib/errorMessage';

export function ImportButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const qc = useQueryClient();

  async function handleFile(file: File) {
    setImporting(true);
    try {
      const { resumo } = await importarPlanilha(file);
      resumo.avisos.forEach((aviso) => console.warn(aviso));
      toast.success(
        `Importação concluída: ${resumo.empreendimentosInseridos} empreendimento(s) e ${resumo.tarefasInseridas} tarefa(s) adicionadas`,
      );
      if (resumo.empreendimentosCriadosAutomaticamente > 0) {
        toast.info(
          `${resumo.empreendimentosCriadosAutomaticamente} empreendimento(s) foram criados automaticamente a partir da aba Tarefas — revise tipo e fase em "Empreendimentos".`,
        );
      }
      qc.invalidateQueries({ queryKey: ['empreendimentos'] });
      qc.invalidateQueries({ queryKey: ['tarefas'] });
      qc.invalidateQueries({ queryKey: ['kanban'] });
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
    } catch (err) {
      toast.error(errorMessage(err, 'Não foi possível importar a planilha'));
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={importing}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        <Upload size={14} /> {importing ? 'Importando...' : 'Importar'}
      </button>
    </>
  );
}
