import { ApiError } from '../api/client';

export function errorMessage(err: unknown, fallback = 'Algo deu errado, tente novamente'): string {
  return err instanceof ApiError ? err.message : fallback;
}
