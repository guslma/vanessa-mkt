export interface PublicEmpreendimento {
  id: string;
  nome: string;
  tipo: string;
  fase_atual: string;
  data_lancamento: string | null;
  responsavel_comercial: string | null;
}

export interface PublicTarefa {
  id: string;
  titulo: string;
  categoria: string;
  prioridade: string;
  status: string;
  prazo: string | null;
  responsavel: string | null;
  atrasado: boolean;
}

export async function getPublicEmpreendimento(token: string) {
  const res = await fetch(`/api/public/empreendimentos/${token}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Não foi possível carregar');
  }
  return res.json() as Promise<{ empreendimento: PublicEmpreendimento; tarefas: PublicTarefa[] }>;
}
