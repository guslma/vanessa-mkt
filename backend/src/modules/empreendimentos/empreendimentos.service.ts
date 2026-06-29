import { pool } from '../../db/pool';
import { HttpError } from '../../middleware/errorHandler';
import { EmpreendimentoInput } from './empreendimentos.types';

const COLUMNS = [
  'id', 'nome', 'tipo', 'fase_atual', 'data_lancamento', 'responsavel_comercial',
  'link_materiais', 'observacoes', 'endereco', 'public_token',
  'created_at', 'updated_at',
].join(', ');

export interface ListFilters {
  tipo?: string;
  fase?: string;
  search?: string;
}

export async function listEmpreendimentos(filters: ListFilters) {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (filters.tipo) {
    conditions.push(`tipo = $${i++}`);
    values.push(filters.tipo);
  }
  if (filters.fase) {
    conditions.push(`fase_atual = $${i++}`);
    values.push(filters.fase);
  }
  if (filters.search) {
    conditions.push(`nome ILIKE $${i++}`);
    values.push(`%${filters.search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM empreendimentos ${where} ORDER BY nome`,
    values,
  );
  return rows;
}

export async function getEmpreendimento(id: string) {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM empreendimentos WHERE id = $1`, [id]);
  if (!rows[0]) {
    throw new HttpError(404, 'Empreendimento não encontrado');
  }
  return rows[0];
}

export async function createEmpreendimento(input: EmpreendimentoInput) {
  const { rows } = await pool.query(
    `INSERT INTO empreendimentos (nome, tipo, fase_atual, data_lancamento, responsavel_comercial, link_materiais, observacoes, endereco)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      input.nome, input.tipo, input.fase_atual, input.data_lancamento ?? null,
      input.responsavel_comercial ?? null, input.link_materiais ?? null,
      input.observacoes ?? null, input.endereco ?? null,
    ],
  );
  return getEmpreendimento(rows[0].id);
}

export async function updateEmpreendimento(id: string, input: EmpreendimentoInput) {
  const { rowCount } = await pool.query(
    `UPDATE empreendimentos SET
       nome = $1, tipo = $2, fase_atual = $3, data_lancamento = $4,
       responsavel_comercial = $5, link_materiais = $6, observacoes = $7, endereco = $8
     WHERE id = $9`,
    [
      input.nome, input.tipo, input.fase_atual, input.data_lancamento ?? null,
      input.responsavel_comercial ?? null, input.link_materiais ?? null,
      input.observacoes ?? null, input.endereco ?? null, id,
    ],
  );
  if (!rowCount) {
    throw new HttpError(404, 'Empreendimento não encontrado');
  }
  return getEmpreendimento(id);
}

export async function deleteEmpreendimento(id: string) {
  const { rowCount } = await pool.query('DELETE FROM empreendimentos WHERE id = $1', [id]);
  if (!rowCount) {
    throw new HttpError(404, 'Empreendimento não encontrado');
  }
}

export async function regenerateToken(id: string) {
  const { rowCount } = await pool.query(
    'UPDATE empreendimentos SET public_token = gen_random_uuid() WHERE id = $1',
    [id],
  );
  if (!rowCount) {
    throw new HttpError(404, 'Empreendimento não encontrado');
  }
  return getEmpreendimento(id);
}
