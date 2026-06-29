import { Building2 } from 'lucide-react';
import { KanbanCard as KanbanCardType } from '../../api/tarefas';
import { TAREFA_CATEGORIA_LABELS, TAREFA_STATUS_LABELS } from '../../constants/enums';
import { getDueStatus } from '../../lib/dueStatus';
import { toDateOnly } from '../../lib/formatDate';
import { Avatar } from '../common/Avatar';

function formatPrazo(prazo: string | null) {
  if (!prazo) return '';
  const [, month, day] = toDateOnly(prazo).split('-');
  return `${day}/${month}`;
}

interface KanbanCardProps {
  card: KanbanCardType;
  onStatusChange: (id: string, status: string) => void;
}

export function KanbanCard({ card, onStatusChange }: KanbanCardProps) {
  const due = getDueStatus({ status: card.status, prazo: card.prazo });
  const borderClass = due === 'vencendo' ? 'border-l-4 border-l-amber-400' : '';

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${borderClass}`}>
      <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
        <Building2 size={13} className="text-brand-600" />
        {card.empreendimento_nome}
      </p>
      <p className="mt-1 text-xs font-medium text-brand-700">{TAREFA_CATEGORIA_LABELS[card.categoria] ?? card.categoria}</p>
      <p className="mt-1.5 text-sm text-slate-700">
        {card.titulo}
        {card.prazo && (
          <span className={due === 'vencendo' ? 'font-medium text-amber-600' : 'text-slate-400'}> · {formatPrazo(card.prazo)}</span>
        )}
      </p>
      {card.responsavel && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
          <Avatar name={card.responsavel} size="xs" /> {card.responsavel}
        </p>
      )}

      <select
        value={card.status}
        onChange={(e) => onStatusChange(card.id, e.target.value)}
        className="mt-2.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-base md:text-xs font-medium text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
      >
        {Object.entries(TAREFA_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
}
