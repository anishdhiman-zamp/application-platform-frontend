import React, { ChangeEvent, DragEvent, FC, RefObject, useEffect, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { AgGridReact } from 'ag-grid-react';
import { DRAG_ICON } from 'constants/icons';
import Image from 'next/image';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType } from 'types/commonTypes';
import Input from 'components/common/input';
import { MenuWrapper } from 'components/common/MenuWrapper';

type GroupByProps = {
  onClose: defaultFnType;
  tableRef: RefObject<AgGridReact | null>;
};

const GroupBy: FC<GroupByProps> = ({ tableRef, onClose }) => {
  // State to manage grouped and available columns
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedColumns, setGroupedColumns] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  const handleDragStart = (column: string) => (event: DragEvent) => {
    event.dataTransfer.setData('text/plain', column);
  };

  const handleDropOnGroup = (event: DragEvent) => {
    const data = event.dataTransfer.getData('text/plain');
    const column: string = data;
    const latestColumns = tableRef?.current?.api?.getColumns() ?? [];
    const currentColumn = latestColumns.find((col) => col.getColDef()?.headerName === column);

    setGroupedColumns((prev) => (prev?.includes(column) ? prev : [...(prev ?? []), column]));
    setAvailableColumns((prev) => prev?.filter((col) => col !== column));
    tableRef?.current?.api?.applyColumnState({
      state: [{ colId: currentColumn?.getColId() ?? '', rowGroup: true, hide: true }],
    });
  };

  const handleDropOnAvailable = (event: DragEvent) => {
    const data = event.dataTransfer.getData('text/plain');

    const column: string = data;
    const latestColumns = tableRef?.current?.api?.getColumns() ?? [];
    const currentColumn = latestColumns.find((col) => col.getColDef()?.headerName === column);

    setAvailableColumns((prev) => (prev?.includes(column) ? prev : [...(prev ?? []), column]));
    setGroupedColumns((prev) => prev?.filter((col) => col !== column));
    tableRef?.current?.api?.applyColumnState({
      state: [{ colId: currentColumn?.getColId() ?? '', rowGroup: false }],
    });
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const latestColumns = tableRef?.current?.api?.getColumns() ?? [];
    const columnNames = latestColumns
      .map((col) => col.getColDef()?.headerName)
      .filter((column) => column !== undefined);

    setSearchTerm(value);
    if (value) {
      const filteredColumns = columnNames
        ?.filter((column) => column?.toLowerCase().includes(value?.toLowerCase()))
        .filter((column) => column !== undefined);

      setAvailableColumns(filteredColumns);
    } else {
      setAvailableColumns(columnNames);
    }
  };

  const handleReset = () => {
    const latestColumns = tableRef?.current?.api?.getColumns() ?? [];
    const columnNames = latestColumns
      .map((col) => col.getColDef()?.headerName)
      .filter((column) => column !== undefined);

    setGroupedColumns([]);
    setAvailableColumns(columnNames);
    tableRef?.current?.api?.setRowGroupColumns([]);
  };

  const handleRemoveGroupedColumn = (column: string) => {
    setGroupedColumns((prev) => prev?.filter((col) => col !== column));
    setAvailableColumns((prev) => [...(prev ?? []), column]);
    const latestColumns = tableRef?.current?.api?.getColumns() ?? [];
    const currentColumn = latestColumns.find((col) => col.getColDef()?.headerName === column);

    tableRef?.current?.api?.applyColumnState({
      state: [{ colId: currentColumn?.getColId() ?? '', rowGroup: false, hide: false }],
    });
  };

  useEffect(() => {
    const latestColumns = tableRef?.current?.api?.getColumns() ?? [];
    const groupedColumns = tableRef?.current?.api?.getRowGroupColumns() ?? [];
    const groupedColumnNames = groupedColumns
      .map((col) => col.getColDef()?.headerName)
      .filter((column) => column !== undefined);

    const columnNames = latestColumns
      .map((col) => col.getColDef()?.headerName)
      .filter((column) => column !== undefined)
      ?.filter((col) => !groupedColumnNames.includes(col));

    setGroupedColumns(groupedColumnNames);
    setAvailableColumns(columnNames);
  }, [tableRef]);

  return (
    <MenuWrapper
      id='group-by'
      className='!absolute right-0 z-10 mt-1 h-fit min-h-[344px] min-w-[376px]'
      childrenWrapperClassName='overflow-visible! min-h-[344px]! h-fit max-h-fit!'
    >
      <div className='px-3 py-1'>
        <div className='flex items-center gap-1.5 py-2'>
          <SvgSpriteLoader
            id='arrow-narrow-left'
            iconCategory={ICON_SPRITE_TYPES.ARROWS}
            width={12}
            height={12}
            className='cursor-pointer'
            onClick={onClose}
          />
          <div className='f-12-500 text-GRAY_1000'>Group By</div>
        </div>
        {/* Grouped Columns */}
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDropOnGroup}
          className='border-GRAY_500 bg-BG_GRAY_2 min-h-[70px] rounded-md border p-2.5'
        >
          <div className='f-12-400 text-GRAY_700 mb-3'>Drag columns here to group by</div>
          <div className='flex max-h-[100px] flex-wrap gap-1 overflow-x-visible overflow-y-auto'>
            {groupedColumns.map((col, index) => (
              <div className='flex items-center gap-1' key={col}>
                <div
                  key={col}
                  className='border-GRAY_400 text-GRAY_1000 f-12-500 flex items-center gap-1.5 rounded-md border bg-white px-2 py-1'
                  draggable
                  onDragStart={handleDragStart(col)}
                >
                  <Image src={DRAG_ICON} width={14} height={14} alt='drag icon' />
                  <div>{col}</div>
                  <SvgSpriteLoader
                    id='x-close'
                    iconCategory={ICON_SPRITE_TYPES.GENERAL}
                    width={12}
                    height={12}
                    onClick={() => handleRemoveGroupedColumn(col)}
                    className='cursor-pointer'
                  />
                </div>
                {index < groupedColumns?.length - 1 && (
                  <SvgSpriteLoader id='chevron-right' iconCategory={ICON_SPRITE_TYPES.ARROWS} width={12} height={12} />
                )}
              </div>
            ))}
          </div>
        </div>
        <Input
          placeholder='Search Columns...'
          size={SIZE_TYPES.XSMALL}
          noBorders
          focusClassNames='mt-3 mb-2 pl-0!'
          onChange={handleSearch}
          value={searchTerm}
          autoFocus
        />
        {/* Available Columns */}
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDropOnAvailable}
          className='flex max-h-[150px] flex-wrap gap-1.5 overflow-x-visible overflow-y-auto pb-2'
        >
          {availableColumns?.map((col) => (
            <div
              key={col}
              draggable
              onDragStart={handleDragStart(col)}
              className='border-GRAY_400 text-GRAY_900 f-12-400 hover:bg-BG_GRAY_2 w-fit cursor-move rounded-md border px-2 py-1'
            >
              {col}
            </div>
          ))}
        </div>
      </div>
      <div className='f-12-500 text-GRAY_1000 border-GRAY_400 absolute bottom-0 flex w-full flex-row-reverse rounded-b-md border-t bg-white px-3 py-2.5'>
        <div className='cursor-pointer' onClick={handleReset}>
          Reset
        </div>
      </div>
    </MenuWrapper>
  );
};

export default GroupBy;
