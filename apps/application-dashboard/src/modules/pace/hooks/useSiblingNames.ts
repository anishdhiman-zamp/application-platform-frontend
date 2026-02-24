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
 */
export const useSiblingNames = ({ filePath }: UseSiblingNamesProps): UseSiblingNamesReturn => {
  const { data: filesData, isLoading } = useListFilesQuery({ recursive: true });

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
