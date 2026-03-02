import { API_DOMAIN } from '@zamp-platform/api';
import { REQUEST_TYPES } from '@zamp-platform/api/constants';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';

import { chatApi } from './chat';

const FILESYSTEM_ENDPOINTS = {
  FILES_DELETE: 'files/{{path}}',
  FILES_UPLOAD_POST: 'files/upload',
  FILES_UPLOAD_INIT_POST: 'files/upload/init',
  FILES_UPLOAD_CHUNK_POST: 'files/upload/chunk',
  FILES_UPLOAD_COMPLETE_POST: 'files/upload/complete',
  FILES_UPLOAD_CANCEL_DELETE: 'files/upload/{{upload_id}}',
};

export interface DirectUploadResponse {
  success: boolean;
  path: string;
  mtime_ms: number;
  bytes_written: number;
}

export interface InitUploadResponse {
  upload_id: string;
  chunk_size_bytes: number;
  total_chunks: number;
  target_path: string;
}

export interface UploadChunkResponse {
  chunk_index: number;
  bytes_received: number;
}

export interface CompleteUploadResponse {
  success: boolean;
  path: string;
  mtime_ms: number;
  bytes_written: number;
}

export interface DeleteResponse {
  success: boolean;
  path: string;
  mtime_ms: number;
}

interface UploadChunkParams {
  upload_id: string;
  chunk_index: number;
  chunk_offset: number;
  data: ArrayBuffer | Blob;
  signal?: AbortSignal;
}

export async function uploadChunk({
  upload_id,
  chunk_index,
  chunk_offset,
  data,
  signal,
}: UploadChunkParams): Promise<{ data: UploadChunkResponse }> {
  const orgId = getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID);

  const response = await fetch(`${API_DOMAIN}/${FILESYSTEM_ENDPOINTS.FILES_UPLOAD_CHUNK_POST}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-Upload-Id': upload_id,
      'X-Chunk-Index': String(chunk_index),
      'X-Chunk-Offset': String(chunk_offset),
      [LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID]: orgId,
    },
    body: data,
    signal,
  });

  if (!response.ok) {
    throw new Error('Chunk upload failed');
  }

  const result = await response.json();
  return { data: result as UploadChunkResponse };
}

const FilesystemService = chatApi.injectEndpoints({
  endpoints: (builder) => ({
    directUpload: builder.mutation<DirectUploadResponse, { path: string; file: File; skipInvalidation?: boolean }>({
      query: ({ path, file }) => {
        const formData = new FormData();
        formData.append('path', path);
        formData.append('file', file);

        return {
          url: FILESYSTEM_ENDPOINTS.FILES_UPLOAD_POST,
          method: REQUEST_TYPES.POST,
          body: formData,
        };
      },
    }),

    initChunkedUpload: builder.mutation<InitUploadResponse, { path: string; file_name: string; total_bytes: number }>({
      query: ({ path, file_name, total_bytes }) => ({
        url: FILESYSTEM_ENDPOINTS.FILES_UPLOAD_INIT_POST,
        method: REQUEST_TYPES.POST,
        body: { path, file_name, total_bytes },
      }),
    }),

    filesystemUploadChunk: builder.mutation<
      UploadChunkResponse,
      { upload_id: string; chunk_index: number; chunk_offset: number; data: Blob; signal?: AbortSignal }
    >({
      queryFn: async ({ upload_id, chunk_index, chunk_offset, data, signal }) => {
        return uploadChunk({ upload_id, chunk_index, chunk_offset, data, signal });
      },
    }),

    completeUpload: builder.mutation<CompleteUploadResponse, { upload_id: string; skipInvalidation?: boolean }>({
      query: ({ upload_id }) => ({
        url: FILESYSTEM_ENDPOINTS.FILES_UPLOAD_COMPLETE_POST,
        method: REQUEST_TYPES.POST,
        body: { upload_id },
      }),
    }),

    cancelUpload: builder.mutation<{ success: boolean }, { upload_id: string }>({
      query: ({ upload_id }) => ({
        url: FILESYSTEM_ENDPOINTS.FILES_UPLOAD_CANCEL_DELETE.replace('{{upload_id}}', upload_id),
        method: REQUEST_TYPES.DELETE,
      }),
    }),

    deleteFile: builder.mutation<DeleteResponse, { path: string }>({
      query: ({ path }) => ({
        url: FILESYSTEM_ENDPOINTS.FILES_DELETE.replace('{{path}}', encodeURIComponent(path)),
        method: REQUEST_TYPES.DELETE,
      }),
    }),
  }),
});

export const {
  useDirectUploadMutation,
  useInitChunkedUploadMutation,
  useFilesystemUploadChunkMutation,
  useCompleteUploadMutation,
  useCancelUploadMutation,
  useDeleteFileMutation,
} = FilesystemService;
