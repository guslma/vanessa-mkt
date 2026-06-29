import { Empreendimento } from '../../api/empreendimentos';
import { TarefaFilters } from '../../api/tarefas';
import { TAREFA_CATEGORIA_LABELS, TAREFA_PRIORIDADE_LABELS, TAREFA_STATUS_LABELS } from '../../constants/enums';

interface TarefasFiltersProps {
  filters: TarefaFilters;
  onChange: (filters: TarefaFilters) => void;
  empreendimentos: Empreendimento[];
}

export function TarefasFiltersBar({ filters, onChange, empreendimentos }: TarefasFiltersProps) {
  function set<K extends keyof TarefaFilters>(key: K, value: TarefaFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-6">
      <input
        placeholder="Buscar..."
        value={filters.search ?? ''}
        onChange={(e) => set('search', e.target.value)}
        className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-base text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 md:col-span-1 md:text-sm"
      />
      <select value={filters.empreendimento_id ?? ''} onChange={(e) => set('empreendimento_id', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-base md:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
        <option value="">Empreendimento</option>
        {empreendimentos.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
      </select>
      <select value={filters.categoria ?? ''} onChange={(e) => set('categoria', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-base md:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
        <option value="">Categoria</option>
        {Object.entries(TAREFA_CATEGORIA_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <select value={filters.status ?? ''} onChange={(e) => set('status', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-base md:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
        <option value="">Status</option>
        {Object.entries(TAREFA_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <select value={filters.prioridade ?? ''} onChange={(e) => set('prioridade', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-base md:text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
        <option value="">Prioridade</option>
        {Object.entries(TAREFA_PRIORIDADE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <label className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
        <input
          type="checkbox"
          checked={!!filters.atrasado}
          onChange={(e) => set('atrasado', e.target.checked || undefined)}
        />
        Atrasadas
      </label>
    </div>
  );
}
