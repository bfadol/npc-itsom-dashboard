import Papa from 'papaparse';
import fs from 'fs';

export interface ParseResult {
  headers: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

/** Parse CSV string */
export function parseCSV(content: string): ParseResult {
  const result = Papa.parse<Record<string, unknown>>(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });
  return {
    headers: result.meta.fields ?? [],
    rows: result.data,
    rowCount: result.data.length,
  };
}

/** Parse XLSX buffer (dynamic import to avoid bundling issues) */
export async function parseXLSX(buffer: Buffer): Promise<ParseResult> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  return { headers, rows: data, rowCount: data.length };
}

/** Parse JSON string */
export function parseJSON(content: string): ParseResult {
  const parsed = JSON.parse(content);

  // If it's an array of objects → treat as tabular data
  if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
    const headers = Object.keys(parsed[0] as Record<string, unknown>);
    return { headers, rows: parsed, rowCount: parsed.length };
  }

  // If it's a single object (dashboard-format JSON), return as-is wrapped in array
  return { headers: Object.keys(parsed), rows: [parsed], rowCount: 1 };
}

/** Auto-detect format and parse file */
export async function parseFile(filePath: string, format: string): Promise<ParseResult> {
  if (format === 'csv') {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseCSV(content);
  }
  if (format === 'xlsx' || format === 'xls') {
    const buffer = fs.readFileSync(filePath);
    return parseXLSX(buffer);
  }
  if (format === 'json') {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseJSON(content);
  }
  throw new Error(`Unsupported format: ${format}`);
}
