import { ColumnOrderState, Table } from '@tanstack/react-table';
import { useCallback, useRef } from 'react';

interface UseColumnDragAndDropProps {
  table: Table<unknown>;
  columnOrder: ColumnOrderState;
  onColumnMoved?: (sourceColId: string, fromIndex: number, toIndex: number) => void;
  setColumnOrder: (order: ColumnOrderState) => void;
}

interface UseColumnDragAndDropReturn {
  draggingColumnIdRef: React.RefObject<string | null>;
  isDragOperationRef: React.RefObject<boolean>;
  handleHeaderDragStart: (colId: string, event: React.DragEvent) => boolean;
  handleHeaderDragOver: (e: React.DragEvent) => void;
  handleHeaderDrop: (targetColId: string, event: React.DragEvent) => void;
}

/**
 * Custom hook for handling column drag and drop functionality in tables
 * Provides handlers for drag start, drag over, and drop events with column reordering logic
 */
export const useColumnDragAndDrop = ({
  table,
  columnOrder,
  onColumnMoved,
  setColumnOrder,
}: UseColumnDragAndDropProps): UseColumnDragAndDropReturn => {
  const draggingColumnIdRef = useRef<string | null>(null);
  const isDragOperationRef = useRef<boolean>(false);

  // Internal function to ensure column order is properly initialized
  const ensureColumnOrder = useCallback((): ColumnOrderState => {
    if (columnOrder && columnOrder.length > 0) return columnOrder;
    const current = table.getAllLeafColumns().map((c) => c.id);
    setColumnOrder(current);
    return current;
  }, [columnOrder, table, setColumnOrder]);

  const handleHeaderDragStart = useCallback(
    (colId: string, event: React.DragEvent) => {
      // Check if column has suppressMovable using TanStack meta
      const column = table.getColumn(colId);
      const suppressMovable = (column?.columnDef?.meta as { suppressMovable?: boolean })?.suppressMovable;

      // Prevent drag start if column is not movable
      if (suppressMovable) {
        event.preventDefault();
        return false;
      }

      draggingColumnIdRef.current = colId;

      // Set drag effect
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', colId);

      return true;
    },
    [table],
  );

  const handleHeaderDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleHeaderDrop = useCallback(
    (targetColId: string, event: React.DragEvent) => {
      event.preventDefault();
      const sourceColId = draggingColumnIdRef.current;

      if (!sourceColId || sourceColId === targetColId) {
        return;
      }

      // Check if source or target column has suppressMovable
      const sourceColumn = table.getColumn(sourceColId);
      const targetColumn = table.getColumn(targetColId);

      // access suppressMovable directly from column meta
      const sourceSupressMovable = (sourceColumn?.columnDef?.meta as { suppressMovable?: boolean })?.suppressMovable;
      const targetSupressMovable = (targetColumn?.columnDef?.meta as { suppressMovable?: boolean })?.suppressMovable;

      // Prevent moving if source column is not movable
      if (sourceSupressMovable) {
        draggingColumnIdRef.current = null;
        return;
      }

      // Prevent dropping onto a non-movable column
      if (targetSupressMovable) {
        draggingColumnIdRef.current = null;
        return;
      }

      const current = ensureColumnOrder();
      const fromIndex = current.indexOf(sourceColId);
      const toIndex = current.indexOf(targetColId);

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return;
      }

      const next = current.slice();
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, sourceColId);

      // Mark this as a drag operation to prevent external sync
      isDragOperationRef.current = true;
      setColumnOrder(next);

      if (onColumnMoved) {
        onColumnMoved(sourceColId, fromIndex, toIndex);
      }

      draggingColumnIdRef.current = null;
    },
    [ensureColumnOrder, onColumnMoved, table, setColumnOrder],
  );

  return {
    draggingColumnIdRef,
    isDragOperationRef,
    handleHeaderDragStart,
    handleHeaderDragOver,
    handleHeaderDrop,
  };
};
