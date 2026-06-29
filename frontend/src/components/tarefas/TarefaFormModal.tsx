import { FormEvent, useEffect, useState } from 'react';
import { Empreendimento } from '../../api/empreendimentos';
import { Tarefa, TarefaInput } from '../../api/tarefas';
import { TAREFA_CATEGORIA_LABELS, TAREFA_PRIORIDADE_LABELS, TAREFA_RECORRENCIA_LABELS, TAREFA_STATUS_LABELS } from '../../constants/enums';
import { FieldError } from '../common/FieldError';
import { inputClass } from '../../lib/formStyles';
import { toDateOnly } from '../../lib/formatDate';
import { TarefaHistory } from './TarefaHistory';
import { TarefaAnexos } from './TarefaAnexos';
import { TarefaComentarios } from './TarefaComentarios';

interface TarefaFormModalProps {
  open: boolean;
  tarefa: Tarefa | null;
  prefill?: TarefaInput | null;
  empreendimentos: Empreendimento[];
  onClose: () => void;
  onSubmit: (input: TarefaInput) => void;
  saving: boolean;
}

const EMPTY: TarefaInput = {
  empreendimento_id: '',
  categoria: 'outros',
  titulo: '',
  responsavel: '',
  prioridade: 'media',
  status: 'a_fazer',
  data_inicio: null,
  prazo: null,
  data_conclusao: null,
  observacoes: '',
  recorrencia: 'nenhuma',
};

type Errors = Partial<Record<'empreendimento_id' | 'titulo' | 'prazo', string>>;

function validate(form: TarefaInput): Errors {
  const errors: Errors = {};
  if (!form.empreendimento_id) errors.empreendimento_id = 'Selecione um empreendimento';
  if (!form.titulo.trim()) errors.titulo = 'Descreva a tarefa';
  if (form.data_inicio && form.prazo && form.prazo < form.data_inicio) {
    errors.prazo = 'O prazo não pode ser antes da data de início';
  }
  return errors;
}

export function TarefaFormModal({ open, tarefa, prefill, empreendimentos, onClose, onSubmit, saving }: TarefaFormModalProps) {
  const [form, setForm] = useState<TarefaInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    setErrors({});
    if (tarefa) {
      const { id, empreendimento_nome, atrasado, created_at, updated_at, ...rest } = tarefa as any;
      setForm({
        ...rest,
        data_inicio: toDateOnly(rest.data_inicio) || null,
        prazo: toDateOnly(rest.prazo) || null,
        data_conclusao: toDateOnly(rest.data_conclusao) || null,
      });
    } else if (prefill) {
      setForm(prefill);
    } else {
      setForm({ ...EMPTY, empreendimento_id: empreendimentos[0]?.id ?? '' });
    }
  }, [tarefa, prefill, open, empreendimentos]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-800">{tarefa ? 'Editar tarefa' : prefill ? 'Duplicar tarefa' : 'Nova tarefa'}</h2>

        <label className="mt-3 block text-sm font-medium text-slate-700">Empreendimento</label>
        <select value={form.empreendimento_id} onChange={(e) => setForm({ ...form, empreendimento_id: e.target.value })} className={inputClass(!!errors.empreendimento_id)}>
          <option value="">Selecione...</option>
          {empreendimentos.map((emp) => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
        </select>
        <FieldError message={errors.empreendimento_id} />

        <label className="mt-3 block text-sm font-medium text-slate-700">Tarefa / Atividade</label>
        <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className={inputClass(!!errors.titulo)} />
        <FieldError message={errors.titulo} />

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Categoria</label>
            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as any })} className={inputClass()}>
              {Object.entries(TAREFA_CATEGORIA_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Responsável</label>
            <input value={form.responsavel ?? ''} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} className={inputClass()} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Prioridade</label>
            <select value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value as any })} className={inputClass()}>
              {Object.entries(TAREFA_PRIORIDADE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className={inputClass()}>
              {Object.entries(TAREFA_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Data Início</label>
            <input type="date" value={form.data_inicio ?? ''} onChange={(e) => setForm({ ...form, data_inicio: e.target.value || null })} className={inputClass()} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Prazo</label>
            <input type="date" value={form.prazo ?? ''} onChange={(e) => setForm({ ...form, prazo: e.target.value || null })} className={inputClass(!!errors.prazo)} />
            <FieldError message={errors.prazo} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Data Conclusão</label>
            <input type="date" value={form.data_conclusao ?? ''} onChange={(e) => setForm({ ...form, data_conclusao: e.target.value || null })} className={inputClass()} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Repetir</label>
            <select value={form.recorrencia} onChange={(e) => setForm({ ...form, recorrencia: e.target.value as any })} className={inputClass()}>
              {Object.entries(TAREFA_RECORRENCIA_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
        {form.recorrencia !== 'nenhuma' && (
          <p className="mt-1.5 text-xs text-slate-500">Ao marcar essa tarefa como concluída, uma nova cópia é criada automaticamente com o prazo avançado.</p>
        )}

        <label className="mt-3 block text-sm font-medium text-slate-700">Observações</label>
        <textarea value={form.observacoes ?? ''} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} className={inputClass()} rows={2} />

        {tarefa && <TarefaComentarios tarefaId={tarefa.id} />}
        {tarefa && <TarefaAnexos tarefaId={tarefa.id} />}
        {tarefa && <TarefaHistory tarefaId={tarefa.id} />}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
