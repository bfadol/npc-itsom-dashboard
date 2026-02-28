import { getDataUrl } from '../provider';

export async function fetchFileData<T>(sourceId: string, datasetKey: string): Promise<T> {
  const url = getDataUrl(sourceId, datasetKey);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FileAdapter: failed to fetch ${url} (${res.status})`);
  }
  return res.json();
}
