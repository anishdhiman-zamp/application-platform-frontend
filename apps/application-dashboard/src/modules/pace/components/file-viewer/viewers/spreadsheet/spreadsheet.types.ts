export interface ParsedSheetResult {
  headers: string[];
  rows: Record<string, string>[];
}

export interface SpreadsheetData extends ParsedSheetResult {
  sheetNames: string[];
}

export interface SpreadsheetViewerProps {
  content?: string | null;
  mediaUrl?: string | null;
  fileExtension: string;
}

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const ROW_NUMBER_COLUMN_ID = '__row_number';

export { TEXT_SPREADSHEET_EXTENSIONS as TEXT_BASED_EXTENSIONS } from '@/modules/pace/components/files/files.constants';

export const EMPTY_PARSE_RESULT: ParsedSheetResult = { headers: [], rows: [] };
