import { apiDownload, apiFetch, apiUpload } from './client';

export interface Tarefa {
  id: string;
  empreendimento_id: string;
  empreendimento_nome: string;
  categoria: string;
  titulo: string;
  responsavel: string | null;
  prioridade: string;
  status: string;
  data_inicio: string | null;
  prazo: string | null;
  data_conclusao: string | null;
  observacoes: string | null;
  atrasado: boolean;
  recorrencia: string;
  created_at: string;
  updated_at: string;
}

export type TarefaInput = Omit<
  Tarefa,
  'id' | 'empreendimento_nome' | 'atrasado' | 'created_at' | 'updated_at'
>;

export interface TarefaFilters {
  empreendimento_id?: string;
  categoria?: string;
  status?: string;
  prioridade?: string;
  atrasado?: boolean;
  search?: string;
  sort?: string;
}

export interface KanbanCard {
  id: string;
  empreendimento_nome: string;
  categoria: string;
  titulo: string;
  prazo: string | null;
  responsavel: string | null;
  status: string;
}

export interface KanbanBoard {
  a_fazer: { count: number; items: KanbanCard[] };
  em_andamento: { count: number; items: KanbanCard[] };
  concluido: { count: number; items: KanbanCard[] };
  atrasado: { count: number; items: KanbanCard[] };
}

export interface TarefaEvento {
  id: string;
  descricao: string;
  created_at: string;
  user_name: string | null;
}

export function getEventos(id: string) {
  return apiFetch<{ eventos: TarefaEvento[] }>(`/tarefas/${id}/eventos`);
}

function buildQuery(filters: TarefaFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function listTarefas(filters: TarefaFilters = {}) {
  return apiFetch<{ tarefas: Tarefa[] }>(`/tarefas${buildQuery(filters)}`);
}

export function exportTarefas(format: 'xlsx' | 'pdf', filters: TarefaFilters = {}) {
  return apiDownload(`/tarefas/export.${format}${buildQuery(filters)}`, `tarefas.${format}`);
}

export function getKanban() {
  return apiFetch<KanbanBoard>('/tarefas/kanban');
}

export function createTarefa(input: TarefaInput) {
  return apiFetch<{ tarefa: Tarefa }>('/tarefas', { method: 'POST', body: JSON.stringify(input) });
}

export function updateTarefa(id: string, input: TarefaInput) {
  return apiFetch<{ tarefa: Tarefa }>(`/tarefas/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function updateTarefaStatus(id: string, status: string) {
  return apiFetch<{ tarefa: Tarefa }>(`/tarefas/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteTarefa(id: string) {
  return apiFetch<void>(`/tarefas/${id}`, { method: 'DELETE' });
}

export interface Anexo {
  id: string;
  tarefa_id: string;
  nome_original: string;
  mime_type: string | null;
  tamanho_bytes: number | null;
  created_at: string;
  uploaded_by_name: string | null;
}

export function getAnexos(tarefaId: string) {
  return apiFetch<{ anexos: Anexo[] }>(`/tarefas/${tarefaId}/anexos`);
}

export function uploadAnexo(tarefaId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload<{ anexo: Anexo }>(`/tarefas/${tarefaId}/anexos`, formData);
}

export function downloadAnexo(anexo: Anexo) {
  return apiDownload(`/anexos/${anexo.id}/download`, anexo.nome_original);
}

export function deleteAnexo(anexoId: string) {
  return apiFetch<void>(`/anexos/${anexoId}`, { method: 'DELETE' });
}

export interface Comentario {
  id: string;
  texto: string;
  created_at: string;
  user_id: string | null;
  user_name: string | null;
}

export function getComentarios(tarefaId: string) {
  return apiFetch<{ comentarios: Comentario[] }>(`/tarefas/${tarefaId}/comentarios`);
}

export function createComentario(tarefaId: string, texto: string) {
  return apiFetch<{ comentario: Comentario }>(`/tarefas/${tarefaId}/comentarios`, {
    method: 'POST',
    body: JSON.stringify({ texto }),
  });
}

export function deleteComentario(id: string) {
  return apiFetch<void>(`/comentarios/${id}`, { method: 'DELETE' });
}
