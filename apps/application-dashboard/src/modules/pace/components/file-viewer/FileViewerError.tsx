'use client';

import { memo } from 'react';
import { Button } from '@zamp-platform/ui';
import ImageKitImage from '@/components/ImageKitImage';
import { NEEDS_ATTENTION_EMPTY_STATE } from '@/constants/icons';
import { FILE_VIEWER_ERROR_CONFIG } from '@/modules/pace/components/file-viewer/file-viewer.constants';
import type { FileViewerErrorType } from '@/modules/pace/components/file-viewer/file-viewer.types';
import { defaultFnType } from '@/types/commonTypes';

interface FileViewerErrorProps {
  fileName?: string;
  type?: FileViewerErrorType;
  title?: string;
  description?: string;
  onClose?: defaultFnType;
}

const FileViewerError = memo(({ fileName, type = 'load-error', title, description, onClose }: FileViewerErrorProps) => {
  const config = FILE_VIEWER_ERROR_CONFIG[type];
  const resolvedTitle = title ?? config.title;
  const resolvedDescription = description ?? (fileName ? config.getDescription(fileName) : undefined);

  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-y-4'>
      <div className='relative flex h-[120px] w-[160px] items-center justify-center'>
        <ImageKitImage
          src={NEEDS_ATTENTION_EMPTY_STATE}
          alt={resolvedTitle}
          className='h-full w-full object-contain object-center'
          width={160}
          height={120}
        />
      </div>
      <div className='flex flex-col items-center gap-y-2'>
        <p className='f-14-500 text-GRAY_700'>{resolvedTitle}</p>
        {resolvedDescription && (
          <p className='f-12-400 text-GRAY_600 max-w-[300px] text-center'>{resolvedDescription}</p>
        )}
      </div>
      {onClose && (
        <Button variant='secondary' size='small' onClick={onClose}>
          Close tab
        </Button>
      )}
    </div>
  );
});

FileViewerError.displayName = 'FileViewerError';

export default FileViewerError;
