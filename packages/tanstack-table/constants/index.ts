/**
 * Column IDs that should not be movable in drag-and-drop operations
 * These are typically special columns like status, documents, etc.
 */
export const enum NON_MOVABLE_COLUMN_IDS {
  STATUS = 'status',
  DOCUMENT = 'document',
  CURRENT_STATUS = 'current_status',
}

/**
 * Helper function to check if a column ID is non-movable
 * @param columnId The column ID to check
 * @returns true if the column should not be movable
 */
export const isNonMovableColumn = (columnId: string): boolean => {
  return (
    columnId === NON_MOVABLE_COLUMN_IDS.STATUS ||
    columnId === NON_MOVABLE_COLUMN_IDS.DOCUMENT ||
    columnId === NON_MOVABLE_COLUMN_IDS.CURRENT_STATUS
  );
};

/**
 * Query key constants for React Query caching
 */
export const enum QUERY_KEYS {
  ACTIVITY_RUNS_TABLE = 'activity-runs-table',
}

/**
 * Default virtualization configuration constants
 */
export const VIRTUALIZATION_DEFAULTS = {
  PAGE_SIZE: 100,
  OVERSCAN: 4, // number of items to render outside viewport
  ESTIMATE_SIZE: 41, // estimated row height (px)
  FETCH_MORE_SKELETON_COUNT: 10, // number of skeleton rows to show when fetching more
  SCROLL_THRESHOLD: 500, // pixels from bottom to trigger infinite scroll
};

/**
 * Header cell styling constants
 */
export const HEADER_CELL_STYLES = {
  FLEX_FIXED: '0 0 auto', // For fixed width columns (e.g., status column)
  FLEX_GROW: '1 0 auto', // For flexible width columns
} as const;

/**
 * Column sizing constants
 */
export const MIN_COLUMN_WIDTH = 50; // Minimum column width in pixels
export const DEFAULT_COLUMN_WIDTH = 150; // Default column width in pixels
