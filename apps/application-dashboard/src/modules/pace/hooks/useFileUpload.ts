'use client';

import { useCallback, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import {
  FilesystemApi,
  useCancelUploadMutation,
  useCompleteUploadMutation,
  useCreateItemMutation,
  useDirectUploadMutation,
  useInitChunkedUploadMutation,
  useUploadChunkMutation,
} from '@/apis/filesystem';
import { APITags } from '@/constants/api.constants';
import { useAppDispatch } from '@/hooks/toolkit';
import { type FolderUploadProgress, UPLOAD_STATUS, UPLOAD_TYPE } from '@/modules/pace/components/files/file-tree.types';
import {
  calculateTotalBytes,
  extractFilesWithPaths,
  extractUniqueDirectories,
  getFileTargetPath,
  getRootFolderName,
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
  folderUpload: FolderUploadProgress | null;
}

interface UseFileUploadReturn {
  uploadState: UploadState;
  uploadFile: (file: File, targetPath: string) => Promise<void>;
  uploadFiles: (files: FileList | File[], basePath: string) => Promise<void>;
  uploadFolder: (files: FileList, basePath: string) => Promise<void>;
  cancelUpload: () => void;
  isUploading: boolean;
}

export const useFileUpload = (options?: UseFileUploadOptions): UseFileUploadReturn => {
  const dispatch = useAppDispatch();
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    currentUpload: null,
    error: null,
    folderUpload: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentUploadIdRef = useRef<string | null>(null);

  const [directUpload] = useDirectUploadMutation();
  const [initChunkedUpload] = useInitChunkedUploadMutation();
  const [uploadChunk] = useUploadChunkMutation();
  const [completeUpload] = useCompleteUploadMutation();
  const [cancelUploadMutation] = useCancelUploadMutation();
  const [createItem] = useCreateItemMutation();

  const invalidateFilesList = useCallback(() => {
    dispatch(FilesystemApi.util.invalidateTags([APITags.GET_FILES_LIST]));
  }, [dispatch]);

  const mutations: UploadMutations = {
    directUpload: async (args) => {
      // Pass skipInvalidation to control cache invalidation
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
      // Pass skipInvalidation to control cache invalidation for chunked uploads
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
        folderUpload: null,
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
            folderUpload: null,
          });
          toast.success(`${file.name} uploaded successfully`);
          options?.onUploadComplete?.(path);
        },
        onError: (error) => {
          setUploadState({
            isUploading: false,
            currentUpload: null,
            error: error.message,
            folderUpload: null,
          });
          options?.onUploadError?.(error, file.name);
          captureException(error);
        },
        onCancel: () => {
          setUploadState({
            isUploading: false,
            currentUpload: null,
            error: null,
            folderUpload: null,
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

  const uploadFolder = useCallback(
    async (files: FileList, basePath: string) => {
      const filesWithPaths = extractFilesWithPaths(files);

      if (filesWithPaths.length === 0) {
        toast.error('No files found in folder');

        return;
      }

      abortControllerRef.current = new AbortController();

      const folderName = getRootFolderName(filesWithPaths);
      const totalBytes = calculateTotalBytes(filesWithPaths);
      const totalFiles = filesWithPaths.length;

      setUploadState({
        isUploading: true,
        currentUpload: null,
        error: null,
        folderUpload: {
          folderName,
          totalFiles,
          completedFiles: 0,
          currentFile: null,
          totalBytes,
          uploadedBytes: 0,
        },
      });

      try {
        const directories = extractUniqueDirectories(filesWithPaths, basePath);

        for (const dirPath of directories) {
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Upload cancelled');
          }

          await createItem({ path: dirPath, type: 'directory' }).unwrap();
        }

        let completedFiles = 0;
        let uploadedBytes = 0;

        for (const { file, relativePath } of filesWithPaths) {
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Upload cancelled');
          }

          const targetPath = getFileTargetPath(basePath, relativePath);
          const isChunkedUpload = shouldUseChunkedUpload(file.size);
          const uploadType = isChunkedUpload ? UPLOAD_TYPE.CHUNKED : UPLOAD_TYPE.DIRECT;

          setUploadState((prev) => ({
            ...prev,
            currentUpload: {
              fileName: file.name,
              filePath: targetPath,
              loaded: 0,
              total: file.size,
              percentage: 0,
              status: UPLOAD_STATUS.UPLOADING,
              uploadType,
            },
            folderUpload: prev.folderUpload
              ? {
                  ...prev.folderUpload,
                  currentFile: {
                    fileName: file.name,
                    filePath: targetPath,
                    loaded: 0,
                    total: file.size,
                    percentage: 0,
                    status: UPLOAD_STATUS.UPLOADING,
                    uploadType,
                  },
                }
              : null,
          }));

          const fileUploadedBytes = uploadedBytes;

          const callbacks: UploadCallbacks = {
            onProgress: (loaded, total) => {
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
                folderUpload: prev.folderUpload
                  ? {
                      ...prev.folderUpload,
                      uploadedBytes: fileUploadedBytes + loaded,
                      currentFile: prev.folderUpload.currentFile
                        ? {
                            ...prev.folderUpload.currentFile,
                            loaded,
                            total,
                            percentage: Math.round((loaded / total) * 100),
                          }
                        : null,
                    }
                  : null,
              }));
            },
          };

          // Skip cache invalidation for each file - we'll invalidate once at the end
          await uploadFileUtil(file, targetPath, mutations, callbacks, abortControllerRef.current.signal, true);

          uploadedBytes += file.size;
          completedFiles += 1;

          setUploadState((prev) => ({
            ...prev,
            currentUpload: null,
            folderUpload: prev.folderUpload
              ? {
                  ...prev.folderUpload,
                  completedFiles,
                  uploadedBytes,
                  currentFile: null,
                }
              : null,
          }));

          options?.onUploadComplete?.(targetPath);
        }

        // Invalidate files list cache once after all files are uploaded
        invalidateFilesList();

        setUploadState({
          isUploading: false,
          currentUpload: null,
          error: null,
          folderUpload: null,
        });

        toast.success(`${folderName} uploaded successfully (${totalFiles} files)`);
      } catch (error) {
        if (error instanceof Error && error.message === 'Upload cancelled') {
          setUploadState({
            isUploading: false,
            currentUpload: null,
            error: null,
            folderUpload: null,
          });
          toast.info(`Upload of ${folderName} cancelled`);
        } else {
          setUploadState({
            isUploading: false,
            currentUpload: null,
            error: error instanceof Error ? error.message : 'Folder upload failed',
            folderUpload: null,
          });
          captureException(error);
          toast.error(`Failed to upload folder ${folderName}`);
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [mutations, createItem, options, invalidateFilesList],
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
    uploadFolder,
    cancelUpload,
    isUploading: uploadState.isUploading,
  };
};
