'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FILE_TYPE, type FileItem } from '@/modules/pace/components/files/file-tree.types';
import { getStoredExpandedPaths, setStoredExpandedPaths } from '@/utils/localstorage';

const DEBOUNCE_DELAY_MS = 300;

interface UseExpandedPathsOptions {
  files: FileItem[];
}

interface UseExpandedPathsReturn {
  expandedPaths: Set<string>;
  toggleExpand: (path: string) => void;
  collapseAll: () => void;
}

const getInitialExpandedPaths = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();

  const storedPaths = getStoredExpandedPaths();

  return new Set(storedPaths);
};

export const useExpandedPaths = ({ files }: UseExpandedPathsOptions): UseExpandedPathsReturn => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(getInitialExpandedPaths);

  const pendingPathsRef = useRef<string[] | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback((paths: string[]) => {
    pendingPathsRef.current = paths;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (pendingPathsRef.current) {
        setStoredExpandedPaths(pendingPathsRef.current);
        pendingPathsRef.current = null;
      }
    }, DEBOUNCE_DELAY_MS);
  }, []);

  const toggleExpand = useCallback(
    (path: string) => {
      setExpandedPaths((prev) => {
        const newSet = new Set(prev);

        if (newSet.has(path)) {
          newSet.delete(path);

          const prefix = path + '/';

          for (const p of prev) {
            if (p.startsWith(prefix)) {
              newSet.delete(p);
            }
          }
        } else {
          newSet.add(path);
        }

        debouncedSave(Array.from(newSet));

        return newSet;
      });
    },
    [debouncedSave],
  );

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set());
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    pendingPathsRef.current = null;
    setStoredExpandedPaths([]);
  }, []);

  // Progressively validate: remove expanded paths for items that are
  // now known to not be directories (only check paths present in files).
  useEffect(() => {
    if (files.length === 0) return;

    const filePathMap = new Map(files.map((f) => [f.path, f]));

    setExpandedPaths((prev) => {
      if (prev.size === 0) return prev;

      let changed = false;
      const newSet = new Set<string>();

      for (const path of prev) {
        const file = filePathMap.get(path);

        if (file && file.type !== FILE_TYPE.DIRECTORY) {
          changed = true;
        } else {
          newSet.add(path);
        }
      }

      if (changed) {
        debouncedSave(Array.from(newSet));

        return newSet;
      }

      return prev;
    });
  }, [files, debouncedSave]);

  // Cleanup on unmount - save any pending changes
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (pendingPathsRef.current) {
        setStoredExpandedPaths(pendingPathsRef.current);
      }
    };
  }, []);

  return {
    expandedPaths,
    toggleExpand,
    collapseAll,
  };
};

export default useExpandedPaths;
