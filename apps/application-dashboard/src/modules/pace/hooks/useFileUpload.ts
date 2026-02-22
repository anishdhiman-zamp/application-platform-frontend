'use client';

import { useCallback, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import {
  useCancelUploadMutation,
  useCompleteUploadMutation,
  useDirectUploadMutation,
  useInitChunkedUploadMutation,
  useUploadChunkMutation,
} from '@/apis/filesystem';
import { UPLOAD_STATUS, UPLOAD_TYPE } from '@/modules/pace/components/files/file-tree.types';
import {
  getTargetPath,
  shouldUseChunkedUpload,
  type UploadCallbacks,
  uploadFile as uploadFileUtil,
  type UploadMutations,
} from '@/modules/pace/components/files/file-upload.utils';

interface UseFileUploadOptions {
  onUploadComplete?: (path: string) => void;
  onUploadError?: (error: Error, fileName: string) => void;
}

interface UploadState {
  isUploading: boolean;
  currentUpload: {
    fileName: string;
    filePath: string;
    loaded: number;
    total: number;
    percentage: number;
    status: string;
    uploadType: string;
  } | null;
  error: string | null;
}

interface UseFileUploadReturn {
  uploadState: UploadState;
  uploadFile: (file: File, targetPath: string) => Promise<void>;
  uploadFiles: (files: FileList | File[], basePath: string) => Promise<void>;
  cancelUpload: () => void;
  isUploading: boolean;
}

export const useFileUpload = (options?: UseFileUploadOptions): UseFileUploadReturn => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    currentUpload: null,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentUploadIdRef = useRef<string | null>(null);

  const [directUpload] = useDirectUploadMutation();
  const [initChunkedUpload] = useInitChunkedUploadMutation();
  const [uploadChunk] = useUploadChunkMutation();
  const [completeUpload] = useCompleteUploadMutation();
  const [cancelUploadMutation] = useCancelUploadMutation();

  const mutations: UploadMutations = {
    directUpload: async (args) => {
      const result = await directUpload(args).unwrap();

      return { data: result };
    },
    initChunkedUpload: async (args) => {
      const result = await initChunkedUpload(args).unwrap();

      currentUploadIdRef.current = result.upload_id;

      return { data: result };
    },
    uploadChunk: async (args) => {
      const result = await uploadChunk(args).unwrap();

      return { data: result };
    },
    completeUpload: async (args) => {
      const result = await completeUpload(args).unwrap();

      currentUploadIdRef.current = null;

      return { data: result };
    },
    cancelUpload: async (args) => {
      const result = await cancelUploadMutation(args).unwrap();

      currentUploadIdRef.current = null;

      return result;
    },
  };

  const uploadFile = useCallback(
    async (file: File, targetPath: string) => {
      abortControllerRef.current = new AbortController();

      const isChunkedUpload = shouldUseChunkedUpload(file.size);
      const uploadType = isChunkedUpload ? UPLOAD_TYPE.CHUNKED : UPLOAD_TYPE.DIRECT;

      setUploadState({
        isUploading: true,
        currentUpload: isChunkedUpload
          ? {
              fileName: file.name,
              filePath: targetPath,
              loaded: 0,
              total: file.size,
              percentage: 0,
              status: UPLOAD_STATUS.UPLOADING,
              uploadType,
            }
          : null,
        error: null,
      });

      const callbacks: UploadCallbacks = {
        onProgress: isChunkedUpload
          ? (loaded, total) => {
              setUploadState((prev) => ({
                ...prev,
                currentUpload: prev.currentUpload
                  ? {
                      ...prev.currentUpload,
                      loaded,
                      total,
                      percentage: Math.round((loaded / total) * 100),
                    }
                  : null,
              }));
            }
          : undefined,
        onComplete: (path) => {
          setUploadState({
            isUploading: false,
            currentUpload: null,
            error: null,
          });
          toast.success(`${file.name} uploaded successfully`);
          options?.onUploadComplete?.(path);
        },
        onError: (error) => {
          setUploadState({
            isUploading: false,
            currentUpload: null,
            error: error.message,
          });
          options?.onUploadError?.(error, file.name);
          captureException(error);
        },
        onCancel: () => {
          setUploadState({
            isUploading: false,
            currentUpload: null,
            error: null,
          });
        },
      };

      try {
        await uploadFileUtil(file, targetPath, mutations, callbacks, abortControllerRef.current.signal);
      } catch (error) {
        if (!(error instanceof Error && error.message === 'Upload cancelled')) {
          captureException(error);
          toast.error(`Failed to upload ${file.name}`);
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [mutations, options],
  );

  const uploadFiles = useCallback(
    async (files: FileList | File[], basePath: string) => {
      const fileArray = Array.from(files);

      if (fileArray.length === 0) {
        toast.error('No files selected');

        return;
      }

      // Upload files sequentially
      for (const file of fileArray) {
        const targetPath = getTargetPath(basePath, file.name);

        await uploadFile(file, targetPath);
      }
    },
    [uploadFile],
  );

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (currentUploadIdRef.current) {
      cancelUploadMutation({ upload_id: currentUploadIdRef.current }).catch(() => {
        // Ignore cancel errors
      });
    }
  }, [cancelUploadMutation]);

  return {
    uploadState,
    uploadFile,
    uploadFiles,
    cancelUpload,
    isUploading: uploadState.isUploading,
  };
};
