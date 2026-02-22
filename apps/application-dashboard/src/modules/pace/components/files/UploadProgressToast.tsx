'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Button } from '@zamp-platform/ui';
import { CheckCircle2, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { UPLOAD_STATUS } from '@/modules/pace/components/files/file-tree.types';
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
}

interface UploadProgressToastProps {
  uploadState: UploadState;
  onCancel: () => void;
}

const ProgressBar = ({ value, className }: { value: number; className?: string }) => {
  return (
    <div className={`bg-GRAY_200 h-1.5 w-full overflow-hidden rounded-full ${className || ''}`}>
      <div
        className='bg-BLUE_500 h-full rounded-full transition-all duration-300 ease-out'
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

const SingleFileProgress = ({ progress, onCancel }: { progress: UploadProgress; onCancel: () => void }) => {
  const isComplete = progress.status === UPLOAD_STATUS.COMPLETED;

  return (
    <div className='flex w-full flex-col gap-y-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {isComplete ? (
            <CheckCircle2 className='text-GREEN_300 size-4' />
          ) : (
            <Loader2 className='text-BLUE_500 size-4 animate-spin' />
          )}
          <span className='f-13-500 text-GRAY_1000 max-w-[200px] truncate'>{progress.fileName}</span>
        </div>
        {!isComplete && (
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
      <div className='flex items-center gap-2'>
        <ProgressBar value={progress.percentage} className='flex-1' />
        <span className='f-12-400 text-GRAY_600 min-w-[40px] text-right'>{progress.percentage}%</span>
      </div>
      <div className='f-11-400 text-GRAY_500'>
        {formatFileSize(progress.loaded)} / {formatFileSize(progress.total)}
      </div>
    </div>
  );
};

const UploadToastContent = ({ uploadState, onCancel }: UploadProgressToastProps) => {
  return (
    <div className='flex w-full flex-col gap-y-3'>
      <div className='flex items-center gap-2'>
        <div className='bg-BLUE_100 flex size-8 items-center justify-center rounded-full'>
          <Upload className='text-BLUE_600 size-4' />
        </div>
        <span className='f-14-600 text-GRAY_1000'>Uploading file</span>
      </div>
      {uploadState.currentUpload && <SingleFileProgress progress={uploadState.currentUpload} onCancel={onCancel} />}
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
    const hasProgressToShow = uploadState.currentUpload !== null;

    if (!uploadState.isUploading || !hasProgressToShow) {
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
