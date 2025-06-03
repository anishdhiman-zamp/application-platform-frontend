import React, { FC, useEffect } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { TableSchemaAlignmentStatusPropsType } from 'modules/data/components/importDataset/importData.types';
import { LOADER_STATUS } from 'modules/data/data.types';
import { cn } from 'utils/common';
import StatusIndicator from 'components/common/StatusIndicator';

const TableSchemaAlignmentStatus: FC<TableSchemaAlignmentStatusPropsType> = ({
  showAiTransformationStatus,
  setShowAiTransformationStatus,
}) => {
  const handleCloseTransformationStatus = () => {
    setShowAiTransformationStatus({
      open: false,
      status: LOADER_STATUS.SUCCESS,
      title: '',
      description: '',
    });
  };

  useEffect(() => {
    if (showAiTransformationStatus?.open) {
      const timer = setTimeout(handleCloseTransformationStatus, 5000);

      return () => clearTimeout(timer);
    }
  }, [showAiTransformationStatus, setShowAiTransformationStatus]);

  if (!showAiTransformationStatus?.open) return null;

  return (
    <div className='animate-slide-in-out border-GRAY_500 rounded-2.5 z-1000 shadow-table-filter-menu absolute right-0 top-8 flex w-[300px] items-start justify-center gap-5 border-[0.5px] bg-white px-5 py-3'>
      <div className='flex items-start gap-3'>
        <StatusIndicator status={showAiTransformationStatus?.status as LOADER_STATUS} />
        <div className='flex flex-col'>
          <span className='f-13-500 text-GRAY_1000'>{showAiTransformationStatus?.title}</span>
          <span
            className={cn(
              'f-11-400 text-GRAY_700 mt-1',
              showAiTransformationStatus?.status === LOADER_STATUS.ERROR && 'text-RED_800',
            )}
          >
            {showAiTransformationStatus?.description}
          </span>
        </div>
      </div>
      <SvgSpriteLoader
        id='x-close'
        width={16}
        height={16}
        onClick={handleCloseTransformationStatus}
        className='text-GRAY_800 hover:text-GRAY_1000 cursor-pointer'
      />
    </div>
  );
};

export default TableSchemaAlignmentStatus;
