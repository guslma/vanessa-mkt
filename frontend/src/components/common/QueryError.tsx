import { AlertTriangle, RefreshCw } from 'lucide-react';
import { errorMessage } from '../../lib/errorMessage';

export function QueryError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
      <AlertTriangle size={22} className="text-red-500" />
      <p className="text-sm font-medium text-red-700">{errorMessage(error, 'Não foi possível carregar os dados')}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-1 flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700">
          <RefreshCw size={13} /> Tentar novamente
        </button>
      )}
    </div>
  );
}
