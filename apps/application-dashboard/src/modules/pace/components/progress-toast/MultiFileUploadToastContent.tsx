'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Progress, ShimmerText } from '@zamp-platform/ui';
import { FileUp, X } from 'lucide-react';
import type { UploadProgressToastProps } from 'modules/pace/components/progress-toast/progress-toast.types';
import { formatFileSize } from '@/modules/pace/components/files/file-tree.utils';
import { FILE_NAME_CYCLE_INTERVAL_MS } from '@/modules/pace/components/files/files.constants';

const MultiFileUploadToastContent = ({ uploadState, onCancel }: UploadProgressToastProps) => {
  const [displayIndex, setDisplayIndex] = useState(0);

  const multiFile = uploadState?.multiFileUpload;
  const activeFileNames = useMemo(
    () => Object.values(uploadState?.activeUploads ?? {}).map((f) => f.fileName),
    [uploadState?.activeUploads],
  );
  const safeIndex = activeFileNames.length > 0 ? displayIndex % activeFileNames.length : 0;
  const displayFileName = activeFileNames[safeIndex] ?? null;

  useEffect(() => {
    if (activeFileNames.length <= 1) {
      setDisplayIndex(0);

      return;
    }

    const interval = setInterval(() => {
      setDisplayIndex((prev) => (prev + 1) % activeFileNames.length);
    }, FILE_NAME_CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeFileNames.length]);

  if (!multiFile) return null;

  const overallPercentage =
    multiFile?.totalBytes > 0 ? Math.round((multiFile?.uploadedBytes / multiFile?.totalBytes) * 100) : 0;
  const currentFileIndex = Math.min(multiFile?.completedFiles + 1, multiFile?.totalFiles);

  return (
    <div className='flex w-full flex-col gap-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1.5'>
          <FileUp className='text-GRAY_1000 size-4' />
          <span className='f-14-600 text-GRAY_1000'>Uploading {multiFile.totalFiles} files</span>
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

      <div className='flex w-full flex-col gap-y-2'>
        <div className='f-12-450 text-GRAY_900'>
          {currentFileIndex} of {multiFile.totalFiles} files
        </div>

        {displayFileName && (
          <ShimmerText
            text={displayFileName}
            className='block max-w-[240px]'
            baseTextClassName='f-13-500 text-GRAY_1000 truncate'
          />
        )}

        <div className='mt-1'>
          <div className='f-12-450 text-GRAY_900 mb-1'>Overall progress</div>
          <div className='flex items-center gap-2'>
            <Progress value={overallPercentage} className='flex-1' />
            <span className='f-12-400 text-GRAY_600 min-w-[40px] text-right'>{overallPercentage}%</span>
          </div>
          <div className='f-11-400 text-GRAY_700 mt-1'>
            {formatFileSize(multiFile.uploadedBytes)} / {formatFileSize(multiFile.totalBytes)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiFileUploadToastContent;
