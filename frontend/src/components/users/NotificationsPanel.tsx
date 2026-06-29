import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, BellOff, Send } from 'lucide-react';
import { getNotificationsStatus, sendDigestNow, subscribePush, unsubscribePush } from '../../api/notifications';
import { getCurrentPushSubscription, isIos, isPushSupported, isStandalone, subscribeToPush, subscriptionToPayload } from '../../lib/push';
import { errorMessage } from '../../lib/errorMessage';

export function NotificationsPanel() {
  const { data } = useQuery({ queryKey: ['notifications-status'], queryFn: getNotificationsStatus });
  const [subscribed, setSubscribed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getCurrentPushSubscription()
      .then((sub) => setSubscribed(Boolean(sub)))
      .finally(() => setChecking(false));
  }, []);

  const subscribe = useMutation({
    mutationFn: async () => {
      if (!data?.publicKey) throw new Error('Push não configurado no servidor');
      const sub = await subscribeToPush(data.publicKey);
      await subscribePush(subscriptionToPayload(sub));
    },
    onSuccess: () => { setSubscribed(true); toast.success('Notificações push ativadas neste dispositivo'); },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível ativar as notificações')),
  });

  const unsubscribe = useMutation({
    mutationFn: async () => {
      const sub = await getCurrentPushSubscription();
      if (!sub) return;
      await unsubscribePush(sub.endpoint);
      await sub.unsubscribe();
    },
    onSuccess: () => { setSubscribed(false); toast.success('Notificações push desativadas neste dispositivo'); },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível desativar as notificações')),
  });

  const send = useMutation({
    mutationFn: sendDigestNow,
    onSuccess: (result) => {
      if (result.sent) toast.success(`Resumo enviado para ${result.enviados} dispositivo(s)`);
      else toast.error(result.reason ?? 'Não foi possível enviar');
    },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível enviar o resumo')),
  });

  if (!isPushSupported()) {
    const showIosInstructions = isIos() && !isStandalone();
    return (
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <BellOff size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Resumo diário por notificação</h2>
        </div>
        {showIosInstructions ? (
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            <p>No iPhone, notificações só funcionam se o app for adicionado à Tela de Início (precisa do iOS 16.4 ou mais recente). Para ativar:</p>
            <ol className="mt-1.5 list-decimal space-y-0.5 pl-4">
              <li>Toque no ícone de compartilhar do Safari (quadrado com seta para cima)</li>
              <li>Escolha &quot;Adicionar à Tela de Início&quot;</li>
              <li>Abra o app pelo ícone criado na tela inicial (não pelo Safari) e ative as notificações aqui</li>
            </ol>
          </div>
        ) : (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Este navegador não suporta notificações push.</p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2">
        <Bell size={16} className="text-brand-600" />
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Resumo diário por notificação</h2>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {data?.configured
          ? 'Ative as notificações para receber um resumo diário das tarefas neste dispositivo.'
          : 'Push não configurado no servidor ainda. Defina as variáveis VAPID_* no .env para ativar.'}
      </p>
      {data?.configured && !checking && (
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => (subscribed ? unsubscribe.mutate() : subscribe.mutate())}
            disabled={subscribe.isPending || unsubscribe.isPending}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/60"
          >
            {subscribed ? <BellOff size={12} /> : <Bell size={12} />}
            {subscribed ? 'Desativar neste dispositivo' : 'Ativar neste dispositivo'}
          </button>
          {subscribed && (
            <button
              onClick={() => send.mutate()}
              disabled={send.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/60"
            >
              <Send size={12} /> {send.isPending ? 'Enviando...' : 'Enviar agora (teste)'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
