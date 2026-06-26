import ExcelJS from 'exceljs';
import { pool } from '../db/pool';

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

async function main() {
  const filePath = process.argv.find((a) => a.startsWith('--file='))?.split('=')[1];
  const dryRun = process.argv.includes('--dry-run');

  if (!filePath) {
    console.error('Uso: npm run import -- --file="./planilha.xlsx" [--dry-run]');
    process.exit(1);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const empSheet = workbook.getWorksheet('Empreendimentos');
  const tarSheet = workbook.getWorksheet('Tarefas');
  if (!empSheet || !tarSheet) {
    console.error('Planilha precisa ter as abas "Empreendimentos" e "Tarefas".');
    process.exit(1);
  }

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
      console.warn(`[empreendimentos] linha ${r} ignorada: tipo/fase inválido ("${tipoLabel}"/"${faseLabel}")`);
      empSkip++;
      continue;
    }

    const dataLancamento = parseDate(row.getCell(4).value);
    const responsavel = cellText(row.getCell(5));
    const link = cellText(row.getCell(6));
    const obs = cellText(row.getCell(7));

    const existing = await pool.query('SELECT id FROM empreendimentos WHERE lower(nome) = lower($1)', [nome]);
    if (existing.rows[0]) {
      nomeToId.set(nome.toLowerCase(), existing.rows[0].id);
      continue;
    }

    if (dryRun) {
      empInsert++;
      nomeToId.set(nome.toLowerCase(), '00000000-0000-0000-0000-000000000000');
      continue;
    }

    const { rows } = await pool.query(
      `INSERT INTO empreendimentos (nome, tipo, fase_atual, data_lancamento, responsavel_comercial, link_materiais, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [nome, tipo, fase, dataLancamento, responsavel, link, obs],
    );
    nomeToId.set(nome.toLowerCase(), rows[0].id);
    empInsert++;
  }

  let tarInsert = 0, tarSkip = 0, tarUnmatched = 0;

  for (let r = 2; r <= tarSheet.rowCount; r++) {
    const row = tarSheet.getRow(r);
    const empNome = cellText(row.getCell(1));
    const titulo = cellText(row.getCell(3));
    if (!empNome || !titulo) continue;

    const empId = nomeToId.get(empNome.toLowerCase());
    if (!empId) {
      console.warn(`[tarefas] linha ${r} ignorada: empreendimento "${empNome}" não encontrado`);
      tarUnmatched++;
      continue;
    }

    const categoriaLabel = cellText(row.getCell(2));
    const responsavel = cellText(row.getCell(4));
    const prioridadeLabel = cellText(row.getCell(5));
    const statusLabel = cellText(row.getCell(6));
    const dataInicio = parseDate(row.getCell(7).value);
    const prazo = parseDate(row.getCell(8).value);
    const dataConclusao = parseDate(row.getCell(9).value);
    const obs = cellText(row.getCell(10));

    const categoria = categoriaLabel ? CATEGORIA_MAP[categoriaLabel] : undefined;
    const prioridade = prioridadeLabel ? (PRIORIDADE_MAP[prioridadeLabel] ?? 'media') : 'media';
    const status = statusLabel ? (STATUS_MAP[statusLabel] ?? 'a_fazer') : 'a_fazer';

    if (!categoria) {
      console.warn(`[tarefas] linha ${r} ignorada: categoria inválida ("${categoriaLabel}")`);
      tarSkip++;
      continue;
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
      [empId, categoria, titulo, responsavel, prioridade, status, dataInicio, prazo, dataConclusao, obs],
    );
    tarInsert++;
  }

  console.log('--- Resumo da importação ---');
  console.log(`Empreendimentos: ${empInsert} inseridos, ${empSkip} ignorados`);
  console.log(`Tarefas: ${tarInsert} inseridas, ${tarSkip} ignoradas, ${tarUnmatched} sem empreendimento correspondente`);
  if (dryRun) console.log('(dry-run: nada foi gravado no banco)');

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
