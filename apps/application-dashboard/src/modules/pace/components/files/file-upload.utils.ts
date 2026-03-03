'use client';

import {
  DEFAULT_CHUNK_SIZE,
  DIRECT_UPLOAD_THRESHOLD_BYTES,
  MAX_CHUNK_RETRIES,
  PARALLEL_CHUNK_CONCURRENCY,
} from 'modules/pace/components/files/files.constants';
import type {
  CompleteUploadResponse,
  DirectUploadResponse,
  InitUploadResponse,
  UploadChunkResponse,
} from '@/types/api/filesystem.types';
import { defaultFnType } from '@/types/commonTypes';

export interface UploadCallbacks {
  onProgress?: (loaded: number, total: number) => void;
  onComplete?: (path: string, mtime_ms: number) => void;
  onError?: (error: Error) => void;
  onCancel?: defaultFnType;
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

export interface ChunkedUploadMutations
  extends InitChunkedUploadMutation, UploadChunkMutation, CompleteUploadMutation, CancelUploadMutation {}

export interface UploadMutations extends DirectUploadMutation, ChunkedUploadMutations {}

export const shouldUseChunkedUpload = (fileSize: number): boolean => {
  return fileSize >= DIRECT_UPLOAD_THRESHOLD_BYTES;
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
    // Check if aborted before attempting
    if (args.signal?.aborted) {
      throw new Error('Upload cancelled');
    }

    try {
      const result = await mutations.uploadChunk(args);

      return result.data;
    } catch (error) {
      // Don't retry if aborted
      if (args.signal?.aborted) {
        throw new Error('Upload cancelled');
      }

      lastError = error instanceof Error ? error : new Error('Chunk upload failed');

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s with cancellation support
        const backoffMs = Math.pow(2, attempt) * 1000;

        await new Promise<void>((resolve) => {
          const timeoutId = setTimeout(resolve, backoffMs);

          // If signal exists, listen for abort to cancel the backoff wait
          if (args.signal) {
            const abortHandler = () => {
              clearTimeout(timeoutId);
              resolve();
            };

            args.signal.addEventListener('abort', abortHandler, { once: true });

            // Clean up listener after timeout completes
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
      // Don't treat cancellation as an error that needs to stop other chunks
      if (error instanceof Error && error.message === 'Upload cancelled') {
        return;
      }
      hasError = true;
      uploadError = error instanceof Error ? error : new Error('Chunk upload failed');
      throw error;
    }
  };

  // Process chunks with concurrency limit
  while (pendingChunks.length > 0 || inFlightPromises.length > 0) {
    if (hasError || abortSignal?.aborted) {
      break;
    }

    // Start new uploads up to concurrency limit
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

    // Wait for at least one to complete before continuing
    if (inFlightPromises.length > 0) {
      await Promise.race(inFlightPromises).catch(() => {
        // Error is already captured in processChunk
      });
    }
  }

  // Wait for all remaining in-flight uploads to settle
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

export const getTargetPath = (basePath: string, fileName: string): string => {
  const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

  return `${normalizedBase}/${fileName}`;
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

    // Check for cancellation before starting
    if (abortSignal?.aborted) {
      callbacks?.onCancel?.();
      throw new Error('Upload cancelled');
    }

    const initResult = await mutations.initChunkedUpload({
      path: targetPath.split('/').slice(0, -1).join('/') || '/',
      file_name: file.name,
      total_bytes: file.size,
    });

    uploadId = initResult.data.upload_id;
    const chunkSize = initResult.data.chunk_size_bytes || DEFAULT_CHUNK_SIZE;
    const totalChunks = initResult.data.total_chunks;

    // Build chunk info array
    const chunks: ChunkInfo[] = [];

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const chunkOffset = chunkIndex * chunkSize;
      const chunkEnd = Math.min(chunkOffset + chunkSize, file.size);

      chunks.push({ chunkIndex, chunkOffset, chunkEnd });
    }

    // Track completed bytes for progress reporting
    const completedChunks = new Set<number>();
    let maxCompletedByte = 0;

    const onChunkComplete = (chunkEnd: number) => {
      completedChunks.add(chunkEnd);
      // Report progress based on highest completed byte to ensure monotonic progress
      if (chunkEnd > maxCompletedByte) {
        maxCompletedByte = chunkEnd;
      }
      // Calculate total completed bytes from all finished chunks
      const totalCompleted = Math.min(
        Array.from(completedChunks).reduce((sum, end) => {
          const chunk = chunks.find((c) => c.chunkEnd === end);

          return sum + (chunk ? chunk.chunkEnd - chunk.chunkOffset : 0);
        }, 0),
        file.size,
      );

      callbacks?.onProgress?.(totalCompleted, file.size);
    };

    // Upload chunks in parallel with retry logic
    await uploadChunksInParallel(file, uploadId, chunks, mutations, abortSignal, onChunkComplete);

    // Check for cancellation before completing
    if (abortSignal?.aborted) {
      throw new Error('Upload cancelled');
    }

    const completeResult = await mutations.completeUpload({ upload_id: uploadId, skipInvalidation });

    callbacks?.onComplete?.(completeResult.data.path, completeResult.data.mtime_ms);

    return completeResult.data;
  } catch (error) {
    const isCancellation = error instanceof Error && error.message === 'Upload cancelled';

    // Always try to cancel the upload on the server to clean up partial uploads
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

interface ProcessInParallelOptions {
  continueOnError?: boolean;
}

export interface ProcessInParallelResult {
  errors: Error[];
  totalProcessed: number;
  totalFailed: number;
  wasCancelled: boolean;
}

export const processInParallel = async <T>(
  items: T[],
  concurrency: number,
  processor: (item: T) => Promise<void>,
  abortSignal?: AbortSignal,
  options?: ProcessInParallelOptions,
): Promise<ProcessInParallelResult> => {
  const { continueOnError = false } = options ?? {};
  const pending = [...items];
  const inFlight: Promise<void>[] = [];
  let hasError = false;
  let firstError: Error | null = null;
  const errors: Error[] = [];
  let totalProcessed = 0;

  const processItem = async (item: T): Promise<void> => {
    if ((!continueOnError && hasError) || abortSignal?.aborted) return;

    try {
      await processor(item);
      totalProcessed++;
    } catch (error) {
      if (error instanceof Error && error.message === 'Upload cancelled') return;

      const err = error instanceof Error ? error : new Error('Parallel processing failed');

      errors.push(err);

      if (!continueOnError) {
        hasError = true;
        firstError = err;
        throw error;
      }
    }
  };

  while (pending.length > 0 || inFlight.length > 0) {
    if ((!continueOnError && hasError) || abortSignal?.aborted) break;

    while (pending.length > 0 && inFlight.length < concurrency) {
      if ((!continueOnError && hasError) || abortSignal?.aborted) break;

      const item = pending.shift()!;
      const promise = processItem(item).finally(() => {
        const index = inFlight.indexOf(promise);

        if (index > -1) inFlight.splice(index, 1);
      });

      inFlight.push(promise);
    }

    if (inFlight.length > 0) {
      await Promise.race(inFlight).catch(() => {});
    }
  }

  if (!continueOnError && (firstError || abortSignal?.aborted)) {
    if (firstError) throw firstError;
    throw new Error('Upload cancelled');
  }

  if (inFlight.length > 0) {
    await Promise.allSettled(inFlight);
  }

  return { errors, totalProcessed, totalFailed: errors.length, wasCancelled: abortSignal?.aborted ?? false };
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

  for (const file of files) {
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
 * Calculate total bytes for all files in the folder
 */
export const calculateTotalBytes = (files: FileWithRelativePath[]): number => {
  return files.reduce((total, { file }) => total + file.size, 0);
};
