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
      query: ({ recursive = true, path }) => ({
        url: API_ENDPOINTS.FILES_LIST_GET,
        params: {
          recursive,
          path: path || undefined,
        },
      }),
      providesTags: [APITags.GET_FILES_LIST],
    }),

    // Read File Content
    readFile: builder.query<ReadFileResponse, { path: string }>({
      query: ({ path }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.FILES_READ_GET, { path }),
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
        url: API_ENDPOINTS.FILES_CREATE_POST,
        method: REQUEST_TYPES.POST,
        body: { path, type },
      }),
      async onQueryStarted({ path, type, owner }, { dispatch, queryFulfilled }) {
        const name = path.split('/').pop() || path;

        const patchResult = dispatch(
          FilesystemApi.util.updateQueryData('listFiles', { recursive: true }, (draft) => {
            draft.files.push({
              path,
              name,
              type,
              size: 0,
              owner: owner || 'user',
              mtime_ms: Date.now(),
            });
            draft.total_count += 1;
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Write File Content
    writeFile: builder.mutation<WriteFileResponse, WriteFileRequest>({
      query: ({ relative_path, content, expected_mtime_ms }) => ({
        url: API_ENDPOINTS.FILES_WRITE_POST,
        method: REQUEST_TYPES.POST,
        body: {
          relative_path,
          content,
          expected_mtime_ms: expected_mtime_ms || undefined,
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
      async onQueryStarted({ source, destination }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          FilesystemApi.util.updateQueryData('listFiles', { recursive: true }, (draft) => {
            const sourceItem = draft.files.find((f) => f.path === source);

            if (sourceItem) {
              const destName = destination.split('/').pop() || destination;

              draft.files.push({
                path: destination,
                name: destName,
                type: sourceItem.type,
                size: sourceItem.size,
                mtime_ms: Date.now(),
                owner: sourceItem.owner,
              });
              draft.total_count += 1;

              if (sourceItem.type === 'directory') {
                const childFiles = draft.files.filter((f) => f.path.startsWith(source + '/') && f.path !== source);

                childFiles.forEach((child) => {
                  const relativePath = child.path.slice(source.length);
                  const newChildPath = destination + relativePath;

                  draft.files.push({
                    ...child,
                    path: newChildPath,
                    mtime_ms: Date.now(),
                  });
                  draft.total_count += 1;
                });
              }
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Move/Rename File or Directory
    moveFile: builder.mutation<CopyMoveResponse, CopyMoveRequest>({
      query: ({ source, destination }) => ({
        url: API_ENDPOINTS.FILES_MOVE_POST,
        method: REQUEST_TYPES.POST,
        body: { source, destination },
      }),
      async onQueryStarted({ source, destination }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          FilesystemApi.util.updateQueryData('listFiles', { recursive: true }, (draft) => {
            const sourceIndex = draft.files.findIndex((f) => f.path === source);

            if (sourceIndex !== -1) {
              const destName = destination.split('/').pop() || destination;

              draft.files[sourceIndex].path = destination;
              draft.files[sourceIndex].name = destName;
              draft.files[sourceIndex].mtime_ms = Date.now();

              if (draft.files[sourceIndex].type === 'directory') {
                draft.files.forEach((file) => {
                  if (file.path.startsWith(source + '/')) {
                    const relativePath = file.path.slice(source.length);

                    file.path = destination + relativePath;
                    file.mtime_ms = Date.now();
                  }
                });
              }
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Delete File or Directory
    deleteFile: builder.mutation<DeleteResponse, { path: string }>({
      query: ({ path }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.FILES_DELETE, { path }),
        method: REQUEST_TYPES.DELETE,
      }),
      async onQueryStarted({ path }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          FilesystemApi.util.updateQueryData('listFiles', { recursive: true }, (draft) => {
            const initialCount = draft.files.length;

            draft.files = draft.files.filter((file) => file.path !== path && !file.path.startsWith(path + '/'));
            draft.total_count -= initialCount - draft.files.length;
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Direct Upload (Small Files <= 1MB)
    directUpload: builder.mutation<DirectUploadResponse, { path: string; file: File }>({
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
      invalidatesTags: [APITags.GET_FILES_LIST],
    }),

    // Initialize Chunked Upload
    initChunkedUpload: builder.mutation<InitUploadResponse, InitUploadRequest>({
      query: ({ path, file_name, total_bytes }) => ({
        url: API_ENDPOINTS.FILES_UPLOAD_INIT_POST,
        method: REQUEST_TYPES.POST,
        body: { path, file_name, total_bytes },
      }),
    }),

    // Upload Chunk
    uploadChunk: builder.mutation<UploadChunkResponse, UploadChunkRequest>({
      query: ({ upload_id, chunk_index, chunk_offset, data }) => ({
        url: API_ENDPOINTS.FILES_UPLOAD_CHUNK_POST,
        method: REQUEST_TYPES.POST,
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Upload-Id': upload_id,
          'X-Chunk-Index': String(chunk_index),
          'X-Chunk-Offset': String(chunk_offset),
        },
        body: data,
      }),
    }),

    // Complete Chunked Upload
    completeUpload: builder.mutation<CompleteUploadResponse, CompleteUploadRequest>({
      query: ({ upload_id }) => ({
        url: API_ENDPOINTS.FILES_UPLOAD_COMPLETE_POST,
        method: REQUEST_TYPES.POST,
        body: { upload_id },
      }),
      invalidatesTags: [APITags.GET_FILES_LIST],
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
