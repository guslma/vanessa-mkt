import { pool } from '../../db/pool';
import { HttpError } from '../../middleware/errorHandler';
import { TarefaInput } from './tarefas.types';

const SELECT_BASE = `
  SELECT
    t.id, t.empreendimento_id, t.categoria, t.titulo, t.responsavel, t.prioridade,
    t.status, t.data_inicio, t.prazo, t.data_conclusao, t.observacoes, t.atrasado,
    t.recorrencia, t.created_at, t.updated_at,
    e.nome AS empreendimento_nome
  FROM tarefas_view t
  JOIN empreendimentos e ON e.id = t.empreendimento_id
`;

export interface ListFilters {
  empreendimento_id?: string;
  categoria?: string;
  status?: string;
  prioridade?: string;
  atrasado?: string;
  search?: string;
  sort?: string;
}

function parseSort(sort: string | undefined) {
  const allowed = new Set(['prazo', 'created_at', 'prioridade', 'titulo']);
  const [field = 'created_at', dir = 'desc'] = (sort ?? '').split(':');
  const column = allowed.has(field) ? field : 'created_at';
  const direction = dir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  return `t.${column} ${direction}`;
}

export async function listTarefas(filters: ListFilters) {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (filters.empreendimento_id) {
    conditions.push(`t.empreendimento_id = $${i++}`);
    values.push(filters.empreendimento_id);
  }
  if (filters.categoria) {
    conditions.push(`t.categoria = $${i++}`);
    values.push(filters.categoria);
  }
  if (filters.status) {
    conditions.push(`t.status = $${i++}`);
    values.push(filters.status);
  }
  if (filters.prioridade) {
    conditions.push(`t.prioridade = $${i++}`);
    values.push(filters.prioridade);
  }
  if (filters.atrasado === 'true') {
    conditions.push('t.atrasado = true');
  }
  if (filters.search) {
    conditions.push(`(t.titulo ILIKE $${i} OR e.nome ILIKE $${i})`);
    values.push(`%${filters.search}%`);
    i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = parseSort(filters.sort);
  const { rows } = await pool.query(`${SELECT_BASE} ${where} ORDER BY ${orderBy}`, values);
  return rows;
}

export async function getTarefa(id: string) {
  const { rows } = await pool.query(`${SELECT_BASE} WHERE t.id = $1`, [id]);
  if (!rows[0]) {
    throw new HttpError(404, 'Tarefa não encontrada');
  }
  return rows[0];
}

async function logEvento(tarefaId: string, userId: string | undefined, descricao: string) {
  await pool.query(
    'INSERT INTO tarefa_eventos (tarefa_id, user_id, descricao) VALUES ($1, $2, $3)',
    [tarefaId, userId ?? null, descricao],
  );
}

export const logTarefaEvento = logEvento;

export async function listEventos(tarefaId: string) {
  const { rows } = await pool.query(
    `SELECT te.id, te.descricao, te.created_at, u.name AS user_name
     FROM tarefa_eventos te
     LEFT JOIN users u ON u.id = te.user_id
     WHERE te.tarefa_id = $1
     ORDER BY te.created_at DESC`,
    [tarefaId],
  );
  return rows;
}

function toDateOnlyString(value: string | Date): string {
  const isoLike = value instanceof Date ? value.toISOString() : value;
  return isoLike.slice(0, 10);
}

function addInterval(dateValue: string | Date, recorrencia: string): string {
  const date = new Date(`${toDateOnlyString(dateValue)}T00:00:00`);
  if (recorrencia === 'semanal') date.setDate(date.getDate() + 7);
  else if (recorrencia === 'quinzenal') date.setDate(date.getDate() + 14);
  else if (recorrencia === 'mensal') date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 10);
}

async function maybeCreateNextOccurrence(before: any, actorUserId?: string) {
  if (before.recorrencia === 'nenhuma' || !before.prazo) return;

  const nextPrazo = addInterval(before.prazo, before.recorrencia);
  const nextDataInicio = before.data_inicio ? addInterval(before.data_inicio, before.recorrencia) : null;

  const { rows } = await pool.query(
    `INSERT INTO tarefas (empreendimento_id, categoria, titulo, responsavel, prioridade, status, data_inicio, prazo, data_conclusao, observacoes, recorrencia)
     VALUES ($1, $2, $3, $4, $5, 'a_fazer', $6, $7, NULL, $8, $9)
     RETURNING id`,
    [
      before.empreendimento_id, before.categoria, before.titulo, before.responsavel,
      before.prioridade, nextDataInicio, nextPrazo, before.observacoes, before.recorrencia,
    ],
  );
  await logEvento(rows[0].id, actorUserId, `Tarefa recorrente criada a partir da conclusão de "${before.titulo}"`);
}

export async function createTarefa(input: TarefaInput, actorUserId?: string) {
  const { rows } = await pool.query(
    `INSERT INTO tarefas (empreendimento_id, categoria, titulo, responsavel, prioridade, status, data_inicio, prazo, data_conclusao, observacoes, recorrencia)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id`,
    [
      input.empreendimento_id, input.categoria, input.titulo, input.responsavel ?? null,
      input.prioridade, input.status, input.data_inicio ?? null, input.prazo ?? null,
      input.data_conclusao ?? null, input.observacoes ?? null, input.recorrencia ?? 'nenhuma',
    ],
  );
  await logEvento(rows[0].id, actorUserId, 'Tarefa criada');
  return getTarefa(rows[0].id);
}

export async function updateTarefa(id: string, input: TarefaInput, actorUserId?: string) {
  const before = await getTarefa(id);

  const { rowCount } = await pool.query(
    `UPDATE tarefas SET
       empreendimento_id = $1, categoria = $2, titulo = $3, responsavel = $4,
       prioridade = $5, status = $6, data_inicio = $7, prazo = $8,
       data_conclusao = $9, observacoes = $10, recorrencia = $11
     WHERE id = $12`,
    [
      input.empreendimento_id, input.categoria, input.titulo, input.responsavel ?? null,
      input.prioridade, input.status, input.data_inicio ?? null, input.prazo ?? null,
      input.data_conclusao ?? null, input.observacoes ?? null, input.recorrencia ?? 'nenhuma', id,
    ],
  );
  if (!rowCount) {
    throw new HttpError(404, 'Tarefa não encontrada');
  }

  if (before.status !== input.status) {
    await logEvento(id, actorUserId, `Status alterado de "${STATUS_LABELS[before.status]}" para "${STATUS_LABELS[input.status]}"`);
    if (input.status === 'concluido') {
      await maybeCreateNextOccurrence({ ...before, recorrencia: input.recorrencia ?? before.recorrencia }, actorUserId);
    }
  } else {
    await logEvento(id, actorUserId, 'Tarefa atualizada');
  }
  return getTarefa(id);
}

const STATUS_LABELS: Record<string, string> = {
  a_fazer: 'A fazer', em_andamento: 'Em andamento', concluido: 'Concluído', cancelado: 'Cancelado',
};

export async function updateStatus(id: string, status: string, actorUserId?: string) {
  const before = await getTarefa(id);
  const dataConclusao = status === 'concluido' ? new Date().toISOString().slice(0, 10) : null;
  const { rowCount } = await pool.query(
    `UPDATE tarefas SET status = $1, data_conclusao = COALESCE($2, data_conclusao) WHERE id = $3`,
    [status, dataConclusao, id],
  );
  if (!rowCount) {
    throw new HttpError(404, 'Tarefa não encontrada');
  }
  await logEvento(id, actorUserId, `Status alterado de "${STATUS_LABELS[before.status]}" para "${STATUS_LABELS[status]}"`);
  if (status === 'concluido' && before.status !== 'concluido') {
    await maybeCreateNextOccurrence(before, actorUserId);
  }
  return getTarefa(id);
}

export async function deleteTarefa(id: string) {
  const { rowCount } = await pool.query('DELETE FROM tarefas WHERE id = $1', [id]);
  if (!rowCount) {
    throw new HttpError(404, 'Tarefa não encontrada');
  }
}

const KANBAN_COLUMNS = ['a_fazer', 'em_andamento', 'concluido'] as const;

export async function getKanban() {
  const { rows } = await pool.query(`
    SELECT t.id, t.status, t.atrasado, t.prazo, t.responsavel, t.categoria, t.titulo,
           e.nome AS empreendimento_nome
    FROM tarefas_view t
    JOIN empreendimentos e ON e.id = t.empreendimento_id
    WHERE t.status != 'cancelado'
    ORDER BY t.prazo ASC NULLS LAST, t.created_at DESC
  `);

  const board: Record<string, { count: number; items: unknown[] }> = {
    a_fazer: { count: 0, items: [] },
    em_andamento: { count: 0, items: [] },
    concluido: { count: 0, items: [] },
    atrasado: { count: 0, items: [] },
  };

  for (const row of rows) {
    const card = {
      id: row.id,
      empreendimento_nome: row.empreendimento_nome,
      categoria: row.categoria,
      titulo: row.titulo,
      prazo: row.prazo,
      responsavel: row.responsavel,
      status: row.status,
    };
    if (KANBAN_COLUMNS.includes(row.status)) {
      board[row.status].items.push(card);
      board[row.status].count++;
    }
    if (row.atrasado) {
      board.atrasado.items.push(card);
      board.atrasado.count++;
    }
  }

  return board;
}
