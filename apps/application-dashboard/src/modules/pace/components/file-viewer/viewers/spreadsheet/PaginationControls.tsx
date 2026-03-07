import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE_OPTIONS } from '@/modules/pace/components/file-viewer/viewers/spreadsheet/spreadsheet.types';

interface PaginationControlsProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalRows: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PaginationControls = ({
  pageIndex,
  pageSize,
  pageCount,
  totalRows,
  canPreviousPage,
  canNextPage,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) => {
  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className='flex items-center gap-2 px-3 py-1.5 tabular-nums'>
      <div className='flex items-center gap-1.5'>
        <span className='f-12-400 text-GRAY_700 shrink-0'>Rows per page:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='xxsmall' className='w-[50px] justify-between gap-1 px-1.5'>
              <span className='f-12-450 text-GRAY_700'>{pageSize}</span>
              <ChevronDown size={12} className='text-GRAY_600 shrink-0' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='min-w-[80px]'>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => onPageSizeChange(size)}
                className={cn('f-12-400 hover:bg-GRAY_100 rounded-md', size === pageSize && 'bg-GRAY_200 font-medium')}
              >
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <span className='f-12-400 text-GRAY_700 w-[100px] shrink-0 text-center'>
        {totalRows > 0 ? `${start}\u2013${end} of ${totalRows}` : '0 rows'}
      </span>
      <div className='flex shrink-0 items-center gap-0.5'>
        <Button
          variant='ghost'
          size='xxsmall'
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!canPreviousPage}
          className='disabled:text-GRAY_500 disabled:cursor-not-allowed disabled:opacity-40'
        >
          <ChevronLeft size={16} />
        </Button>
        <span className='f-12-400 text-GRAY_700 w-[48px] text-center'>
          {pageCount > 0 ? `${pageIndex + 1} / ${pageCount}` : '\u2014'}
        </span>
        <Button
          variant='ghost'
          size='xxsmall'
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canNextPage}
          className='disabled:text-GRAY_500 disabled:cursor-not-allowed disabled:opacity-40'
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
