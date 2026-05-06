'use no memo';

import type { Header } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { cn } from '@zamp-platform/ui/utils';
import { type MapAny } from '@zamp-platform/utils';

import {
  getHeaderCellStyle,
  getHeaderDragStartHandler,
  getResizeHandleProps,
  isHeaderDraggable,
  isHeaderResizable,
} from '../utils';

interface TanstackHeaderProps {
  header: Header<MapAny, MapAny>;
  headerClass?: string;
  handleHeaderDragStart: (id: string, e: React.DragEvent<HTMLTableHeaderCellElement>) => void;
  handleHeaderDragOver: (e: React.DragEvent<HTMLTableHeaderCellElement>) => void;
  handleHeaderDrop: (id: string, e: React.DragEvent<HTMLTableHeaderCellElement>) => void;
}

const TanstackHeader: React.FC<TanstackHeaderProps> = ({
  header,
  headerClass,
  handleHeaderDragStart,
  handleHeaderDragOver,
  handleHeaderDrop,
}) => (
  <th
    data-testid={`tanstack-table-header-${header.id}`}
    key={header.id}
    className={cn('relative flex cursor-pointer overflow-hidden capitalize', headerClass)}
    style={getHeaderCellStyle(header)}
    draggable={isHeaderDraggable(header)}
    onDragStart={getHeaderDragStartHandler(header, handleHeaderDragStart)}
    onDragOver={handleHeaderDragOver}
    onDrop={(e) => handleHeaderDrop(header.id, e)}
  >
    <div className={'flex h-full w-full cursor-pointer items-center justify-between select-none'}>
      {flexRender(header.column.columnDef.header, header.getContext())}
      {isHeaderResizable(header) && <div {...getResizeHandleProps(header)} />}
    </div>
  </th>
);

export default TanstackHeader;
