import { pool } from '../../db/pool';
import { sendMail, isMailerConfigured } from './mailer';

const STATUS_LABELS: Record<string, string> = {
  a_fazer: 'A fazer', em_andamento: 'Em andamento', concluido: 'Concluído', cancelado: 'Cancelado',
};

function formatDateBR(value: string | Date | null) {
  if (!value) return '';
  const iso = value instanceof Date ? value.toISOString() : value;
  const [year, month, day] = iso.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

async function getActiveAdminEmails(): Promise<string[]> {
  const { rows } = await pool.query("SELECT email FROM users WHERE active = true AND role = 'admin'");
  return rows.map((r) => r.email);
}

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

async function getAtrasadasETarefasDaSemana() {
  const { rows } = await pool.query(`
    SELECT t.titulo, t.status, t.prazo, t.atrasado, e.nome AS empreendimento_nome
    FROM tarefas_view t
    JOIN empreendimentos e ON e.id = t.empreendimento_id
    WHERE t.status NOT IN ('concluido', 'cancelado')
      AND t.prazo IS NOT NULL
      AND (t.atrasado OR t.prazo <= CURRENT_DATE + INTERVAL '7 days')
    ORDER BY t.prazo ASC
    LIMIT 25
  `);
  return rows;
}

function buildHtml(summary: any, tarefas: any[]) {
  const rows = tarefas.map((t) => `
    <tr>
      <td style="padding:4px 8px;border-bottom:1px solid #eee;">${t.empreendimento_nome}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #eee;">${t.titulo}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #eee;">${STATUS_LABELS[t.status] ?? t.status}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #eee;color:${t.atrasado ? '#dc2626' : '#475569'};">
        ${formatDateBR(t.prazo)}${t.atrasado ? ' (atrasada)' : ''}
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family:Arial,sans-serif;color:#1e293b;max-width:600px;margin:0 auto;">
      <h2 style="color:#f25c00;">Vanessa MKT — Resumo diário</h2>
      <p>Bom dia! Aqui está o resumo das tarefas de marketing:</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;">
        <tr>
          <td style="padding:8px;background:#fff4ed;border-radius:6px;text-align:center;">
            <strong style="font-size:20px;">${summary.total_tarefas}</strong><br/><span style="font-size:12px;">Total</span>
          </td>
          <td style="padding:8px;text-align:center;">
            <strong style="font-size:20px;">${summary.em_andamento}</strong><br/><span style="font-size:12px;">Em andamento</span>
          </td>
          <td style="padding:8px;background:#fef2f2;border-radius:6px;text-align:center;">
            <strong style="font-size:20px;color:#dc2626;">${summary.atrasadas}</strong><br/><span style="font-size:12px;">Atrasadas</span>
          </td>
          <td style="padding:8px;background:#fffbeb;border-radius:6px;text-align:center;">
            <strong style="font-size:20px;color:#b45309;">${summary.alta_prioridade_em_aberto}</strong><br/><span style="font-size:12px;">Alta prioridade</span>
          </td>
        </tr>
      </table>

      <h3 style="font-size:14px;color:#475569;">Atrasadas ou vencendo nos próximos 7 dias</h3>
      ${tarefas.length === 0 ? '<p style="color:#94a3b8;">Nenhuma tarefa nessa situação. 🎉</p>' : `
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="text-align:left;color:#64748b;font-size:11px;text-transform:uppercase;">
              <th style="padding:4px 8px;">Empreendimento</th><th style="padding:4px 8px;">Tarefa</th>
              <th style="padding:4px 8px;">Status</th><th style="padding:4px 8px;">Prazo</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `}
      <p style="margin-top:20px;font-size:12px;color:#94a3b8;">Enviado automaticamente pelo Marketing Tracker.</p>
    </div>
  `;
}

export async function sendDailyDigest() {
  if (!isMailerConfigured()) return { sent: false, reason: 'SMTP não configurado' };

  const recipients = await getActiveAdminEmails();
  if (recipients.length === 0) return { sent: false, reason: 'Nenhum administrador ativo' };

  const summary = await getSummary();
  const tarefas = await getAtrasadasETarefasDaSemana();
  const html = buildHtml(summary, tarefas);

  await sendMail(recipients, `Resumo diário — ${summary.atrasadas} tarefa(s) atrasada(s)`, html);
  return { sent: true, recipients };
}
