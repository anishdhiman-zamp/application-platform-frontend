import React, { FC } from 'react';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { COLORS } from 'constants/colors';
import { IMPORT_ALLOWED_FILE_FORMATS } from 'modules/data/components/importDataset/importData.constants';
import { ImportFileWrapperPropsType } from 'modules/data/components/importDataset/importData.types';
import ImportFile from 'modules/data/components/importDataset/ImportFile';
import Popup from 'components/common/popup/Popup';

const ImportFileWrapper: FC<ImportFileWrapperPropsType> = ({
  isOpen,
  onClose,
  setRawData,
  fileName,
  setFileName,
  setFileUploadId,
  keepLoadingFlow,
  isFileUploading,
}) => {
  return (
    <Popup
      title='Import Data'
      titleClassName='f-16-600 text-GRAY_950'
      iconCategory={ICON_SPRITE_TYPES.GENERAL}
      iconId='x-close'
      iconColor={COLORS.TEXT_PRIMARY}
      isOpen={isOpen}
      onClose={onClose}
      popupWrapperClassName='bg-white rounded-t-2.5 min-w-[464px] pl-6 py-4.5 border border-GRAY_400 border-b-0'
      closeOnClickOutside={false}
      showIcon
    >
      <div className='rounded-2.5 border-GRAY_400 rounded-t-none border border-t-0 bg-white p-1.5 pt-0'>
        <ImportFile
          fileName={fileName}
          setFileName={setFileName}
          setRawData={setRawData}
          acceptedFormats={IMPORT_ALLOWED_FILE_FORMATS}
          className='bg-BG_GRAY_1 border-GRAY_400 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed focus:border-solid focus:border-black'
          setFileUploadId={setFileUploadId}
          keepLoadingFlow={keepLoadingFlow}
          isFileUploading={isFileUploading}
        />
      </div>
    </Popup>
  );
};

export default ImportFileWrapper;
