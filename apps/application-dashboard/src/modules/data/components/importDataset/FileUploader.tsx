import React, { DragEventHandler, FC, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { Button, CSS_VARS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { KEYBOARD_KEYS } from 'constants/shortcuts';
import { FILE_IMPORT_STATUS_MSG } from 'modules/data/components/importDataset/importData.constants';
import { FileUploaderPropsType } from 'modules/data/components/importDataset/importData.types';
import { cn } from 'utils/common';
import { toast } from '@/components/common/toast/Toast';

const FileUploader: FC<FileUploaderPropsType> = ({
  isLoading,
  isSuccess,
  error,
  onFileDrop,
  onClick,
  children,
  footer,
  className,
  fileName,
  setFileName,
  indexKey,
  showUploadButton = true,
  supportedFiles,
}) => {
  const errorTitle = error ?? FILE_IMPORT_STATUS_MSG.FILE_UPLOAD_COMMON_ERROR;
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const helperText = useMemo(() => {
    const supportedFilesList = supportedFiles?.replaceAll('.', ' ');

    return `We only accept ${supportedFilesList} format files here`;
  }, [supportedFiles]);

  const handleFileDrop: DragEventHandler<HTMLDivElement> = (event) => {
    if (isLoading) return null;

    event?.preventDefault();
    event?.stopPropagation();

    const files = event?.dataTransfer?.files?.[0];

    setFileName?.(files?.name);

    setIsDragOver(false);
    onFileDrop(files);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === KEYBOARD_KEYS.ENTER) onClick();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='h-full w-3/5'>
          <div className='flex w-full justify-start gap-1.5 py-1'>
            <SvgSpriteLoader id='file-06' width={14} height={14} color={CSS_VARS.GRAY_700} />
            <span className='f-12-400 text-GRAY_700'>{fileName}</span>
          </div>
          <span className='bg-GRAY_400 relative mt-2 flex h-1 w-full overflow-hidden rounded-xl'>
            <span className='animate-slide absolute left-0 h-full w-1/2 rounded-xl bg-black'></span>
          </span>
        </div>
      );
    }

    if (isSuccess) {
      return (
        <div className='w-3/5'>
          <div className='flex w-full items-center justify-between gap-4'>
            <div className='flex w-full justify-start gap-1.5 py-1'>
              <SvgSpriteLoader id='file-06' width={14} height={14} color={CSS_VARS.GRAY_1000} />
              <span className='f-12-400 text-GRAY_1000'>{fileName}</span>
            </div>
            <SvgSpriteLoader id='check' width={14} height={14} color={CSS_VARS.GREEN_700} />
          </div>
          <span className='bg-GREEN_700 mt-2 flex h-1 w-full rounded-xl'></span>
        </div>
      );
    }

    return (
      <div key={indexKey} className='relative flex w-full flex-col items-center justify-center'>
        {showUploadButton && (
          <Button testId='UPLOAD_FILE_BUTTON' className='mt-4 h-fit' size='small' variant='outline' isLoading={false}>
            Browse files
          </Button>
        )}
        <div className='f-12-400 rounded-2.5 text-GRAY_700 mt-1.5 flex flex-col gap-1'>
          <span>{footer}</span>
          <span>{helperText}</span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (error) {
      toast.error(errorTitle);
    }
  }, [error, errorTitle]);

  return (
    <>
      <div
        className={cn(
          'bg-BG_GRAY_1 border-GRAY_400 relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed focus:border-solid focus:border-black',
          isLoading ? 'cursor-not-allowed' : 'cursor-pointer',
          className,
          isDragOver && 'bg-GRAY_100 border-GRAY_500',
        )}
        onDrop={handleFileDrop}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => event.preventDefault()}
        onDragEnter={() => setIsDragOver(true)}
        onDragExit={() => setIsDragOver(false)}
        onDragLeave={() => setIsDragOver(false)}
      >
        <div onDragOver={() => setIsDragOver(true)} className='flex w-full flex-col items-center text-center'>
          {renderContent()}
        </div>
        {children}
      </div>
    </>
  );
};

export default FileUploader;
