'use no memo';

import type { ColumnSizingState, Header } from '@tanstack/react-table';
import { getCoreRowModel, getSortedRowModel, Row, useReactTable } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type MapAny, useThrottle } from '@zamp-platform/utils';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import SkeletonElement from '@/components/common/skeletons/SkeletonElement';
import CustomNoRowsOverlay from '@/components/common/table/CustomNoRowsOverlay';
import SkeletonBody from '@/components/common/tanstackTable/skeletons/SkeletonBody';
import SkeletonHeader from '@/components/common/tanstackTable/skeletons/SkeletonHeader';

import { DEFAULT_COLUMN_WIDTH, MIN_COLUMN_WIDTH, QUERY_KEYS, VIRTUALIZATION_DEFAULTS } from '../constants';
import { useColumnDragAndDrop } from '../hooks/useColumnDragAndDrop';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useInfiniteTableData } from '../hooks/useInfiniteTableData';
import { useRowHighlighting } from '../hooks/useRowHighlighting';
import { useScrollPositionPreservation } from '../hooks/useScrollPositionPreservation';
import { useScrollSync } from '../hooks/useScrollSync';
import { useSkeletonStates } from '../hooks/useSkeletonStates';
import { useTableEffects } from '../hooks/useTableEffects';
import { useTableState } from '../hooks/useTableState';
import { useTableSync } from '../hooks/useTableSync';
import { CUSTOM_COLUMN_TYPE, SortDirection, TanStackTableProps, VirtualizationOptions } from '../types';
import TanstackHeader from './TanstackHeader';
import TanstackRow from './TanstackRow';

export const TanStackTable: FC<TanStackTableProps> = ({
  columns,
  rows,
  totalRows,
  clientSideDatasource,
  filterModel,
  tableRef,
  onTableReady,
  queryKeyParts = [],
  onColumnVisible,
  onColumnMoved,
  onColumnResized,
  containerStyle = { width: '100%', height: '100%' },
  gridStyle = { height: 'calc(100vh - 100px)', width: '100%' },
  onRowClicked,
  customTheme,
  headerClass,
  cellClass,
  initialSorting = [],
  initialColumnVisibility = {},
  initialColumnOrder = [],
  emptyStateStatus,
  virtualizationOptions = {},
  preserveScrollPosition,
  rowHighlighting,
  showHeaderSkeleton = false,
  tableHeaderSkeletonWidth = [30, 30, 30],
  tableBodySkeletonRowCount = 20,
}) => {
  const {
    overscan = VIRTUALIZATION_DEFAULTS.OVERSCAN, // number of items to render outside viewport
    estimateSize = VIRTUALIZATION_DEFAULTS.ESTIMATE_SIZE, // estimated row height (px)
    measureElement = true, // whether to measure actual element sizes
  }: VirtualizationOptions = virtualizationOptions;

  // Use table state management hook
  const {
    sorting,
    columnOrder,
    columnVisibility,
    internalFilterModel,
    setSorting,
    setColumnOrder,
    setColumnVisibility,
    setInternalFilterModel,
    setInternalColumnVisibility,
    setInternalColumnOrder,
    isExternalOrderChangeRef,
    prevVisibilityRef,
  } = useTableState({
    initialSorting,
    initialColumnVisibility,
    initialColumnOrder,
    initialFilterModel: filterModel,
  });

  // Track column sizing state locally (not in shared useTableState)
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  // Memoize columns to prevent unnecessary re-renders and column order resets
  // This is critical for proper column reordering with React Compiler in Next.js 16
  type ColumnDefType = (typeof columns)[number];
  const prevColumnsRef = useRef<ColumnDefType[]>(columns);
  const columnIdsKey = useMemo(
    () => JSON.stringify(columns.map((col) => col.id ?? (col as ColumnDefType & { accessorKey?: string }).accessorKey)),
    [columns],
  );
  const memoizedColumns = useMemo((): ColumnDefType[] => {
    prevColumnsRef.current = columns;
    return columns;
  }, [columnIdsKey]);

  // Use infinite table data hook
  const { flatRowData, totalFetched, totalRowCount, fetchNextPage, isFetching, isFetchingNextPage } =
    useInfiniteTableData<MapAny>({
      fetchPage: async ({ pageIndex, pageSize, sorting, filterModel }) => {
        if (!clientSideDatasource) return { data: [], totalCount: 0 };

        const startRow = pageIndex * pageSize;
        const endRow = startRow + pageSize;
        const sortModel = sorting.map((column) => ({
          colId: column?.id,
          sort: column?.desc ? SortDirection.DESC : SortDirection.ASC,
        }));

        return new Promise((resolve, reject) => {
          clientSideDatasource.getRows({
            startRow,
            endRow,
            sortModel,
            filterModel,
            request: {
              startRow,
              endRow,
              sortModel,
              filterModel,
              rowGroupCols: [],
              valueCols: [],
              pivotCols: [],
              pivotMode: false,
              groupKeys: [],
            },
            success: (result: { rowData?: MapAny[]; rowCount?: number }) =>
              resolve({ data: result.rowData || [], totalCount: result.rowCount || 0 }),
            fail: () => reject(new Error('Failed to fetch data')),
          });
        });
      },
      sorting,
      filterModel: internalFilterModel,
      queryKey: [QUERY_KEYS.ACTIVITY_RUNS_TABLE, ...queryKeyParts],
      rows,
      totalRows,
      pageSize: VIRTUALIZATION_DEFAULTS.PAGE_SIZE,
    });

  // Use skeleton states hook
  const { showFetchMoreSkeleton, showOverlaySkeleton, skeletonRowCount } = useSkeletonStates({
    isFetching,
    isFetchingNextPage,
    totalFetched,
    totalRowCount,
    fetchMoreSkeletonCount: VIRTUALIZATION_DEFAULTS.FETCH_MORE_SKELETON_COUNT,
  });

  // Use infinite scroll hook
  const { fetchMoreOnBottomReached } = useInfiniteScroll({
    fetchNextPage,
    isFetching,
    totalFetched,
    totalRowCount,
    hasDataSource: !!clientSideDatasource,
    threshold: VIRTUALIZATION_DEFAULTS.SCROLL_THRESHOLD,
  });

  // Use scroll sync hook
  const { headerContainerRef, tableContainerRef, handleHeaderScroll, handleBodyScroll } = useScrollSync({
    onBodyScroll: (e) => fetchMoreOnBottomReached(e.currentTarget),
  });

  // row virtualizer
  const rowVirtualizer = useVirtualizer({
    count: flatRowData?.length + skeletonRowCount,
    estimateSize: () => estimateSize,
    getScrollElement: () => tableContainerRef.current,
    measureElement:
      measureElement && typeof window !== 'undefined'
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan,
  });

  const isVirtualizationReady = rowVirtualizer.getVirtualItems().length > 0 && rowVirtualizer.getTotalSize() > 0;

  // Use scroll position preservation hook
  const { saveScrollPosition, hasScrollPositionToRestore } = useScrollPositionPreservation({
    key: preserveScrollPosition?.key || '',
    tableContainerRef,
    isDataLoaded: flatRowData.length > 0,
    totalRowCount,
    isVirtualizationReady,
    saveScrollPosition: preserveScrollPosition?.saveScrollPosition,
    getScrollPosition: preserveScrollPosition?.getScrollPosition,
    hasScrollPositionToRestore: preserveScrollPosition?.hasScrollPositionToRestore,
  });

  const { highlightedRowIndex, setHighlightedRowIndex } = useRowHighlighting({
    key: rowHighlighting?.key || '',
    isDataLoaded: flatRowData.length > 0,
    isVirtualizationReady,
    hasScrollPositionToRestore,
    rowVirtualizer,
    setHighlightedRowIndex: rowHighlighting?.setHighlightedRowIndex,
    getHighlightedRowIndex: rowHighlighting?.getHighlightedRowIndex,
    clearHighlightedRowIndex: rowHighlighting?.clearHighlightedRowIndex,
  });

  const throttleHandleBodyScroll = useThrottle(saveScrollPosition, 100);

  const enhancedHandleBodyScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      handleBodyScroll(e);
      if (preserveScrollPosition?.enabled) {
        throttleHandleBodyScroll();
      }
    },
    [handleBodyScroll, throttleHandleBodyScroll, preserveScrollPosition?.enabled],
  );

  const enhancedHandleRowClick = useCallback(
    (rowData: MapAny, rowIndex?: number) => {
      if (rowHighlighting?.enabled && typeof rowIndex === 'number') {
        setHighlightedRowIndex(rowIndex);
      }
      if (onRowClicked) {
        onRowClicked(rowData, rowIndex);
      }
    },
    [onRowClicked, rowHighlighting?.enabled, setHighlightedRowIndex],
  );

  // Memoize data to prevent column order resets on data changes
  const memoizedData = useMemo((): MapAny[] => flatRowData, [flatRowData]);

  // table
  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    state: {
      sorting,
      columnVisibility,
      columnOrder,
      columnSizing,
    },
    defaultColumn: {
      minSize: MIN_COLUMN_WIDTH,
      size: DEFAULT_COLUMN_WIDTH,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: !!clientSideDatasource,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    enableColumnPinning: true,
    debugTable: process.env.NODE_ENV === 'development',
    enableColumnResizing: true,
    columnResizeMode: 'onChange', // Real-time column resizing
  });
  const skeletonLoaderHeaderList = table.getHeaderGroups()[0]?.headers;
  const { rows: tableRows } = table.getRowModel();

  // Use column drag and drop hook
  const { isDragOperationRef, handleHeaderDragStart, handleHeaderDragOver, handleHeaderDrop } = useColumnDragAndDrop({
    table,
    columnOrder,
    onColumnMoved,
    setColumnOrder,
  });

  // Use table sync hook for external state synchronization
  useTableSync({
    filterModel,
    initialColumnVisibility,
    initialColumnOrder,
    setInternalFilterModel,
    setInternalColumnVisibility,
    setInternalColumnOrder,
    isExternalOrderChangeRef,
    isDragOperationRef,
  });

  // Use table effects hook for lifecycle management
  useTableEffects({
    table,
    sorting,
    columnOrder,
    columnVisibility,
    tableRef,
    onTableReady,
    onColumnVisible,
    handleSortingChange: setSorting,
    fetchMoreOnBottomReached,
    tableContainerRef,
    rowVirtualizer,
    prevVisibilityRef,
    isDragOperationRef,
  });

  // Notify parent when column sizing changes
  useEffect(() => {
    if (onColumnResized) {
      onColumnResized(columnSizing);
    }
  }, [columnSizing, onColumnResized]);

  return (
    <div style={containerStyle} className='overflow-auto'>
      {/* Sticky Header - Outside of scroll container */}
      <div
        className='tan-header sticky top-0 z-10 w-full overflow-x-auto overflow-y-hidden border-y border-[#EBEBEB] bg-white'
        ref={headerContainerRef}
        onScroll={handleHeaderScroll}
      >
        <table
          style={{
            display: 'grid',
            width: '100%',
          }}
          className={customTheme}
        >
          <thead className='grid w-full'>
            {showHeaderSkeleton ? (
              <SkeletonHeader columnsWidth={tableHeaderSkeletonWidth} />
            ) : (
              table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} style={{ display: 'flex', width: '100%', minWidth: `50px` }}>
                  {headerGroup.headers.map((header) => (
                    <TanstackHeader
                      key={header.id}
                      header={header as Header<MapAny, MapAny>}
                      headerClass={headerClass}
                      handleHeaderDragStart={handleHeaderDragStart}
                      handleHeaderDragOver={handleHeaderDragOver}
                      handleHeaderDrop={handleHeaderDrop}
                    />
                  ))}
                </tr>
              ))
            )}
          </thead>
        </table>
      </div>

      {/* Scrollable Body Container */}
      <div
        onScroll={preserveScrollPosition?.enabled ? enhancedHandleBodyScroll : handleBodyScroll}
        ref={tableContainerRef}
        className='tan-scroll relative w-full'
        style={{
          height: `calc(${typeof gridStyle.height === 'string' ? gridStyle.height : '100vh'} - 30px)`, // Subtract header height
          overflowX: 'auto',
          overflowY: 'auto',
        }}
      >
        <table
          id='tanStack-table'
          style={{
            display: 'grid',
            width: '100%',
          }}
          className={customTheme}
        >
          <tbody
            key={`${columnOrder.join(',')}-${JSON.stringify(columnVisibility)}`}
            style={{
              display: 'grid',
              height: `${rowVirtualizer.getTotalSize()}px`, // Tells scrollbar how big the table is
              position: 'relative', // Needed for absolute positioning of rows
            }}
          >
            {/* <---- "Full Table" skeleton loader (tab or filter changes) ----> */}
            {showOverlaySkeleton ? (
              <SkeletonBody columnsWidth={tableHeaderSkeletonWidth} rowCount={tableBodySkeletonRowCount} />
            ) : (
              rowVirtualizer.getVirtualItems().map((virtualRow) => {
                // <---- "Fetch More" skeleton loader ---->
                if (showFetchMoreSkeleton && virtualRow?.index >= flatRowData?.length) {
                  return (
                    <tr
                      data-index={virtualRow.index}
                      ref={(node) => rowVirtualizer.measureElement(node)}
                      key={`skeleton-${virtualRow.index}`}
                      style={{
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className='absolute flex h-10 w-full'
                    >
                      {skeletonLoaderHeaderList?.map((header) => (
                        <td
                          data-testid='fetch-more-skeleton-cell'
                          key={`skeleton-cell-${virtualRow.index}-${header.id}`}
                          style={{
                            display: 'flex',
                            width: header.getSize(),
                            minWidth: `${header.getSize()}px`,
                            ...(header.id === CUSTOM_COLUMN_TYPE.STATUS && {
                              maxWidth: `${header.getSize()}px`,
                              flex: '0 0 auto',
                            }),
                          }}
                          className='flex items-center px-2 py-2'
                        >
                          <SkeletonElement className='h-3.5 w-full rounded-sm bg-gray-200' />
                        </td>
                      ))}
                    </tr>
                  );
                }

                const row = tableRows[virtualRow.index] as Row<unknown>;

                // ---- actual rows with data ----
                const isHighlightedVal = Boolean(rowHighlighting?.enabled && highlightedRowIndex === virtualRow.index);

                return (
                  <TanstackRow
                    key={row?.id}
                    row={row}
                    virtualRow={virtualRow}
                    rowVirtualizer={rowVirtualizer}
                    highlightedRowIndex={highlightedRowIndex ?? undefined}
                    isHighlighted={isHighlightedVal}
                    rowHighlighting={{ enabled: !!rowHighlighting?.enabled }}
                    enhancedHandleRowClick={enhancedHandleRowClick}
                    onRowClicked={onRowClicked}
                    cellClass={cellClass}
                  />
                );
              })
            )}
          </tbody>
        </table>

        {/* --- Empty State (when filters return no data) --- */}
        {totalFetched === 0 && !isFetching && emptyStateStatus && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <CustomNoRowsOverlay />
          </div>
        )}
      </div>
    </div>
  );
};
