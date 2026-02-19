import { useGetFilesystemStatusQuery } from '@/apis/filesystem';

const FILESYSTEM_POLL_INTERVAL_MS = 3000;

export const useFilesystemStatus = () => {
  const { data: filesystemStatus, isLoading } = useGetFilesystemStatusQuery();

  const isActive = filesystemStatus?.status === 'active';
  const pollingInterval = isActive ? 0 : FILESYSTEM_POLL_INTERVAL_MS;

  useGetFilesystemStatusQuery(undefined, { pollingInterval });

  return {
    isFilesystemActive: isActive,
    isFilesystemStatusLoading: isLoading,
    filesystemStatus,
  };
};
