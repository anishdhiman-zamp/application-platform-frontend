import { useGetFilesystemStatusQuery, useListFilesQuery } from '@/apis/filesystem';
import { FILESYSTEM_STATUS } from '@/types/api/filesystem.types';

const FILESYSTEM_POLL_INTERVAL_MS = 3000;

export const useFilesystemStatus = () => {
  const { data: filesystemStatus, isLoading: isStatusLoading, isError: isStatusError } = useGetFilesystemStatusQuery();

  const isActive = filesystemStatus?.status === FILESYSTEM_STATUS.ACTIVE;

  const { isError: isFilesError } = useListFilesQuery({ depth: -1 }, { skip: isActive });

  const pollingInterval = isActive || isStatusError || isFilesError ? 0 : FILESYSTEM_POLL_INTERVAL_MS;

  useGetFilesystemStatusQuery(undefined, {
    pollingInterval,
    skip: isStatusError,
  });

  return {
    isFilesystemActive: isActive,
    isFilesystemStatusLoading: isStatusLoading,
    isFilesystemError: isStatusError || isFilesError,
    filesystemStatus,
  };
};
