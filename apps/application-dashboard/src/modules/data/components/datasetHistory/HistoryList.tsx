import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { COLORS } from 'constants/colors';
import { HistoryListPropsType } from 'modules/data/components/importDataset/importData.types';
import { formattedDate, maskString } from 'modules/data/components/importDataset/importData.utils';
import SkeletonLoaderFileHistory from 'modules/data/components/SkeletonLoaderFileHistory';
import { LOADER_STATUS } from 'modules/data/data.types';
import { RootState } from 'store';
import { cn, getUserNameFromEmail } from 'utils/common';
import StatusIndicator from 'components/common/StatusIndicator';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

const HistoryList: FC<HistoryListPropsType> = ({ isHoveredLoaders, fileImportHistoryData }) => {
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
      {!!fileImportHistoryData && !!fileImportHistoryData?.length && (
        <div className='border-GRAY_500 rounded-2.5 flex w-full flex-col items-start justify-start overflow-y-scroll border-[0.5px] p-3.5'>
          <div className='flex w-full flex-col items-start justify-start'>
            <span className='f-14-600'>Import History</span>
            <div className='mt-2 flex w-full flex-col items-start justify-start gap-2'>
              <CommonWrapper
                skeletonType={SkeletonTypes.CUSTOM}
                loader={<SkeletonLoaderFileHistory />}
                className='w-full'
              >
                {!!fileImportHistoryData &&
                  fileImportHistoryData.map((historyItem) => (
                    <div
                      key={historyItem?.id}
                      className='border-GRAY_400 flex w-full flex-col flex-wrap items-start justify-start border-b py-3.5'
                    >
                      <div className='flex w-full items-center justify-between'>
                        <div className='bg-GRAY_100 flex w-fit justify-start rounded-md px-2 py-1.5'>
                          <SvgSpriteLoader id='file-06' width={14} height={14} color={COLORS.GRAY_1000} />
                          <span className='f-12-400 text-GRAY_1000 ml-1.5'>
                            {maskString(historyItem?.file_name, 8, 8, 16)}
                          </span>
                        </div>
                        <StatusIndicator status={historyItem?.status as LOADER_STATUS} />
                      </div>
                      <span className='f-10-400 text-GRAY_700 mt-1'>{`${formattedDate(historyItem?.file_upload_created_at)} by ${getUserNameFromEmail(historyItem?.uploaded_by_user?.email)}`}</span>
                    </div>
                  ))}
              </CommonWrapper>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryList;
