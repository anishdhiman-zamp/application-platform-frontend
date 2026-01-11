import React, { FC } from 'react';
import { Dialog, DialogBody, DialogContent, DialogHeader } from '@zamp-platform/ui';
import { IMPORT_ALLOWED_FILE_FORMATS } from 'modules/data/components/importDataset/importData.constants';
import { ImportFileWrapperPropsType } from 'modules/data/components/importDataset/importData.types';
import ImportFile from 'modules/data/components/importDataset/ImportFile';

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size='small' showCloseButton className='min-w-[464px]'>
        <DialogHeader className='f-16-600 text-GRAY_950 border-none'>Import Data</DialogHeader>
        <DialogBody className='p-1.5 pt-0'>
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
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default ImportFileWrapper;
