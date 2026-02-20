'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import {
  CLIPBOARD_OPERATION,
  CONFLICT_RESOLUTION,
  type ConflictResolution,
  type DropToSiblingData,
  type FileConflict,
  type FileItem,
  type FileTreeProps,
} from '@/modules/pace/components/files/file-tree.types';
import {
  buildFileTree,
  buildNodeMap,
  filterTreeNodes,
  generateKeepBothName,
  sortTreeNodes,
} from '@/modules/pace/components/files/file-tree.utils';
import FileConflictModal from '@/modules/pace/components/files/FileConflictModal';
import FileTreeEmptyState from '@/modules/pace/components/files/FileTreeEmptyState';
import FileTreeNode from '@/modules/pace/components/files/FileTreeNode';
import { useFileActions } from '@/modules/pace/hooks/useFileActions';
import { FileClipboardProvider } from '@/modules/pace/hooks/useFileClipboard';

const FileTreeContent = ({
  files,
  searchQuery,
  sortBy,
  sortDirection,
  selectedPath: controlledSelectedPath,
  onSelectFile,
}: FileTreeProps) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [internalSelectedPath, setInternalSelectedPath] = useState<string | null>(null);
  const [fileConflict, setFileConflict] = useState<FileConflict | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { copyItem, moveItem, deleteItem } = useFileActions();

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
  const rootSiblingNames = useMemo(() => treeData.map((node) => node.name), [treeData]);

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

  const handleDropToRootSibling = useCallback(
    async (data: DropToSiblingData) => {
      const { sourcePath, sourceName, isCopy } = data;

      // Skip if already at root level
      if (!sourcePath.includes('/')) {
        return;
      }

      const destinationPath = sourceName;

      // Skip if moving to the same location (no-op)
      if (!isCopy && sourcePath === destinationPath) {
        return;
      }

      const hasConflict = rootSiblingNames.includes(sourceName);
      const operation = isCopy ? CLIPBOARD_OPERATION.COPY : 'move';

      if (hasConflict) {
        setFileConflict({
          sourcePath,
          sourceName,
          destinationPath,
          operation,
        });

        return;
      }

      try {
        if (isCopy) {
          await copyItem(sourcePath, destinationPath);
        } else {
          await moveItem(sourcePath, destinationPath);
        }
      } catch (error) {
        captureException(error);
        toast.error('Failed to move/copy');
      }
    },
    [copyItem, moveItem, rootSiblingNames],
  );

  const handleRootDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = e.altKey ? 'copy' : 'move';
  }, []);

  const handleRootDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleRootDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();

      try {
        const rawData = e.dataTransfer.getData('application/json');

        if (!rawData) {
          return;
        }

        const data = JSON.parse(rawData);

        if (!data?.path || !data?.name) {
          return;
        }

        const sourcePath = data.path;
        const sourceName = data.name;

        // Skip if already at root level
        if (!sourcePath.includes('/')) {
          return;
        }

        const destinationPath = sourceName;

        // Skip if moving to the same location (no-op)
        if (!e.altKey && sourcePath === destinationPath) {
          return;
        }

        const hasConflict = rootSiblingNames.includes(sourceName);
        const operation = e.altKey ? CLIPBOARD_OPERATION.COPY : 'move';

        if (hasConflict) {
          setFileConflict({
            sourcePath,
            sourceName,
            destinationPath,
            operation,
          });

          return;
        }

        if (e.altKey) {
          await copyItem(sourcePath, destinationPath);
        } else {
          await moveItem(sourcePath, destinationPath);
        }
      } catch (error) {
        captureException(error);
        toast.error('Failed to move/copy');
      }
    },
    [copyItem, moveItem, rootSiblingNames],
  );

  const handleRootConflictResolve = useCallback(
    async (resolution: ConflictResolution) => {
      if (!fileConflict) return;

      const { sourcePath, sourceName, destinationPath, operation } = fileConflict;

      // Close dialog immediately for better UX
      setFileConflict(null);

      try {
        if (resolution === CONFLICT_RESOLUTION.KEEP_BOTH) {
          const newName = generateKeepBothName(sourceName, rootSiblingNames);

          if (operation === CLIPBOARD_OPERATION.COPY) {
            await copyItem(sourcePath, newName);
          } else {
            await moveItem(sourcePath, newName);
          }
        } else if (resolution === CONFLICT_RESOLUTION.REPLACE) {
          deleteItem(destinationPath);

          if (operation === CLIPBOARD_OPERATION.COPY) {
            await copyItem(sourcePath, destinationPath);
          } else {
            await moveItem(sourcePath, destinationPath);
          }
        }
      } catch (error) {
        captureException(error);
        toast.error('Failed to resolve conflict');
      }
    },
    [fileConflict, rootSiblingNames, copyItem, moveItem, deleteItem],
  );

  if (treeData.length === 0 && searchQuery) {
    return <FileTreeEmptyState />;
  }

  return (
    <>
      <div
        ref={containerRef}
        className={cn('flex h-full flex-col gap-0.5 px-3 py-2')}
        onDragOver={handleRootDragOver}
        onDragLeave={handleRootDragLeave}
        onDrop={handleRootDrop}
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
            parentPath={null}
            onToggleExpand={handleToggleExpand}
            onSelect={handleSelect}
            onDropToSibling={handleDropToRootSibling}
          />
        ))}
      </div>
      <FileConflictModal
        isOpen={!!fileConflict}
        conflict={fileConflict}
        onResolve={handleRootConflictResolve}
        onCancel={() => setFileConflict(null)}
      />
    </>
  );
};

const FileTree = (props: FileTreeProps) => {
  return (
    <FileClipboardProvider>
      <FileTreeContent {...props} />
    </FileClipboardProvider>
  );
};

export default FileTree;
