import { useCallback, useRef } from 'react';
import { captureException } from '@sentry/nextjs';
import { API_DOMAIN } from '@zamp-platform/api';
import { toast } from '@zamp-platform/ui';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';
import DownloadProgressToastContent, {
  type DownloadProgress,
} from '@/modules/pace/components/progress-toast/DownloadProgressToastContent';

interface DownloadOptions {
  path: string;
  fileName: string;
}

interface ProgressInfo {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseFileDownloadReturn {
  downloadFile: (options: DownloadOptions) => Promise<void>;
  isDownloading: boolean;
}

interface DownloadWithProgressOptions {
  path: string;
  onProgress: (info: ProgressInfo) => void;
  onAbort: (abortFn: () => void) => void;
}

/**
 * Downloads a file using XMLHttpRequest with progress tracking.
 */
const downloadWithProgress = ({ path, onProgress, onAbort }: DownloadWithProgressOptions): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    onAbort(() => xhr.abort());

    const orgId = getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID);

    xhr.open('POST', `${API_DOMAIN}/files/download`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID, orgId);
    xhr.withCredentials = true;
    xhr.responseType = 'blob';

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject(new Error(`Download failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during download'));
    xhr.onabort = () => reject(new Error('Download was cancelled'));

    xhr.send(JSON.stringify({ paths: [path] }));
  });
};

/**
 * Triggers browser download from a Blob
 */
const triggerBrowserDownload = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Shows the download progress toast with the styled component
 */
const showProgressToast = (
  toastIdRef: React.MutableRefObject<string | number | null>,
  progress: DownloadProgress,
  onCancel?: () => void,
) => {
  const content = <DownloadProgressToastContent progress={progress} onCancel={onCancel} />;
  const options = { duration: Infinity, closeButton: false };

  if (toastIdRef.current) {
    toast(content, { ...options, id: toastIdRef.current });
  } else {
    toastIdRef.current = toast(content, options);
  }
};

export const useFileDownload = (): UseFileDownloadReturn => {
  const isDownloadingRef = useRef(false);
  const toastIdRef = useRef<string | number | null>(null);
  const abortRef = useRef<(() => void) | null>(null);

  const dismissToast = useCallback(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    abortRef.current?.();
    dismissToast();
  }, [dismissToast]);

  const downloadFile = useCallback(
    async ({ path, fileName }: DownloadOptions) => {
      if (isDownloadingRef.current) {
        return;
      }

      isDownloadingRef.current = true;

      // Show initializing toast immediately
      showProgressToast(
        toastIdRef,
        {
          fileName,
          loaded: 0,
          total: 0,
          percentage: 0,
          isInitializing: true,
        },
        handleCancel,
      );

      try {
        const blob = await downloadWithProgress({
          path,
          onProgress: (info) => {
            showProgressToast(
              toastIdRef,
              {
                fileName,
                loaded: info.loaded,
                total: info.total,
                percentage: info.percentage,
              },
              handleCancel,
            );
          },
          onAbort: (abortFn) => {
            abortRef.current = abortFn;
          },
        });

        dismissToast();
        triggerBrowserDownload(blob, fileName);
        toast.success(`${fileName} downloaded successfully`);
      } catch (error) {
        captureException(error);
        dismissToast();
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage !== 'Download was cancelled') {
          toast.error(`Failed to download ${fileName}: ${errorMessage}`);
        }
      } finally {
        isDownloadingRef.current = false;
        abortRef.current = null;
      }
    },
    [dismissToast, handleCancel],
  );

  return {
    downloadFile,
    isDownloading: isDownloadingRef.current,
  };
};
