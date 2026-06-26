import { KanbanBoard as KanbanBoardType } from '../../api/tarefas';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  board: KanbanBoardType;
  onStatusChange: (id: string, status: string) => void;
}

const BASE_COLUMNS = [
  { key: 'a_fazer', title: 'A FAZER', accentClass: 'bg-slate-400' },
  { key: 'em_andamento', title: 'EM ANDAMENTO', accentClass: 'bg-blue-500' },
  { key: 'concluido', title: 'CONCLUÍDO', accentClass: 'bg-emerald-500' },
  { key: 'atrasado', title: 'ATRASADO', accentClass: 'bg-red-500' },
] as const;

function getOrderedColumns(board: KanbanBoardType) {
  // Quando há tarefas atrasadas, a coluna "Atrasado" passa pra frente da
  // "A fazer" pra chamar mais atenção — sem atraso, mantém a ordem normal.
  if (board.atrasado.count === 0) return BASE_COLUMNS;
  const atrasado = BASE_COLUMNS.find((col) => col.key === 'atrasado')!;
  const rest = BASE_COLUMNS.filter((col) => col.key !== 'atrasado');
  return [atrasado, ...rest];
}

export function KanbanBoard({ board, onStatusChange }: KanbanBoardProps) {
  const columns = getOrderedColumns(board);

  return (
    <div>
      {/* Mobile: colunas empilhadas como cards, sem slider/abas horizontais */}
      <div className="flex flex-col gap-3 md:hidden">
        {columns.map((col) => (
          <KanbanColumn key={col.key} title={col.title} accentClass={col.accentClass} items={board[col.key].items} onStatusChange={onStatusChange} />
        ))}
      </div>

      {/* Desktop/tablet: grid que se ajusta à largura disponível, sem scroll horizontal */}
      <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => (
          <KanbanColumn key={col.key} title={col.title} accentClass={col.accentClass} items={board[col.key].items} onStatusChange={onStatusChange} />
        ))}
      </div>
    </div>
  );
}
