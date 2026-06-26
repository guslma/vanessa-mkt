import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

const CATEGORIA_LABELS: Record<string, string> = {
  redes_sociais: 'Redes Sociais', material_grafico: 'Material Gráfico', lancamento: 'Lançamento',
  midia_paga: 'Mídia Paga', evento: 'Evento', stand_de_vendas: 'Stand de Vendas', site: 'Site',
  email_marketing: 'E-mail Marketing', fotos_e_videos: 'Fotos e Vídeos', outros: 'Outros',
};
const PRIORIDADE_LABELS: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
const STATUS_LABELS: Record<string, string> = {
  a_fazer: 'A fazer', em_andamento: 'Em andamento', concluido: 'Concluído', cancelado: 'Cancelado',
};

interface TarefaExportRow {
  empreendimento_nome: string;
  categoria: string;
  titulo: string;
  responsavel: string | null;
  prioridade: string;
  status: string;
  data_inicio: string | null;
  prazo: string | null;
  data_conclusao: string | null;
  observacoes: string | null;
  atrasado: boolean;
}

function formatDate(value: string | null) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('pt-BR');
}

export async function writeTarefasXlsx(tarefas: TarefaExportRow[], res: Response) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tarefas');

  sheet.columns = [
    { header: 'Empreendimento', key: 'empreendimento_nome', width: 28 },
    { header: 'Categoria', key: 'categoria', width: 18 },
    { header: 'Tarefa / Atividade', key: 'titulo', width: 36 },
    { header: 'Responsável', key: 'responsavel', width: 20 },
    { header: 'Prioridade', key: 'prioridade', width: 12 },
    { header: 'Status', key: 'status', width: 16 },
    { header: 'Data Início', key: 'data_inicio', width: 14 },
    { header: 'Prazo', key: 'prazo', width: 14 },
    { header: 'Data Conclusão', key: 'data_conclusao', width: 14 },
    { header: 'Atrasada', key: 'atrasada', width: 10 },
    { header: 'Observações', key: 'observacoes', width: 30 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const t of tarefas) {
    sheet.addRow({
      empreendimento_nome: t.empreendimento_nome,
      categoria: CATEGORIA_LABELS[t.categoria] ?? t.categoria,
      titulo: t.titulo,
      responsavel: t.responsavel ?? '',
      prioridade: PRIORIDADE_LABELS[t.prioridade] ?? t.prioridade,
      status: STATUS_LABELS[t.status] ?? t.status,
      data_inicio: formatDate(t.data_inicio),
      prazo: formatDate(t.prazo),
      data_conclusao: formatDate(t.data_conclusao),
      atrasada: t.atrasado ? 'Sim' : 'Não',
      observacoes: t.observacoes ?? '',
    });
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="tarefas.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
}

export function writeTarefasPdf(tarefas: TarefaExportRow[], res: Response) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="tarefas.pdf"');

  const doc = new PDFDocument({ margin: 36, size: 'A4', layout: 'landscape' });
  doc.pipe(res);

  doc.fontSize(16).text('Marketing Tracker — Tarefas', { align: 'left' });
  doc.fontSize(9).fillColor('#666').text(`Exportado em ${new Date().toLocaleString('pt-BR')} · ${tarefas.length} tarefa(s)`);
  doc.moveDown(1);

  const colWidths = [110, 90, 160, 80, 60, 70, 60, 70, 110];
  const headers = ['Empreendimento', 'Categoria', 'Tarefa', 'Responsável', 'Prioridade', 'Status', 'Prazo', 'Atrasada', 'Observações'];

  function drawRow(values: string[], y: number, bold = false) {
    let x = doc.page.margins.left;
    doc.fontSize(8).fillColor(bold ? '#000' : '#333').font(bold ? 'Helvetica-Bold' : 'Helvetica');
    values.forEach((value, i) => {
      doc.text(value, x, y, { width: colWidths[i], ellipsis: true });
      x += colWidths[i];
    });
  }

  let y = doc.y;
  drawRow(headers, y, true);
  y += 16;
  doc.moveTo(doc.page.margins.left, y - 4).lineTo(doc.page.width - doc.page.margins.right, y - 4).strokeColor('#ccc').stroke();

  for (const t of tarefas) {
    if (y > doc.page.height - doc.page.margins.bottom - 20) {
      doc.addPage();
      y = doc.page.margins.top;
      drawRow(headers, y, true);
      y += 16;
    }
    drawRow([
      t.empreendimento_nome,
      CATEGORIA_LABELS[t.categoria] ?? t.categoria,
      t.titulo,
      t.responsavel ?? '',
      PRIORIDADE_LABELS[t.prioridade] ?? t.prioridade,
      STATUS_LABELS[t.status] ?? t.status,
      formatDate(t.prazo),
      t.atrasado ? 'Sim' : 'Não',
      t.observacoes ?? '',
    ], y);
    y += 16;
  }

  doc.end();
}
