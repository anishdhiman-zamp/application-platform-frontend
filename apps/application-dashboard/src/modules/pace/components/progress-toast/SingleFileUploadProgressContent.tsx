'use client';

import { Progress, ShimmerText } from '@zamp-platform/ui';
import type { UploadProgress } from 'modules/pace/components/progress-toast/progress-toast.types';
import { formatFileSize } from '@/modules/pace/components/files/file-tree.utils';

interface SingleFileUploadProgressContentProps {
  progress: UploadProgress;
}

const SingleFileUploadProgressContent = ({ progress }: SingleFileUploadProgressContentProps) => {
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <ShimmerText text={progress.fileName} baseTextClassName='f-13-500 text-GRAY_1000 max-w-[240px] truncate' />

      <div className='mt-1'>
        <div className='flex items-center gap-2'>
          <Progress value={progress.percentage} className='flex-1' />
          <span className='f-12-400 text-GRAY_600 min-w-[40px] text-right'>{progress.percentage}%</span>
        </div>
        <div className='f-11-400 text-GRAY_700 mt-1'>
          {formatFileSize(progress.loaded)} / {formatFileSize(progress.total)}
        </div>
      </div>
    </div>
  );
};

export default SingleFileUploadProgressContent;
