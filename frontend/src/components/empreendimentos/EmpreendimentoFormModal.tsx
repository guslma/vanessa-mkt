import { FormEvent, useEffect, useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Empreendimento, EmpreendimentoInput } from '../../api/empreendimentos';
import { EMPREENDIMENTO_FASE_LABELS, EMPREENDIMENTO_TIPO_LABELS } from '../../constants/enums';
import { FieldError } from '../common/FieldError';
import { inputClass } from '../../lib/formStyles';
import { toDateOnly } from '../../lib/formatDate';
import { useAuth } from '../../context/AuthContext';

interface EmpreendimentoFormModalProps {
  open: boolean;
  empreendimento: Empreendimento | null;
  onClose: () => void;
  onSubmit: (input: EmpreendimentoInput) => void;
  onRegenerateToken: () => void;
  regenerating: boolean;
  saving: boolean;
}

const EMPTY: EmpreendimentoInput = {
  nome: '',
  tipo: 'residencial',
  fase_atual: 'pre_lancamento',
  data_lancamento: null,
  responsavel_comercial: '',
  link_materiais: '',
  observacoes: '',
  endereco: '',
};

type Errors = Partial<Record<'nome' | 'link_materiais', string>>;

function validate(form: EmpreendimentoInput): Errors {
  const errors: Errors = {};
  if (!form.nome.trim()) errors.nome = 'Informe o nome do empreendimento';
  if (form.link_materiais && !/^https?:\/\//i.test(form.link_materiais)) {
    errors.link_materiais = 'Use um link completo (começando com http:// ou https://)';
  }
  return errors;
}

export function EmpreendimentoFormModal({ open, empreendimento, onClose, onSubmit, onRegenerateToken, regenerating, saving }: EmpreendimentoFormModalProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<EmpreendimentoInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    setErrors({});
    if (empreendimento) {
      const { id, latitude, longitude, created_at, updated_at, ...rest } = empreendimento as any;
      setForm({ ...rest, data_lancamento: toDateOnly(rest.data_lancamento) || null });
    } else {
      setForm(EMPTY);
    }
  }, [empreendimento, open]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{empreendimento ? 'Editar empreendimento' : 'Novo empreendimento'}</h2>

        <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200">Nome</label>
        <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={inputClass(!!errors.nome)} />
        <FieldError message={errors.nome} />

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as any })} className={inputClass()}>
              {Object.entries(EMPREENDIMENTO_TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Fase Atual</label>
            <select value={form.fase_atual} onChange={(e) => setForm({ ...form, fase_atual: e.target.value as any })} className={inputClass()}>
              {Object.entries(EMPREENDIMENTO_FASE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Data de Lançamento</label>
            <input type="date" value={form.data_lancamento ?? ''} onChange={(e) => setForm({ ...form, data_lancamento: e.target.value || null })} className={inputClass()} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Responsável Comercial</label>
            <input value={form.responsavel_comercial ?? ''} onChange={(e) => setForm({ ...form, responsavel_comercial: e.target.value })} className={inputClass()} />
          </div>
        </div>

        <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200">Endereço</label>
        <input
          value={form.endereco ?? ''}
          onChange={(e) => setForm({ ...form, endereco: e.target.value })}
          className={inputClass()}
          placeholder="Rua, número, bairro, cidade"
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Opcional — preenchendo, o empreendimento aparece automaticamente no mapa.</p>

        <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200">Link / Pasta de Materiais</label>
        <input value={form.link_materiais ?? ''} onChange={(e) => setForm({ ...form, link_materiais: e.target.value })} className={inputClass(!!errors.link_materiais)} placeholder="https://..." />
        <FieldError message={errors.link_materiais} />

        <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200">Observações</label>
        <textarea value={form.observacoes ?? ''} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} className={inputClass()} rows={2} />

        {empreendimento && (
          <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 p-3">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Link público (somente leitura, sem login)</p>
            <div className="mt-1.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/publico/${empreendimento.public_token}`);
                  toast.success('Link público copiado');
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
              >
                <Copy size={12} /> Copiar link
              </button>
              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={onRegenerateToken}
                  disabled={regenerating}
                  title="Gera um novo link e invalida o anterior"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  <RefreshCw size={12} /> Renovar
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
