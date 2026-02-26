'use client';

import { memo } from 'react';
import { Button } from '@zamp-platform/ui';
import ImageKitImage from '@/components/ImageKitImage';
import { NEEDS_ATTENTION_EMPTY_STATE } from '@/constants/icons';
import { defaultFnType } from '@/types/commonTypes';

interface FileNotFoundErrorProps {
  fileName: string;
  onClose: defaultFnType;
}

const FileNotFoundError = memo(({ fileName, onClose }: FileNotFoundErrorProps) => {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-y-4'>
      <div className='relative flex h-[120px] w-[160px] items-center justify-center'>
        <ImageKitImage
          src={NEEDS_ATTENTION_EMPTY_STATE}
          alt='File not found'
          className='h-full w-full object-contain object-center'
          width={160}
          height={120}
        />
      </div>
      <div className='flex flex-col items-center gap-y-2'>
        <p className='f-14-500 text-GRAY_700'>File not found</p>
        <p className='f-12-400 text-GRAY_600 max-w-[300px] text-center'>
          The file <span className='font-medium'>{fileName}</span> may have been moved or deleted.
        </p>
      </div>
      <Button variant='secondary' size='small' onClick={onClose}>
        Close tab
      </Button>
    </div>
  );
});

FileNotFoundError.displayName = 'FileNotFoundError';

export default FileNotFoundError;
