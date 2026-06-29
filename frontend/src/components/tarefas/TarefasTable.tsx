import { Copy } from 'lucide-react';
import { Tarefa } from '../../api/tarefas';
import { Badge } from '../common/Badge';
import { PRIORIDADE_COLOR, STATUS_COLOR, TAREFA_CATEGORIA_LABELS, TAREFA_PRIORIDADE_LABELS, TAREFA_STATUS_LABELS } from '../../constants/enums';
import { getDueStatus } from '../../lib/dueStatus';
import { formatDateBR } from '../../lib/formatDate';
import { Avatar } from '../common/Avatar';

interface TarefasTableProps {
  tarefas: Tarefa[];
  onEdit: (tarefa: Tarefa) => void;
  onDuplicate: (tarefa: Tarefa) => void;
  onDelete: (tarefa: Tarefa) => void;
}

function StatusBadges({ tarefa }: { tarefa: Tarefa }) {
  const due = getDueStatus(tarefa);
  return (
    <div className="flex flex-wrap gap-1">
      <Badge label={TAREFA_STATUS_LABELS[tarefa.status] ?? tarefa.status} colorClass={STATUS_COLOR[tarefa.status]} />
      {due === 'atrasado' && <Badge label="Atrasado" colorClass="bg-red-100 text-red-700" />}
      {due === 'vencendo' && <Badge label="Vence em breve" colorClass="bg-amber-100 text-amber-700" />}
    </div>
  );
}

function PrazoLabel({ tarefa }: { tarefa: Tarefa }) {
  if (!tarefa.prazo) return null;
  const due = getDueStatus(tarefa);
  const colorClass = due === 'atrasado' ? 'text-red-600 font-medium' : due === 'vencendo' ? 'text-amber-600 font-medium' : 'text-slate-500';
  return <span className={`text-xs ${colorClass}`}>Prazo: {formatDateBR(tarefa.prazo)}</span>;
}

export function TarefasTable({ tarefas, onEdit, onDuplicate, onDelete }: TarefasTableProps) {
  if (tarefas.length === 0) {
    return <p className="text-sm text-slate-400">Nenhuma tarefa encontrada.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {tarefas.map((t) => (
        <div key={t.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">{t.empreendimento_nome}</p>
            <p className="text-sm text-slate-700">{t.titulo}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              {TAREFA_CATEGORIA_LABELS[t.categoria] ?? t.categoria}
              {t.responsavel && <>· <Avatar name={t.responsavel} size="xs" /> {t.responsavel}</>}
              {t.prazo && <>· <PrazoLabel tarefa={t} /></>}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge label={TAREFA_PRIORIDADE_LABELS[t.prioridade] ?? t.prioridade} colorClass={PRIORIDADE_COLOR[t.prioridade]} />
            <StatusBadges tarefa={t} />
            <button onClick={() => onEdit(t)} className="text-xs text-slate-500 hover:text-slate-800">Editar</button>
            <button onClick={() => onDuplicate(t)} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-700">
              <Copy size={12} /> Duplicar
            </button>
            <button onClick={() => onDelete(t)} className="text-xs text-red-500 hover:text-red-700">Excluir</button>
          </div>
        </div>
      ))}
    </div>
  );
}
