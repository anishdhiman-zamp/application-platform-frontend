import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import HistoryRow from 'modules/data/components/datasetHistory/HistoryRow';
import { HistoryListPropsType } from 'modules/data/components/importDataset/importData.types';
import SkeletonLoaderFileHistory from 'modules/data/components/SkeletonLoaderFileHistory';
import { RootState } from 'store';
import { cn } from 'utils/common';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

const HistoryList: FC<HistoryListPropsType> = ({ isHoveredLoaders, fileImportHistoryData, isHistoryLoading }) => {
  const datasetBulkLoaders = useSelector((state: RootState) => state?.user?.datasetBulkLoaders) || [];
  const baseTranslateY = Math.min(datasetBulkLoaders?.length, 3) * 10;
  const dynamicTranslateY =
    datasetBulkLoaders?.length === 0 ? 0 : isHoveredLoaders ? (datasetBulkLoaders?.length >= 3 ? -30 : -9) : 50;

  return (
    <div
      className={cn(
        !!datasetBulkLoaders?.length && 'mt-1.5',
        'rounded-2.5 shadow-table-filter-menu mr-4 mb-4 h-full max-h-fit w-96 bg-white',
      )}
      style={{
        scrollbarWidth: 'none',
        transform: `translateY(${baseTranslateY + dynamicTranslateY}px)`,
      }}
    >
      <div className='border-GRAY_500 rounded-2.5 flex w-full flex-col items-start justify-start overflow-y-scroll border-[0.5px] p-3.5'>
        <div className='flex w-full flex-col items-start justify-start'>
          <span className='f-14-600'>Import History</span>
          <div className='mt-2 flex w-full flex-col items-start justify-start gap-2'>
            <CommonWrapper
              skeletonType={SkeletonTypes.CUSTOM}
              loader={<SkeletonLoaderFileHistory itemCount={6} />}
              isLoading={isHistoryLoading && fileImportHistoryData?.length === 0}
              className='w-full'
            >
              {!!fileImportHistoryData &&
                fileImportHistoryData.map((historyItem) => (
                  <HistoryRow key={historyItem?.id} historyItem={historyItem} />
                ))}
            </CommonWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryList;
