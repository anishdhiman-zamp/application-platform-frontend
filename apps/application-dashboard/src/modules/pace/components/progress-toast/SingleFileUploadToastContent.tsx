'use client';

import { Button } from '@zamp-platform/ui';
import { FileUp, X } from 'lucide-react';
import type { UploadProgressToastProps } from 'modules/pace/components/progress-toast/progress-toast.types';
import SingleFileUploadProgressContent from 'modules/pace/components/progress-toast/SingleFileUploadProgressContent';

const SingleFileUploadToastContent = ({ uploadState, onCancel }: UploadProgressToastProps) => {
  return (
    <div className='flex w-full flex-col gap-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1.5'>
          <FileUp className='text-GRAY_1000 size-4' />
          <span className='f-14-600 text-GRAY_1000'>Uploading file</span>
        </div>
        <Button
          variant='ghost'
          size='small'
          className='text-GRAY_600 hover:text-GRAY_900 h-6 w-6 p-0'
          onClick={onCancel}
        >
          <X className='size-4' />
        </Button>
      </div>
      {uploadState?.currentUpload && <SingleFileUploadProgressContent progress={uploadState?.currentUpload} />}
    </div>
  );
};

export default SingleFileUploadToastContent;
