'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Button, Progress } from '@zamp-platform/ui';
import { FolderUp, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { FolderUploadProgress } from '@/modules/pace/components/files/file-tree.types';
import { UPLOAD_TYPE } from '@/modules/pace/components/files/file-tree.types';
import { formatFileSize } from '@/modules/pace/components/files/file-tree.utils';

interface UploadProgress {
  fileName: string;
  filePath: string;
  loaded: number;
  total: number;
  percentage: number;
  status: string;
  uploadType: string;
}

interface UploadState {
  isUploading: boolean;
  currentUpload: UploadProgress | null;
  error: string | null;
  folderUpload: FolderUploadProgress | null;
}

interface UploadProgressToastProps {
  uploadState: UploadState;
  onCancel: () => void;
}

const ChunkedFileProgress = ({ progress }: { progress: UploadProgress }) => {
  return (
    <div className='border-GRAY_200 mt-2 border-t pt-2'>
      <div className='f-12-500 text-GRAY_700 mb-1'>Current file progress</div>
      <div className='flex items-center gap-2'>
        <Progress value={progress.percentage} className='flex-1' />
        <span className='f-12-400 text-GRAY_600 min-w-[40px] text-right'>{progress.percentage}%</span>
      </div>
      <div className='f-11-400 text-GRAY_500 mt-1'>
        {formatFileSize(progress.loaded)} / {formatFileSize(progress.total)}
      </div>
    </div>
  );
};

const FolderUploadProgressContent = ({
  folderProgress,
  currentFile,
}: {
  folderProgress: FolderUploadProgress;
  currentFile: UploadProgress | null;
}) => {
  const overallPercentage =
    folderProgress.totalBytes > 0 ? Math.round((folderProgress.uploadedBytes / folderProgress.totalBytes) * 100) : 0;

  const isChunkedUpload = currentFile?.uploadType === UPLOAD_TYPE.CHUNKED;
  const currentFileIndex = Math.min(folderProgress.completedFiles + 1, folderProgress.totalFiles);

  return (
    <div className='flex w-full flex-col gap-y-2'>
      <div className='f-12-400 text-GRAY_600'>
        Uploading {currentFileIndex} of {folderProgress.totalFiles} files
      </div>

      {currentFile && (
        <div className='flex items-center gap-2'>
          <Loader2 className='text-BLUE_500 size-4 animate-spin' />
          <span className='f-13-500 text-GRAY_1000 max-w-[240px] truncate'>{currentFile.fileName}</span>
        </div>
      )}

      <div className='mt-1'>
        <div className='f-12-500 text-GRAY_700 mb-1'>Overall progress</div>
        <div className='flex items-center gap-2'>
          <Progress value={overallPercentage} className='flex-1' />
          <span className='f-12-400 text-GRAY_600 min-w-[40px] text-right'>{overallPercentage}%</span>
        </div>
        <div className='f-11-400 text-GRAY_500 mt-1'>
          {formatFileSize(folderProgress.uploadedBytes)} / {formatFileSize(folderProgress.totalBytes)}
        </div>
      </div>

      {isChunkedUpload && currentFile && <ChunkedFileProgress progress={currentFile} />}
    </div>
  );
};

const UploadToastContent = ({ uploadState, onCancel }: UploadProgressToastProps) => {
  return (
    <div className='flex w-full flex-col gap-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='bg-BLUE_100 flex size-8 items-center justify-center rounded-full'>
            <FolderUp className='text-BLUE_600 size-4' />
          </div>
          <span className='f-14-600 text-GRAY_1000'>Uploading {uploadState.folderUpload?.folderName}</span>
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
      {uploadState.folderUpload && (
        <FolderUploadProgressContent
          folderProgress={uploadState.folderUpload}
          currentFile={uploadState.currentUpload}
        />
      )}
    </div>
  );
};

export const UploadProgressToast = ({ uploadState, onCancel }: UploadProgressToastProps) => {
  const toastIdRef = useRef<string | number | null>(null);

  const dismissUploadProgress = useCallback(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    const isFolderUpload = uploadState.folderUpload !== null;

    if (!uploadState.isUploading || !isFolderUpload) {
      dismissUploadProgress();

      return;
    }

    const toastContent = <UploadToastContent uploadState={uploadState} onCancel={onCancel} />;

    if (toastIdRef.current) {
      toast(toastContent, {
        id: toastIdRef.current,
        duration: Infinity,
        closeButton: false,
      });
    } else {
      toastIdRef.current = toast(toastContent, {
        duration: Infinity,
        closeButton: false,
      });
    }
  }, [uploadState, onCancel, dismissUploadProgress]);

  return null;
};

export default UploadProgressToast;
