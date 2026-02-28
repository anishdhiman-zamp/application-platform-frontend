'use client';

import { Button, Progress, ShimmerText } from '@zamp-platform/ui';
import { Download, X } from 'lucide-react';
import { formatFileSize } from '@/modules/pace/components/files/file-tree.utils';

export interface DownloadProgress {
  fileName: string;
  loaded: number;
  total: number;
  percentage: number;
  isInitializing?: boolean;
}

interface DownloadProgressToastContentProps {
  progress: DownloadProgress;
  onCancel?: () => void;
}

const DownloadProgressToastContent = ({ progress, onCancel }: DownloadProgressToastContentProps) => {
  const isInitializing = progress?.isInitializing;

  return (
    <div className='flex w-full flex-col gap-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1.5'>
          <Download className='text-GRAY_1000 size-4' />
          <span className='f-14-600 text-GRAY_1000'>Downloading file</span>
        </div>
        {onCancel && (
          <Button
            variant='ghost'
            size='small'
            className='text-GRAY_600 hover:text-GRAY_900 h-6 w-6 p-0'
            onClick={onCancel}
          >
            <X className='size-4' />
          </Button>
        )}
      </div>
      <div className='flex w-full flex-col gap-y-2'>
        <ShimmerText
          text={progress.fileName}
          className='block max-w-[240px]'
          baseTextClassName='f-13-500 text-GRAY_1000 truncate'
        />
        <div className='mt-1'>
          {isInitializing ? (
            <div className='flex items-center gap-2'>
              <Progress value={0} className='flex-1 animate-pulse' />
              <span className='f-12-400 text-GRAY_600 min-w-[40px] text-right'>0%</span>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Progress value={progress.percentage} className='flex-1' />
              <span className='f-12-400 text-GRAY_600 min-w-[40px] text-right'>{progress.percentage}%</span>
            </div>
          )}
          <div className='f-11-400 text-GRAY_700 mt-1'>
            {isInitializing
              ? 'Starting download...'
              : `${formatFileSize(progress.loaded)} / ${formatFileSize(progress.total)}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadProgressToastContent;
