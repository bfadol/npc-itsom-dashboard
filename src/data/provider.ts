export type DataMode = 'file' | 'api' | 'stream';

export interface DataProviderConfig {
  mode: DataMode;
  baseUrl: string;
}

const config: DataProviderConfig = {
  mode: 'file',
  baseUrl: '/api/data',
};

export function getDataUrl(sourceId: string, datasetKey: string): string {
  return `${config.baseUrl}/${sourceId}/${datasetKey}`;
}

export function getConfig(): DataProviderConfig {
  return config;
}
