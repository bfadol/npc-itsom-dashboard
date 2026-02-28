import { useQuery } from '@tanstack/react-query';
import { getDataUrl } from '../provider';

export interface DataSourceOptions<T = unknown> {
  refreshInterval?: number;
  enabled?: boolean;
  transform?: (raw: unknown) => T;
}

export interface DataSourceResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  lastRefresh: Date | null;
  source: 'file' | 'api' | 'stream';
  staleMinutes: number;
}

async function fetchData<T>(url: string, transform?: (raw: unknown) => T): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const raw = await res.json();
  return transform ? transform(raw) : (raw as T);
}

export function useDataSource<T = unknown>(
  sourceId: string,
  datasetKey: string,
  options?: DataSourceOptions<T>,
): DataSourceResult<T> {
  const url = getDataUrl(sourceId, datasetKey);

  const query = useQuery<T, Error>({
    queryKey: ['data', sourceId, datasetKey],
    queryFn: () => fetchData<T>(url, options?.transform),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refreshInterval,
    staleTime: 5 * 60 * 1000,
  });

  const lastRefresh = query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null;
  const staleMinutes = lastRefresh
    ? Math.round((Date.now() - lastRefresh.getTime()) / 60000)
    : 0;

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    lastRefresh,
    source: 'file',
    staleMinutes,
  };
}
