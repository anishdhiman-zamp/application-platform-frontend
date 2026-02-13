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
    default_value?: string | boolean | null;
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
 * Order matters - more specific patterns should come first
 */
const DATATYPE_PATTERNS: Array<{ patterns: string[]; type: DatasetColumnTypes }> = [
  { patterns: ['boolean', 'bool'], type: DatasetColumnTypes.BOOLEAN },
  { patterns: ['timestamp', 'datetime'], type: DatasetColumnTypes.TIMESTAMP },
  { patterns: ['double'], type: DatasetColumnTypes.DOUBLE },
  { patterns: ['float', 'real'], type: DatasetColumnTypes.FLOAT },
  { patterns: ['int', 'integer', 'bigint', 'smallint'], type: DatasetColumnTypes.INTEGER },
  { patterns: ['json', 'jsonb'], type: DatasetColumnTypes.JSON },
  { patterns: ['text', 'string', 'varchar', 'char'], type: DatasetColumnTypes.TEXT },
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
 * Maps backend schema type (e.g., "TEXT", "INTEGER") to frontend DatasetColumnTypes enum
 * This handles the case sensitivity difference between backend and frontend
 */
export const mapSchemaTypeToColumnType = (schemaType: string | null | undefined): DatasetColumnTypes => {
  if (!schemaType) return DatasetColumnTypes.TEXT;

  const typeLower = schemaType.toLowerCase().trim();

  // Direct mapping for known types
  const directMapping: Record<string, DatasetColumnTypes> = {
    // Text types
    text: DatasetColumnTypes.TEXT,
    varchar: DatasetColumnTypes.TEXT,
    char: DatasetColumnTypes.TEXT,
    string: DatasetColumnTypes.TEXT,
    // Integer types
    integer: DatasetColumnTypes.INTEGER,
    int: DatasetColumnTypes.INTEGER,
    int4: DatasetColumnTypes.INTEGER,
    int8: DatasetColumnTypes.INTEGER,
    bigint: DatasetColumnTypes.INTEGER,
    smallint: DatasetColumnTypes.INTEGER,
    // Boolean types
    boolean: DatasetColumnTypes.BOOLEAN,
    bool: DatasetColumnTypes.BOOLEAN,
    // Timestamp types
    timestamp: DatasetColumnTypes.TIMESTAMP,
    timestamptz: DatasetColumnTypes.TIMESTAMP,
    datetime: DatasetColumnTypes.TIMESTAMP,
    date: DatasetColumnTypes.TIMESTAMP,
    time: DatasetColumnTypes.TIMESTAMP,
    timetz: DatasetColumnTypes.TIMESTAMP,
    // Float types
    float: DatasetColumnTypes.FLOAT,
    float4: DatasetColumnTypes.FLOAT,
    real: DatasetColumnTypes.FLOAT,
    // Double types
    double: DatasetColumnTypes.DOUBLE,
    float8: DatasetColumnTypes.DOUBLE,
    'double precision': DatasetColumnTypes.DOUBLE,
    numeric: DatasetColumnTypes.DOUBLE,
    decimal: DatasetColumnTypes.DOUBLE,
    // JSON types
    json: DatasetColumnTypes.JSON,
    jsonb: DatasetColumnTypes.JSON,
  };

  // Check direct mapping first
  if (directMapping[typeLower]) {
    return directMapping[typeLower];
  }

  // Fall back to pattern-based matching
  return mapDatatypeToColumnType(schemaType);
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
      // Use alias if provided, otherwise fall back to friendly format of column name
      // Always prefer the alias when it exists, as it's the user-defined display name
      const displayName = config.alias || snakeCaseToDisplayName(config.column);

      // Map the datatype to column type - use mapSchemaTypeToColumnType for better coverage
      const columnType = mapSchemaTypeToColumnType(config.datatype);

      const columnData: ColumnDataType = {
        id: config?.column, // STABLE ID from API (e.g., "invoice_description") - NEVER changes
        column_name: displayName || '', // Always friendly format
        column_type: columnType,
        required: config?.metadata?.is_required || false,
        default: config?.metadata?.default_value ?? null,
      };

      return columnData;
    });
};

/**
 * Normalizes column types for comparison purposes.
 * Groups equivalent types together (e.g., FLOAT, DOUBLE, DOUBLE PRECISION are all treated as the same)
 * because PostgreSQL internally converts FLOAT to DOUBLE PRECISION.
 *
 * @param type - The column type string (from backend or frontend)
 * @returns Normalized type string for comparison
 */
export const normalizeTypeForComparison = (type: string): string => {
  if (!type) return '';
  const mapped = mapSchemaTypeToColumnType(type);
  // FLOAT, DOUBLE, and DOUBLE_PRECISION are all equivalent
  // (PostgreSQL stores FLOAT as DOUBLE PRECISION internally)
  if (
    mapped === DatasetColumnTypes.FLOAT ||
    mapped === DatasetColumnTypes.DOUBLE ||
    mapped === DatasetColumnTypes.DOUBLE_PRECISION
  ) {
    return 'FLOAT_FAMILY';
  }
  return mapped;
};

/**
 * Converts Blueprint columns to filterConfig format (for API updates)
 *
 * @param columns - Array of columns from Blueprint
 * @returns Partial filterConfig format for API updates
 */
export const convertColumnsToFilterConfig = (columns: ColumnDataType[]): Partial<FilterConfigType>[] => {
  return columns.map((col) => ({
    column: col?.column_name,
    alias: col?.column_name,
    datatype: col?.column_type,
    metadata: {
      is_required: col?.required,
    },
  }));
};
