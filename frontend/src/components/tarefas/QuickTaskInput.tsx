import { FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';
import { Empreendimento } from '../../api/empreendimentos';
import { TarefaInput } from '../../api/tarefas';

interface QuickTaskInputProps {
  empreendimentos: Empreendimento[];
  defaultEmpreendimentoId?: string;
  onCreate: (input: TarefaInput) => void;
  creating: boolean;
}

export function QuickTaskInput({ empreendimentos, defaultEmpreendimentoId, onCreate, creating }: QuickTaskInputProps) {
  const [titulo, setTitulo] = useState('');
  const [empreendimentoId, setEmpreendimentoId] = useState(defaultEmpreendimentoId ?? empreendimentos[0]?.id ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !empreendimentoId) return;
    onCreate({
      empreendimento_id: empreendimentoId,
      categoria: 'outros',
      titulo: titulo.trim(),
      responsavel: '',
      prioridade: 'media',
      status: 'a_fazer',
      data_inicio: null,
      prazo: null,
      data_conclusao: null,
      observacoes: '',
      recorrencia: 'nenhuma',
    });
    setTitulo('');
  }

  if (empreendimentos.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} className="mb-3 flex flex-col gap-2 sm:flex-row">
      <select
        value={empreendimentoId}
        onChange={(e) => setEmpreendimentoId(e.target.value)}
        className="w-full shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 sm:w-40"
      >
        {empreendimentos.map((emp) => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
      </select>
      <div className="flex gap-2">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Adicionar tarefa rápida e apertar Enter..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={creating || !titulo.trim()}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          <Plus size={15} />
        </button>
      </div>
    </form>
  );
}
