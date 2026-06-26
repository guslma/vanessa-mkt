import { Component, ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('Erro não tratado na interface:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center shadow-sm">
            <AlertOctagon size={28} className="text-red-500" />
            <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">Algo deu errado</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              A página encontrou um problema inesperado. Tente recarregar — se persistir, avise o suporte.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
