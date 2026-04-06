import * as XLSX from 'xlsx';

export interface WorkerRequest {
  id: number;
  type: 'parse' | 'switchSheet';
  payload: {
    data?: ArrayBuffer | string;
    readType?: 'array' | 'string';
    sheetName?: string;
  };
}

export interface WorkerResponse {
  id: number;
  type: 'result' | 'error';
  payload: {
    headers: string[];
    rows: Record<string, string>[];
    sheetNames: string[];
  } | null;
  error?: string;
}

let cachedWorkbook: XLSX.WorkBook | null = null;

function parseSheet(workbook: XLSX.WorkBook, sheetName: string) {
  const sheet = workbook?.Sheets?.[sheetName];

  if (!sheet) return { headers: [] as string[], rows: [] as Record<string, string>[] };

  let jsonData: string[][];

  try {
    jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });
  } catch {
    return { headers: [] as string[], rows: [] as Record<string, string>[] };
  }

  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    return { headers: [] as string[], rows: [] as Record<string, string>[] };
  }

  const rawHeaders = (jsonData[0] ?? []) as string[];
  const hasAnyHeader = rawHeaders.some((v) => v != null && String(v).trim() !== '');

  if (!hasAnyHeader) return { headers: [] as string[], rows: [] as Record<string, string>[] };

  const seenHeaders = new Map<string, number>();
  const headers = rawHeaders.map((headerValue, index) => {
    const base = headerValue && String(headerValue).trim() ? String(headerValue) : `Column ${index + 1}`;
    const count = seenHeaders.get(base) ?? 0;

    seenHeaders.set(base, count + 1);

    return count === 0 ? base : `${base}_${count}`;
  });

  const rows = jsonData.slice(1).map((row) => {
    const rowData: Record<string, string> = {};
    const safeRow = Array.isArray(row) ? row : [];

    headers.forEach((header, index) => {
      rowData[header] = safeRow[index] != null ? String(safeRow[index]) : '';
    });

    return rowData;
  });

  return { headers, rows };
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, type, payload } = e.data;

  try {
    if (type === 'parse') {
      if (cachedWorkbook) cachedWorkbook = null;

      const workbook = XLSX.read(payload.data, { type: payload.readType });

      cachedWorkbook = workbook;

      const sheetNames = workbook.SheetNames ?? [];
      const firstSheet = sheetNames[0] ?? '';
      const parsed = parseSheet(workbook, firstSheet);

      const response: WorkerResponse = {
        id,
        type: 'result',
        payload: { ...parsed, sheetNames },
      };

      self.postMessage(response);
    } else if (type === 'switchSheet') {
      if (!cachedWorkbook || !payload.sheetName) {
        const response: WorkerResponse = {
          id,
          type: 'error',
          payload: null,
          error: 'No workbook loaded',
        };

        self.postMessage(response);

        return;
      }

      const parsed = parseSheet(cachedWorkbook, payload.sheetName);
      const sheetNames = cachedWorkbook.SheetNames ?? [];

      const response: WorkerResponse = {
        id,
        type: 'result',
        payload: { ...parsed, sheetNames },
      };

      self.postMessage(response);
    }
  } catch (err) {
    const response: WorkerResponse = {
      id,
      type: 'error',
      payload: null,
      error: err instanceof Error ? err.message : 'Unknown worker error',
    };

    self.postMessage(response);
  }
};
