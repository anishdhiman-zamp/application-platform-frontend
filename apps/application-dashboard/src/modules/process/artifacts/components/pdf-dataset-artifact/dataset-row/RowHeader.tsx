import { Button, CSS_VARS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { GridApi } from 'ag-grid-community';
import TooltipV2 from '@/components/common/TooltipV2';

interface RowHeaderProps {
  selectedRowIndex: number;
  totalRows: number;
  navigateRow: (direction: 1 | -1) => void;
  gridApi: GridApi | null;
}

const RowHeader = ({ selectedRowIndex, totalRows, navigateRow, gridApi }: RowHeaderProps) => {
  return (
    <div className='bg-BG_GRAY_1 border-GRAY_400 flex w-full shrink-0 items-center justify-between border-[0.5px] border-b-0 px-4 py-2'>
      <div className='flex items-center gap-1'>
        <span className='f-11-550 text-GRAY_900 uppercase'>row</span>
        <span className='f-11-550 text-GRAY_1000'>{(selectedRowIndex ?? 0) + 1}</span>
        <span className='f-11-550 text-GRAY_700'>{`/ ${totalRows}`}</span>
      </div>
      <div className='flex items-center gap-1.5'>
        <TooltipV2 tooltipBody='Go to previous row'>
          <Button
            variant='ghost'
            className='border-GRAY_400 flex size-5 items-center justify-center rounded-md border bg-white p-0'
            onClick={() => navigateRow(-1)}
            disabled={selectedRowIndex === 0 || !gridApi}
          >
            <SvgSpriteLoader id='chevron-up' size={14} color={CSS_VARS.GRAY_1000} />
          </Button>
        </TooltipV2>
        <TooltipV2 tooltipBody='Go to next row'>
          <Button
            variant='ghost'
            className='border-GRAY_400 flex size-5 items-center justify-center rounded-md border bg-white p-0'
            onClick={() => navigateRow(+1)}
            disabled={selectedRowIndex === totalRows - 1 || !gridApi}
          >
            <SvgSpriteLoader id='chevron-down' size={14} color={CSS_VARS.GRAY_1000} />
          </Button>
        </TooltipV2>
      </div>
    </div>
  );
};

export default RowHeader;
