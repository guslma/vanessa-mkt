import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, Send } from 'lucide-react';
import { getNotificationsStatus, sendDigestNow } from '../../api/notifications';
import { errorMessage } from '../../lib/errorMessage';

export function NotificationsPanel() {
  const { data } = useQuery({ queryKey: ['notifications-status'], queryFn: getNotificationsStatus });

  const send = useMutation({
    mutationFn: sendDigestNow,
    onSuccess: (result) => {
      if (result.sent) toast.success(`Resumo enviado para ${result.recipients?.join(', ')}`);
      else toast.error(result.reason ?? 'Não foi possível enviar');
    },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível enviar o resumo')),
  });

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2">
        <Mail size={16} className="text-brand-600" />
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Resumo diário por e-mail</h2>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {data?.configured
          ? 'SMTP configurado — administradores ativos recebem um resumo automático todo dia.'
          : 'SMTP não configurado ainda. Defina as variáveis SMTP_* no .env para ativar.'}
      </p>
      {data?.configured && (
        <button
          onClick={() => send.mutate()}
          disabled={send.isPending}
          className="mt-2 flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/60"
        >
          <Send size={12} /> {send.isPending ? 'Enviando...' : 'Enviar agora (teste)'}
        </button>
      )}
    </div>
  );
}
