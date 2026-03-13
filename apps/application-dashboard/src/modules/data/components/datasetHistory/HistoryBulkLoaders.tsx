import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { CSS_VARS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { HistoryBulkLoadersPropsType } from 'modules/data/components/importDataset/importData.types';
import { LOADER_STATUS } from 'modules/data/data.types';
import { removeDatasetBulkLoader } from 'store/slices/user';
import { cn } from 'utils/common';
import StatusIndicator from 'components/common/StatusIndicator';

const HistoryBulkLoaders: FC<HistoryBulkLoadersPropsType> = ({
  isHoveredLoaders,
  setIsHoveredLoaders,
  datasetBulkLoaders,
}) => {
  const dispatch = useDispatch();

  const handleRemoveLoader = (id: string) => dispatch(removeDatasetBulkLoader(id));

  return (
    <div>
      {!!datasetBulkLoaders?.length && (
        <div className='w-full' onMouseEnter={() => setIsHoveredLoaders(true)}>
          <div className='relative flex flex-col gap-1.5'>
            {datasetBulkLoaders
              .slice(0, isHoveredLoaders ? datasetBulkLoaders?.length : 3)
              .reverse()
              .map((loader, index) => (
                <div
                  key={index}
                  className={cn(
                    !isHoveredLoaders && 'absolute delay-100 ease-out',
                    'border-GRAY_500 rounded-2.5 shadow-table-filter-menu bg-BG_WHITE flex w-96 items-center justify-between gap-3 border-[0.5px] px-5 py-3 transition-transform delay-100 duration-300 ease-out',
                  )}
                  style={{
                    transform: isHoveredLoaders
                      ? ''
                      : `translateZ(-${index * 10}px) translateY(${index * 10}px) scale(${1 - index * 0.05})`,
                    zIndex: isHoveredLoaders ? '' : datasetBulkLoaders?.length - index,
                  }}
                >
                  <div className='flex items-start gap-3'>
                    <StatusIndicator status={loader?.status} />
                    <div className='flex flex-col'>
                      <span className='f-13-500 text-GRAY_1000'>{loader?.title}</span>
                      <span className='f-11-400 text-GRAY_700 mt-1'>{loader?.description}</span>
                    </div>
                  </div>
                  <div className='flex flex-col items-center justify-center'>
                    {!(loader?.status === LOADER_STATUS?.LOADING) && (
                      <SvgSpriteLoader
                        id='x-close'
                        width={16}
                        height={16}
                        color={CSS_VARS.GRAY_1000}
                        className='cursor-pointer'
                        onClick={() => handleRemoveLoader(loader?.id)}
                      />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryBulkLoaders;
