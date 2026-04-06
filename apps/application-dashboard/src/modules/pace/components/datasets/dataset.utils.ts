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

// Postgres wire-type names returned by information_schema / pg_catalog
enum PgColumnType {
  TEXT = 'text',
  CHARACTER_VARYING = 'character varying',
  TIMESTAMP = 'timestamp',
  TIMESTAMPTZ = 'timestamptz',
  INTEGER = 'integer',
  INT4 = 'int4',
  BIGINT = 'bigint',
  SMALLINT = 'smallint',
  BOOLEAN = 'boolean',
  BOOL = 'bool',
  REAL = 'real',
  FLOAT4 = 'float4',
  DOUBLE_PRECISION = 'double precision',
  FLOAT8 = 'float8',
  JSONB = 'jsonb',
  JSON = 'json',
}

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
  const normalized = pgType.toLowerCase() as PgColumnType;

  if (
    normalized === PgColumnType.TEXT ||
    normalized === PgColumnType.CHARACTER_VARYING ||
    normalized.startsWith('varchar')
  )
    return DatasetColumnTypes.TEXT;
  if (normalized.includes(PgColumnType.TIMESTAMP)) return DatasetColumnTypes.TIMESTAMP;
  if (
    normalized === PgColumnType.INTEGER ||
    normalized === PgColumnType.INT4 ||
    normalized === PgColumnType.BIGINT ||
    normalized === PgColumnType.SMALLINT
  )
    return DatasetColumnTypes.INTEGER;
  if (normalized === PgColumnType.BOOLEAN || normalized === PgColumnType.BOOL) return DatasetColumnTypes.BOOLEAN;
  if (normalized === PgColumnType.REAL || normalized === PgColumnType.FLOAT4) return DatasetColumnTypes.FLOAT;
  if (normalized === PgColumnType.DOUBLE_PRECISION || normalized === PgColumnType.FLOAT8)
    return DatasetColumnTypes.DOUBLE;
  if (normalized === PgColumnType.JSONB || normalized === PgColumnType.JSON) return DatasetColumnTypes.JSON;

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

// --- Column ordering helpers ---

/**
 * Given a new field order from AG Grid and the current blueprint columns,
 * returns a reordered BlueprintColumn array that matches the grid order,
 * appending any columns not present in the grid at the end.
 */
export const reorderBlueprintColumns = <T extends { id: string }>(
  newFieldOrder: string[],
  blueprintColumns: T[],
): T[] => {
  const colMap = new Map(blueprintColumns.map((c) => [c.id, c]));
  const reordered = newFieldOrder.map((f) => colMap.get(f)).filter((c): c is T => c !== undefined);
  const inGrid = new Set(newFieldOrder);
  const extra = blueprintColumns.filter((c) => !inGrid.has(c.id));

  return [...reordered, ...extra];
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
