import { useState } from 'react';
import { useSelector } from 'react-redux';
import { CSS_VARS, TooltipV2 } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import ImportFileHistory from 'modules/data/components/datasetHistory/ImportFileHistory';
import LoadingWidthAnimation from 'modules/data/components/LoadingWidthAnimation';
import { RootState } from 'store';
import { cn } from 'utils/common';
import { SIDE_OPTIONS } from '@/types/commonTypes';

const DatasetHistory = ({ disable }: { disable: boolean }) => {
  const datasetBulkLoaders = useSelector((state: RootState) => state?.user?.datasetBulkLoaders) || [];
  const [isFileImportHistoryOpen, setIsFileImportHistoryOpen] = useState<boolean>(false);

  const handleOpenFileImportHistory = () => setIsFileImportHistoryOpen(true);
  const handleCloseFileImportHistory = () => setIsFileImportHistoryOpen(false);

  return (
    <div>
      {isFileImportHistoryOpen && <ImportFileHistory onClose={handleCloseFileImportHistory} />}
      <div className='relative z-40 h-5.5 w-5.5'>
        <TooltipV2
          tooltipBody='Activity'
          side={SIDE_OPTIONS.BOTTOM}
          tooltipClassName='f-12-300 rounded-md whitespace-nowrap z-[1000] bg-black text-GRAY_200'
          className='z-1 h-full w-full'
        >
          <div
            className={cn(
              'rounded p-1',
              isFileImportHistoryOpen && 'bg-GRAY_100',
              disable
                ? 'disabled:text-GRAY_300 hover:text-GRAY_300 cursor-not-allowed'
                : 'hover:text-GRAY_100 cursor-pointer',
            )}
            onClick={handleOpenFileImportHistory}
          >
            <SvgSpriteLoader id='clock-rewind' width={14} height={14} color={CSS_VARS.GRAY_900} />
          </div>
        </TooltipV2>
        {!!datasetBulkLoaders?.length && (
          <div className='absolute bottom-px left-[3px]'>
            <LoadingWidthAnimation />
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetHistory;
