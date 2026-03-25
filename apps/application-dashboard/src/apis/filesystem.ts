import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import type {
  CancelUploadRequest,
  CancelUploadResponse,
  CompleteUploadRequest,
  CompleteUploadResponse,
  CopyMoveRequest,
  CopyMoveResponse,
  CreateItemRequest,
  CreateItemResponse,
  DeleteResponse,
  DirectUploadResponse,
  FilesystemStatusResponse,
  InitUploadRequest,
  InitUploadResponse,
  ListFilesRequest,
  ListFilesResponse,
  ReadDirectoryResponse,
  ReadFileResponse,
  UploadChunkRequest,
  UploadChunkResponse,
  WriteFileRequest,
  WriteFileResponse,
} from '@/types/api/filesystem.types';
import { formRequestUrlWithParams } from '@/utils/common';
import { uploadChunk } from '@/utils/fileUpload';

const FilesystemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Filesystem/Sandbox Status
    getFilesystemStatus: builder.query<FilesystemStatusResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.FILESYSTEM_STATUS_GET,
      }),
      providesTags: [APITags.GET_FILESYSTEM_STATUS],
    }),

    // List Files (Recursive)
    listFiles: builder.query<ListFilesResponse, ListFilesRequest>({
      query: ({ depth = 2, path, query }) => ({
        url: API_ENDPOINTS.FILES_LIST_GET,
        params: {
          depth,
          path: path || undefined,
          query: query || undefined,
        },
      }),
      providesTags: [APITags.GET_FILES_LIST],
    }),

    // Read File Metadata (without content)
    readFile: builder.query<ReadFileResponse, { path: string }>({
      query: ({ path }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.FILES_READ_GET, { path }),
      }),
    }),

    // Read File Content (raw text content via ?content)
    readFileContent: builder.query<string, { path: string }>({
      query: ({ path }) => ({
        url: `${formRequestUrlWithParams(API_ENDPOINTS.FILES_READ_GET, { path })}?raw=true`,
        responseHandler: (response) => response.text(),
      }),
    }),

    // Read Directory Contents
    readDirectory: builder.query<ReadDirectoryResponse, { path: string }>({
      query: ({ path }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.FILES_READ_GET, { path }),
      }),
    }),

    // Create File or Directory
    createItem: builder.mutation<CreateItemResponse, CreateItemRequest>({
      query: ({ path, type }) => ({
        url: API_ENDPOINTS.FILES_CREATE_PUT.replace('{{path}}', path),
        method: REQUEST_TYPES.PUT,
        body: { type, content: '' },
      }),
    }),

    // Write File Content
    writeFile: builder.mutation<WriteFileResponse, WriteFileRequest>({
      query: ({ path, content, expectedMtimeMs }) => ({
        url: API_ENDPOINTS.FILES_WRITE_POST.replace('{{path}}', path),
        method: REQUEST_TYPES.PUT,
        body: {
          content,
          ...(expectedMtimeMs !== undefined && { expectedMtimeMs }),
        },
      }),
    }),

    // Copy File or Directory
    copyFile: builder.mutation<CopyMoveResponse, CopyMoveRequest>({
      query: ({ source, destination }) => ({
        url: API_ENDPOINTS.FILES_COPY_POST,
        method: REQUEST_TYPES.POST,
        body: { source, destination },
      }),
    }),

    // Move/Rename File or Directory
    moveFile: builder.mutation<CopyMoveResponse, CopyMoveRequest>({
      query: ({ source, destination }) => ({
        url: API_ENDPOINTS.FILES_MOVE_POST,
        method: REQUEST_TYPES.POST,
        body: { source, destination },
      }),
    }),

    // Delete File or Directory
    deleteFile: builder.mutation<DeleteResponse, { path: string }>({
      query: ({ path }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.FILES_DELETE, { path }),
        method: REQUEST_TYPES.DELETE,
      }),
    }),

    // Direct Upload (Small Files <= 1MB)
    directUpload: builder.mutation<DirectUploadResponse, { path: string; file: File; skipInvalidation?: boolean }>({
      query: ({ path, file }) => {
        const formData = new FormData();

        formData.append('path', path);
        formData.append('file', file);

        return {
          url: API_ENDPOINTS.FILES_UPLOAD_POST,
          method: REQUEST_TYPES.POST,
          body: formData,
        };
      },
    }),

    // Initialize Chunked Upload
    initChunkedUpload: builder.mutation<InitUploadResponse, InitUploadRequest>({
      query: ({ path, file_name, total_bytes }) => ({
        url: API_ENDPOINTS.FILES_UPLOAD_INIT_POST,
        method: REQUEST_TYPES.POST,
        body: { path, file_name, total_bytes },
      }),
    }),

    // Upload Chunk - sends binary data directly as application/octet-stream
    // Using queryFn to ensure binary data is sent raw without any transformation
    uploadChunk: builder.mutation<UploadChunkResponse, UploadChunkRequest>({
      queryFn: async ({ upload_id, chunk_index, chunk_offset, data, signal }) => {
        return uploadChunk({ upload_id, chunk_index, chunk_offset, data, signal });
      },
    }),

    // Complete Chunked Upload
    completeUpload: builder.mutation<CompleteUploadResponse, CompleteUploadRequest & { skipInvalidation?: boolean }>({
      query: ({ upload_id }) => ({
        url: API_ENDPOINTS.FILES_UPLOAD_COMPLETE_POST,
        method: REQUEST_TYPES.POST,
        body: { upload_id },
      }),
    }),

    // Cancel Chunked Upload
    cancelUpload: builder.mutation<CancelUploadResponse, CancelUploadRequest>({
      query: ({ upload_id }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.FILES_UPLOAD_CANCEL_DELETE, { upload_id }),
        method: REQUEST_TYPES.DELETE,
      }),
    }),
  }),
});

export const {
  useGetFilesystemStatusQuery,
  useLazyGetFilesystemStatusQuery,
  useListFilesQuery,
  useLazyListFilesQuery,
  useReadFileQuery,
  useLazyReadFileQuery,
  useReadFileContentQuery,
  useLazyReadFileContentQuery,
  useReadDirectoryQuery,
  useLazyReadDirectoryQuery,
  useCreateItemMutation,
  useWriteFileMutation,
  useCopyFileMutation,
  useMoveFileMutation,
  useDeleteFileMutation,
  useDirectUploadMutation,
  useInitChunkedUploadMutation,
  useUploadChunkMutation,
  useCompleteUploadMutation,
  useCancelUploadMutation,
} = FilesystemApi;

export { FilesystemApi };

export const FILESYSTEM_ENDPOINT_NAMES = {
  LIST_FILES: 'listFiles',
} as const;
