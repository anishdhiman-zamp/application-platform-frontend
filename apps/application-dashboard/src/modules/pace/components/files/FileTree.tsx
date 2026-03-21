'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FileTreeProvider } from 'modules/pace/provider/FileTreeProvider';
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
import StickyNestedTree from '@/modules/pace/components/files/StickyNestedTree';
import { useFileConflict } from '@/modules/pace/context/FileConflictContext';
import { useExpandedPaths } from '@/modules/pace/hooks/useExpandedPaths';

const ROW_HEIGHT = 32;
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

  const rawTree = useMemo(() => buildFileTree(files), [files]);

  const sortedRawTree = useMemo(() => sortTreeNodes(rawTree, sortBy, sortDirection), [rawTree, sortBy, sortDirection]);

  const originalNodeMap = useMemo(() => buildNodeMap(sortedRawTree), [sortedRawTree]);

  const treeData = useMemo(() => {
    const filtered = filterTreeNodes(sortedRawTree, searchQuery);

    return sortTreeNodes(filtered, sortBy, sortDirection);
  }, [sortedRawTree, searchQuery, sortBy, sortDirection]);

  const flatNodes = useMemo(() => flattenTree(treeData, expandedPaths, ROW_HEIGHT), [treeData, expandedPaths]);
  const rootSiblingNames = useMemo(() => treeData.map((node) => node.name), [treeData]);

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

  const virtualizer = useVirtualizer({
    count: flatNodes.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN_COUNT,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const visibleStart = virtualItems.length > 0 ? virtualItems[0].index : 0;
  const visibleEnd = virtualItems.length > 0 ? virtualItems[virtualItems.length - 1].index : 0;

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

  useEffect(() => {
    if (onCollapseAllChange) {
      onCollapseAllChange(collapseAll);
    }
  }, [onCollapseAllChange, collapseAll]);

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
      <div ref={containerRef} className='min-h-0 flex-1 overflow-auto px-3' onDragLeave={handleContainerDragLeave}>
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          <StickyNestedTree
            treeData={treeData}
            expandedPaths={expandedPaths}
            selectedPath={selectedPath}
            originalNodeMap={originalNodeMap}
            rowHeight={ROW_HEIGHT}
            visibleStart={visibleStart}
            visibleEnd={visibleEnd}
            onToggleExpand={handleToggleExpand}
            onSelect={handleSelect}
            onFileMoved={onFileMoved}
            onFileDeleted={onFileDeleted}
            onFileCreated={onFileCreated}
            onUploadFiles={onUploadFiles}
            onTriggerFileUpload={triggerFileUpload}
            onTriggerFolderUpload={triggerFolderUpload}
            onDragOverFolderChange={handleDragOverFolderChange}
            isSearchActive={!!searchQuery}
          />
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
