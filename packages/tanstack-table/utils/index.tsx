import { Header } from '@tanstack/react-table';
import { cn } from '@zamp-platform/ui/utils';
import { type MapAny } from '@zamp-platform/utils';
import type React from 'react';

import { HEADER_CELL_STYLES, isNonMovableColumn } from '../constants';
import { CUSTOM_COLUMN_TYPE } from '../types';

/**
 * Flattens paginated data from react-query infinite queries or falls back to rows
 * @param data - The infinite query data with pages containing data arrays
 * @param rows - Fallback rows if data is not available
 * @returns Flattened array of row data
 */
export const flattenRowData = <TData = unknown,>(data?: { pages?: { data: TData[] }[] }, rows?: TData[]): TData[] => {
  return data?.pages?.flatMap((page: { data: TData[] }) => page.data) ?? rows ?? [];
};

export function isHeaderDraggable(header: Header<MapAny, MapAny>): boolean {
  return !header.column.getIsResizing() && !isNonMovableColumn(header.id);
}

export function isHeaderResizable(header: Header<MapAny, MapAny>): boolean {
  return !isNonMovableColumn(header.id);
}

export function getResizeHandleProps(header: Header<MapAny, MapAny>): React.HTMLAttributes<HTMLDivElement> {
  return {
    onMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      header.getResizeHandler()(e);
    },
    onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation();
      header.getResizeHandler()(e);
    },
    className: cn(
      'tanstack-col-resizer absolute right-1.5 top-0 bottom-0 cursor-col-resize z-10',
      'w-1.5 min-w-[6px]',
      header.column.getIsResizing() && 'isResizing',
    ),
    draggable: false,
    'aria-label': `Resize-${header.id}-column`,
    role: 'separator',
    tabIndex: -1,
  };
}

export function getHeaderCellStyle(header: Header<MapAny, MapAny>): React.CSSProperties {
  return {
    width: `${header.getSize()}px`,
    minWidth: `${header.getSize()}px`,
    ...(header.id === CUSTOM_COLUMN_TYPE.STATUS && {
      maxWidth: `${header.getSize()}px`,
      flex: HEADER_CELL_STYLES.FLEX_FIXED,
    }),
    ...(header.id !== CUSTOM_COLUMN_TYPE.STATUS && {
      flex: HEADER_CELL_STYLES.FLEX_GROW,
    }),
  };
}

export function getHeaderDragStartHandler(
  header: Header<MapAny, MapAny>,
  handleHeaderDragStart: (id: string, e: React.DragEvent<HTMLTableHeaderCellElement>) => void,
): React.DragEventHandler<HTMLTableHeaderCellElement> {
  return (e) => {
    if (!isHeaderDraggable(header) || (e.target as HTMLElement).classList.contains('tanstack-col-resizer')) {
      e.preventDefault();
      return;
    }
    handleHeaderDragStart(header.id, e);
  };
}
