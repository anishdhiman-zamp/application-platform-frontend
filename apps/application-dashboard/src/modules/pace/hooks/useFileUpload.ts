'use client';

import { useCallback, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import {
  FilesystemApi,
  useCancelUploadMutation,
  useCompleteUploadMutation,
  useDirectUploadMutation,
  useInitChunkedUploadMutation,
  useUploadChunkMutation,
} from '@/apis/filesystem';
import { APITags } from '@/constants/api.constants';
import { useAppDispatch } from '@/hooks/toolkit';
import {
  FILE_TYPE,
  type FileItem,
  type FolderUploadProgress,
  UPLOAD_STATUS,
  UPLOAD_TYPE,
} from '@/modules/pace/components/files/file-tree.types';
import {
  calculateTotalBytes,
  extractFilesWithPaths,
  getRootFolderName,
  getTargetPath,
  shouldUseChunkedUpload,
  type UploadCallbacks,
  uploadFile as uploadFileUtil,
  type UploadMutations,
} from '@/modules/pace/components/files/file-upload.utils';
import { MAX_FOLDER_UPLOAD_FILES } from '@/modules/pace/components/files/files.constants';

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
  uploadingPath: string | null;
  uploadingItem: FileItem | null;
}

interface UseFileUploadReturn {
  uploadState: UploadState;
  uploadFile: (file: File, targetPath: string) => Promise<void>;
  uploadFiles: (files: FileList | File[], basePath: string) => Promise<void>;
  uploadFolder: (files: FileList, basePath: string) => Promise<void>;
  cancelUpload: () => void;
  clearUploadingItem: () => void;
  isUploading: boolean;
}

const DEFAULT_UPLOAD_STATE: UploadState = {
  isUploading: false,
  currentUpload: null,
  error: null,
  folderUpload: null,
  uploadingPath: null,
  uploadingItem: null,
};

export const useFileUpload = (): UseFileUploadReturn => {
  const dispatch = useAppDispatch();
  const [uploadState, setUploadState] = useState<UploadState>(DEFAULT_UPLOAD_STATE);

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentUploadIdRef = useRef<string | null>(null);

  const [directUpload] = useDirectUploadMutation();
  const [initChunkedUpload] = useInitChunkedUploadMutation();
  const [uploadChunk] = useUploadChunkMutation();
  const [completeUpload] = useCompleteUploadMutation();
  const [cancelUploadMutation] = useCancelUploadMutation();

  const invalidateFilesList = useCallback(() => {
    dispatch(FilesystemApi.util.invalidateTags([APITags.GET_FILES_LIST]));
  }, [dispatch]);

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
      const result = await uploadChunk({
        upload_id: args.upload_id,
        chunk_index: args.chunk_index,
        chunk_offset: args.chunk_offset,
        data: args.data,
        signal: args.signal,
      }).unwrap();

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

      const uploadingItem: FileItem | null = isChunkedUpload
        ? {
            path: targetPath,
            name: file.name,
            type: FILE_TYPE.FILE,
            size: file.size,
            mtime_ms: Date.now(),
            owner: '',
          }
        : null;

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
        uploadingPath: isChunkedUpload ? targetPath : null,
        uploadingItem,
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
        onComplete: () => {
          setUploadState((prev) => ({
            ...DEFAULT_UPLOAD_STATE,
            uploadingItem: prev.uploadingItem,
          }));
          toast.success(`${file.name} uploaded successfully`);
        },
        onError: (error) => {
          setUploadState({
            ...DEFAULT_UPLOAD_STATE,
            error: error.message,
          });
          captureException(error);
        },
        onCancel: () => {
          setUploadState(DEFAULT_UPLOAD_STATE);
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
    [mutations],
  );

  const uploadFiles = useCallback(
    async (files: FileList | File[], basePath: string) => {
      const fileArray = Array.from(files);

      if (fileArray.length === 0) {
        toast.error('No files selected');

        return;
      }

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

      if (filesWithPaths.length > MAX_FOLDER_UPLOAD_FILES) {
        toast.error(
          `Folder contains ${filesWithPaths.length} files. Maximum allowed is ${MAX_FOLDER_UPLOAD_FILES} files.`,
        );

        return;
      }

      abortControllerRef.current = new AbortController();

      const folderName = getRootFolderName(filesWithPaths);
      const totalBytes = calculateTotalBytes(filesWithPaths);
      const totalFiles = filesWithPaths.length;
      const rootFolderPath = `${basePath}/${folderName}`;

      const uploadingItem: FileItem = {
        path: rootFolderPath,
        name: folderName,
        type: FILE_TYPE.DIRECTORY,
        size: null,
        mtime_ms: Date.now(),
        owner: '',
      };

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
        uploadingPath: rootFolderPath,
        uploadingItem,
      });

      try {
        let completedFiles = 0;
        let uploadedBytes = 0;

        for (const { file, relativePath } of filesWithPaths) {
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Upload cancelled');
          }

          const targetPath = getTargetPath(basePath, relativePath);
          const isChunkedUpload = shouldUseChunkedUpload(file.size);
          const uploadType = isChunkedUpload ? UPLOAD_TYPE.CHUNKED : UPLOAD_TYPE.DIRECT;

          const currentFileInfo = {
            fileName: file.name,
            filePath: targetPath,
            loaded: 0,
            total: file.size,
            percentage: 0,
            status: UPLOAD_STATUS.UPLOADING,
            uploadType,
          };

          setUploadState((prev) => ({
            ...prev,
            currentUpload: currentFileInfo,
            folderUpload: prev.folderUpload ? { ...prev.folderUpload, currentFile: currentFileInfo } : null,
          }));

          const fileUploadedBytes = uploadedBytes;

          const callbacks: UploadCallbacks = {
            onProgress: (loaded, total) => {
              const percentage = Math.round((loaded / total) * 100);
              const progressUpdate = { loaded, total, percentage };

              setUploadState((prev) => ({
                ...prev,
                currentUpload: prev.currentUpload ? { ...prev.currentUpload, ...progressUpdate } : null,
                folderUpload: prev.folderUpload
                  ? {
                      ...prev.folderUpload,
                      uploadedBytes: fileUploadedBytes + loaded,
                      currentFile: prev.folderUpload.currentFile
                        ? { ...prev.folderUpload.currentFile, ...progressUpdate }
                        : null,
                    }
                  : null,
              }));
            },
          };

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
        }

        invalidateFilesList();

        setUploadState((prev) => ({
          ...DEFAULT_UPLOAD_STATE,
          uploadingItem: prev.uploadingItem,
        }));

        toast.success(`${folderName} uploaded successfully (${totalFiles} files)`);
      } catch (error) {
        if (error instanceof Error && error.message === 'Upload cancelled') {
          setUploadState(DEFAULT_UPLOAD_STATE);
          toast.info(`Upload of ${folderName} cancelled`);
        } else {
          setUploadState({
            ...DEFAULT_UPLOAD_STATE,
            error: error instanceof Error ? error.message : 'Folder upload failed',
          });
          captureException(error);
          toast.error(`Failed to upload folder ${folderName}`);
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [mutations, invalidateFilesList],
  );

  const cancelUpload = useCallback(() => {
    setUploadState(DEFAULT_UPLOAD_STATE);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearUploadingItem = useCallback(() => {
    setUploadState((prev) => ({
      ...prev,
      uploadingItem: null,
    }));
  }, []);

  return {
    uploadState,
    uploadFile,
    uploadFiles,
    uploadFolder,
    cancelUpload,
    clearUploadingItem,
    isUploading: uploadState.isUploading,
  };
};
