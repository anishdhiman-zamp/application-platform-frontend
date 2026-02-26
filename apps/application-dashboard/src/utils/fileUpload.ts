import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { API_DOMAIN } from '@zamp-platform/api';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import type { UploadChunkResponse } from '@/types/api/filesystem.types';

interface UploadChunkParams {
  upload_id: string;
  chunk_index: number;
  chunk_offset: number;
  data: ArrayBuffer | Blob;
  signal?: AbortSignal;
}

type UploadChunkResult =
  | { data: UploadChunkResponse; error?: undefined }
  | { error: FetchBaseQueryError; data?: undefined };

export async function uploadChunk({
  upload_id,
  chunk_index,
  chunk_offset,
  data,
  signal,
}: UploadChunkParams): Promise<UploadChunkResult> {
  try {
    const orgId = getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID);

    const response = await fetch(`${API_DOMAIN}/${API_ENDPOINTS.FILES_UPLOAD_CHUNK_POST}`, {
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
      const errorData = await response.json().catch(() => ({}));

      return {
        error: {
          status: response.status,
          data: errorData,
        } as FetchBaseQueryError,
      };
    }

    const result = await response.json();

    return { data: result as UploadChunkResponse };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        error: {
          status: 'CUSTOM_ERROR',
          error: 'Upload cancelled',
        } as FetchBaseQueryError,
      };
    }

    return {
      error: {
        status: 'FETCH_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as FetchBaseQueryError,
    };
  }
}
