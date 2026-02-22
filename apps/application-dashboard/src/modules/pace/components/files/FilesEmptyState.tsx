'use client';

import { FC } from 'react';
import ImageKitImage from '@/components/ImageKitImage';
import { NEEDS_ATTENTION_EMPTY_STATE } from '@/constants/icons';

const FilesEmptyState: FC = () => {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-y-3'>
      <div className='relative flex h-[120px] w-[160px] items-center justify-center'>
        <ImageKitImage
          src={NEEDS_ATTENTION_EMPTY_STATE}
          alt='No files yet'
          className='h-full w-full object-contain object-center'
          width={160}
          height={120}
        />
      </div>
      <div className='flex flex-col items-center gap-y-1'>
        <p className='f-14-500 text-GRAY_700'>No files yet</p>
      </div>
    </div>
  );
};

export default FilesEmptyState;
