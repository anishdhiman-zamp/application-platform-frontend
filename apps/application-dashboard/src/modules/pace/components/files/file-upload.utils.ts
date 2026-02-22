'use client';

import type {
  CompleteUploadResponse,
  DirectUploadResponse,
  InitUploadResponse,
  UploadChunkResponse,
} from '@/types/api/filesystem.types';

export const DIRECT_UPLOAD_THRESHOLD_BYTES = 1 * 1024 * 1024; // 1MB
export const DEFAULT_CHUNK_SIZE = 1 * 1024 * 1024; // 1MB default chunk size
export const MAX_FOLDER_UPLOAD_FILES = 200;

export interface UploadCallbacks {
  onProgress?: (loaded: number, total: number) => void;
  onComplete?: (path: string, mtime_ms: number) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

export interface UploadMutations {
  directUpload: (args: {
    path: string;
    file: File;
    skipInvalidation?: boolean;
  }) => Promise<{ data: DirectUploadResponse }>;
  initChunkedUpload: (args: {
    path: string;
    file_name: string;
    total_bytes: number;
  }) => Promise<{ data: InitUploadResponse }>;
  uploadChunk: (args: {
    upload_id: string;
    chunk_index: number;
    chunk_offset: number;
    data: Blob;
  }) => Promise<{ data: UploadChunkResponse }>;
  completeUpload: (args: {
    upload_id: string;
    skipInvalidation?: boolean;
  }) => Promise<{ data: CompleteUploadResponse }>;
  cancelUpload: (args: { upload_id: string }) => Promise<unknown>;
}

export const shouldUseChunkedUpload = (fileSize: number): boolean => {
  return fileSize >= DIRECT_UPLOAD_THRESHOLD_BYTES;
};

export const getTargetPath = (basePath: string, fileName: string): string => {
  const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

  return `${normalizedBase}/${fileName}`;
};

export const uploadFileDirectly = async (
  file: File,
  targetPath: string,
  mutations: Pick<UploadMutations, 'directUpload'>,
  callbacks?: UploadCallbacks,
  skipInvalidation?: boolean,
): Promise<DirectUploadResponse> => {
  try {
    callbacks?.onProgress?.(0, file.size);

    const result = await mutations.directUpload({ path: targetPath, file, skipInvalidation });

    callbacks?.onProgress?.(file.size, file.size);
    callbacks?.onComplete?.(result.data.path, result.data.mtime_ms);

    return result.data;
  } catch (error) {
    callbacks?.onError?.(error instanceof Error ? error : new Error('Direct upload failed'));
    throw error;
  }
};

export const uploadFileChunked = async (
  file: File,
  targetPath: string,
  mutations: Omit<UploadMutations, 'directUpload'>,
  callbacks?: UploadCallbacks,
  abortSignal?: AbortSignal,
  skipInvalidation?: boolean,
): Promise<CompleteUploadResponse> => {
  let uploadId: string | null = null;

  try {
    callbacks?.onProgress?.(0, file.size);

    const initResult = await mutations.initChunkedUpload({
      path: targetPath.split('/').slice(0, -1).join('/') || '/',
      file_name: file.name,
      total_bytes: file.size,
    });

    uploadId = initResult.data.upload_id;
    const chunkSize = initResult.data.chunk_size_bytes || DEFAULT_CHUNK_SIZE;
    const totalChunks = initResult.data.total_chunks;

    let uploadedBytes = 0;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      if (abortSignal?.aborted) {
        if (uploadId) {
          await mutations.cancelUpload({ upload_id: uploadId });
        }
        callbacks?.onCancel?.();
        throw new Error('Upload cancelled');
      }

      const chunkOffset = chunkIndex * chunkSize;
      const chunkEnd = Math.min(chunkOffset + chunkSize, file.size);
      const chunk = file.slice(chunkOffset, chunkEnd);

      await mutations.uploadChunk({
        upload_id: uploadId,
        chunk_index: chunkIndex,
        chunk_offset: chunkOffset,
        data: chunk,
      });

      uploadedBytes = chunkEnd;
      callbacks?.onProgress?.(uploadedBytes, file.size);
    }

    const completeResult = await mutations.completeUpload({ upload_id: uploadId, skipInvalidation });

    callbacks?.onComplete?.(completeResult.data.path, completeResult.data.mtime_ms);

    return completeResult.data;
  } catch (error) {
    if (uploadId && !(error instanceof Error && error.message === 'Upload cancelled')) {
      try {
        await mutations.cancelUpload({ upload_id: uploadId });
      } catch {
        // Ignore cancel errors
      }
    }
    callbacks?.onError?.(error instanceof Error ? error : new Error('Chunked upload failed'));
    throw error;
  }
};

export const uploadFile = async (
  file: File,
  targetPath: string,
  mutations: UploadMutations,
  callbacks?: UploadCallbacks,
  abortSignal?: AbortSignal,
  skipInvalidation?: boolean,
): Promise<{ path: string; mtime_ms: number; bytes_written: number }> => {
  if (shouldUseChunkedUpload(file.size)) {
    return uploadFileChunked(file, targetPath, mutations, callbacks, abortSignal, skipInvalidation);
  }

  return uploadFileDirectly(file, targetPath, mutations, callbacks, skipInvalidation);
};

/**
 * File with its relative path from the folder root
 */
export interface FileWithRelativePath {
  file: File;
  relativePath: string;
}

/**
 * Extract files from a FileList with their relative paths (from webkitRelativePath)
 * This is used when uploading folders via the webkitdirectory input attribute
 */
export const extractFilesWithPaths = (files: FileList): FileWithRelativePath[] => {
  const result: FileWithRelativePath[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (file.webkitRelativePath) {
      result.push({
        file,
        relativePath: file.webkitRelativePath,
      });
    }
  }

  return result;
};

/**
 * Get the root folder name from the webkitRelativePath
 * e.g., "myFolder/subfolder/file.txt" -> "myFolder"
 */
export const getRootFolderName = (files: FileWithRelativePath[]): string => {
  if (files.length === 0) return '';

  const firstPath = files[0].relativePath;
  const firstSlash = firstPath.indexOf('/');

  return firstSlash > 0 ? firstPath.substring(0, firstSlash) : firstPath;
};

/**
 * Extract unique directory paths that need to be created
 * Returns paths sorted by depth (parent directories first)
 */
export const extractUniqueDirectories = (files: FileWithRelativePath[], basePath: string): string[] => {
  const directories = new Set<string>();

  for (const { relativePath } of files) {
    const parts = relativePath.split('/');

    let currentPath = basePath;

    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = `${currentPath}/${parts[i]}`;
      directories.add(currentPath);
    }
  }

  return Array.from(directories).sort((a, b) => {
    const depthA = a.split('/').length;
    const depthB = b.split('/').length;

    return depthA - depthB;
  });
};

/**
 * Get the full target path for a file within the folder upload
 */
export const getFileTargetPath = (basePath: string, relativePath: string): string => {
  const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

  return `${normalizedBase}/${relativePath}`;
};

/**
 * Calculate total bytes for all files in the folder
 */
export const calculateTotalBytes = (files: FileWithRelativePath[]): number => {
  return files.reduce((total, { file }) => total + file.size, 0);
};
