import { apiUpload } from './client';

export interface ImportSummary {
  empreendimentosInseridos: number;
  empreendimentosIgnorados: number;
  tarefasInseridas: number;
  empreendimentosCriadosAutomaticamente: number;
  avisos: string[];
}

export function importarPlanilha(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload<{ resumo: ImportSummary }>('/importacao', formData);
}
