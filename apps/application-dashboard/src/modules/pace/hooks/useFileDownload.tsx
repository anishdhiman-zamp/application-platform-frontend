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
  activeDownloads: number;
}

interface DownloadWithProgressOptions {
  path: string;
  onProgress: (info: ProgressInfo) => void;
  onAbort: (abortFn: () => void) => void;
}

interface ActiveDownload {
  toastId: string | number;
  abort: () => void;
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

let downloadCounter = 0;
const generateDownloadId = (): string => `${Date.now()}-${++downloadCounter}`;

export const useFileDownload = (): UseFileDownloadReturn => {
  const activeDownloadsRef = useRef<Map<string, ActiveDownload>>(new Map());

  const showProgressToast = useCallback((downloadId: string, progress: DownloadProgress, onCancel: () => void) => {
    const content = <DownloadProgressToastContent progress={progress} onCancel={onCancel} />;
    const options = { duration: Infinity, closeButton: false };

    const existing = activeDownloadsRef.current.get(downloadId);

    if (existing) {
      toast(content, { ...options, id: existing.toastId });
    } else {
      const toastId = toast(content, options);

      activeDownloadsRef.current.set(downloadId, {
        toastId,
        abort: () => {},
      });
    }
  }, []);

  const dismissToast = useCallback((downloadId: string) => {
    const download = activeDownloadsRef.current.get(downloadId);

    if (download) {
      toast.dismiss(download.toastId);
      activeDownloadsRef.current.delete(downloadId);
    }
  }, []);

  const downloadFile = useCallback(
    async ({ path, fileName }: DownloadOptions) => {
      const downloadId = generateDownloadId();

      const handleCancel = () => {
        const download = activeDownloadsRef.current.get(downloadId);

        download?.abort();
        dismissToast(downloadId);
      };

      showProgressToast(
        downloadId,
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
              downloadId,
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
            const download = activeDownloadsRef.current.get(downloadId);

            if (download) {
              download.abort = abortFn;
            }
          },
        });

        dismissToast(downloadId);
        triggerBrowserDownload(blob, fileName);
        toast.success(`${fileName} downloaded successfully`);
      } catch (error) {
        captureException(error);
        dismissToast(downloadId);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage !== 'Download was cancelled') {
          toast.error(`Failed to download ${fileName}: ${errorMessage}`);
        }
      }
    },
    [dismissToast, showProgressToast],
  );

  return {
    downloadFile,
    activeDownloads: activeDownloadsRef.current.size,
  };
};
