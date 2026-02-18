'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FileItem, FileTreeProps } from 'modules/pace/components/files/file-tree.types';
import {
  buildFileTree,
  filterTreeNodes,
  getExpandedPathsForSearch,
  sortTreeNodes,
} from 'modules/pace/components/files/file-tree.utils';
import FileTreeNode from 'modules/pace/components/files/FileTreeNode';

const FileTree = ({
  files,
  searchQuery,
  sortBy,
  sortDirection,
  selectedPath: controlledSelectedPath,
  onSelectFile,
}: FileTreeProps) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [internalSelectedPath, setInternalSelectedPath] = useState<string | null>(null);

  const selectedPath = controlledSelectedPath ?? internalSelectedPath;

  const filesMap = useMemo(() => {
    const map = new Map<string, FileItem>();

    files.forEach((file) => map.set(file.path, file));

    return map;
  }, [files]);

  const treeData = useMemo(() => {
    const tree = buildFileTree(files);
    const filtered = filterTreeNodes(tree, searchQuery);
    const sorted = sortTreeNodes(filtered, sortBy, sortDirection);

    return sorted;
  }, [files, searchQuery, sortBy, sortDirection]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const tree = buildFileTree(files);
      const pathsToExpand = getExpandedPathsForSearch(tree, searchQuery);

      setExpandedPaths((prev) => {
        const newSet = new Set(prev);

        pathsToExpand.forEach((path) => newSet.add(path));

        return newSet;
      });
    }
  }, [searchQuery, files]);

  const handleToggleExpand = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }

      return newSet;
    });
  }, []);

  const handleSelect = useCallback(
    (path: string) => {
      const file = filesMap.get(path) ?? null;

      if (onSelectFile) {
        onSelectFile(file);
      } else {
        setInternalSelectedPath(path);
      }
    },
    [onSelectFile, filesMap],
  );

  if (treeData.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-8 text-center'>
        <p className='f-14-400 text-GRAY_600'>{searchQuery ? 'No files match your search' : 'No files found'}</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-0.5 px-3 py-2'>
      {treeData.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          depth={0}
          expandedPaths={expandedPaths}
          selectedPath={selectedPath}
          onToggleExpand={handleToggleExpand}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
};

export default FileTree;
