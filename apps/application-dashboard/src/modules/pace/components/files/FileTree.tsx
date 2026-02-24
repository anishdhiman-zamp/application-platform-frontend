'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type FileItem, type FileTreeProps } from '@/modules/pace/components/files/file-tree.types';
import {
  buildFileTree,
  buildNodeMap,
  filterTreeNodes,
  flattenTree,
  sortTreeNodes,
} from '@/modules/pace/components/files/file-tree.utils';
import FileConflictModal from '@/modules/pace/components/files/FileConflictModal';
import FileTreeEmptyState from '@/modules/pace/components/files/FileTreeEmptyState';
import FileTreeNode from '@/modules/pace/components/files/FileTreeNode';
import { useFileConflict } from '@/modules/pace/context/FileConflictContext';
import { useExpandedPaths } from '@/modules/pace/hooks/useExpandedPaths';
import { FileTreeProvider } from '@/modules/pace/provider/FileTreeProvider';

const ROW_HEIGHT = 36;
const OVERSCAN_COUNT = 10;

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
  onUploadFiles,
  onUploadFolder,
  onCollapseAllChange,
}: FileTreeProps) => {
  const { conflict, resolveConflict, cancelConflict } = useFileConflict();
  const { expandedPaths, toggleExpand, collapseAll } = useExpandedPaths({ files });

  const [internalSelectedPath, setInternalSelectedPath] = useState<string | null>(null);
  const [uploadTargetPath, setUploadTargetPath] = useState<string>('');
  const [dragOverFolderPath, setDragOverFolderPath] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const selectedPath = controlledSelectedPath ?? internalSelectedPath;

  const triggerFileUpload = useCallback((targetPath: string) => {
    setUploadTargetPath(targetPath);
    fileInputRef.current?.click();
  }, []);

  const triggerFolderUpload = useCallback((targetPath: string) => {
    setUploadTargetPath(targetPath);
    folderInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length && onUploadFiles) {
        onUploadFiles(e.target.files, uploadTargetPath);
      }
      e.target.value = '';
    },
    [uploadTargetPath, onUploadFiles],
  );

  const handleFolderInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length && onUploadFolder) {
        onUploadFolder(e.target.files, uploadTargetPath);
      }
      e.target.value = '';
    },
    [uploadTargetPath, onUploadFolder],
  );

  const filesMap = useMemo(() => {
    const map = new Map<string, FileItem>();

    files.forEach((file) => map.set(file.path, file));

    return map;
  }, [files]);

  useEffect(() => {
    if (onCollapseAllChange) {
      onCollapseAllChange(collapseAll);
    }
  }, [onCollapseAllChange, collapseAll]);

  const rawTree = useMemo(() => buildFileTree(files), [files]);
  const sortedRawTree = useMemo(() => sortTreeNodes(rawTree, sortBy, sortDirection), [rawTree, sortBy, sortDirection]);
  const originalNodeMap = useMemo(() => buildNodeMap(sortedRawTree), [sortedRawTree]);

  const treeData = useMemo(() => {
    const filtered = filterTreeNodes(sortedRawTree, searchQuery);

    return sortTreeNodes(filtered, sortBy, sortDirection);
  }, [sortedRawTree, searchQuery, sortBy, sortDirection]);

  const flatNodes = useMemo(() => flattenTree(treeData, expandedPaths), [treeData, expandedPaths]);

  const rootSiblingNames = useMemo(() => treeData.map((node) => node.name), [treeData]);

  const virtualizer = useVirtualizer({
    count: flatNodes.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN_COUNT,
  });

  const handleToggleExpand = useCallback(
    (path: string) => {
      toggleExpand(path);
    },
    [toggleExpand],
  );

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

  const handleDragOverFolderChange = useCallback((path: string | null) => {
    setDragOverFolderPath(path);
  }, []);

  const handleContainerDragLeave = useCallback((e: React.DragEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setDragOverFolderPath(null);
    }
  }, []);

  const dragOverlayBounds = useMemo(() => {
    if (!dragOverFolderPath) return null;

    const folderIndex = flatNodes.findIndex((n) => n.path === dragOverFolderPath);

    if (folderIndex === -1) return null;

    let lastChildIndex = folderIndex;

    for (let i = folderIndex + 1; i < flatNodes.length; i++) {
      if (flatNodes[i].path.startsWith(dragOverFolderPath + '/')) {
        lastChildIndex = i;
      } else {
        break;
      }
    }

    const startY = folderIndex * ROW_HEIGHT;
    const endY = (lastChildIndex + 1) * ROW_HEIGHT;

    return {
      top: startY,
      height: endY - startY,
    };
  }, [dragOverFolderPath, flatNodes]);

  if (treeData.length === 0 && searchQuery) {
    return <FileTreeEmptyState />;
  }

  return (
    <div className='flex h-full flex-col'>
      <input ref={fileInputRef} type='file' multiple className='hidden' onChange={handleFileInputChange} />
      <input
        ref={folderInputRef}
        type='file'
        multiple
        className='hidden'
        onChange={handleFolderInputChange}
        {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
      />
      <div ref={containerRef} className='min-h-0 flex-1 overflow-auto px-3 py-2' onDragLeave={handleContainerDragLeave}>
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const node = flatNodes[virtualRow.index];

            return (
              <FileTreeNode
                key={node.path}
                node={node}
                depth={node.depth}
                expandedPaths={expandedPaths}
                selectedPath={selectedPath}
                originalNodeMap={originalNodeMap}
                siblingNames={node.siblingNames}
                parentPath={node.parentPath}
                onToggleExpand={handleToggleExpand}
                onSelect={handleSelect}
                onFileMoved={onFileMoved}
                onFileDeleted={onFileDeleted}
                onFileCreated={onFileCreated}
                onUploadFiles={onUploadFiles}
                onUploadFolder={onUploadFolder}
                onTriggerFileUpload={triggerFileUpload}
                onTriggerFolderUpload={triggerFolderUpload}
                onDragOverFolderChange={handleDragOverFolderChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              />
            );
          })}
          {dragOverlayBounds && (
            <div
              className='border-GRAY_700 pointer-events-none absolute right-0 left-0 rounded-md border-2 border-dotted'
              style={{
                top: dragOverlayBounds.top,
                height: dragOverlayBounds.height,
              }}
            />
          )}
        </div>
      </div>
      <FileConflictModal
        isOpen={!!conflict}
        conflict={conflict}
        onResolve={handleConflictResolve}
        onCancel={cancelConflict}
      />
    </div>
  );
};

const FileTree = (props: FileTreeProps) => {
  return (
    <FileTreeProvider onFileMoved={props.onFileMoved}>
      <FileTreeContent {...props} />
    </FileTreeProvider>
  );
};

export default FileTree;
