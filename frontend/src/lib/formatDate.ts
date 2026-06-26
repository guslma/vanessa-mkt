// Datas vindas da API (colunas `date` do Postgres) chegam como ISO completo
// (ex: "2026-06-20T00:00:00.000Z"). Tratamos sempre como string e cortamos
// para "YYYY-MM-DD" antes de qualquer formatação/uso em <input type="date">,
// evitando tanto bugs de parsing quanto de fuso horário (Date + toLocale*
// pode "voltar um dia" perto da meia-noite em UTC-3).

export function toDateOnly(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 10);
}

export function formatDateBR(value: string | null | undefined): string {
  const dateOnly = toDateOnly(value);
  if (!dateOnly) return '';
  const [year, month, day] = dateOnly.split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}
