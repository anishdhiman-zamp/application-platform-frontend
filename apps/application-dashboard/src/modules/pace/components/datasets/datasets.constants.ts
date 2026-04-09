// Re-export everything from split modules for backward compatibility
export type { BlueprintColumn, ColumnModification } from './dataset.types';
export {
  COLUMN_TYPE_TO_PG,
  downloadCsvBlob,
  escapeSqlIdentifier,
  escapeSqlString,
  getCellEditorForPgType,
  pgTypeToColumnType,
  reorderBlueprintColumns,
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

import { DatasetRoleValue } from '@/apis/agentManagedDb';
import { ResourcePrivilege, ResourceType } from '@/modules/shareResource/shareResource.types';

export const DATASETS_POLL_INTERVAL_MS = 5000;
export const DETAIL_PAGE_SIZE = 100;
export const EXPORT_CHUNK_SIZE = 5000;
export const COL_PREFIX = 'col_';
export const COLUMN_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_ ]*$/;
export const COLUMN_NAME_MAX_LENGTH = 60;
export const COLUMN_NAME_ERROR = 'Column name must start with a letter and contain only letters, numbers, or spaces';
export const COLUMN_NAME_LENGTH_ERROR = `Column name must not exceed ${COLUMN_NAME_MAX_LENGTH} characters`;

export const NEON_DATASET_ROLES: ResourcePrivilege[] = [
  { kind: ResourceType.DATASET, label: 'Admin', value: DatasetRoleValue.ADMIN, desc: 'Can manage and share dataset' },
  { kind: ResourceType.DATASET, label: 'Viewer', value: DatasetRoleValue.VIEWER, desc: 'Can read data only' },
  { kind: ResourceType.DATASET, label: 'Editor', value: DatasetRoleValue.EDITOR, desc: 'Can update existing data' },
];
