import { useEffect } from 'react';
import { useGetFilesystemStatusQuery, useProvisionFilesystemMutation } from '@/apis/filesystem';
import { FILESYSTEM_STATUS } from '@/types/api/filesystem.types';
const FILESYSTEM_POLL_INTERVAL_MS = 3000;

export const useFilesystemStatus = () => {
  const {
    data: filesystemStatus,
    isLoading: isStatusLoading,
    isError: isStatusError,
    refetch: refetchStatus,
  } = useGetFilesystemStatusQuery();
  const [provisionFilesystem, { isError: isFilesError }] = useProvisionFilesystemMutation();

  const isActive = filesystemStatus?.status === FILESYSTEM_STATUS.ACTIVE;
  const pollingInterval = isActive || isStatusError || isFilesError ? 0 : FILESYSTEM_POLL_INTERVAL_MS;

  useGetFilesystemStatusQuery(undefined, {
    pollingInterval,
    skip: isStatusError,
  });

  const refetch = () => {
    refetchStatus();
    provisionFilesystem();
  };

  useEffect(() => {
    provisionFilesystem();
  }, [provisionFilesystem]);

  return {
    isFilesystemActive: isActive,
    isFilesystemStatusLoading: isStatusLoading,
    isFilesystemError: isStatusError || isFilesError,
    filesystemStatus,
    refetch,
  };
};
