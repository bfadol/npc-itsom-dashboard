// Phase 2 placeholder — same interface as file-adapter
// Will connect to live APIs when available

export async function fetchApiData<T>(sourceId: string, datasetKey: string): Promise<T> {
  const url = `/api/live/${sourceId}/${datasetKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`APIAdapter: failed to fetch ${url} (${res.status})`);
  }
  return res.json();
}
