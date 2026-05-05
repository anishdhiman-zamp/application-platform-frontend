import { useEffect } from 'react';
import { useGetFilesystemStatusQuery, useProvisionFilesystemMutation } from '@/apis/filesystem';
import { FILESYSTEM_STATUS } from '@/types/api/filesystem.types';
const FILESYSTEM_POLL_INTERVAL_MS = 3000;

export const useFilesystemStatus = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const {
    data: filesystemStatus,
    isLoading: isStatusLoading,
    isError: isStatusError,
    refetch: refetchStatus,
  } = useGetFilesystemStatusQuery(undefined, { skip: !enabled });
  const [provisionFilesystem, { isError: isFilesError }] = useProvisionFilesystemMutation();

  const isActive = filesystemStatus?.status === FILESYSTEM_STATUS.ACTIVE;
  const refetch = () => {
    refetchStatus();
    provisionFilesystem();
  };

  useEffect(() => {
    if (!enabled) return;
    provisionFilesystem();
  }, [enabled, provisionFilesystem]);

  useEffect(() => {
    if (!enabled || isActive || isStatusError || isFilesError) return;

    const intervalId = window.setInterval(() => {
      refetchStatus();
    }, FILESYSTEM_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [enabled, isActive, isStatusError, isFilesError, refetchStatus]);

  return {
    isFilesystemActive: isActive,
    isFilesystemStatusLoading: isStatusLoading,
    isFilesystemError: isStatusError || isFilesError,
    filesystemStatus,
    refetch,
  };
};
