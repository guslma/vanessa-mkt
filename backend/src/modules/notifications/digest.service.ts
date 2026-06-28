import { pool } from '../../db/pool';
import { isPushConfigured, sendPushToAdmins } from './push.service';

async function getSummary() {
  const { rows } = await pool.query(`
    SELECT
      count(*) AS total_tarefas,
      count(*) FILTER (WHERE status = 'em_andamento') AS em_andamento,
      count(*) FILTER (WHERE status = 'concluido') AS concluidas,
      count(*) FILTER (WHERE atrasado) AS atrasadas,
      count(*) FILTER (WHERE prioridade = 'alta' AND status NOT IN ('concluido', 'cancelado')) AS alta_prioridade_em_aberto
    FROM tarefas_view
  `);
  return rows[0];
}

function buildPushPayload(summary: any) {
  const partes = [`${summary.total_tarefas} tarefa(s) no total`, `${summary.em_andamento} em andamento`];
  if (Number(summary.atrasadas) > 0) partes.push(`${summary.atrasadas} atrasada(s)`);
  if (Number(summary.alta_prioridade_em_aberto) > 0) partes.push(`${summary.alta_prioridade_em_aberto} de alta prioridade em aberto`);

  return {
    title: 'Resumo diário — Vanessa MKT',
    body: partes.join(' · '),
    url: '/quadro',
  };
}

export async function sendDailyDigest() {
  if (!isPushConfigured()) return { sent: false, reason: 'Push não configurado' };

  const summary = await getSummary();
  const payload = buildPushPayload(summary);
  const result = await sendPushToAdmins(payload);

  if (result.sent === 0) return { sent: false, reason: 'Nenhum administrador com notificações ativadas' };
  return { sent: true, enviados: result.sent, falhas: result.failed };
}
