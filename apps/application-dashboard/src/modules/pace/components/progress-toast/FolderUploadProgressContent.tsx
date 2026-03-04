'use client';

import { useEffect, useMemo, useState } from 'react';
import { Progress, ShimmerText } from '@zamp-platform/ui';
import type { FolderUploadProgress } from '@/modules/pace/components/files/file-tree.types';
import { formatFileSize } from '@/modules/pace/components/files/file-tree.utils';
import { FILE_NAME_CYCLE_INTERVAL_MS } from '@/modules/pace/components/files/files.constants';

interface FolderUploadProgressContentProps {
  folderProgress: FolderUploadProgress;
}

const FolderUploadProgressContent = ({ folderProgress }: FolderUploadProgressContentProps) => {
  const [displayIndex, setDisplayIndex] = useState(0);

  const overallPercentage =
    folderProgress?.totalBytes > 0 ? Math.round((folderProgress?.uploadedBytes / folderProgress?.totalBytes) * 100) : 0;

  const currentFileIndex = Math.min(folderProgress?.completedFiles + 1, folderProgress?.totalFiles);
  const activeFileNames = useMemo(
    () => Object.values(folderProgress?.activeFiles ?? {}).map((f) => f.fileName),
    [folderProgress?.activeFiles],
  );
  const safeIndex = activeFileNames.length > 0 ? displayIndex % activeFileNames.length : 0;
  const displayFileName = activeFileNames[safeIndex] ?? null;

  useEffect(() => {
    if (activeFileNames?.length <= 1) {
      setDisplayIndex(0);

      return;
    }

    const interval = setInterval(() => {
      setDisplayIndex((prev) => (prev + 1) % activeFileNames?.length);
    }, FILE_NAME_CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeFileNames?.length]);

  return (
    <div className='flex w-full flex-col gap-y-2'>
      <div className='f-12-450 text-GRAY_900'>
        {currentFileIndex} of {folderProgress?.totalFiles} files
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
          <Progress value={overallPercentage ?? 0} className='flex-1' />
          <span className='f-12-400 text-GRAY_600 min-w-[40px] text-right'>{overallPercentage}%</span>
        </div>
        <div className='f-11-400 text-GRAY_700 mt-1'>
          {formatFileSize(folderProgress?.uploadedBytes)} / {formatFileSize(folderProgress?.totalBytes)}
        </div>
      </div>
    </div>
  );
};

export default FolderUploadProgressContent;
