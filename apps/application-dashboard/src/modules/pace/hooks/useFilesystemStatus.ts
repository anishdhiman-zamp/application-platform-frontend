import { useGetFilesystemStatusQuery, useListFilesQuery } from '@/apis/filesystem';
import { FETCH_DEPTH } from '@/modules/pace/hooks/useLazyFileTree';
import { FILESYSTEM_STATUS } from '@/types/api/filesystem.types';
const FILESYSTEM_POLL_INTERVAL_MS = 3000;

export const useFilesystemStatus = () => {
  const {
    data: filesystemStatus,
    isLoading: isStatusLoading,
    isError: isStatusError,
    refetch: refetchStatus,
  } = useGetFilesystemStatusQuery();
  const { isError: isFilesError, refetch: refetchFiles } = useListFilesQuery(
    { depth: FETCH_DEPTH },
    { refetchOnMountOrArgChange: false },
  );

  const isActive = filesystemStatus?.status === FILESYSTEM_STATUS.ACTIVE;
  const pollingInterval = isActive || isStatusError || isFilesError ? 0 : FILESYSTEM_POLL_INTERVAL_MS;

  useGetFilesystemStatusQuery(undefined, {
    pollingInterval,
    skip: isStatusError,
  });

  const refetch = () => {
    refetchStatus();
    refetchFiles();
  };

  return {
    isFilesystemActive: isActive,
    isFilesystemStatusLoading: isStatusLoading,
    isFilesystemError: isStatusError || isFilesError,
    filesystemStatus,
    refetch,
  };
};
