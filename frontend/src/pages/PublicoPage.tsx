import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { getPublicEmpreendimento, PublicEmpreendimento, PublicTarefa } from '../api/public';
import { EMPREENDIMENTO_FASE_LABELS, EMPREENDIMENTO_TIPO_LABELS, TAREFA_CATEGORIA_LABELS } from '../constants/enums';
import { Badge } from '../components/common/Badge';
import { formatDateBR } from '../lib/formatDate';

const STATUS_COLUMNS = [
  { key: 'a_fazer', title: 'A fazer' },
  { key: 'em_andamento', title: 'Em andamento' },
  { key: 'concluido', title: 'Concluído' },
] as const;

export function PublicoPage() {
  const { token } = useParams<{ token: string }>();
  const [empreendimento, setEmpreendimento] = useState<PublicEmpreendimento | null>(null);
  const [tarefas, setTarefas] = useState<PublicTarefa[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getPublicEmpreendimento(token)
      .then(({ empreendimento, tarefas }) => { setEmpreendimento(empreendimento); setTarefas(tarefas); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Carregando...</div>;
  }

  if (error || !empreendimento) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-slate-50 p-4 text-center">
        <AlertTriangle className="text-red-500" />
        <p className="text-sm text-slate-600">{error ?? 'Empreendimento não encontrado'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <img src="/icons/icon-192.png" alt="Vanessa MKT" className="h-9 w-9 rounded-lg" />
          <div>
            <p className="text-xs text-slate-400">Acompanhamento de marketing</p>
            <h1 className="text-lg font-semibold text-slate-800">{empreendimento.nome}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        <div className="mb-4 flex flex-wrap gap-2 text-sm text-slate-600">
          <Badge label={EMPREENDIMENTO_TIPO_LABELS[empreendimento.tipo] ?? empreendimento.tipo} colorClass="bg-slate-100 text-slate-700" />
          <Badge label={EMPREENDIMENTO_FASE_LABELS[empreendimento.fase_atual] ?? empreendimento.fase_atual} colorClass="bg-brand-100 text-brand-700" />
        </div>

        <div className="flex flex-col gap-4">
          {STATUS_COLUMNS.map((col) => {
            const items = tarefas.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="mb-2 text-sm font-semibold text-slate-700">{col.title} <span className="text-slate-400">({items.length})</span></h2>
                {items.length === 0 && <p className="text-xs text-slate-400">Nenhuma tarefa</p>}
                <ul className="flex flex-col gap-2">
                  {items.map((t) => (
                    <li key={t.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <p className="font-medium text-slate-800">{t.titulo}</p>
                      <p className="text-xs text-slate-500">{TAREFA_CATEGORIA_LABELS[t.categoria] ?? t.categoria}{t.prazo && ` · Prazo: ${formatDateBR(t.prazo)}`}</p>
                      {t.atrasado && <Badge label="Atrasado" colorClass="bg-red-100 text-red-700" />}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">Link de acompanhamento somente leitura · Vanessa MKT</p>
      </main>
    </div>
  );
}
