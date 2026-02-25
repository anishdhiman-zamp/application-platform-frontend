import { useMemo } from 'react';
import { useListFilesQuery } from '@/apis/filesystem';
import { getSiblingNamesFromFiles } from '@/modules/pace/components/files/file-tree.utils';

interface UseSiblingNamesProps {
  filePath: string;
}

interface UseSiblingNamesReturn {
  siblingNames: string[];
  isLoading: boolean;
}

/**
 * Hook to get sibling file/folder names for a given file path.
 * Uses the cached files list from RTK Query.
 * Does not trigger a refetch if data is already cached.
 */
export const useSiblingNames = ({ filePath }: UseSiblingNamesProps): UseSiblingNamesReturn => {
  const { data: filesData, isLoading } = useListFilesQuery(
    {
      depth: -1,
    },
    { refetchOnMountOrArgChange: false },
  );

  const siblingNames = useMemo(() => {
    if (!filesData?.files || !filePath) {
      return [];
    }

    return getSiblingNamesFromFiles(filesData.files, filePath);
  }, [filesData?.files, filePath]);

  return {
    siblingNames,
    isLoading,
  };
};
