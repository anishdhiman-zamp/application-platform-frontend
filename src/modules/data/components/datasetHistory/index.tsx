import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { COLORS } from 'constants/colors';
import ImportFileHistory from 'modules/data/components/datasetHistory/ImportFileHistory';
import LoadingWidthAnimation from 'modules/data/components/LoadingWidthAnimation';
import { RootState } from 'store';
import { cn } from 'utils/common';
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
        <SvgSpriteLoader
          className={cn('cursor-pointer hover:bg-GRAY_100 p-1 rounded', isFileImportHistoryOpen && 'bg-GRAY_100')}
          onClick={handleOpenFileImportHistory}
          id='clock-rewind'
          width={14}
          height={14}
          color={COLORS.GRAY_900}
        />
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
