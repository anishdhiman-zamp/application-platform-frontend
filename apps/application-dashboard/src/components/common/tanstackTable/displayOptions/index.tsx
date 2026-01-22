import { ChangeEvent, FC, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Column } from '@zamp-platform/tanstack-table';
import { Button, Checkbox } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { DRAG_ICON } from 'constants/icons';
import { getColumnOrderingVisibilityForCurrentDataset, updateLocalStorage } from 'modules/data/data.utils';
import Image from 'next/image';
import { SIZE_TYPES } from 'types/common/components';
import { MapAny, ResponsiveGridLayoutType } from 'types/commonTypes';
import { cn } from 'utils/common';
import { useGetDatasetDisplayConfigQuery } from '@/apis/admin';
import { POSITION } from '@/constants/common.constants';
import useDisplayConfigUpdate from '@/hooks/useDisplayConfigUpdate';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import { DATASET_ACCESS_PRIVILEGES } from '@/modules/shareResource/shareResource.types';
import { ResourceType } from '@/types/api/policies.types';
import Input from 'components/common/input';
import { MenuWrapper } from 'components/common/MenuWrapper';
import { ColumnVisibility } from 'components/common/table/table.types';
import { ColumnListingTkProps } from 'components/common/tanstackTable/displayOptions/display-option.types';
import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const ColumnListingTk: FC<ColumnListingTkProps> = ({
  table,
  columnVisibility,
  setColumnVisibility,
  setColumnOrder,
  onClose,
  datasetId,
  isSelfServe = false,
  position = POSITION.LEFT,
}) => {
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [columns, setColumns] = useState<Column<MapAny>[]>([]);
  const [layout, setLayout] = useState<ResponsiveGridLayoutType[]>([]); // State for grid layout
  const [columnsChecked, setColumnsChecked] = useState<ColumnVisibility[]>([]);

  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ResourceType.DATASET,
    resourceId: datasetId,
  });

  const isCurrentUserAdmin = useMemo(() => {
    return checkUserPrivilege(DATASET_ACCESS_PRIVILEGES.ADMIN);
  }, [checkUserPrivilege]);

  const { handleDefaultOrderUpdate } = useDisplayConfigUpdate(
    { current: { api: { getAllGridColumns: () => table?.getAllLeafColumns() || [] } } } as any,
    datasetId,
  );

  const { data: displayConfigData } = useGetDatasetDisplayConfigQuery(
    { datasetId },
    { skip: !datasetId || !isCurrentUserAdmin },
  );

  const defaultColumnOrder = useMemo(() => {
    return displayConfigData?.display_config?.map((item) => item?.column);
  }, [displayConfigData]);

  const handleCheckBoxClick = (column?: Column<MapAny>) => {
    if (!column) return;
    const colId = column.id;
    const currentVisible =
      columnsChecked.find((column) => column?.colId === colId)?.isVisible ?? columnVisibility[colId] !== false;

    // direct state update
    const newVisibility = {
      ...columnVisibility,
      [colId]: !currentVisible,
    };

    setColumnVisibility(newVisibility);

    const columnOrderingVisibility = getColumnOrderingVisibilityForCurrentDataset(datasetId).map((columnItem) => ({
      ...columnItem,
      isVisible: columnItem?.colId === colId ? !columnItem?.isVisible : columnItem?.isVisible,
    }));

    updateLocalStorage(columnOrderingVisibility, datasetId);
    setColumnsChecked(columnOrderingVisibility);

    // Refresh in-panel column objects so subsequent toggles use fresh state
    const latestColumns =
      table?.getAllLeafColumns().filter((column) => {
        return !(column?.columnDef?.meta as any)?.suppressMovable;
      }) || [];

    if (!searchTerm) setColumns(latestColumns);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // direct table access
    const latestColumns =
      table?.getAllLeafColumns().filter((column) => {
        return !(column?.columnDef?.meta as any)?.suppressMovable;
      }) || [];

    setSearchTerm(value);
    if (value) {
      const filteredColumns = latestColumns
        ?.filter((column) => {
          const colId = column.id?.toLowerCase();
          const header = column?.columnDef?.header;
          const headerName = typeof header === 'string' ? header.toLowerCase() : '';
          const searchValue = value.toLowerCase();

          return colId?.includes(searchValue) || headerName?.includes(searchValue);
        })
        .filter((column) => column !== undefined);

      setColumns(filteredColumns);
    } else {
      setColumns(latestColumns);
    }
  };

  // Handle layout change
  const handleLayoutChange = (newLayout: ResponsiveGridLayoutType[]) => {
    if (inputFocused || searchTerm) return;

    setLayout(newLayout);

    const allColumns = table?.getAllLeafColumns() || [];
    const nonMovableColumns = allColumns.filter((column) => {
      return (column?.columnDef?.meta as any)?.suppressMovable;
    });
    const movableColumns = allColumns.filter((column) => {
      return !(column?.columnDef?.meta as any)?.suppressMovable;
    });

    // Desired order for movable columns based on the layout
    const orderedMovableColumns = newLayout
      .slice()
      .sort((first: any, second: any) => first?.y - second?.y)
      .map((layout: any) => movableColumns.find((column) => column?.id === layout?.i))
      .filter((column): column is Column<MapAny> => column !== undefined);

    // Combine non-movable columns with ordered movable columns
    const finalOrderedColumns = [...nonMovableColumns, ...orderedMovableColumns];

    const newColumnOrder = finalOrderedColumns.map((column) => column?.id);

    setColumnOrder(newColumnOrder);

    // Update storage with new ordering
    const columnOrderingVisibility = finalOrderedColumns.map((column) => ({
      colId: column?.id,
      isVisible: columnVisibility[column.id] !== false,
      width: column.getSize(),
    }));

    updateLocalStorage(columnOrderingVisibility, datasetId);
  };

  const handleSelectAll = (isSelectAll = true) => {
    // direct table access
    const allCols = table?.getAllLeafColumns() || [];

    // direct visibility state update
    const newVisibility: typeof columnVisibility = {};

    allCols.forEach((col) => {
      newVisibility[col.id] = isSelectAll;
    });
    setColumnVisibility(newVisibility);

    const columnOrderingVisibility = getColumnOrderingVisibilityForCurrentDataset(datasetId).map((columnItem) => ({
      ...columnItem,
      isVisible: isSelectAll,
    }));

    updateLocalStorage(columnOrderingVisibility, datasetId);
    setColumnsChecked(columnOrderingVisibility);
  };

  const handleColumnClick = (e: MouseEvent<HTMLDivElement>, column?: Column<MapAny>) => {
    e.stopPropagation();
    handleCheckBoxClick(column);
  };

  const handleReset = () => {
    const updatedLayout = defaultColumnOrder?.map((columnId, index) => ({
      i: columnId,
      x: 0,
      y: index,
      w: 1,
      h: 1,
    }));

    handleLayoutChange(updatedLayout ?? []);
  };

  const maxWidth = useMemo(() => {
    if (columnRefs.current?.length > 0) {
      const widths = columnRefs.current.map((ref) => ref?.offsetWidth || 0);
      const maxElementWidth = Math.max(...widths);

      return Math.max(maxElementWidth + 50, 250); // Add padding and ensure minimum width
    }

    return 250;
  }, [columns]);

  const handleInitializeColumns = useCallback(() => {
    if (!table) return;

    const allColumns = table.getAllLeafColumns();

    // Only get movable columns for display
    const movableColumns = allColumns.filter((column) => {
      return !(column?.columnDef?.meta as any)?.suppressMovable;
    });

    // Get stored ordering for movable columns
    const storedOrdering = getColumnOrderingVisibilityForCurrentDataset(datasetId);

    // Re-order movable columns based on stored ordering
    const orderedMovableColumns =
      storedOrdering
        ?.map((storedCol) => movableColumns?.find((col) => col?.id === storedCol?.colId))
        .filter((col): col is Column<MapAny> => col !== undefined) ?? [];

    const finalColumns = orderedMovableColumns?.length ? orderedMovableColumns : movableColumns;

    if (searchTerm) {
      const filteredColumns = finalColumns?.filter((column) => {
        const headerName = column?.columnDef?.header;

        return (
          column.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof headerName === 'string' && headerName?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });

      setColumns(filteredColumns);
    } else {
      setColumns(finalColumns);
    }

    setColumnsChecked(
      finalColumns?.map((column) => ({
        colId: column?.id,
        isVisible: columnVisibility[column.id] !== false,
      })),
    );
  }, [datasetId, searchTerm, table, columnVisibility]);

  useEffect(() => {
    handleInitializeColumns();
  }, [handleInitializeColumns]);

  return (
    <MenuWrapper
      id='display-options'
      className={cn('absolute! z-10 mt-1 w-[100px] overflow-visible!', position === 'left' ? 'right-0' : 'left-0')}
      childrenWrapperClassName='overflow-visible! max-h-[462px] w-full'
      style={{ width: maxWidth }}
    >
      <div className='px-1 pt-1'>
        <div className='flex items-center gap-1.5 p-2'>
          <SvgSpriteLoader
            id='arrow-narrow-left'
            iconCategory={ICON_SPRITE_TYPES.ARROWS}
            width={12}
            height={12}
            className='cursor-pointer'
            onClick={onClose}
          />
          <div className='f-12-500 text-GRAY_1000 flex w-full justify-between'>
            <div>Columns</div>
            <div
              className='cursor-pointer'
              onClick={() => handleSelectAll(!columnsChecked.every((col) => col?.isVisible))}
            >
              {columnsChecked.every((col) => col?.isVisible) ? 'Deselect All' : 'Select All'}
            </div>
          </div>
        </div>
        <Input
          placeholder='Search columns...'
          size={SIZE_TYPES.XSMALL}
          noBorders
          focusClassNames='mt-2 mb-2.5'
          onChange={handleSearch}
          value={searchTerm}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        />
      </div>
      <div className='text-GRAY_900 max-h-[330px] overflow-x-visible overflow-y-auto [&::-webkit-scrollbar]:hidden'>
        <ResponsiveGridLayout
          className='layout'
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200 }}
          cols={{ lg: 1 }} // Single-column layout
          rowHeight={28} // Set row height
          isResizable={false} // Disable resizing
          onLayoutChange={handleLayoutChange} // Only handle drag-and-drop when not searching
          isDraggable={!(searchTerm || inputFocused)}
          draggableHandle='.drag-handle' // Restrict drag to the handle
        >
          {columns
            ?.filter((column) => !(column?.columnDef?.meta as any)?.suppressMovable)
            ?.map((column, index) => (
              <div
                data-testid={`display-options-item-${column?.id}`}
                key={column?.id}
                className='hover:!bg-GRAY_100 flex w-full items-center gap-2.5 rounded-md bg-white p-2'
              >
                <div className='drag-handle min-w-[14px] cursor-grab'>
                  <Image src={DRAG_ICON} width={14} height={14} alt='drag icon' />
                </div>
                <div
                  ref={(el) => {
                    columnRefs.current[index] = el;
                  }}
                  className='flex cursor-pointer items-center gap-2.5'
                  onClick={(e) => handleColumnClick(e, column)}
                >
                  <Checkbox
                    checked={columnsChecked?.find((col) => col?.colId === column?.id)?.isVisible ?? false}
                    onCheckedChange={() => handleCheckBoxClick(column)}
                  />
                  <div className='f-12-400 text-GRAY_1000 whitespace-nowrap select-none'>
                    {typeof column?.columnDef?.header === 'string' ? column?.columnDef?.header : column?.id}
                  </div>
                </div>
              </div>
            ))}
        </ResponsiveGridLayout>
      </div>

      {isSelfServe && (
        <div className='flex justify-end gap-3 border-t p-1'>
          <Button variant='ghost' size='small' className='px-1 text-gray-900' onClick={handleReset}>
            Reset
          </Button>
          {isCurrentUserAdmin && (
            <Button variant='ghost' size='small' className='px-1' onClick={handleDefaultOrderUpdate}>
              Save as default view
            </Button>
          )}
        </div>
      )}
    </MenuWrapper>
  );
};

export default ColumnListingTk;
