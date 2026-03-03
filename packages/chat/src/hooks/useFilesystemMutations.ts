'use client';

import { useMemo, useRef } from 'react';

import {
  useCancelUploadMutation,
  useCompleteUploadMutation,
  useDeleteFileMutation,
  useDirectUploadMutation,
  useFilesystemUploadChunkMutation,
  useInitChunkedUploadMutation,
} from '../api/filesystem';
import { DeleteFileMutation, UploadMutations } from '../utils/filesystemUpload';

interface UseFilesystemMutationsReturn {
  uploadMutations: UploadMutations;
  deleteFileMutation: DeleteFileMutation;
}

export const useFilesystemMutations = (): UseFilesystemMutationsReturn => {
  const currentUploadIdRef = useRef<string | null>(null);

  const [directUpload] = useDirectUploadMutation();
  const [initChunkedUpload] = useInitChunkedUploadMutation();
  const [uploadChunk] = useFilesystemUploadChunkMutation();
  const [completeUpload] = useCompleteUploadMutation();
  const [cancelUploadMutation] = useCancelUploadMutation();
  const [deleteFile] = useDeleteFileMutation();

  const uploadMutations: UploadMutations = useMemo(
    () => ({
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
    }),
    [directUpload, initChunkedUpload, uploadChunk, completeUpload, cancelUploadMutation],
  );

  const deleteFileMutation: DeleteFileMutation = useMemo(
    () => ({
      deleteFile: async (args) => {
        const result = await deleteFile(args).unwrap();
        return result;
      },
    }),
    [deleteFile],
  );

  return {
    uploadMutations,
    deleteFileMutation,
  };
};
