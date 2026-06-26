import { pool } from '../../db/pool';
import { HttpError } from '../../middleware/errorHandler';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getPublicEmpreendimento(token: string) {
  if (!UUID_RE.test(token)) {
    throw new HttpError(404, 'Link inválido ou expirado');
  }
  const { rows } = await pool.query(
    `SELECT id, nome, tipo, fase_atual, data_lancamento, responsavel_comercial
     FROM empreendimentos WHERE public_token = $1`,
    [token],
  );
  if (!rows[0]) {
    throw new HttpError(404, 'Link inválido ou expirado');
  }
  return rows[0];
}

export async function getPublicTarefas(empreendimentoId: string) {
  const { rows } = await pool.query(
    `SELECT id, titulo, categoria, prioridade, status, prazo, responsavel, atrasado
     FROM tarefas_view
     WHERE empreendimento_id = $1
     ORDER BY prazo ASC NULLS LAST, created_at DESC`,
    [empreendimentoId],
  );
  return rows;
}
