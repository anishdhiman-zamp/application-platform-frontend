import type { ColumnDataType } from '../components/DatasetColumDetails';
import { DatasetColumnTypes } from '../constants';

/**
 * Generic filter config type - apps can extend this
 */
export interface FilterConfigType {
  column: string;
  alias?: string;
  datatype: string;
  metadata?: {
    is_hidden?: boolean;
    is_required?: boolean;
  };
}

/**
 * Converts snake_case to friendly display name
 * Example: "invoice_description" → "Invoice Description"
 */
export const snakeCaseToDisplayName = (str: string): string => {
  if (!str) return '';

  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Pattern mapping for datatype to column type conversion
 * Each entry maps patterns (substrings) to a column type
 */
const DATATYPE_PATTERNS: Array<{ patterns: string[]; type: DatasetColumnTypes }> = [
  { patterns: ['text', 'string', 'varchar'], type: DatasetColumnTypes.TEXT },
  { patterns: ['int', 'float', 'decimal', 'double', 'numeric'], type: DatasetColumnTypes.NUMBER },
  { patterns: ['date', 'time'], type: DatasetColumnTypes.DATE },
  { patterns: ['file', 'blob'], type: DatasetColumnTypes.FILE },
  { patterns: ['link', 'url'], type: DatasetColumnTypes.LINK },
  { patterns: ['email', 'mail'], type: DatasetColumnTypes.EMAIL },
];

/**
 * Maps AG Grid/API datatype to Blueprint column type
 */
export const mapDatatypeToColumnType = (datatype: string): DatasetColumnTypes => {
  const datatypeLower = datatype?.toLowerCase() || '';

  const match = DATATYPE_PATTERNS.find(({ patterns }) => patterns.some((pattern) => datatypeLower.includes(pattern)));

  return match?.type ?? DatasetColumnTypes.TEXT;
};

/**
 * Converts AG Grid filterConfig to Blueprint column format
 * This allows the Blueprint to display and edit the schema of existing datasets
 *
 * @param filterConfig - Array of column configs from the dataset API
 * @returns Array of columns in Blueprint format
 */
export const convertFilterConfigToColumns = <T extends FilterConfigType>(filterConfig: T[]): ColumnDataType[] => {
  if (!filterConfig || filterConfig.length === 0) {
    return [];
  }

  return filterConfig
    .filter((config) => !config.metadata?.is_hidden) // Only show visible columns in Blueprint
    .map((config) => {
      // Check if alias is already in friendly format (has spaces or capital letters)
      const aliasIsFriendly = config.alias && (config.alias.includes(' ') || /[A-Z]/.test(config.alias));

      const displayName = aliasIsFriendly ? config.alias : snakeCaseToDisplayName(config.column);

      const columnData: ColumnDataType = {
        id: config.column, // STABLE ID from API (e.g., "invoice_description") - NEVER changes
        column_name: displayName || '', // Always friendly format
        column_type: mapDatatypeToColumnType(config.datatype),
        required: config.metadata?.is_required || false,
      };

      return columnData;
    });
};

/**
 * Converts Blueprint columns to filterConfig format (for API updates)
 *
 * @param columns - Array of columns from Blueprint
 * @returns Partial filterConfig format for API updates
 */
export const convertColumnsToFilterConfig = (columns: ColumnDataType[]): Partial<FilterConfigType>[] => {
  return columns.map((col) => ({
    column: col.column_name,
    alias: col.column_name,
    datatype: col.column_type,
    metadata: {
      is_required: col.required,
    },
  }));
};
