'use client';

import { useCallback, useMemo, useState } from 'react';
import ImageKitImage from '@/components/ImageKitImage';
import { TEAM_MEMBERS_EMPTY_STATE } from '@/constants/icons';
import type { FileItem, FileTreeProps } from '@/modules/pace/components/files/file-tree.types';
import {
  buildFileTree,
  buildNodeMap,
  filterTreeNodes,
  sortTreeNodes,
} from '@/modules/pace/components/files/file-tree.utils';
import FileTreeNode from '@/modules/pace/components/files/FileTreeNode';

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
  const rawTree = useMemo(() => buildFileTree(files), [files]);
  const sortedRawTree = useMemo(() => sortTreeNodes(rawTree, sortBy, sortDirection), [rawTree, sortBy, sortDirection]);
  const originalNodeMap = useMemo(() => buildNodeMap(sortedRawTree), [sortedRawTree]);
  const treeData = useMemo(() => {
    const filtered = filterTreeNodes(sortedRawTree, searchQuery);

    return sortTreeNodes(filtered, sortBy, sortDirection);
  }, [sortedRawTree, searchQuery, sortBy, sortDirection]);

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

  const rootSiblingNames = useMemo(() => treeData.map((node) => node.name), [treeData]);

  if (treeData.length === 0 && searchQuery) {
    return (
      <div className='flex h-full w-full flex-col items-center justify-center gap-y-2 py-8'>
        <div className='relative flex h-[150px] w-[190px] items-center justify-center'>
          <ImageKitImage
            src={TEAM_MEMBERS_EMPTY_STATE}
            alt='No files found'
            className='h-full w-full object-cover object-center'
            width={222}
            height={181}
          />
        </div>
        <p className='f-14-400 text-GRAY_600 text-center'>No files match your search</p>
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
          originalNodeMap={originalNodeMap}
          siblingNames={rootSiblingNames}
          onToggleExpand={handleToggleExpand}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
};

export default FileTree;
