import React, { FC, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetFileImportHistoryQuery } from 'apis/dataset';
import { useOnClickOutside } from 'hooks';
import HistoryBulkLoaders from 'modules/data/components/datasetHistory/HistoryBulkLoaders';
import HistoryEmptyState from 'modules/data/components/datasetHistory/HistoryEmptyState';
import HistoryList from 'modules/data/components/datasetHistory/HistoryList';
import { ImportFileHistoryPropsType } from 'modules/data/components/importDataset/importData.types';
import { useParams } from 'next/navigation';
import { RootState } from 'store';

const ImportFileHistory: FC<ImportFileHistoryPropsType> = ({ onClose }) => {
  const params = useParams();
  const datasetId = params?.datasetId as string;
  const importFileHistoryRef = useRef<HTMLDivElement>(null);
  const [isHoveredLoaders, setIsHoveredLoaders] = useState(false);
  const datasetBulkLoaders = useSelector((state: RootState) => state?.user?.datasetBulkLoaders) || [];
  const { data, isLoading: isHistoryLoading } = useGetFileImportHistoryQuery({ datasetId });
  const fileImportHistoryData = data?.file_uploads || [];
  const showEmptyState = !isHistoryLoading && !datasetBulkLoaders?.length && !fileImportHistoryData?.length;

  useOnClickOutside(importFileHistoryRef, onClose);

  return (
    <>
      <div className='fixed top-[94px] left-0 z-1000 flex h-[calc(100vh-136px)]! w-screen justify-end'>
        {showEmptyState ? (
          <div className='absolute top-0 right-8 z-50' ref={importFileHistoryRef}>
            <HistoryEmptyState />
          </div>
        ) : (
          <div
            ref={importFileHistoryRef}
            className='h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden'
            onMouseLeave={() => setIsHoveredLoaders(false)}
          >
            <div className='flex h-auto flex-col'>
              <HistoryBulkLoaders
                isHoveredLoaders={isHoveredLoaders}
                setIsHoveredLoaders={setIsHoveredLoaders}
                datasetBulkLoaders={datasetBulkLoaders}
              />
              <HistoryList
                isHoveredLoaders={isHoveredLoaders}
                isHistoryLoading={isHistoryLoading}
                fileImportHistoryData={fileImportHistoryData}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ImportFileHistory;
