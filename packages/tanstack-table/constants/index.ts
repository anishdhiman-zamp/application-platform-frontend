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
