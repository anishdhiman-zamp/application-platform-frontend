// Re-export everything from split modules for backward compatibility
export type { BlueprintColumn, ColumnModification } from './dataset.types';
export {
  COLUMN_TYPE_TO_PG,
  downloadCsvBlob,
  escapeSqlIdentifier,
  escapeSqlString,
  getCellEditorForPgType,
  pgTypeToColumnType,
  rowsToCsv,
  sanitizeSqlName as sanitizeColumnName,
  sanitizeSqlName,
  sanitizeSqlName as sanitizeTableName,
} from './dataset.utils';
export {
  buildAlterTableAddColumnQuery,
  buildAlterTableBatchQuery,
  buildAlterTableDropColumnQuery,
  buildBackfillNullsQuery,
  buildCountQuery,
  buildCreateTableQuery,
  buildFilterClauses,
  buildPrimaryKeyQuery,
  buildSelectTableQuery,
  buildTableColumnsDetailQuery,
  buildTableColumnsQuery,
  buildUpdateCellQuery,
  buildUpdateFillQuery,
  LIST_TABLES_QUERY,
} from './datasetQueryBuilder';

export const DETAIL_PAGE_SIZE = 100;
export const EXPORT_CHUNK_SIZE = 5000;
export const COL_PREFIX = 'col_';
