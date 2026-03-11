'use client';

import { useCallback, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import {
  FilesystemApi,
  useCancelUploadMutation,
  useCompleteUploadMutation,
  useDeleteFileMutation,
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
  type UploadProgress,
} from '@/modules/pace/components/files/file-tree.types';
import {
  calculateTotalBytes,
  extractFilesWithPaths,
  getRootFolderName,
  getTargetPath,
  processInParallel,
  sanitizeFileName,
  shouldUseChunkedUpload,
  type UploadCallbacks,
  uploadFile as uploadFileUtil,
  type UploadMutations,
} from '@/modules/pace/components/files/file-upload.utils';
import {
  MAX_FOLDER_UPLOAD_FILES,
  PARALLEL_FILE_UPLOAD_CONCURRENCY,
} from '@/modules/pace/components/files/files.constants';
import { defaultFnType } from '@/types/commonTypes';

interface MultiFileUploadProgress {
  totalFiles: number;
  completedFiles: number;
  totalBytes: number;
  uploadedBytes: number;
}

interface UploadState {
  isUploading: boolean;
  currentUpload: UploadProgress | null;
  activeUploads: Record<string, UploadProgress>;
  error: string | null;
  folderUpload: FolderUploadProgress | null;
  multiFileUpload: MultiFileUploadProgress | null;
  uploadingPath: string | null;
  uploadingItems: FileItem[];
  completedPaths: Set<string>;
}

interface UseFileUploadReturn {
  uploadState: UploadState;
  uploadFile: (file: File, targetPath: string) => Promise<void>;
  uploadFiles: (files: FileList | File[], basePath: string) => Promise<void>;
  uploadFolder: (files: FileList, basePath: string) => Promise<void>;
  cancelUpload: defaultFnType;
  clearUploadingItems: defaultFnType;
  isUploading: boolean;
}

const DEFAULT_UPLOAD_STATE: UploadState = {
  isUploading: false,
  currentUpload: null,
  activeUploads: {},
  error: null,
  folderUpload: null,
  multiFileUpload: null,
  uploadingPath: null,
  uploadingItems: [],
  completedPaths: new Set(),
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
  const [deleteFile] = useDeleteFileMutation();

  const invalidateFilesList = useCallback(() => {
    dispatch(FilesystemApi.util.invalidateTags([APITags.GET_FILES_LIST]));
  }, [dispatch]);

  const deleteFolderSilently = useCallback(
    async (folderPath: string) => {
      try {
        await deleteFile({ path: folderPath }).unwrap();
      } catch (error) {
        captureException(error);
      }
      invalidateFilesList();
    },
    [deleteFile, invalidateFilesList],
  );

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

      const sanitizedName = sanitizeFileName(file.name);

      const uploadingItem: FileItem = {
        path: targetPath,
        name: sanitizedName,
        type: FILE_TYPE.FILE,
        size: file.size,
        mtime_ms: Date.now(),
        owner: '',
      };

      const uploadInfo: UploadProgress = {
        fileName: sanitizedName,
        filePath: targetPath,
        loaded: 0,
        total: file.size,
        percentage: 0,
        status: UPLOAD_STATUS.UPLOADING,
        uploadType,
      };

      setUploadState({
        isUploading: true,
        currentUpload: isChunkedUpload ? uploadInfo : null,
        activeUploads: { [targetPath]: uploadInfo },
        error: null,
        folderUpload: null,
        multiFileUpload: null,
        uploadingPath: targetPath,
        uploadingItems: [uploadingItem],
        completedPaths: new Set(),
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
            uploadingItems: prev.uploadingItems,
          }));
          toast.success(`${sanitizedName} uploaded successfully`);
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
          toast.error(`Failed to upload ${sanitizedName}`);
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

      if (fileArray.length === 1) {
        const targetPath = getTargetPath(basePath, fileArray[0].name);

        await uploadFile(fileArray[0], targetPath);

        return;
      }

      abortControllerRef.current = new AbortController();

      const uploadingItems: FileItem[] = fileArray.map((file) => ({
        path: getTargetPath(basePath, file.name),
        name: sanitizeFileName(file.name),
        type: FILE_TYPE.FILE,
        size: file.size,
        mtime_ms: Date.now(),
        owner: '',
      }));

      const totalBytes = fileArray.reduce((sum, file) => sum + file.size, 0);

      setUploadState({
        isUploading: true,
        currentUpload: null,
        activeUploads: {},
        error: null,
        folderUpload: null,
        multiFileUpload: {
          totalFiles: fileArray.length,
          completedFiles: 0,
          totalBytes,
          uploadedBytes: 0,
        },
        uploadingPath: basePath,
        uploadingItems,
        completedPaths: new Set(),
      });

      const failedFiles: string[] = [];

      try {
        const result = await processInParallel(
          fileArray,
          PARALLEL_FILE_UPLOAD_CONCURRENCY,
          async (file: File) => {
            const targetPath = getTargetPath(basePath, file.name);
            const sanitizedName = sanitizeFileName(file.name);
            const isChunkedUpload = shouldUseChunkedUpload(file.size);
            const uploadType = isChunkedUpload ? UPLOAD_TYPE.CHUNKED : UPLOAD_TYPE.DIRECT;

            const fileInfo: UploadProgress = {
              fileName: sanitizedName,
              filePath: targetPath,
              loaded: 0,
              total: file.size,
              percentage: 0,
              status: UPLOAD_STATUS.UPLOADING,
              uploadType,
            };

            setUploadState((prev) => {
              const newActiveUploads = { ...prev.activeUploads, [targetPath]: fileInfo };

              return {
                ...prev,
                activeUploads: newActiveUploads,
                currentUpload: Object.values(newActiveUploads)[0] ?? null,
              };
            });

            const callbacks: UploadCallbacks = {
              onProgress: (loaded, total) => {
                const percentage = Math.round((loaded / total) * 100);

                setUploadState((prev) => {
                  const existing = prev.activeUploads[targetPath];

                  if (!existing) return prev;

                  const updated = { ...existing, loaded, total, percentage };
                  const newActiveUploads = { ...prev.activeUploads, [targetPath]: updated };

                  const activeLoadedBytes = Object.values(newActiveUploads).reduce((sum, u) => sum + u.loaded, 0);

                  const completedFileBytes = Array.from(prev.completedPaths).reduce((sum, path) => {
                    const completedFile = fileArray.find((f) => getTargetPath(basePath, f.name) === path);

                    return sum + (completedFile?.size ?? 0);
                  }, 0);

                  return {
                    ...prev,
                    activeUploads: newActiveUploads,
                    currentUpload: Object.values(newActiveUploads)[0] ?? null,
                    multiFileUpload: prev.multiFileUpload
                      ? {
                          ...prev.multiFileUpload,
                          uploadedBytes: completedFileBytes + activeLoadedBytes,
                        }
                      : null,
                  };
                });
              },
            };

            const signal = abortControllerRef.current?.signal;

            if (!signal || signal.aborted) {
              throw new Error('Upload cancelled');
            }

            try {
              await uploadFileUtil(file, targetPath, mutations, callbacks, signal, true);
            } catch (fileError) {
              const isCancelled = fileError instanceof Error && fileError.message === 'Upload cancelled';

              if (!isCancelled) {
                captureException(fileError);
                failedFiles.push(sanitizedName);
              }

              setUploadState((prev) => {
                const { [targetPath]: _, ...remainingUploads } = prev.activeUploads;
                const failedFileBytes = file.size;

                return {
                  ...prev,
                  activeUploads: remainingUploads,
                  currentUpload: Object.values(remainingUploads)[0] ?? null,
                  uploadingItems: prev.uploadingItems.filter((item) => item.path !== targetPath),
                  multiFileUpload: prev.multiFileUpload
                    ? {
                        ...prev.multiFileUpload,
                        totalFiles: prev.multiFileUpload.totalFiles - 1,
                        totalBytes: prev.multiFileUpload.totalBytes - failedFileBytes,
                      }
                    : null,
                };
              });

              throw fileError;
            }

            setUploadState((prev) => {
              const { [targetPath]: _, ...remainingUploads } = prev.activeUploads;
              const newCompleted = new Set(prev.completedPaths);

              newCompleted.add(targetPath);

              const completedFileBytes = Array.from(newCompleted).reduce((sum, path) => {
                const completedFile = fileArray.find((f) => getTargetPath(basePath, f.name) === path);

                return sum + (completedFile?.size ?? 0);
              }, 0);

              const activeLoadedBytes = Object.values(remainingUploads).reduce((sum, u) => sum + u.loaded, 0);

              return {
                ...prev,
                activeUploads: remainingUploads,
                currentUpload: Object.values(remainingUploads)[0] ?? null,
                completedPaths: newCompleted,
                multiFileUpload: prev.multiFileUpload
                  ? {
                      ...prev.multiFileUpload,
                      completedFiles: prev.multiFileUpload.completedFiles + 1,
                      uploadedBytes: completedFileBytes + activeLoadedBytes,
                    }
                  : null,
              };
            });
          },
          abortControllerRef.current.signal,
          { continueOnError: true },
        );

        invalidateFilesList();

        const keepSuccessful = result.wasCancelled || result.totalFailed > 0;

        setUploadState((prev) => ({
          ...DEFAULT_UPLOAD_STATE,
          uploadingItems: keepSuccessful
            ? prev.uploadingItems.filter((item) => prev.completedPaths.has(item.path))
            : prev.uploadingItems,
        }));

        if (result.wasCancelled) {
          if (result.totalProcessed > 0) {
            toast.success(
              `${result.totalProcessed} file${result.totalProcessed > 1 ? 's' : ''} uploaded before cancellation`,
            );
          }
          toast.info('Upload cancelled');
        } else {
          if (result.totalFailed > 0) {
            toast.error(`Failed to upload: ${failedFiles.join(', ')}`);
          }

          if (result.totalProcessed > 0) {
            toast.success(
              `${result.totalProcessed} of ${fileArray.length} file${fileArray.length > 1 ? 's' : ''} uploaded successfully`,
            );
          }
        }
      } catch {
        invalidateFilesList();
        setUploadState((prev) => ({
          ...DEFAULT_UPLOAD_STATE,
          uploadingItems: prev.uploadingItems.filter((item) => prev.completedPaths.has(item.path)),
        }));
      } finally {
        abortControllerRef.current = null;
      }
    },
    [uploadFile, mutations, invalidateFilesList],
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
        activeUploads: {},
        error: null,
        folderUpload: {
          folderName,
          totalFiles,
          completedFiles: 0,
          currentFile: null,
          activeFiles: {},
          totalBytes,
          uploadedBytes: 0,
        },
        multiFileUpload: null,
        uploadingPath: rootFolderPath,
        uploadingItems: [uploadingItem],
        completedPaths: new Set(),
      });

      try {
        await processInParallel(
          filesWithPaths,
          PARALLEL_FILE_UPLOAD_CONCURRENCY,
          async ({ file, relativePath }) => {
            const targetPath = getTargetPath(basePath, relativePath);
            const sanitizedName = sanitizeFileName(file.name);
            const isChunkedUpload = shouldUseChunkedUpload(file.size);
            const uploadType = isChunkedUpload ? UPLOAD_TYPE.CHUNKED : UPLOAD_TYPE.DIRECT;

            const currentFileInfo: UploadProgress = {
              fileName: sanitizedName,
              filePath: targetPath,
              loaded: 0,
              total: file.size,
              percentage: 0,
              status: UPLOAD_STATUS.UPLOADING,
              uploadType,
            };

            setUploadState((prev) => {
              const newActiveFiles = {
                ...(prev.folderUpload?.activeFiles ?? {}),
                [targetPath]: currentFileInfo,
              };
              const activeValues = Object.values(newActiveFiles);

              return {
                ...prev,
                currentUpload: activeValues[0] ?? null,
                activeUploads: { ...prev.activeUploads, [targetPath]: currentFileInfo },
                folderUpload: prev.folderUpload
                  ? {
                      ...prev.folderUpload,
                      currentFile: activeValues[0] ?? null,
                      activeFiles: newActiveFiles,
                    }
                  : null,
              };
            });

            const callbacks: UploadCallbacks = {
              onProgress: (loaded, total) => {
                const percentage = Math.round((loaded / total) * 100);
                const progressUpdate = { loaded, total, percentage };

                setUploadState((prev) => {
                  const existingFile = prev.folderUpload?.activeFiles[targetPath];

                  if (!existingFile) return prev;

                  const updatedFileInfo = { ...existingFile, ...progressUpdate };
                  const newActiveFiles = {
                    ...(prev.folderUpload?.activeFiles ?? {}),
                    [targetPath]: updatedFileInfo,
                  };

                  const totalActiveLoaded = Object.values(newActiveFiles).reduce((sum, f) => sum + f.loaded, 0);
                  const completedBytes = prev.folderUpload?.uploadedBytes ?? 0;
                  const adjustedCompletedBytes =
                    completedBytes -
                    Object.values(prev.folderUpload?.activeFiles ?? {}).reduce((sum, f) => sum + f.loaded, 0);

                  return {
                    ...prev,
                    currentUpload: Object.values(newActiveFiles)[0] ?? null,
                    activeUploads: { ...prev.activeUploads, [targetPath]: updatedFileInfo },
                    folderUpload: prev.folderUpload
                      ? {
                          ...prev.folderUpload,
                          activeFiles: newActiveFiles,
                          currentFile: Object.values(newActiveFiles)[0] ?? null,
                          uploadedBytes: adjustedCompletedBytes + totalActiveLoaded,
                        }
                      : null,
                  };
                });
              },
            };

            const signal = abortControllerRef.current?.signal;

            if (!signal || signal.aborted) {
              throw new Error('Upload cancelled');
            }

            try {
              await uploadFileUtil(file, targetPath, mutations, callbacks, signal, true);
            } catch (fileError) {
              if (!(fileError instanceof Error && fileError.message === 'Upload cancelled')) {
                captureException(fileError);
              }
              throw fileError;
            }

            setUploadState((prev) => {
              const { [targetPath]: _, ...remainingActiveFiles } = prev.folderUpload?.activeFiles ?? {};
              const { [targetPath]: __, ...remainingUploads } = prev.activeUploads;
              const newCompletedFiles = (prev.folderUpload?.completedFiles ?? 0) + 1;
              const newUploadedBytes =
                (prev.folderUpload?.uploadedBytes ?? 0) +
                file.size -
                (prev.folderUpload?.activeFiles[targetPath]?.loaded ?? 0);

              return {
                ...prev,
                currentUpload: Object.values(remainingActiveFiles)[0] ?? null,
                activeUploads: remainingUploads,
                folderUpload: prev.folderUpload
                  ? {
                      ...prev.folderUpload,
                      completedFiles: newCompletedFiles,
                      uploadedBytes: newUploadedBytes,
                      activeFiles: remainingActiveFiles,
                      currentFile: Object.values(remainingActiveFiles)[0] ?? null,
                    }
                  : null,
              };
            });
          },
          abortControllerRef.current.signal,
        );

        invalidateFilesList();

        setUploadState((prev) => ({
          ...DEFAULT_UPLOAD_STATE,
          uploadingItems: prev.uploadingItems,
        }));

        toast.success(`${folderName} uploaded successfully (${totalFiles} files)`);
      } catch (error) {
        setUploadState(DEFAULT_UPLOAD_STATE);

        if (error instanceof Error && error.message === 'Upload cancelled') {
          toast.info(`Upload of ${folderName} cancelled`);
        } else {
          captureException(error);
          toast.error(`Failed to upload folder ${folderName}. Partially uploaded files have been cleaned up.`);
        }

        deleteFolderSilently(rootFolderPath);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [mutations, invalidateFilesList, deleteFolderSilently],
  );

  const cancelUpload = useCallback(() => {
    setUploadState((prev) => ({
      ...prev,
      isUploading: false,
      currentUpload: null,
      folderUpload: null,
      multiFileUpload: null,
      activeUploads: {},
    }));

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearUploadingItems = useCallback(() => {
    setUploadState((prev) => ({
      ...prev,
      uploadingItems: [],
    }));
  }, []);

  return {
    uploadState,
    uploadFile,
    uploadFiles,
    uploadFolder,
    cancelUpload,
    clearUploadingItems,
    isUploading: uploadState.isUploading,
  };
};
