import { useQuery } from '@tanstack/react-query';
import { getSummary } from '../api/dashboard';

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard-summary'], queryFn: getSummary, refetchInterval: 60_000 });
}
