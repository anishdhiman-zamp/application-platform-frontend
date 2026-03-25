import { useCallback, useMemo, useState } from 'react';
import { useLazyListFilesQuery } from '@/apis/filesystem';
import { getParentPath } from '@/modules/pace/components/files/file-tree.utils';

interface UseSiblingNamesProps {
  filePath: string;
}

interface UseSiblingNamesReturn {
  siblingNames: string[];
  isLoading: boolean;
  refetchSiblings: () => Promise<string[]>;
}

/**
 * Hook to get sibling file/folder names for a given file path.
 * Fetches fresh data on demand via refetchSiblings() to avoid stale cache issues
 * (e.g. after a sibling is deleted, the old cached list would still include it).
 */
export const useSiblingNames = ({ filePath }: UseSiblingNamesProps): UseSiblingNamesReturn => {
  // State
  const [siblingNames, setSiblingNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trigger] = useLazyListFilesQuery();

  // Derived State
  const parentPath = useMemo(() => {
    if (!filePath) return '';

    const parent = getParentPath(filePath);

    return parent === '/' ? '' : parent;
  }, [filePath]);

  const extractSiblingNames = useCallback(
    (files: { path: string; name: string }[]): string[] => {
      if (!filePath) return [];

      const parentDir = getParentPath(filePath);
      const isRoot = parentDir === '/';

      return files
        .filter((file) => {
          if (isRoot) {
            return !file.path.includes('/');
          }

          const fileParent = getParentPath(file.path);

          return fileParent === parentDir;
        })
        .map((file) => file.name);
    },
    [filePath],
  );

  const refetchSiblings = useCallback(async (): Promise<string[]> => {
    if (!filePath) return [];

    setIsLoading(true);

    try {
      const result = await trigger({
        depth: 1,
        path: parentPath || undefined,
      }).unwrap();

      const names = extractSiblingNames(result.files);

      setSiblingNames(names);

      return names;
    } catch {
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [filePath, parentPath, trigger, extractSiblingNames]);

  return {
    siblingNames,
    isLoading,
    refetchSiblings,
  };
};
