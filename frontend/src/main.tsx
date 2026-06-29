import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { App } from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 15_000 } },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="top-right" toastOptions={{ duration: 3500 }} />
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
