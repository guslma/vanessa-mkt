import ExcelJS from 'exceljs';
import { pool } from '../../db/pool';
import { HttpError } from '../../middleware/errorHandler';

const TIPO_MAP: Record<string, string> = {
  Residencial: 'residencial', Comercial: 'comercial', Loteamento: 'loteamento', Misto: 'misto',
};
const FASE_MAP: Record<string, string> = {
  'Pré-lançamento': 'pre_lancamento', Lançamento: 'lancamento', 'Em obras': 'em_obras',
  'Pronto para morar': 'pronto_para_morar', Entregue: 'entregue',
};
const CATEGORIA_MAP: Record<string, string> = {
  'Redes Sociais': 'redes_sociais', 'Material Gráfico': 'material_grafico', 'Lançamento': 'lancamento',
  'Mídia Paga': 'midia_paga', Evento: 'evento', 'Stand de Vendas': 'stand_de_vendas', Site: 'site',
  'E-mail Marketing': 'email_marketing', 'Fotos e Vídeos': 'fotos_e_videos', Outros: 'outros',
};
const PRIORIDADE_MAP: Record<string, string> = { Alta: 'alta', Média: 'media', Baixa: 'baixa' };
const STATUS_MAP: Record<string, string> = {
  'A fazer': 'a_fazer', 'Em andamento': 'em_andamento', 'Concluído': 'concluido',
  Atrasado: 'em_andamento', // "Atrasado" não existe mais como status — fica em_andamento e o atraso é calculado pelo prazo
  Cancelado: 'cancelado',
};

export interface ImportSummary {
  empreendimentosInseridos: number;
  empreendimentosIgnorados: number;
  tarefasInseridas: number;
  empreendimentosCriadosAutomaticamente: number;
  avisos: string[];
}

function parseDate(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') {
    const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return null;
}

function cellText(cell: ExcelJS.Cell | undefined): string | null {
  const v = cell?.value;
  if (v == null) return null;
  if (typeof v === 'object' && 'text' in (v as any)) return String((v as any).text).trim();
  return String(v).trim();
}

// Acentuação varia entre as abas da planilha (ex.: "Vertice" vs "Vértice") — normaliza para casar mesmo assim.
function normalizeName(name: string): string {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export async function importWorkbookFromBuffer(buffer: Buffer, options: { dryRun?: boolean } = {}): Promise<ImportSummary> {
  const { dryRun = false } = options;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

  const empSheet = workbook.getWorksheet('Empreendimentos');
  const tarSheet = workbook.getWorksheet('Tarefas');
  if (!empSheet || !tarSheet) {
    throw new HttpError(400, 'A planilha precisa ter as abas "Empreendimentos" e "Tarefas".');
  }

  const avisos: string[] = [];
  const nomeToId = new Map<string, string>();
  let empInsert = 0, empSkip = 0;

  for (let r = 2; r <= empSheet.rowCount; r++) {
    const row = empSheet.getRow(r);
    const nome = cellText(row.getCell(1));
    if (!nome) continue;

    const tipoLabel = cellText(row.getCell(2));
    const faseLabel = cellText(row.getCell(3));
    const tipo = tipoLabel ? TIPO_MAP[tipoLabel] : undefined;
    const fase = faseLabel ? FASE_MAP[faseLabel] : undefined;
    if (!tipo || !fase) {
      avisos.push(`[Empreendimentos] linha ${r} ignorada: tipo/fase inválido ("${tipoLabel}"/"${faseLabel}")`);
      empSkip++;
      continue;
    }

    const dataLancamento = parseDate(row.getCell(4).value);
    const responsavel = cellText(row.getCell(5));
    const link = cellText(row.getCell(6));
    const obs = cellText(row.getCell(7));

    const existing = await pool.query('SELECT id FROM empreendimentos WHERE lower(nome) = lower($1)', [nome]);
    if (existing.rows[0]) {
      nomeToId.set(normalizeName(nome), existing.rows[0].id);
      continue;
    }

    if (dryRun) {
      empInsert++;
      nomeToId.set(normalizeName(nome), '00000000-0000-0000-0000-000000000000');
      continue;
    }

    const { rows } = await pool.query(
      `INSERT INTO empreendimentos (nome, tipo, fase_atual, data_lancamento, responsavel_comercial, link_materiais, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [nome, tipo, fase, dataLancamento, responsavel, link, obs],
    );
    nomeToId.set(normalizeName(nome), rows[0].id);
    empInsert++;
  }

  let tarInsert = 0, empAutoCriados = 0;

  for (let r = 2; r <= tarSheet.rowCount; r++) {
    const row = tarSheet.getRow(r);
    const empNome = cellText(row.getCell(1));
    const titulo = cellText(row.getCell(3));
    if (!empNome || !titulo) continue;

    let empId = nomeToId.get(normalizeName(empNome));
    if (!empId) {
      // A Tarefa referencia um empreendimento que não está (ou está incompleto) na aba Empreendimentos —
      // cria com dados padrão para não bloquear a importação; fica marcado para revisão manual.
      const existing = await pool.query('SELECT id FROM empreendimentos WHERE lower(nome) = lower($1)', [empNome]);
      if (existing.rows[0]) {
        empId = existing.rows[0].id as string;
      } else if (dryRun) {
        empId = '00000000-0000-0000-0000-000000000000';
        empInsert++;
      } else {
        const { rows } = await pool.query(
          `INSERT INTO empreendimentos (nome, tipo, fase_atual, observacoes)
           VALUES ($1, 'residencial', 'pre_lancamento', 'Criado automaticamente na importação — revisar tipo, fase e demais dados.')
           RETURNING id`,
          [empNome],
        );
        empId = rows[0].id as string;
        empInsert++;
      }
      nomeToId.set(normalizeName(empNome), empId);
      empAutoCriados++;
      avisos.push(`[Tarefas] linha ${r}: empreendimento "${empNome}" não estava cadastrado — criado automaticamente, revise tipo/fase.`);
    }

    const categoriaLabel = cellText(row.getCell(2));
    const responsavel = cellText(row.getCell(4));
    const prioridadeLabel = cellText(row.getCell(5));
    const statusLabel = cellText(row.getCell(6));
    const dataInicio = parseDate(row.getCell(7).value);
    const prazo = parseDate(row.getCell(8).value);
    const dataConclusao = parseDate(row.getCell(9).value);
    const obs = cellText(row.getCell(10));

    const prioridade = prioridadeLabel ? (PRIORIDADE_MAP[prioridadeLabel] ?? 'media') : 'media';
    const status = statusLabel ? (STATUS_MAP[statusLabel] ?? 'a_fazer') : 'a_fazer';

    // Categoria sem mapeamento cai em "outros" — a categoria original fica registrada nas observações
    // para não perder a tarefa por causa de um rótulo que a planilha usa e o sistema não conhece.
    const categoria = (categoriaLabel ? CATEGORIA_MAP[categoriaLabel] : undefined) ?? 'outros';
    const obsComCategoriaOriginal = categoriaLabel && !CATEGORIA_MAP[categoriaLabel]
      ? `[Categoria original: ${categoriaLabel}] ${obs ?? ''}`.trim()
      : obs;
    if (categoriaLabel && !CATEGORIA_MAP[categoriaLabel]) {
      avisos.push(`[Tarefas] linha ${r}: categoria "${categoriaLabel}" desconhecida — importada como "Outros".`);
    }

    const dup = await pool.query(
      `SELECT id FROM tarefas WHERE empreendimento_id = $1 AND titulo = $2 AND prazo IS NOT DISTINCT FROM $3`,
      [empId, titulo, prazo],
    );
    if (dup.rows.length) continue; // já importada (chave composta empreendimento+titulo+prazo)

    if (dryRun) {
      tarInsert++;
      continue;
    }

    await pool.query(
      `INSERT INTO tarefas (empreendimento_id, categoria, titulo, responsavel, prioridade, status, data_inicio, prazo, data_conclusao, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [empId, categoria, titulo, responsavel, prioridade, status, dataInicio, prazo, dataConclusao, obsComCategoriaOriginal],
    );
    tarInsert++;
  }

  return {
    empreendimentosInseridos: empInsert,
    empreendimentosIgnorados: empSkip,
    tarefasInseridas: tarInsert,
    empreendimentosCriadosAutomaticamente: empAutoCriados,
    avisos,
  };
}
