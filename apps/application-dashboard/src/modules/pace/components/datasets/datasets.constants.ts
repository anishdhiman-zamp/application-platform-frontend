import { DatasetColumnTypes } from '@zamp-platform/dataset-create-edit';

export const LIST_TABLES_QUERY = `SELECT table_name FROM _accessible_tables ORDER BY table_name`;

export const DETAIL_PAGE_SIZE = 100;
export const EXPORT_CHUNK_SIZE = 5000;

// --- Low-level helpers ---

export const escapeSqlString = (value: string): string => value.replace(/'/g, "''");
export const escapeSqlIdentifier = (name: string): string => name.replace(/"/g, '""');

export const sanitizeTableName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

export const sanitizeColumnName = (name: string): string =>
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

// --- Types ---

export interface BlueprintColumn {
  id: string;
  name: string;
  type: DatasetColumnTypes;
  required: boolean;
  defaultValue?: string | null;
}

// --- DDL query builders ---

export const buildCreateTableQuery = (tableName: string, columns: BlueprintColumn[]): string => {
  const safeName = escapeSqlIdentifier(sanitizeTableName(tableName));
  const colDefs = columns.map((col) => {
    const colName = escapeSqlIdentifier(sanitizeColumnName(col.name));
    const pgType = COLUMN_TYPE_TO_PG[col.type] ?? 'TEXT';
    const notNull = col.required ? ' NOT NULL' : '';

    return `"${colName}" ${pgType}${notNull}`;
  });

  return `CREATE TABLE "${safeName}" (${colDefs.join(', ')})`;
};

export const buildAlterTableAddColumnQuery = (
  tableName: string,
  col: { name: string; type: DatasetColumnTypes; required: boolean; defaultValue?: string | null },
): string => {
  const pgType = COLUMN_TYPE_TO_PG[col.type] ?? 'TEXT';
  const defaultClause =
    col.required && col.defaultValue != null && col.defaultValue !== ''
      ? ` DEFAULT '${escapeSqlString(col.defaultValue)}'`
      : '';
  const notNull = col.required ? ' NOT NULL' : '';

  return `ALTER TABLE "${escapeSqlIdentifier(tableName)}" ADD COLUMN "${escapeSqlIdentifier(sanitizeColumnName(col.name))}" ${pgType}${defaultClause}${notNull}`;
};

export const buildAlterTableDropColumnQuery = (tableName: string, columnName: string): string =>
  `ALTER TABLE "${escapeSqlIdentifier(tableName)}" DROP COLUMN "${escapeSqlIdentifier(columnName)}"`;

export interface ColumnModification {
  oldName: string;
  newName?: string;
  setNotNull?: boolean;
  dropNotNull?: boolean;
  defaultValue?: string | null;
}

export const buildAlterTableBatchQuery = (
  tableName: string,
  drops: string[],
  adds: { name: string; type: DatasetColumnTypes; required: boolean; defaultValue?: string | null }[],
  modifications?: ColumnModification[],
): string => {
  const table = `"${escapeSqlIdentifier(tableName)}"`;
  const statements: string[] = [];
  const ops: string[] = [];

  for (const col of drops) {
    ops.push(`DROP COLUMN "${escapeSqlIdentifier(col)}"`);
  }
  for (const col of adds) {
    const pgType = COLUMN_TYPE_TO_PG[col.type] ?? 'TEXT';
    const defaultClause =
      col.required && col.defaultValue != null && col.defaultValue !== ''
        ? ` DEFAULT '${escapeSqlString(col.defaultValue)}'`
        : '';
    const notNull = col.required ? ' NOT NULL' : '';

    ops.push(`ADD COLUMN "${escapeSqlIdentifier(sanitizeColumnName(col.name))}" ${pgType}${defaultClause}${notNull}`);
  }
  for (const mod of modifications ?? []) {
    if (mod.setNotNull) ops.push(`ALTER COLUMN "${escapeSqlIdentifier(mod.oldName)}" SET NOT NULL`);
    if (mod.dropNotNull) ops.push(`ALTER COLUMN "${escapeSqlIdentifier(mod.oldName)}" DROP NOT NULL`);
  }

  if (ops.length) {
    statements.push(`ALTER TABLE ${table} ${ops.join(', ')}`);
  }

  // RENAME COLUMN must be a separate ALTER TABLE per rename in PostgreSQL
  for (const mod of modifications ?? []) {
    if (mod.newName && mod.newName !== mod.oldName) {
      statements.push(
        `ALTER TABLE ${table} RENAME COLUMN "${escapeSqlIdentifier(mod.oldName)}" TO "${escapeSqlIdentifier(sanitizeColumnName(mod.newName))}"`,
      );
    }
  }

  return statements.join(';\n');
};

export const buildBackfillNullsQuery = (tableName: string, columnName: string, defaultValue: string): string =>
  `UPDATE "${escapeSqlIdentifier(tableName)}" SET "${escapeSqlIdentifier(columnName)}" = '${escapeSqlString(defaultValue)}' WHERE "${escapeSqlIdentifier(columnName)}" IS NULL`;

// --- Schema introspection queries ---

export const buildTableColumnsQuery = (tableName: string): string =>
  `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${escapeSqlString(tableName)}' ORDER BY ordinal_position`;

export const buildTableColumnsDetailQuery = (tableName: string): string =>
  `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${escapeSqlString(tableName)}' ORDER BY ordinal_position`;

// --- Row identity (backend auto-injects this into CREATE TABLE) ---

export const ZAMP_ROW_ID_COLUMN = '_zamp_row_id';

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

// --- UPDATE query builders ---

export const buildUpdateCellQuery = (tableName: string, column: string, newValue: unknown, rowId: string): string => {
  const val =
    newValue === null || newValue === undefined || newValue === '' ? 'NULL' : `'${escapeSqlString(String(newValue))}'`;

  return `UPDATE "${escapeSqlIdentifier(tableName)}" SET "${escapeSqlIdentifier(column)}" = ${val} WHERE "${ZAMP_ROW_ID_COLUMN}" = '${escapeSqlString(rowId)}'`;
};

export const buildUpdateFillQuery = (
  tableName: string,
  column: string,
  newValue: unknown,
  rowIds: string[],
): string => {
  const val =
    newValue === null || newValue === undefined || newValue === '' ? 'NULL' : `'${escapeSqlString(String(newValue))}'`;
  const ids = rowIds.map((id) => `'${escapeSqlString(id)}'`).join(', ');

  return `UPDATE "${escapeSqlIdentifier(tableName)}" SET "${escapeSqlIdentifier(column)}" = ${val} WHERE "${ZAMP_ROW_ID_COLUMN}" IN (${ids})`;
};

// --- DML query builders ---

const buildSingleFilterClause = (colId: string, condition: Record<string, unknown>): string | undefined => {
  const col = `"${escapeSqlIdentifier(colId)}"`;
  const value = escapeSqlString(String(condition.filter ?? ''));

  switch (condition.type) {
    case 'contains':
      return `${col}::text ILIKE '%${value}%'`;
    case 'notContains':
    case 'ncontains':
      return `${col}::text NOT ILIKE '%${value}%'`;
    case 'equals':
    case 'eq':
      return `${col}::text = '${value}'`;
    case 'notEqual':
    case 'neq':
      return `${col}::text != '${value}'`;
    case 'startsWith':
    case 'startswith':
      return `${col}::text ILIKE '${value}%'`;
    case 'endsWith':
    case 'endswith':
      return `${col}::text ILIKE '%${value}'`;
    case 'blank':
    case 'is_null':
      return `(${col} IS NULL OR ${col}::text = '')`;
    case 'notBlank':
      return `(${col} IS NOT NULL AND ${col}::text != '')`;
    default:
      return undefined;
  }
};

export const buildFilterClauses = (filterModel: Record<string, Record<string, unknown>>): string | undefined => {
  const clauses: string[] = [];

  for (const [colId, filter] of Object.entries(filterModel)) {
    if (filter.conditions && Array.isArray(filter.conditions)) {
      const subClauses = (filter.conditions as Record<string, unknown>[])
        .map((c) => buildSingleFilterClause(colId, c))
        .filter(Boolean);

      if (subClauses.length) {
        const op = filter.operator === 'OR' ? ' OR ' : ' AND ';

        clauses.push(`(${subClauses.join(op)})`);
      }
    } else {
      const clause = buildSingleFilterClause(colId, filter);

      if (clause) clauses.push(clause);
    }
  }

  return clauses.length ? clauses.join(' AND ') : undefined;
};

export const buildSelectTableQuery = (
  tableName: string,
  limit: number,
  offset: number,
  sortModel?: { colId: string; sort: string }[],
  filterClauses?: string,
): string => {
  let query = `SELECT * FROM "${escapeSqlIdentifier(tableName)}"`;

  if (filterClauses) query += ` WHERE ${filterClauses}`;
  if (sortModel?.length) {
    query += ` ORDER BY ${sortModel.map((s) => `"${escapeSqlIdentifier(s.colId)}" ${s.sort === 'desc' ? 'DESC' : 'ASC'}`).join(', ')}`;
  }
  query += ` LIMIT ${limit} OFFSET ${offset}`;

  return query;
};

export const buildCountQuery = (tableName: string, filterClauses?: string): string => {
  let query = `SELECT COUNT(*) AS total FROM "${escapeSqlIdentifier(tableName)}"`;

  if (filterClauses) query += ` WHERE ${filterClauses}`;

  return query;
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
