import { useState } from 'react';
import { FileDown, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { exportTarefas, TarefaFilters } from '../../api/tarefas';

export function ExportMenu({ filters }: { filters: TarefaFilters }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleExport(format: 'xlsx' | 'pdf') {
    setOpen(false);
    setExporting(true);
    try {
      await exportTarefas(format, filters);
    } catch {
      toast.error('Não foi possível gerar o arquivo de exportação');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={exporting}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-50"
      >
        <FileDown size={14} /> {exporting ? 'Gerando...' : 'Exportar'}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shadow-lg">
            <button onClick={() => handleExport('xlsx')} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60">
              <FileSpreadsheet size={14} className="text-emerald-600" /> Excel (.xlsx)
            </button>
            <button onClick={() => handleExport('pdf')} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60">
              <FileText size={14} className="text-red-600" /> PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
