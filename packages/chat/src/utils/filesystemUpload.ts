'use client';

import type {
  CompleteUploadResponse,
  DirectUploadResponse,
  InitUploadResponse,
  UploadChunkResponse,
} from '../api/filesystem';
import { UploadedFile } from '../hooks/useChatInput';

/**
 * Result type for multiple filesystem file uploads
 */
export interface FilesystemUploadResult {
  successful: UploadedFile[];
  failed: { file: File; error: unknown }[];
}

export const DIRECT_UPLOAD_THRESHOLD_BYTES = 1 * 1024 * 1024; // 1MB
export const DEFAULT_CHUNK_SIZE = 6 * 1024 * 1024; // 6MB chunk size
export const PARALLEL_CHUNK_CONCURRENCY = 6; // Upload 6 chunks in parallel
export const MAX_CHUNK_RETRIES = 3; // Retry failed chunks up to 3 times

export interface UploadCallbacks {
  onProgress?: (loaded: number, total: number) => void;
  onComplete?: (path: string, mtime_ms: number) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

export interface DirectUploadMutation {
  directUpload: (args: {
    path: string;
    file: File;
    skipInvalidation?: boolean;
  }) => Promise<{ data: DirectUploadResponse }>;
}

export interface InitChunkedUploadMutation {
  initChunkedUpload: (args: {
    path: string;
    file_name: string;
    total_bytes: number;
  }) => Promise<{ data: InitUploadResponse }>;
}

export interface UploadChunkMutation {
  uploadChunk: (args: {
    upload_id: string;
    chunk_index: number;
    chunk_offset: number;
    data: Blob;
    signal?: AbortSignal;
  }) => Promise<{ data: UploadChunkResponse }>;
}

export interface CompleteUploadMutation {
  completeUpload: (args: {
    upload_id: string;
    skipInvalidation?: boolean;
  }) => Promise<{ data: CompleteUploadResponse }>;
}

export interface CancelUploadMutation {
  cancelUpload: (args: { upload_id: string }) => Promise<unknown>;
}

export interface DeleteFileMutation {
  deleteFile: (args: { path: string }) => Promise<unknown>;
}

export interface ChunkedUploadMutations
  extends InitChunkedUploadMutation, UploadChunkMutation, CompleteUploadMutation, CancelUploadMutation {}

export interface UploadMutations extends DirectUploadMutation, ChunkedUploadMutations {}

export interface FilesystemUploadAdapter extends UploadMutations, DeleteFileMutation {
  getUsername: () => string;
}

export const shouldUseChunkedUpload = (fileSize: number): boolean => {
  return fileSize >= DIRECT_UPLOAD_THRESHOLD_BYTES;
};

export const sanitizeFileName = (name: string): string => {
  return name.replace(/\s+/g, '_');
};

export const getTargetPath = (basePath: string, fileName: string): string => {
  const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  return `${normalizedBase}/${fileName}`;
};

export const generateUploadPath = (username: string, fileName: string): string => {
  const uuid = crypto.randomUUID();
  return `${username}/uploads/${uuid}/${sanitizeFileName(fileName)}`;
};

interface ChunkUploadArgs {
  upload_id: string;
  chunk_index: number;
  chunk_offset: number;
  data: Blob;
  signal?: AbortSignal;
}

const uploadChunkWithRetry = async (
  mutations: UploadChunkMutation,
  args: ChunkUploadArgs,
  maxRetries: number = MAX_CHUNK_RETRIES,
): Promise<UploadChunkResponse> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (args.signal?.aborted) {
      throw new Error('Upload cancelled');
    }

    try {
      const result = await mutations.uploadChunk(args);
      return result.data;
    } catch (error) {
      if (args.signal?.aborted) {
        throw new Error('Upload cancelled');
      }

      lastError = error instanceof Error ? error : new Error('Chunk upload failed');

      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000;

        await new Promise<void>((resolve) => {
          const timeoutId = setTimeout(resolve, backoffMs);

          if (args.signal) {
            const abortHandler = () => {
              clearTimeout(timeoutId);
              resolve();
            };

            args.signal.addEventListener('abort', abortHandler, { once: true });

            setTimeout(() => {
              args.signal?.removeEventListener('abort', abortHandler);
            }, backoffMs + 10);
          }
        });
      }
    }
  }

  throw lastError;
};

interface ChunkInfo {
  chunkIndex: number;
  chunkOffset: number;
  chunkEnd: number;
}

const uploadChunksInParallel = async (
  file: File,
  uploadId: string,
  chunks: ChunkInfo[],
  mutations: UploadChunkMutation & CancelUploadMutation,
  abortSignal: AbortSignal | undefined,
  onChunkComplete: (chunkEnd: number) => void,
): Promise<void> => {
  const pendingChunks = [...chunks];
  const inFlightPromises: Promise<void>[] = [];
  let hasError = false;
  let uploadError: Error | null = null;

  const processChunk = async (chunk: ChunkInfo): Promise<void> => {
    if (hasError || abortSignal?.aborted) {
      return;
    }

    const chunkData = file.slice(chunk.chunkOffset, chunk.chunkEnd);

    try {
      await uploadChunkWithRetry(mutations, {
        upload_id: uploadId,
        chunk_index: chunk.chunkIndex,
        chunk_offset: chunk.chunkOffset,
        data: chunkData,
        signal: abortSignal,
      });

      if (!hasError && !abortSignal?.aborted) {
        onChunkComplete(chunk.chunkEnd);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Upload cancelled') {
        return;
      }
      hasError = true;
      uploadError = error instanceof Error ? error : new Error('Chunk upload failed');
      throw error;
    }
  };

  while (pendingChunks.length > 0 || inFlightPromises.length > 0) {
    if (hasError || abortSignal?.aborted) {
      break;
    }

    while (pendingChunks.length > 0 && inFlightPromises.length < PARALLEL_CHUNK_CONCURRENCY) {
      if (hasError || abortSignal?.aborted) {
        break;
      }

      const chunk = pendingChunks.shift()!;
      const promise = processChunk(chunk).finally(() => {
        const index = inFlightPromises.indexOf(promise);

        if (index > -1) {
          inFlightPromises.splice(index, 1);
        }
      });

      inFlightPromises.push(promise);
    }

    if (inFlightPromises.length > 0) {
      await Promise.race(inFlightPromises).catch(() => {
        // Error is already captured in processChunk
      });
    }
  }

  if (inFlightPromises.length > 0) {
    await Promise.allSettled(inFlightPromises);
  }

  if (uploadError) {
    throw uploadError;
  }

  if (abortSignal?.aborted) {
    throw new Error('Upload cancelled');
  }
};

export const uploadFileDirectly = async (
  file: File,
  targetPath: string,
  mutations: DirectUploadMutation,
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
  mutations: ChunkedUploadMutations,
  callbacks?: UploadCallbacks,
  abortSignal?: AbortSignal,
  skipInvalidation?: boolean,
): Promise<CompleteUploadResponse> => {
  let uploadId: string | null = null;

  try {
    callbacks?.onProgress?.(0, file.size);

    if (abortSignal?.aborted) {
      callbacks?.onCancel?.();
      throw new Error('Upload cancelled');
    }

    const initResult = await mutations.initChunkedUpload({
      path: targetPath.split('/').slice(0, -1).join('/') || '/',
      file_name: sanitizeFileName(file.name),
      total_bytes: file.size,
    });

    uploadId = initResult.data.upload_id;
    const chunkSize = initResult.data.chunk_size_bytes || DEFAULT_CHUNK_SIZE;
    const totalChunks = initResult.data.total_chunks;

    const chunks: ChunkInfo[] = [];

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const chunkOffset = chunkIndex * chunkSize;
      const chunkEnd = Math.min(chunkOffset + chunkSize, file.size);

      chunks.push({ chunkIndex, chunkOffset, chunkEnd });
    }

    const completedChunks = new Set<number>();
    let maxCompletedByte = 0;

    const onChunkComplete = (chunkEnd: number) => {
      completedChunks.add(chunkEnd);
      if (chunkEnd > maxCompletedByte) {
        maxCompletedByte = chunkEnd;
      }
      const totalCompleted = Math.min(
        Array.from(completedChunks).reduce((sum, end) => {
          const chunk = chunks.find((c) => c.chunkEnd === end);

          return sum + (chunk ? chunk.chunkEnd - chunk.chunkOffset : 0);
        }, 0),
        file.size,
      );

      callbacks?.onProgress?.(totalCompleted, file.size);
    };

    await uploadChunksInParallel(file, uploadId, chunks, mutations, abortSignal, onChunkComplete);

    if (abortSignal?.aborted) {
      throw new Error('Upload cancelled');
    }

    const completeResult = await mutations.completeUpload({ upload_id: uploadId, skipInvalidation });

    callbacks?.onComplete?.(completeResult.data.path, completeResult.data.mtime_ms);

    return completeResult.data;
  } catch (error) {
    const isCancellation = error instanceof Error && error.message === 'Upload cancelled';

    if (uploadId) {
      try {
        await mutations.cancelUpload({ upload_id: uploadId });
      } catch {
        // Ignore cancel errors during cleanup
      }
    }

    if (isCancellation) {
      callbacks?.onCancel?.();
      throw error;
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

export const processFilesystemUpload = async (
  file: File,
  username: string,
  mutations: UploadMutations,
): Promise<UploadedFile> => {
  const sanitizedName = sanitizeFileName(file.name);
  const targetPath = generateUploadPath(username, sanitizedName);

  await uploadFile(file, targetPath, mutations, undefined, undefined, true);

  return {
    path: targetPath,
    name: sanitizedName,
    file_type: file.type || 'application/octet-stream',
    file: file,
  };
};

export const handleFilesystemUploads = async (
  files: FileList,
  username: string,
  mutations: UploadMutations,
): Promise<FilesystemUploadResult> => {
  const fileArray = Array.from(files);
  const uploadPromises = fileArray.map((file) => processFilesystemUpload(file, username, mutations));

  const results = await Promise.allSettled(uploadPromises);

  const successful: UploadedFile[] = [];
  const failed: { file: File; error: unknown }[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successful.push(result.value);
    } else {
      failed.push({ file: fileArray[index], error: result.reason });
    }
  });

  return { successful, failed };
};
