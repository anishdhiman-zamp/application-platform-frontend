import { DatasetColumnTypes } from '@zamp-platform/dataset-create-edit';
import type { BlueprintColumn, ColumnModification } from 'modules/pace/components/datasets/dataset.types';
import {
  COLUMN_TYPE_TO_PG,
  escapeSqlIdentifier,
  escapeSqlString,
  sanitizeSqlName,
} from 'modules/pace/components/datasets/dataset.utils';

export const LIST_TABLES_QUERY = `SELECT table_name FROM _accessible_tables ORDER BY table_name`;

// --- DDL query builders ---

export const buildCreateTableQuery = (tableName: string, columns: BlueprintColumn[]): string => {
  const safeName = escapeSqlIdentifier(sanitizeSqlName(tableName));
  const colDefs = columns.map((col) => {
    const colName = escapeSqlIdentifier(sanitizeSqlName(col.name));
    const pgType = COLUMN_TYPE_TO_PG[col.type] ?? 'TEXT';
    const notNull = col.required ? ' NOT NULL' : '';

    return `"${colName}" ${pgType}${notNull}`;
  });

  return `CREATE TABLE "${safeName}" ("id" SERIAL PRIMARY KEY, ${colDefs.join(', ')})`;
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

  return `ALTER TABLE "${escapeSqlIdentifier(tableName)}" ADD COLUMN "${escapeSqlIdentifier(sanitizeSqlName(col.name))}" ${pgType}${defaultClause}${notNull}`;
};

export const buildAlterTableDropColumnQuery = (tableName: string, columnName: string): string =>
  `ALTER TABLE "${escapeSqlIdentifier(tableName)}" DROP COLUMN "${escapeSqlIdentifier(columnName)}"`;

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

    ops.push(`ADD COLUMN "${escapeSqlIdentifier(sanitizeSqlName(col.name))}" ${pgType}${defaultClause}${notNull}`);
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
        `ALTER TABLE ${table} RENAME COLUMN "${escapeSqlIdentifier(mod.oldName)}" TO "${escapeSqlIdentifier(sanitizeSqlName(mod.newName))}"`,
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

// --- Primary key detection ---

export const buildPrimaryKeyQuery = (tableName: string): string =>
  `SELECT a.attname AS column_name FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey) WHERE i.indrelid = '"${escapeSqlString(tableName)}"'::regclass AND i.indisprimary LIMIT 1`;

// --- UPDATE query builders ---

export const buildUpdateCellQuery = (
  tableName: string,
  column: string,
  newValue: unknown,
  rowId: string,
  pkColumn: string,
): string => {
  const val =
    newValue === null || newValue === undefined || newValue === '' ? 'NULL' : `'${escapeSqlString(String(newValue))}'`;

  return `UPDATE "${escapeSqlIdentifier(tableName)}" SET "${escapeSqlIdentifier(column)}" = ${val} WHERE "${escapeSqlIdentifier(pkColumn)}" = '${escapeSqlString(String(rowId))}'`;
};

export const buildUpdateFillQuery = (
  tableName: string,
  column: string,
  newValue: unknown,
  rowIds: string[],
  pkColumn: string,
): string => {
  const val =
    newValue === null || newValue === undefined || newValue === '' ? 'NULL' : `'${escapeSqlString(String(newValue))}'`;
  const ids = rowIds.map((id) => `'${escapeSqlString(String(id))}'`).join(', ');

  return `UPDATE "${escapeSqlIdentifier(tableName)}" SET "${escapeSqlIdentifier(column)}" = ${val} WHERE "${escapeSqlIdentifier(pkColumn)}" IN (${ids})`;
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
  defaultSortColumn?: string,
): string => {
  let query = `SELECT * FROM "${escapeSqlIdentifier(tableName)}"`;

  if (filterClauses) query += ` WHERE ${filterClauses}`;
  if (sortModel?.length) {
    query += ` ORDER BY ${sortModel.map((s) => `"${escapeSqlIdentifier(s.colId)}" ${s.sort === 'desc' ? 'DESC' : 'ASC'}`).join(', ')}`;
  } else if (defaultSortColumn) {
    query += ` ORDER BY "${escapeSqlIdentifier(defaultSortColumn)}" ASC`;
  }
  query += ` LIMIT ${limit} OFFSET ${offset}`;

  return query;
};

export const buildCountQuery = (tableName: string, filterClauses?: string): string => {
  let query = `SELECT COUNT(*) AS total FROM "${escapeSqlIdentifier(tableName)}"`;

  if (filterClauses) query += ` WHERE ${filterClauses}`;

  return query;
};
