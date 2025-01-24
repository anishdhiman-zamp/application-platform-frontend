import React, { FC, useEffect, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Column } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { DRAG_ICON, ICON_SPRITE_TYPES } from 'constants/icons';
import Image from 'next/image';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType } from 'types/commonTypes';
import { CheckBox } from 'components/common/Checkbox';
import Input from 'components/common/input';
import { MenuWrapper } from 'components/common/MenuWrapper';
import SvgSpriteLoader from 'components/SvgSpriteLoader';
import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

type ColumnListingProps = {
  tableRef: React.RefObject<AgGridReact>;
  refetchColumnList: number;
  onClose: defaultFnType;
};

const ColumnListing: FC<ColumnListingProps> = ({ tableRef, refetchColumnList, onClose }) => {
  const [columns, setColumns] = useState<Column[]>(tableRef?.current?.api?.getColumns() ?? []);
  const [searchTerm, setSearchTerm] = useState('');
  // State for grid layout
  const [layout, setLayout] = useState(
    columns.map((column, index) => ({
      i: column.getColId(),
      x: 0,
      y: index,
      w: 1,
      h: 1,
    })),
  );

  const handleCheckBoxClick = (column: Column) => {
    tableRef?.current?.api?.setColumnsVisible([column.getColId()], !column.isVisible());
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const latestColumns = tableRef?.current?.api?.getColumns() ?? [];

    setSearchTerm(value);
    if (value) {
      const filteredColumns = latestColumns?.filter((column) => column.getColId()?.includes(value));

      setColumns(filteredColumns);
    } else {
      setColumns(latestColumns);
    }
  };

  // Handle layout change
  const onLayoutChange = (newLayout: any) => {
    setLayout(newLayout);
    // Optional: Update item order based on layout
    const orderedItems: Column[] = newLayout
      .slice()
      .sort((a: any, b: any) => a.y - b.y)
      .map((l: any) => columns.find((column) => column.getColId() === l.i)!);

    setColumns(orderedItems);
    tableRef?.current?.api?.moveColumns(orderedItems, 0);
  };

  useEffect(() => {
    const latestColumns = tableRef?.current?.api?.getColumns() ?? [];

    if (searchTerm) {
      const filteredColumns = latestColumns?.filter((column) => column.getColId()?.includes(searchTerm));

      setColumns(filteredColumns);
    } else {
      setColumns(latestColumns);
    }
  }, [refetchColumnList]);

  return (
    <MenuWrapper
      id='display-options'
      className='!absolute z-10 p-1 right-0 mt-1 w-fit min-w-[250px]'
      childrenWrapperClassName='!overflow-visible max-h-[422px]'
    >
      <div className='flex items-center gap-1.5 p-2'>
        <SvgSpriteLoader
          id='arrow-narrow-left'
          iconCategory={ICON_SPRITE_TYPES.ARROWS}
          width={12}
          height={12}
          className='cursor-pointer'
          onClick={onClose}
        />
        <div className='f-12-500 text-GRAY_1000'>Columns</div>
      </div>
      <Input
        placeholder='Search Columns..'
        size={SIZE_TYPES.XSMALL}
        noBorders
        focusClassNames='placeholder:italic mt-2 mb-2.5'
        onChange={handleSearch}
        value={searchTerm}
      />
      <div className='text-GRAY_900 !overflow-y-auto max-h-[340px]'>
        <ResponsiveGridLayout
          className='layout'
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200 }}
          cols={{ lg: 1 }} // Single-column layout
          rowHeight={50} // Set row height
          isResizable={false} // Disable resizing
          onLayoutChange={onLayoutChange} // Handle drag-and-drop reordering
          draggableHandle='.drag-handle' // Restrict drag to the handle
        >
          {columns?.map((column) => (
            <div key={column.getColId()} className='flex items-center gap-2.5 p-2'>
              <div className='drag-handle cursor-grab min-w-[14px]'>
                <Image src={DRAG_ICON} width={14} height={14} alt='drag icon' />
              </div>
              <CheckBox
                checked={column.isVisible()}
                onPress={(e) => {
                  e.stopPropagation();
                  handleCheckBoxClick(column);
                }}
                id={column.getColId() ?? ''}
              />
              <div className='f-12-400 text-GRAY_1000'>{column.getColId()}</div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </MenuWrapper>
  );
};

export default ColumnListing;
