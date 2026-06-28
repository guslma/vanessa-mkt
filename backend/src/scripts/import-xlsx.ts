import fs from 'fs';
import { pool } from '../db/pool';
import { importWorkbookFromBuffer } from '../modules/importacao/importacao.service';

async function main() {
  const filePath = process.argv.find((a) => a.startsWith('--file='))?.split('=')[1];
  const dryRun = process.argv.includes('--dry-run');

  if (!filePath) {
    console.error('Uso: npm run import -- --file="./planilha.xlsx" [--dry-run]');
    process.exit(1);
  }

  const buffer = fs.readFileSync(filePath);
  const resumo = await importWorkbookFromBuffer(buffer, { dryRun });

  resumo.avisos.forEach((aviso) => console.warn(aviso));
  console.log('--- Resumo da importação ---');
  console.log(`Empreendimentos: ${resumo.empreendimentosInseridos} inseridos, ${resumo.empreendimentosIgnorados} ignorados`);
  console.log(`Tarefas: ${resumo.tarefasInseridas} inseridas`);
  if (resumo.empreendimentosCriadosAutomaticamente > 0) {
    console.log(`${resumo.empreendimentosCriadosAutomaticamente} empreendimento(s) criado(s) automaticamente a partir da aba Tarefas — revise tipo/fase.`);
  }
  if (dryRun) console.log('(dry-run: nada foi gravado no banco)');

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
