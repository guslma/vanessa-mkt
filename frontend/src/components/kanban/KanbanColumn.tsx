import { KanbanCard as KanbanCardType } from '../../api/tarefas';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  title: string;
  accentClass: string;
  items: KanbanCardType[];
  onStatusChange: (id: string, status: string) => void;
}

export function KanbanColumn({ title, accentClass, items, onStatusChange }: KanbanColumnProps) {
  return (
    <div className="flex flex-col rounded-2xl bg-slate-100/70 p-3">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${accentClass}`} />
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 shadow-sm">{items.length}</span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto md:max-h-[calc(100vh-260px)]">
        {items.length === 0 && <p className="text-xs text-slate-400">Nenhuma tarefa</p>}
        {items.map((card) => (
          <KanbanCard key={card.id} card={card} onStatusChange={onStatusChange} />
        ))}
      </div>
    </div>
  );
}
