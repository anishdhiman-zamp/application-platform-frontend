import { flexRender, getCoreRowModel, getSortedRowModel, Row, useReactTable } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@zamp-platform/ui/utils';
import React, { FC, useCallback } from 'react';

import SkeletonElement from '@/components/common/skeletons/SkeletonElement';
import CustomNoRowsOverlay from '@/components/common/table/CustomNoRowsOverlay';
import { ActivityRunRowData } from '@/modules/process/process.types';
import { MapAny } from '@/types/commonTypes';

import { isNonMovableColumn, QUERY_KEYS, VIRTUALIZATION_DEFAULTS } from '../constants';
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

  // Use scroll position preservation hook
  const { saveScrollPosition } = useScrollPositionPreservation({
    key: preserveScrollPosition?.key || '',
    tableContainerRef,
    isDataLoaded: !isFetching && flatRowData.length > 0,
    totalRowCount,
  });

  const { highlightedRowIndex, setHighlightedRowIndex } = useRowHighlighting({
    key: rowHighlighting?.key || '',
    isDataLoaded: !isFetching && flatRowData.length > 0,
  });

  const enhancedHandleBodyScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      handleBodyScroll(e);
      if (preserveScrollPosition?.enabled) {
        saveScrollPosition();
      }
    },
    [handleBodyScroll, saveScrollPosition, preserveScrollPosition?.enabled],
  );

  const enhancedHandleRowClick = useCallback(
    (rowData: ActivityRunRowData, rowIndex?: number) => {
      if (rowHighlighting?.enabled && typeof rowIndex === 'number') {
        setHighlightedRowIndex(rowIndex);
      }
      if (onRowClicked) {
        onRowClicked(rowData, rowIndex);
      }
    },
    [onRowClicked, rowHighlighting?.enabled, setHighlightedRowIndex],
  );

  // table
  const table = useReactTable({
    data: flatRowData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnOrder,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: !!clientSideDatasource,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    enableColumnPinning: true,
    debugTable: process.env.NODE_ENV === 'development',
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

  // row virtualizer
  const rowVirtualizer = useVirtualizer({
    count: flatRowData?.length + skeletonRowCount,
    estimateSize: () => estimateSize, // Configurable row height estimation
    getScrollElement: () => tableContainerRef.current,
    measureElement:
      measureElement && typeof window !== 'undefined'
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan,
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
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} style={{ display: 'flex', width: '100%', minWidth: `50px` }}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      data-testid={`tanstack-table-header-${header.id}`}
                      key={header.id}
                      className={cn('flex cursor-pointer overflow-hidden capitalize', headerClass)}
                      style={{
                        width: `${header.getSize()}px`,
                        minWidth: `${header.getSize()}px`,
                        ...(header.id === CUSTOM_COLUMN_TYPE.STATUS && {
                          maxWidth: `${header.getSize()}px`,
                          flex: '0 0 auto',
                        }),
                        ...(header.id !== CUSTOM_COLUMN_TYPE.STATUS && {
                          flex: '1 0 auto',
                        }),
                      }}
                      draggable
                      onDragStart={(e) => handleHeaderDragStart(header.id, e)}
                      onDragOver={handleHeaderDragOver}
                      onDrop={(e) => handleHeaderDrop(header.id, e)}
                    >
                      <div className={'flex h-full w-full cursor-pointer items-center justify-between select-none'}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
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
            style={{
              display: 'grid',
              height: `${rowVirtualizer.getTotalSize()}px`, // Tells scrollbar how big the table is
              position: 'relative', // Needed for absolute positioning of rows
            }}
          >
            {/* <---- "Full Table" skeleton loader (tab or filter changes) ----> */}
            {showOverlaySkeleton
              ? Array.from({ length: 20 }).map((_, skeletonRowIdx) => {
                  return (
                    <tr
                      key={`skeleton-${skeletonRowIdx}`}
                      className='absolute flex h-10 w-full'
                      style={{
                        transform: `translateY(${skeletonRowIdx * 40}px)`,
                      }}
                    >
                      {skeletonLoaderHeaderList?.map((header, colIdx) => (
                        <td
                          data-testid='overlay-skeleton-cell'
                          key={`skeleton-cell-${skeletonRowIdx}-${colIdx}`}
                          className='flex items-center px-2 py-2'
                          style={{
                            width: `${header.getSize()}px`,
                            minWidth: `${header.getSize()}px`,
                            ...(header.id === CUSTOM_COLUMN_TYPE.STATUS && {
                              maxWidth: `${header.getSize()}px`,
                              flex: '0 0 auto',
                            }),
                            ...(header.id !== CUSTOM_COLUMN_TYPE.STATUS && {
                              flex: '1 0 auto',
                            }),
                          }}
                        >
                          <SkeletonElement className='h-3.5 w-full rounded-sm bg-gray-200' />
                        </td>
                      ))}
                    </tr>
                  );
                })
              : rowVirtualizer.getVirtualItems().map((virtualRow) => {
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
                  const isHighlighted = rowHighlighting?.enabled && highlightedRowIndex === virtualRow.index;

                  return (
                    <tr
                      data-index={virtualRow.index}
                      ref={(node) => rowVirtualizer.measureElement(node)}
                      key={row?.id}
                      className={cn('group absolute flex cursor-pointer', isHighlighted && 'bg-BACKGROUND_GRAY_2')}
                      style={{
                        transform: `translateY(${virtualRow.start}px)`,
                        width: '100%',
                      }}
                      onClick={() =>
                        rowHighlighting?.enabled
                          ? enhancedHandleRowClick(row?.original as ActivityRunRowData, virtualRow.index)
                          : onRowClicked?.(row?.original as ActivityRunRowData, virtualRow.index)
                      }
                    >
                      {row.getVisibleCells().map((cell) => {
                        const raw = cell.getValue();
                        const ctx = { ...cell.getContext(), absoluteRowIndex: virtualRow.index };
                        const colId = cell.column.id;
                        const showCustomCell = isNonMovableColumn(colId);

                        return (
                          <td
                            key={cell.id}
                            data-testid={`table-cell-${colId}`}
                            className={cn(
                              'group-hover:bg-BACKGROUND_GRAY_2',
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
                            {showCustomCell ? (
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
                            ) : raw == null || (typeof raw === 'string' && raw.trim() === '') ? (
                              <span
                                className={cn(
                                  'text-13 group-hover:bg-BACKGROUND_GRAY_2 text-gray-550 px-4! py-1!',
                                  isHighlighted && 'bg-BACKGROUND_GRAY_2',
                                )}
                              >
                                N/A
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  'group-hover:bg-BACKGROUND_GRAY_2! truncate px-4! py-1!',
                                  isHighlighted && 'bg-BACKGROUND_GRAY_2',
                                )}
                              >
                                {String(raw)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
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
