'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FileItem } from '@/modules/pace/components/files/file-tree.types';
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
  const hasValidatedRef = useRef(false);

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

  // Validate expanded paths against actual files (remove stale paths)
  useEffect(() => {
    if (hasValidatedRef.current || files.length === 0) return;

    hasValidatedRef.current = true;

    setExpandedPaths((prev) => {
      if (prev.size === 0) return prev;

      const validPaths = Array.from(prev).filter((path) =>
        files.some((file) => file.path === path && file.type === 'directory'),
      );

      if (validPaths.length !== prev.size) {
        setStoredExpandedPaths(validPaths);

        return new Set(validPaths);
      }

      return prev;
    });
  }, [files]);

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
