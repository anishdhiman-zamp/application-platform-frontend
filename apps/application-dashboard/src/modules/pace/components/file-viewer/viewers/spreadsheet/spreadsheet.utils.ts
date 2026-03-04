import * as XLSX from 'xlsx';
import {
  EMPTY_PARSE_RESULT,
  type ParsedSheetResult,
} from '@/modules/pace/components/file-viewer/viewers/spreadsheet/spreadsheet.types';

export function parseWorkbook(workbook: XLSX.WorkBook, sheetName: string): ParsedSheetResult {
  const sheet = workbook?.Sheets?.[sheetName];

  if (!sheet) return { ...EMPTY_PARSE_RESULT };

  let jsonData: string[][];

  try {
    jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });
  } catch {
    return { ...EMPTY_PARSE_RESULT };
  }

  if (!Array.isArray(jsonData) || jsonData?.length === 0) return { ...EMPTY_PARSE_RESULT };

  const rawHeaders = (jsonData[0] ?? []) as string[];
  const hasAnyHeader = rawHeaders.some((headerValue) => headerValue != null && String(headerValue).trim() !== '');

  if (!hasAnyHeader) return { ...EMPTY_PARSE_RESULT };

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
