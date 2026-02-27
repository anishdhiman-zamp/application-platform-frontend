'use client';

import { Progress, ShimmerText } from '@zamp-platform/ui';
import type { UploadProgress } from 'modules/pace/components/progress-toast/progress-toast.types';
import type { FolderUploadProgress } from '@/modules/pace/components/files/file-tree.types';
import { formatFileSize } from '@/modules/pace/components/files/file-tree.utils';

interface FolderUploadProgressContentProps {
  folderProgress: FolderUploadProgress;
  currentFile: UploadProgress | null;
}

const FolderUploadProgressContent = ({ folderProgress, currentFile }: FolderUploadProgressContentProps) => {
  const overallPercentage =
    folderProgress?.totalBytes > 0 ? Math.round((folderProgress?.uploadedBytes / folderProgress?.totalBytes) * 100) : 0;

  const currentFileIndex = Math.min(folderProgress?.completedFiles + 1, folderProgress?.totalFiles);

  return (
    <div className='flex w-full flex-col gap-y-2'>
      <div className='f-12-450 text-GRAY_900'>
        {currentFileIndex} of {folderProgress?.totalFiles} files
      </div>

      {currentFile && (
        <ShimmerText
          text={currentFile.fileName}
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
