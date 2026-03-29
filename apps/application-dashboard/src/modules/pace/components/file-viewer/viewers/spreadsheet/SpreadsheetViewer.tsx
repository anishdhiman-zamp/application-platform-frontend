'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type ColumnDef,
  type ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Input } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import EmptyState from '@/components/EmptyState';
import { SHEET_EMPTY_STATE } from '@/constants/icons';
import SheetTabs from '@/modules/pace/components/file-viewer/viewers/spreadsheet/SheetTabs';
import SortIcon from '@/modules/pace/components/file-viewer/viewers/spreadsheet/SortIcon';
import {
  ROW_NUMBER_COLUMN_ID,
  type SpreadsheetData,
  type SpreadsheetViewerProps,
  TEXT_BASED_EXTENSIONS,
} from '@/modules/pace/components/file-viewer/viewers/spreadsheet/spreadsheet.types';
import { parseWorkbook } from '@/modules/pace/components/file-viewer/viewers/spreadsheet/spreadsheet.utils';
import SpreadsheetViewerLoading from '@/modules/pace/components/file-viewer/viewers/spreadsheet/SpreadsheetViewerLoading';

const ROW_HEIGHT = 36;

const SpreadsheetViewer = memo(({ content, mediaUrl, fileExtension, onError }: SpreadsheetViewerProps) => {
  const hasLoadedOnce = useRef(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData | null>(null);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [workbookRef, setWorkbookRef] = useState<XLSX.WorkBook | null>(null);
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');

  const isTextBased = (TEXT_BASED_EXTENSIONS as readonly string[]).includes(fileExtension?.toLowerCase() ?? '');
  const hasData = (spreadsheetData?.headers?.length ?? 0) > 0;

  const columns = useMemo<ColumnDef<Record<string, string>>[]>(() => {
    if (!spreadsheetData) return [];

    const rowNumCol: ColumnDef<Record<string, string>> = {
      id: ROW_NUMBER_COLUMN_ID,
      header: '',
      size: 60,
      minSize: 60,
      enableSorting: false,
      enableGlobalFilter: false,
      enableResizing: true,
    };

    const dataCols: ColumnDef<Record<string, string>>[] = spreadsheetData.headers.map((header) => ({
      accessorKey: header,
      header: header,
      cell: ({ getValue }) => {
        const value = getValue() as string;

        return value || '';
      },
      size: Math.max(120, Math.min(header.length * 10 + 40, 300)),
      minSize: 60,
      enableResizing: true,
    }));

    return [rowNumCol, ...dataCols];
  }, [spreadsheetData]);

  const table = useReactTable({
    data: spreadsheetData?.rows ?? [],
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    columnResizeMode,
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? (virtualRows[0]?.start ?? 0) : 0;
  const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0) : 0;

  const handleSheetChange = useCallback(
    (sheetName: string) => {
      if (!workbookRef) return;

      const parsed = parseWorkbook(workbookRef, sheetName);

      setSpreadsheetData((prev) => (prev ? { ...parsed, sheetNames: prev.sheetNames } : null));
      setActiveSheet(sheetName);
      setGlobalFilter('');
      setSorting([]);
    },
    [workbookRef],
  );

  const parseData = useCallback(
    async (signal?: AbortSignal) => {
      if (!hasLoadedOnce.current) {
        setIsLoading(true);
      }
      setError(null);

      try {
        let workbook: XLSX.WorkBook;

        if (isTextBased && content != null) {
          workbook = XLSX.read(content, { type: 'string' });
        } else if (mediaUrl) {
          const response = await fetch(mediaUrl, { signal });

          if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

          const arrayBuffer = await response.arrayBuffer();

          workbook = XLSX.read(arrayBuffer, { type: 'array' });
        } else {
          setIsLoading(false);

          return;
        }

        if (signal?.aborted) return;

        setWorkbookRef(workbook);

        const sheetNames = workbook?.SheetNames ?? [];
        const firstSheet = sheetNames[0] ?? '';
        const parsed = parseWorkbook(workbook, firstSheet);

        setSpreadsheetData({
          ...parsed,
          sheetNames,
        });
        setActiveSheet(firstSheet);
        hasLoadedOnce.current = true;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Unknown error occurred';

        setError(message);
        onError?.(message);
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [content, mediaUrl, isTextBased, onError],
  );

  useEffect(() => {
    const controller = new AbortController();

    parseData(controller.signal);

    return () => controller.abort();
  }, [parseData]);

  if (isLoading) return <SpreadsheetViewerLoading />;
  if (error || !spreadsheetData) return null;

  if (!hasData) {
    return <EmptyState imageSrc={SHEET_EMPTY_STATE} imageAlt='No data available' title='No data available' />;
  }

  return (
    <div className='flex h-full w-full flex-col overflow-hidden'>
      {/* Toolbar */}
      <div className='border-border flex shrink-0 items-center justify-between border-b px-4 py-2'>
        <div className='max-w-xs flex-1'>
          <Input
            size='small'
            placeholder='Search across all columns'
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            icon={<Search size={14} className='text-GRAY_600' />}
            iconPosition='leading'
            className='bg-BG_WHITE'
          />
        </div>
        <span className='f-12-400 text-GRAY_700'>
          {rows.length} / {spreadsheetData?.rows?.length ?? 0} rows × {spreadsheetData?.headers?.length ?? 0} columns
        </span>
      </div>

      {/* Table */}
      <div ref={tableContainerRef} className='min-h-0 flex-1 overflow-auto [scrollbar-width:thin]'>
        <table
          className='w-full border-collapse'
          style={{ minWidth: table.getCenterTotalSize(), tableLayout: 'fixed' }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'bg-muted border-border f-12-500 text-GRAY_700 relative border-r border-b px-3 py-2 text-left whitespace-nowrap',
                      'sticky top-0 z-10',
                      header.column.getCanSort() &&
                        !table.getState().columnSizingInfo.isResizingColumn &&
                        'hover:bg-accent cursor-pointer select-none',
                      header.id === ROW_NUMBER_COLUMN_ID && 'left-0 z-20',
                    )}
                    style={{ width: header.getSize() }}
                    onClick={() => {
                      if (table.getState().columnSizingInfo.isResizingColumn) return;
                      header.column.getToggleSortingHandler()?.({} as React.MouseEvent);
                    }}
                  >
                    <div className='flex items-center gap-1'>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <SortIcon isSorted={header.column.getIsSorted()} />}
                    </div>
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onDoubleClick={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          'absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none',
                          header.column.getIsResizing()
                            ? 'bg-GRAY_1000 opacity-100'
                            : 'hover:bg-GRAY_1000 opacity-0 hover:opacity-100',
                        )}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='px-3 py-8 text-center'>
                  <p className='f-13-400 text-GRAY_700'>
                    {globalFilter ? 'No matching rows found.' : 'No data available.'}
                  </p>
                </td>
              </tr>
            ) : (
              <>
                {paddingTop > 0 && (
                  <tr>
                    <td style={{ height: paddingTop }} />
                  </tr>
                )}
                {virtualRows.map((virtualRow) => {
                  const row = rows[virtualRow.index];

                  if (!row) return null;

                  return (
                    <tr
                      key={row.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className={cn('hover:bg-accent', virtualRow.index % 2 === 1 && 'bg-muted/40')}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={cn(
                            'border-border f-13-400 text-GRAY_1000 truncate overflow-hidden border-r border-b px-3 py-2 whitespace-nowrap',
                            cell.column.id === ROW_NUMBER_COLUMN_ID &&
                              'bg-muted text-GRAY_700 f-12-400 sticky left-0 z-10 text-center',
                          )}
                          style={{ width: cell.column.getSize(), maxWidth: cell.column.getSize() }}
                        >
                          {cell.column.id === ROW_NUMBER_COLUMN_ID
                            ? virtualRow.index + 1
                            : flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {paddingBottom > 0 && (
                  <tr>
                    <td style={{ height: paddingBottom }} />
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: Sheet tabs */}
      {(spreadsheetData.sheetNames?.length ?? 0) > 1 && (
        <div className='border-border shrink-0 border-t'>
          <SheetTabs
            sheetNames={spreadsheetData.sheetNames}
            activeSheet={activeSheet}
            onSheetChange={handleSheetChange}
          />
        </div>
      )}
    </div>
  );
});

SpreadsheetViewer.displayName = 'SpreadsheetViewer';

export default SpreadsheetViewer;
