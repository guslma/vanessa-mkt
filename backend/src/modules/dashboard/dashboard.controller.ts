import { Request, Response } from 'express';
import { pool } from '../../db/pool';

export async function summaryHandler(_req: Request, res: Response) {
  const { rows } = await pool.query(`
    SELECT
      count(*) AS total_tarefas,
      count(*) FILTER (WHERE status = 'em_andamento') AS em_andamento,
      count(*) FILTER (WHERE status = 'concluido') AS concluidas,
      count(*) FILTER (WHERE atrasado) AS atrasadas,
      count(*) FILTER (WHERE prioridade = 'alta' AND status NOT IN ('concluido', 'cancelado')) AS alta_prioridade_em_aberto
    FROM tarefas_view
  `);
  const row = rows[0];
  res.json({
    total_tarefas: Number(row.total_tarefas),
    em_andamento: Number(row.em_andamento),
    concluidas: Number(row.concluidas),
    atrasadas: Number(row.atrasadas),
    alta_prioridade_em_aberto: Number(row.alta_prioridade_em_aberto),
  });
}
