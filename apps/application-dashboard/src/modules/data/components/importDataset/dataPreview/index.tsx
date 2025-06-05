import React, { FC } from 'react';
import DataPreviewContent from 'modules/data/components/importDataset/dataPreview/DataPreviewContent';
import DataPreviewSidebar from 'modules/data/components/importDataset/dataPreview/DataPreviewSidebar';
import { ImportedDataPreviewPropsType } from 'modules/data/components/importDataset/importData.types';

const ImportedDataPreview: FC<ImportedDataPreviewPropsType> = ({
  onReset,
  rawData,
  mappedData,
  startAiTransformation,
  setShowAiTransformationStatus,
  fileUploadId,
  fileName,
  onRefetch,
}) => {
  const handleReset = () => {
    onReset();
  };

  if (startAiTransformation) {
    return (
      <div className='bg-GRAY_70 fixed top-0 left-0 z-1000 h-screen w-screen'>
        <div className='rounded-2.5 border-GRAY_400 mt-7 flex h-screen overflow-hidden border border-t bg-white'>
          <div className='border-GRAY_400 sticky h-full w-1/3 border-r'>
            <DataPreviewSidebar
              fileName={fileName}
              fileUploadId={fileUploadId}
              setShowAiTransformationStatus={setShowAiTransformationStatus}
              onReset={handleReset}
              onRefetch={onRefetch}
            />
          </div>
          <div className='h-full w-2/3'>
            <DataPreviewContent mappedData={mappedData} rawData={rawData} />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ImportedDataPreview;
