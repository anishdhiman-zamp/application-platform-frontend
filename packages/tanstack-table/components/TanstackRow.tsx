'use no memo';

import { Row } from '@tanstack/react-table';
import { Virtualizer } from '@tanstack/react-virtual';
import { cn } from '@zamp-platform/ui/utils';
import { type MapAny } from '@zamp-platform/utils';
import React from 'react';

import { isNonMovableColumn } from '../constants';
import TanstackCell from './TanstackCell';

interface TanstackRowProps {
  row: Row<unknown>;
  virtualRow: { index: number; start: number };
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  highlightedRowIndex?: number;
  isHighlighted: boolean;
  rowHighlighting: {
    enabled?: boolean;
  };
  enhancedHandleRowClick: (rowData: MapAny, rowIndex?: number) => void;
  onRowClicked?: (rowData: MapAny, rowIndex?: number) => void;
  cellClass?: string;
}

const TanstackRow: React.FC<TanstackRowProps> = ({
  row,
  virtualRow,
  rowVirtualizer,
  isHighlighted,
  rowHighlighting,
  enhancedHandleRowClick,
  onRowClicked,
  cellClass,
}) => (
  <tr
    data-index={virtualRow.index}
    ref={(node) => rowVirtualizer?.measureElement?.(node)}
    key={row?.id}
    className={cn('group absolute flex cursor-pointer', isHighlighted && 'bg-BG_GRAY_2')}
    style={{
      transform: `translateY(${virtualRow.start}px)`,
      width: '100%',
    }}
    onClick={() =>
      rowHighlighting?.enabled
        ? enhancedHandleRowClick(row?.original as MapAny, virtualRow.index)
        : onRowClicked?.(row?.original as MapAny, virtualRow.index)
    }
  >
    {row.getVisibleCells().map((cell) => {
      const ctx = { ...cell.getContext(), absoluteRowIndex: virtualRow.index };
      const colId = cell.column.id;
      const showCustomCell = isNonMovableColumn(colId);
      return (
        <TanstackCell
          key={cell.id}
          cell={cell}
          ctx={ctx}
          isHighlighted={isHighlighted}
          cellClass={cellClass}
          showCustomCell={showCustomCell}
        />
      );
    })}
  </tr>
);

export default TanstackRow;
