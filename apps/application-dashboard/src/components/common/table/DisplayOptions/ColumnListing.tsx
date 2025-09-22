import { ChangeEvent, FC, MouseEvent, RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { Column } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { DRAG_ICON } from 'constants/icons';
import { getColumnOrderingVisibilityForCurrentDataset, updateLocalStorage } from 'modules/data/data.utils';
import Image from 'next/image';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType, ResponsiveGridLayoutType } from 'types/commonTypes';
import { cn } from 'utils/common';
import { useGetDatasetDisplayConfigQuery } from '@/apis/admin';
import { POSITION } from '@/constants/common.constants';
import useDisplayConfigUpdate from '@/hooks/useDisplayConfigUpdate';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import { DATASET_ACCESS_PRIVILEGES } from '@/modules/shareResource/shareResource.types';
import { ResourceType } from '@/types/api/policies.types';
import { CheckBox } from 'components/common/Checkbox';
import Input from 'components/common/input';
import { MenuWrapper } from 'components/common/MenuWrapper';
import { ColumnVisibility } from 'components/common/table/table.types';
import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

type ColumnListingProps = {
  tableRef: RefObject<AgGridReact | null>;
  onClose: defaultFnType;
  datasetId: string;
  isSelfServe?: boolean;
  position?: POSITION.LEFT | POSITION.RIGHT;
};

const ColumnListing: FC<ColumnListingProps> = ({
  tableRef,
  onClose,
  datasetId,
  isSelfServe = false,
  position = POSITION.LEFT,
}) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnsChecked, setColumnsChecked] = useState<ColumnVisibility[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  // State for grid layout
  const [layout, setLayout] = useState<ResponsiveGridLayoutType[]>([]);

  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ResourceType.DATASET,
    resourceId: datasetId,
  });

  const isCurrentUserAdmin = useMemo(() => {
    return checkUserPrivilege(DATASET_ACCESS_PRIVILEGES.ADMIN);
  }, [checkUserPrivilege]);

  const { handleDefaultOrderUpdate } = useDisplayConfigUpdate(tableRef, datasetId);

  const { data: displayConfigData } = useGetDatasetDisplayConfigQuery(
    { datasetId },
    { skip: !datasetId || !isCurrentUserAdmin },
  );

  const defaultColumnOrder = useMemo(() => {
    return displayConfigData?.display_config?.map((item) => item.column);
  }, [displayConfigData]);

  const handleCheckBoxClick = (column?: Column) => {
    if (!column) return;
    tableRef?.current?.api?.setColumnsVisible([column.getColId()], !column.isVisible());

    const columnOrderingVisibility = getColumnOrderingVisibilityForCurrentDataset(datasetId).map((columnItem) => ({
      ...columnItem,
      isVisible: columnItem.colId === column.getColId() ? !columnItem.isVisible : columnItem.isVisible,
    }));

    updateLocalStorage(columnOrderingVisibility, datasetId);
    setColumnsChecked(columnOrderingVisibility);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const latestColumns =
      tableRef?.current?.api?.getColumns()?.filter((column) => !column?.getColDef()?.suppressMovable) ?? [];

    setSearchTerm(value);
    if (value) {
      const filteredColumns = latestColumns
        ?.filter((column) => {
          const colId = column.getColId()?.toLowerCase();
          const headerName = column.getColDef()?.headerName?.toLowerCase();
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
  const onLayoutChange = (newLayout: any) => {
    if (inputFocused || searchTerm) return;

    setLayout(newLayout);

    // Get all columns and separate movable from non-movable
    const allColumns = tableRef?.current?.api?.getColumns() ?? [];
    const nonMovableColumns = allColumns.filter((column) => column?.getColDef()?.suppressMovable);
    const movableColumns = allColumns.filter((column) => !column?.getColDef()?.suppressMovable);

    // Get ordered movable columns based on layout
    const orderedMovableColumns: Column[] = newLayout
      .slice()
      .sort((a: any, b: any) => a.y - b.y)
      .map((l: any) => movableColumns.find((column) => column?.getColId() === l.i))
      .filter((column: Column | undefined): column is Column => column !== undefined);

    // Combine non-movable columns with ordered movable columns
    const finalOrderedColumns = [...nonMovableColumns, ...orderedMovableColumns];

    // Apply the new column order
    tableRef?.current?.api?.moveColumns(finalOrderedColumns, 0);

    // Update storage with new ordering
    const columnOrderingVisibility = finalOrderedColumns.map((column) => ({
      colId: column.getColId(),
      isVisible: column.isVisible(),
      width: column.getActualWidth(),
    }));

    updateLocalStorage(columnOrderingVisibility, datasetId);
  };

  const handleSelectAll = (isSelectAll = true) => {
    tableRef?.current?.api?.setColumnsVisible(
      columns.map((column) => column.getColId()),
      isSelectAll,
    );
    const columnOrderingVisibility = getColumnOrderingVisibilityForCurrentDataset(datasetId).map((columnItem) => ({
      ...columnItem,
      isVisible: isSelectAll,
    }));

    updateLocalStorage(columnOrderingVisibility, datasetId);
    setColumnsChecked(columnOrderingVisibility);
  };

  const handleColumnClick = (e: MouseEvent<HTMLDivElement>, column?: Column) => {
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

    onLayoutChange(updatedLayout);
  };

  useEffect(() => {
    const allColumns = tableRef?.current?.api?.getColumns() ?? [];
    // Only get movable columns for display
    const movableColumns = allColumns.filter((column) => !column?.getColDef()?.suppressMovable);

    // Get stored ordering for movable columns
    const storedOrdering = getColumnOrderingVisibilityForCurrentDataset(datasetId);

    // Re-order movable columns based on stored ordering
    const orderedMovableColumns: Column[] =
      storedOrdering
        ?.map((column) => movableColumns?.find((col) => col.getColId() === column.colId))
        .filter((col): col is Column => col !== undefined) ?? [];

    const finalColumns = orderedMovableColumns?.length ? orderedMovableColumns : movableColumns;

    if (searchTerm) {
      const filteredColumns = finalColumns?.filter(
        (column) =>
          column.getColId()?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          column.getColDef()?.headerName?.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      setColumns(filteredColumns);
    } else {
      setColumns(finalColumns);
    }

    setColumnsChecked(
      finalColumns?.map((column) => ({
        colId: column?.getColId(),
        isVisible: column?.isVisible(),
      })),
    );
  }, []);

  const maxWidth = useMemo(() => {
    if (columnRefs.current.length > 0) {
      const widths = columnRefs.current.map((ref) => ref?.offsetWidth || 0);
      const maxElementWidth = Math.max(...widths);

      return Math.max(maxElementWidth + 50, 250); // Add padding and ensure minimum width
    }

    return 250;
  }, [columns]);

  return (
    <MenuWrapper
      id='display-options'
      className={cn('absolute! z-10 mt-1 min-w-[250px] overflow-visible!', position === 'left' ? 'right-0' : 'left-0')}
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
              onClick={() => handleSelectAll(!columnsChecked.every((col) => col.isVisible))}
            >
              {columnsChecked.every((col) => col.isVisible) ? 'Deselect All' : 'Select All'}
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
          onLayoutChange={onLayoutChange} // Only handle drag-and-drop when not searching
          isDraggable={!(searchTerm || inputFocused)}
          draggableHandle='.drag-handle' // Restrict drag to the handle
        >
          {columns?.map((column, index) => (
            <div
              key={column?.getColId()}
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
                <CheckBox
                  checked={columnsChecked?.find((col) => col?.colId === column?.getColId())?.isVisible ?? false}
                  onPress={(e) => handleColumnClick(e, column)}
                  id={column?.getColId() ?? ''}
                />
                <div className='f-12-400 text-GRAY_1000 whitespace-nowrap select-none'>
                  {column?.getColDef()?.headerName}
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

export default ColumnListing;
