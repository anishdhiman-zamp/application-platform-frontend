import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { COLORS } from 'constants/colors';
import ImportFileHistory from 'modules/data/components/datasetHistory/ImportFileHistory';
import LoadingWidthAnimation from 'modules/data/components/LoadingWidthAnimation';
import { RootState } from 'store';
import { cn } from 'utils/common';
import { Tooltip, TooltipPositions } from 'components/common/tooltip';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const DatasetHistory = () => {
  const datasetBulkLoaders = useSelector((state: RootState) => state?.user?.datasetBulkLoaders) || [];
  const [isFileImportHistoryOpen, setIsFileImportHistoryOpen] = useState<boolean>(false);

  const handleOpenFileImportHistory = () => setIsFileImportHistoryOpen(true);
  const handleCloseFileImportHistory = () => setIsFileImportHistoryOpen(false);

  return (
    <div>
      {isFileImportHistoryOpen && <ImportFileHistory onClose={handleCloseFileImportHistory} />}
      <div className='relative'>
        <Tooltip
          tooltipBody='activity'
          tooltipBodyClassName='f-10-300 px-3 ml-2 py-1.5 rounded-md whitespace-nowrap z-999 bg-black text-white'
          position={TooltipPositions.BOTTOM}
          className='!cursor-text'
        >
          <div
            className={cn('p-1 hover:bg-GRAY_100 rounded cursor-pointer', isFileImportHistoryOpen && 'bg-GRAY_100')}
            onClick={handleOpenFileImportHistory}
          >
            <SvgSpriteLoader id='clock-rewind' width={14} height={14} color={COLORS.GRAY_900} />
          </div>
        </Tooltip>
        {!!datasetBulkLoaders.length && (
          <div className='absolute bottom-px left-[3px]'>
            <LoadingWidthAnimation />
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetHistory;
