'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import type { FileItem, FileTreeProps } from '@/modules/pace/components/files/file-tree.types';
import {
  buildFileTree,
  buildNodeMap,
  filterTreeNodes,
  sortTreeNodes,
} from '@/modules/pace/components/files/file-tree.utils';
import FileConflictModal from '@/modules/pace/components/files/FileConflictModal';
import FileTreeEmptyState from '@/modules/pace/components/files/FileTreeEmptyState';
import FileTreeNode from '@/modules/pace/components/files/FileTreeNode';
import { FileClipboardProvider } from '@/modules/pace/hooks/useFileClipboard';
import { FileConflictProvider, useFileConflict } from '@/modules/pace/hooks/useFileConflict';
import { useFileTreeRootDragDrop } from '@/modules/pace/hooks/useFileTreeRootDragDrop';
import { ProtectedFoldersProvider } from '@/modules/pace/hooks/useProtectedFolders';

const FileTreeContent = ({
  files,
  searchQuery,
  sortBy,
  sortDirection,
  selectedPath: controlledSelectedPath,
  onSelectFile,
  onFileMoved,
  onFileDeleted,
  onFileCreated,
}: FileTreeProps) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [internalSelectedPath, setInternalSelectedPath] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPath = controlledSelectedPath ?? internalSelectedPath;

  const { conflict, resolveConflict, cancelConflict } = useFileConflict();

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

  const rootSiblingNames = useMemo(() => treeData.map((node) => node.name), [treeData]);

  const { handleDropToRootSibling } = useFileTreeRootDragDrop({
    rootSiblingNames,
    containerRef,
    onFileMoved,
  });

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

  const handleConflictResolve = useCallback(
    (resolution: Parameters<typeof resolveConflict>[0]) => {
      resolveConflict(resolution, rootSiblingNames);
    },
    [resolveConflict, rootSiblingNames],
  );

  if (treeData.length === 0 && searchQuery) {
    return <FileTreeEmptyState />;
  }

  return (
    <>
      <div
        ref={containerRef}
        className={cn('flex h-full flex-col gap-0.5 px-3 py-2')}
        // onDragOver={handleRootDragOver}
        // onDragLeave={handleRootDragLeave}
        // onDrop={handleRootDrop}
      >
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
            onDropToSibling={handleDropToRootSibling}
            onFileMoved={onFileMoved}
            onFileDeleted={onFileDeleted}
            onFileCreated={onFileCreated}
          />
        ))}
      </div>
      <FileConflictModal
        isOpen={!!conflict}
        conflict={conflict}
        onResolve={handleConflictResolve}
        onCancel={cancelConflict}
      />
    </>
  );
};

const FileTree = (props: FileTreeProps) => {
  return (
    <ProtectedFoldersProvider>
      <FileClipboardProvider>
        <FileConflictProvider onFileMoved={props.onFileMoved}>
          <FileTreeContent {...props} />
        </FileConflictProvider>
      </FileClipboardProvider>
    </ProtectedFoldersProvider>
  );
};

export default FileTree;
