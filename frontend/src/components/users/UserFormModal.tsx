import { FormEvent, useEffect, useState } from 'react';
import { AppUser, CreateUserInput } from '../../api/users';
import { FieldError } from '../common/FieldError';
import { inputClass } from '../../lib/formStyles';
import { USER_FUNCAO_LABELS } from '../../constants/enums';

interface UserFormModalProps {
  open: boolean;
  user: AppUser | null;
  onClose: () => void;
  onSubmit: (input: CreateUserInput) => void;
  saving: boolean;
}

const EMPTY: CreateUserInput = { username: '', email: '', name: '', password: '', role: 'member', funcao: null };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9._-]+$/;

type Errors = Partial<Record<'name' | 'username' | 'email' | 'password', string>>;

function validate(form: CreateUserInput, isEditing: boolean): Errors {
  const errors: Errors = {};
  if (!form.name.trim()) errors.name = 'Informe o nome';
  if (!form.username.trim()) errors.username = 'Informe o usuário';
  else if (form.username.trim().length < 3) errors.username = 'Use ao menos 3 caracteres';
  else if (!USERNAME_RE.test(form.username.trim())) errors.username = 'Use apenas letras, números, ponto, hífen ou underline';
  if (!form.email.trim()) errors.email = 'Informe o e-mail';
  else if (!EMAIL_RE.test(form.email)) errors.email = 'E-mail inválido';
  if (!isEditing && form.password.length < 6) errors.password = 'Use ao menos 6 caracteres';
  else if (form.password && form.password.length < 6) errors.password = 'Use ao menos 6 caracteres';
  return errors;
}

export function UserFormModal({ open, user, onClose, onSubmit, saving }: UserFormModalProps) {
  const [form, setForm] = useState<CreateUserInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    setErrors({});
    if (user) {
      setForm({ username: user.username, email: user.email, name: user.name, role: user.role, funcao: user.funcao, password: '' });
    } else {
      setForm(EMPTY);
    }
  }, [user, open]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(form, !!user);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{user ? 'Editar usuário' : 'Novo usuário'}</h2>

        <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200">Nome</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass(!!errors.name)} />
        <FieldError message={errors.name} />

        <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200">Usuário (login)</label>
        <input type="text" autoCapitalize="none" autoCorrect="off" disabled={!!user} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={`${inputClass(!!errors.username)} disabled:bg-slate-100 disabled:text-slate-400 dark:text-slate-500`} />
        <FieldError message={errors.username} />

        <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200">E-mail</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass(!!errors.email)} />
        <FieldError message={errors.email} />

        <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200">Papel</label>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })} className={inputClass()}>
          <option value="member">Equipe / Agência</option>
          <option value="admin">Administrador</option>
        </select>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Controla o acesso: administrador gerencia usuários e pode excluir empreendimentos.</p>

        <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200">Função na equipe</label>
        <select value={form.funcao ?? ''} onChange={(e) => setForm({ ...form, funcao: e.target.value || null })} className={inputClass()}>
          <option value="">Não informado</option>
          {Object.entries(USER_FUNCAO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>

        <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200">{user ? 'Nova senha (opcional)' : 'Senha'}</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass(!!errors.password)} />
        <FieldError message={errors.password} />

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
