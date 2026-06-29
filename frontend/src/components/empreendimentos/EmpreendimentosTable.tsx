import { Link } from 'react-router-dom';
import { Share2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Empreendimento } from '../../api/empreendimentos';
import { Badge } from '../common/Badge';
import { EMPREENDIMENTO_FASE_LABELS, EMPREENDIMENTO_TIPO_LABELS } from '../../constants/enums';

interface EmpreendimentosTableProps {
  empreendimentos: Empreendimento[];
  onEdit: (e: Empreendimento) => void;
  onDelete: (e: Empreendimento) => void;
}

function copyPublicLink(token: string) {
  const url = `${window.location.origin}/publico/${token}`;
  navigator.clipboard.writeText(url).then(
    () => toast.success('Link público copiado'),
    () => toast.error('Não foi possível copiar o link'),
  );
}

export function EmpreendimentosTable({ empreendimentos, onEdit, onDelete }: EmpreendimentosTableProps) {
  if (empreendimentos.length === 0) {
    return <p className="text-sm text-slate-400">Nenhum empreendimento cadastrado.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {empreendimentos.map((e) => (
        <div key={e.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to={`/tarefas?empreendimento_id=${e.id}`}
              className="text-sm font-semibold text-slate-800 hover:text-brand-700 hover:underline"
              title="Ver tarefas deste empreendimento"
            >
              {e.nome}
            </Link>
            <p className="mt-0.5 text-xs text-slate-500">
              {e.responsavel_comercial ?? 'Sem responsável comercial'}
              {e.link_materiais && (
                <a href={e.link_materiais} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 text-blue-600 hover:underline">
                  <ExternalLink size={11} /> Materiais
                </a>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge label={EMPREENDIMENTO_TIPO_LABELS[e.tipo] ?? e.tipo} colorClass="bg-slate-100 text-slate-600" />
            <Badge label={EMPREENDIMENTO_FASE_LABELS[e.fase_atual] ?? e.fase_atual} colorClass="bg-brand-100 text-brand-700" />
            <button onClick={() => copyPublicLink(e.public_token)} title="Copiar link público" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-700">
              <Share2 size={12} /> Link
            </button>
            <button onClick={() => onEdit(e)} className="text-xs text-slate-500 hover:text-slate-800">Editar</button>
            <button onClick={() => onDelete(e)} className="text-xs text-red-500 hover:text-red-700">Excluir</button>
          </div>
        </div>
      ))}
    </div>
  );
}
