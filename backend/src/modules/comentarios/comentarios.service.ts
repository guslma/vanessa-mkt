import { pool } from '../../db/pool';
import { HttpError } from '../../middleware/errorHandler';

export async function listComentarios(tarefaId: string) {
  const { rows } = await pool.query(
    `SELECT c.id, c.texto, c.created_at, c.user_id, u.name AS user_name
     FROM tarefa_comentarios c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.tarefa_id = $1
     ORDER BY c.created_at ASC`,
    [tarefaId],
  );
  return rows;
}

export async function createComentario(tarefaId: string, texto: string, userId?: string) {
  const { rows } = await pool.query(
    `INSERT INTO tarefa_comentarios (tarefa_id, user_id, texto) VALUES ($1, $2, $3)
     RETURNING id`,
    [tarefaId, userId ?? null, texto],
  );
  const [comentario] = await pool.query(
    `SELECT c.id, c.texto, c.created_at, c.user_id, u.name AS user_name
     FROM tarefa_comentarios c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.id = $1`,
    [rows[0].id],
  ).then((r) => r.rows);
  return comentario;
}

export async function deleteComentario(id: string, requesterUserId: string, requesterRole: string) {
  const { rows } = await pool.query('SELECT user_id FROM tarefa_comentarios WHERE id = $1', [id]);
  if (!rows[0]) throw new HttpError(404, 'Comentário não encontrado');
  if (requesterRole !== 'admin' && rows[0].user_id !== requesterUserId) {
    throw new HttpError(403, 'Você só pode excluir seus próprios comentários');
  }
  await pool.query('DELETE FROM tarefa_comentarios WHERE id = $1', [id]);
}
