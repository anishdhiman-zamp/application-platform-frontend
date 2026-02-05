'use no memo';

import { Cell, CellContext, flexRender } from '@tanstack/react-table';
import { cn } from '@zamp-platform/ui/utils';
import React from 'react';

import { CUSTOM_COLUMN_TYPE } from '../types';

interface TanstackCellProps {
  cell: Cell<unknown, unknown>;
  ctx: CellContext<unknown, unknown>;
  isHighlighted: boolean;
  cellClass?: string;
  showCustomCell: boolean;
}

const TanstackCellTd: React.FC<{
  cell: Cell<unknown, unknown>;
  colId: string;
  isHighlighted: boolean;
  cellClass?: string;
  children: React.ReactNode;
}> = ({ cell, colId, isHighlighted, cellClass, children }) => (
  <td
    key={cell.id}
    data-testid={`table-cell-${colId}`}
    className={cn('group-hover:bg-BACKGROUND_GRAY_2', isHighlighted && 'bg-BACKGROUND_GRAY_2', cellClass)}
    style={{
      width: `${cell.column.getSize()}px`,
      minWidth: `${cell.column.getSize()}px`,
      ...(colId === CUSTOM_COLUMN_TYPE.STATUS && {
        maxWidth: `${cell.column.getSize()}px`,
        flex: '0 0 auto',
      }),
      ...(colId !== CUSTOM_COLUMN_TYPE.STATUS && {
        flex: '1 0 auto',
      }),
    }}
  >
    {children}
  </td>
);

const TanstackCell: React.FC<TanstackCellProps> = ({ cell, ctx, isHighlighted, cellClass, showCustomCell }) => {
  const raw = cell.getValue();
  const colId = cell.column.id;

  if (showCustomCell) {
    return (
      <TanstackCellTd cell={cell} colId={colId} isHighlighted={isHighlighted} cellClass={cellClass}>
        <span
          className={cn(
            'group-hover:bg-BACKGROUND_GRAY_2 flex justify-between py-2!',
            isHighlighted && 'bg-BACKGROUND_GRAY_2',
            cellClass,
          )}
          style={{
            width: `${cell.column.getSize()}px`,
            minWidth: `${cell.column.getSize()}px`,
            ...(colId === CUSTOM_COLUMN_TYPE.STATUS && {
              maxWidth: `${cell.column.getSize()}px`,
              flex: '0 0 auto',
            }),
            ...(colId !== CUSTOM_COLUMN_TYPE.STATUS && {
              flex: '1 0 auto',
            }),
          }}
        >
          {flexRender(cell.column.columnDef.cell, ctx)}
        </span>
      </TanstackCellTd>
    );
  } else if (raw == null || (typeof raw === 'string' && raw.trim() === '')) {
    return (
      <TanstackCellTd cell={cell} colId={colId} isHighlighted={isHighlighted} cellClass={cellClass}>
        <span
          className={cn(
            'text-13 group-hover:bg-BACKGROUND_GRAY_2 text-gray-550 px-4! py-1!',
            isHighlighted && 'bg-BACKGROUND_GRAY_2',
          )}
        >
          N/A
        </span>
      </TanstackCellTd>
    );
  } else {
    return (
      <TanstackCellTd cell={cell} colId={colId} isHighlighted={isHighlighted} cellClass={cellClass}>
        <span
          className={cn(
            'group-hover:bg-BACKGROUND_GRAY_2! truncate px-4! py-1!',
            isHighlighted && 'bg-BACKGROUND_GRAY_2',
          )}
        >
          {String(raw)}
        </span>
      </TanstackCellTd>
    );
  }
};

export default TanstackCell;
