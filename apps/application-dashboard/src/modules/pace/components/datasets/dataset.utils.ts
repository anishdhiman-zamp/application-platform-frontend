import { DatasetColumnTypes } from '@zamp-platform/dataset-create-edit';

// --- Low-level helpers ---

export const escapeSqlString = (value: string): string => value.replace(/'/g, "''");
export const escapeSqlIdentifier = (name: string): string => name.replace(/"/g, '""');

export const sanitizeSqlName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

// --- Type mappings ---

export const COLUMN_TYPE_TO_PG: Record<string, string> = {
  [DatasetColumnTypes.TEXT]: 'TEXT',
  [DatasetColumnTypes.TIMESTAMP]: 'TIMESTAMPTZ',
  [DatasetColumnTypes.INTEGER]: 'INTEGER',
  [DatasetColumnTypes.BOOLEAN]: 'BOOLEAN',
  [DatasetColumnTypes.FLOAT]: 'REAL',
  [DatasetColumnTypes.DOUBLE]: 'DOUBLE PRECISION',
  [DatasetColumnTypes.DOUBLE_PRECISION]: 'DOUBLE PRECISION',
  [DatasetColumnTypes.JSON]: 'JSONB',
};

export const pgTypeToColumnType = (pgType: string): DatasetColumnTypes => {
  const normalized = pgType.toLowerCase();

  if (normalized === 'text' || normalized === 'character varying' || normalized.startsWith('varchar'))
    return DatasetColumnTypes.TEXT;
  if (normalized.includes('timestamp')) return DatasetColumnTypes.TIMESTAMP;
  if (normalized === 'integer' || normalized === 'int4' || normalized === 'bigint' || normalized === 'smallint')
    return DatasetColumnTypes.INTEGER;
  if (normalized === 'boolean' || normalized === 'bool') return DatasetColumnTypes.BOOLEAN;
  if (normalized === 'real' || normalized === 'float4') return DatasetColumnTypes.FLOAT;
  if (normalized === 'double precision' || normalized === 'float8') return DatasetColumnTypes.DOUBLE;
  if (normalized === 'jsonb' || normalized === 'json') return DatasetColumnTypes.JSON;

  return DatasetColumnTypes.TEXT;
};

// --- Cell editor mapping (Postgres type -> AG Grid editor) ---

export const getCellEditorForPgType = (
  pgType: string,
): { cellEditor: string; cellEditorParams?: Record<string, unknown> } => {
  const colType = pgTypeToColumnType(pgType);

  switch (colType) {
    case DatasetColumnTypes.INTEGER:
    case DatasetColumnTypes.FLOAT:
    case DatasetColumnTypes.DOUBLE:
    case DatasetColumnTypes.DOUBLE_PRECISION:
      return { cellEditor: 'agNumberCellEditor' };
    case DatasetColumnTypes.BOOLEAN:
      return {
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: { values: ['', 'true', 'false'], allowTyping: true, filterList: true },
      };
    default:
      return { cellEditor: 'agTextCellEditor' };
  }
};

// --- CSV export helpers ---

const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);

  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
};

export const rowsToCsv = (rows: Record<string, unknown>[], includeHeader: boolean): string => {
  if (rows.length === 0) return '';
  const keys = Object.keys(rows[0]);
  const lines: string[] = [];

  if (includeHeader) {
    lines.push(keys.map(escapeCsvValue).join(','));
  }
  for (const row of rows) {
    lines.push(keys.map((k) => escapeCsvValue(row[k])).join(','));
  }

  return lines.join('\n');
};

export const downloadCsvBlob = (csv: string, fileName: string): void => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
