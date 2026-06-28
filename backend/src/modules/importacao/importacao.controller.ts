import { Request, Response } from 'express';
import { HttpError } from '../../middleware/errorHandler';
import { importWorkbookFromBuffer } from './importacao.service';

export async function importarHandler(req: Request, res: Response) {
  const file = req.file;
  if (!file) throw new HttpError(400, 'Selecione um arquivo .xlsx para importar');

  const resumo = await importWorkbookFromBuffer(file.buffer);
  res.status(201).json({ resumo });
}
