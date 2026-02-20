import { useGetFilesystemStatusQuery, useListFilesQuery } from '@/apis/filesystem';
import { FILESYSTEM_STATUS } from '@/types/api/filesystem.types';

const FILESYSTEM_POLL_INTERVAL_MS = 3000;

export const useFilesystemStatus = () => {
  // Call listFiles to initiate the filesystem
  const { isError: isFilesError } = useListFilesQuery({ recursive: true });

  const {
    data: filesystemStatus,
    isLoading,
    isError,
  } = useGetFilesystemStatusQuery(undefined, {
    skip: isFilesError,
  });

  const isActive = filesystemStatus?.status === FILESYSTEM_STATUS.ACTIVE;
  const pollingInterval = isActive || isError || isFilesError ? 0 : FILESYSTEM_POLL_INTERVAL_MS;

  useGetFilesystemStatusQuery(undefined, {
    pollingInterval,
    skip: isFilesError,
  });

  return {
    isFilesystemActive: isActive,
    isFilesystemStatusLoading: isLoading,
    isFilesystemError: isError || isFilesError,
    filesystemStatus,
  };
};
