'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FileTreeProvider } from 'modules/pace/provider/FileTreeProvider';
import { type FileItem, type FileTreeProps } from '@/modules/pace/components/files/file-tree.types';
import {
  buildFileTree,
  buildNodeMap,
  collectAncestors,
  flattenTree,
  sortTreeNodes,
} from '@/modules/pace/components/files/file-tree.utils';
import FileConflictModal from '@/modules/pace/components/files/FileConflictModal';
import FileTreeEmptyState from '@/modules/pace/components/files/FileTreeEmptyState';
import SearchResultsView from '@/modules/pace/components/files/SearchResultsView';
import StickyNestedTree from '@/modules/pace/components/files/StickyNestedTree';
import { useFileConflict } from '@/modules/pace/context/FileConflictContext';
import { useFileTreeNavigation } from '@/modules/pace/context/FileTreeNavigationContext';
import { useExpandedPaths } from '@/modules/pace/hooks/useExpandedPaths';

const ROW_HEIGHT = 32;
const OVERSCAN_COUNT = 10;

const FileTreeContent = ({
  files,
  searchQuery,
  searchResults,
  isSearching,
  sortBy,
  sortDirection,
  selectedPath: controlledSelectedPath,
  onSelectFile,
  onOpenFile,
  onFileMoved,
  onFileDeleted,
  onFileCreated,
  onUploadFiles,
  onUploadFolder,
  onCollapseAllChange,
  loadingFolders,
  loadedFolders,
  onLoadFolder,
}: FileTreeProps) => {
  // State
  const [internalSelectedPath, setInternalSelectedPath] = useState<string | null>(null);
  const [uploadTargetPath, setUploadTargetPath] = useState<string>('');
  const [dragOverFolderPath, setDragOverFolderPath] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { conflict, resolveConflict, cancelConflict } = useFileConflict();
  const { expandedPaths, toggleExpand, expandPaths, collapseAll } = useExpandedPaths({ files });
  const { revealedPath, registerRevealHandler, revealPathInTree } = useFileTreeNavigation();

  // Derived State
  const selectedPath = controlledSelectedPath ?? revealedPath ?? internalSelectedPath;
  const pendingScrollPathRef = useRef<string | null>(null);
  const isServerSearch = !!searchQuery && searchResults !== undefined && searchResults !== null;

  const filesMap = useMemo(() => {
    const map = new Map<string, FileItem>();

    files.forEach((file) => map.set(file.path, file));
    searchResults?.forEach((file) => {
      if (!map.has(file.path)) map.set(file.path, file);
    });

    return map;
  }, [files, searchResults]);

  const rawTree = useMemo(() => buildFileTree(files), [files]);
  const sortedRawTree = useMemo(() => sortTreeNodes(rawTree, sortBy, sortDirection), [rawTree, sortBy, sortDirection]);
  const originalNodeMap = useMemo(() => buildNodeMap(sortedRawTree), [sortedRawTree]);

  const flatNodes = useMemo(() => flattenTree(sortedRawTree, expandedPaths), [sortedRawTree, expandedPaths]);
  const flatNodesRef = useRef(flatNodes);

  flatNodesRef.current = flatNodes;
  const rootSiblingNames = useMemo(() => sortedRawTree.map((node) => node.name), [sortedRawTree]);

  const virtualizer = useVirtualizer({
    count: flatNodes.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN_COUNT,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const visibleStart = virtualItems.length > 0 ? virtualItems[0].index : 0;
  const visibleEnd = virtualItems.length > 0 ? virtualItems[virtualItems.length - 1].index : flatNodes.length - 1;

  // Handlers
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

  const handleToggleExpand = useCallback(
    (path: string) => {
      const isCollapsing = expandedPaths.has(path);

      toggleExpand(path);

      if (!isCollapsing && onLoadFolder && loadedFolders && loadingFolders) {
        if (!loadedFolders.has(path) && !loadingFolders.has(path)) {
          onLoadFolder(path);
        }
      }
    },
    [toggleExpand, expandedPaths, onLoadFolder, loadedFolders, loadingFolders],
  );

  const handleSelect = useCallback(
    (path: string) => {
      const file = filesMap.get(path) ?? null;

      revealPathInTree(path);

      if (onSelectFile) {
        onSelectFile(file);
      } else {
        setInternalSelectedPath(path);
      }
    },
    [onSelectFile, filesMap, revealPathInTree],
  );

  const handleConflictResolve = useCallback(
    (resolution: Parameters<typeof resolveConflict>[0]) => {
      resolveConflict(resolution, rootSiblingNames);
    },
    [resolveConflict, rootSiblingNames],
  );

  const handleFileCreated = useCallback(
    (newFile: FileItem) => {
      revealPathInTree(newFile.path);
      onFileCreated?.(newFile);
    },
    [revealPathInTree, onFileCreated],
  );

  const handleDragOverFolderChange = useCallback((path: string | null) => {
    setDragOverFolderPath(path);
  }, []);

  const handleContainerDragLeave = useCallback((e: React.DragEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setDragOverFolderPath(null);
    }
  }, []);

  const handleContainerDragEnd = useCallback(() => {
    setDragOverFolderPath(null);
  }, []);

  const keepSelectedVisible = useCallback(() => {
    if (!selectedPath) return;
    revealPathInTree(selectedPath);
  }, [selectedPath, revealPathInTree]);

  const handleRevealPath = useCallback(
    (path: string) => {
      const ancestors = collectAncestors(path);

      pendingScrollPathRef.current = path;

      if (ancestors.length > 0) {
        expandPaths(ancestors);

        // Mirror handleToggleExpand's lazy-load behavior for each newly expanded ancestor
        // so backend folder contents get fetched, just like a manual chevron click would.
        if (onLoadFolder && loadedFolders && loadingFolders) {
          for (const ancestorPath of ancestors) {
            if (!loadedFolders.has(ancestorPath) && !loadingFolders.has(ancestorPath)) {
              onLoadFolder(ancestorPath);
            }
          }
        }
      }

      // If expansion is a no-op (ancestors already expanded), the flatNodes effect won't
      // fire — schedule the scroll attempt on the next frame as a fallback.
      requestAnimationFrame(() => {
        const pendingPath = pendingScrollPathRef.current;

        if (!pendingPath) return;

        const index = flatNodesRef.current.findIndex((n) => n.path === pendingPath);

        if (index < 0) return;

        pendingScrollPathRef.current = null;
        virtualizer.scrollToIndex(index, { align: 'center', behavior: 'smooth' });
      });
    },
    [expandPaths, virtualizer, onLoadFolder, loadedFolders, loadingFolders],
  );

  useEffect(() => {
    if (onCollapseAllChange) {
      onCollapseAllChange(collapseAll);
    }
  }, [onCollapseAllChange, collapseAll]);

  useEffect(() => {
    registerRevealHandler(handleRevealPath);

    return () => registerRevealHandler(null);
  }, [registerRevealHandler, handleRevealPath]);

  useEffect(() => {
    keepSelectedVisible();
    // Only re-run when sort changes; keepSelectedVisible captures the latest selectedPath.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortDirection]);

  useEffect(() => {
    const pendingPath = pendingScrollPathRef.current;

    if (!pendingPath) return;

    const index = flatNodes.findIndex((n) => n.path === pendingPath);

    if (index < 0) return;

    pendingScrollPathRef.current = null;
    virtualizer.scrollToIndex(index, { align: 'center', behavior: 'smooth' });
  }, [flatNodes, virtualizer]);

  if (isSearching) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-GRAY_500 f-12-400'>Searching...</div>
      </div>
    );
  }

  if (isServerSearch && searchResults && searchResults.length === 0) {
    return <FileTreeEmptyState />;
  }

  if (!isServerSearch && sortedRawTree.length === 0 && searchQuery) {
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
      {isServerSearch && searchResults ? (
        <SearchResultsView
          searchQuery={searchQuery}
          searchResults={searchResults}
          files={files}
          sortBy={sortBy}
          sortDirection={sortDirection}
          selectedPath={selectedPath}
          loadingFolders={loadingFolders}
          loadedFolders={loadedFolders}
          onLoadFolder={onLoadFolder}
          onSelect={handleSelect}
          onOpenFile={onOpenFile}
          onFileMoved={onFileMoved}
          onFileDeleted={onFileDeleted}
          onFileCreated={handleFileCreated}
          onUploadFiles={onUploadFiles}
          onTriggerFileUpload={triggerFileUpload}
          onTriggerFolderUpload={triggerFolderUpload}
          onDragOverFolderChange={handleDragOverFolderChange}
        />
      ) : (
        <div
          ref={containerRef}
          className='min-h-0 flex-1 overflow-x-hidden overflow-y-auto pt-2 pl-4 [scrollbar-width:thin]'
          onDragLeave={handleContainerDragLeave}
          onDragEnd={handleContainerDragEnd}
        >
          <div
            style={{
              height: virtualizer.getTotalSize(),
              width: '100%',
              position: 'relative',
            }}
          >
            <StickyNestedTree
              treeData={sortedRawTree}
              expandedPaths={expandedPaths}
              selectedPath={selectedPath}
              originalNodeMap={originalNodeMap}
              rowHeight={ROW_HEIGHT}
              visibleStart={visibleStart}
              visibleEnd={visibleEnd}
              dragOverFolderPath={dragOverFolderPath}
              onToggleExpand={handleToggleExpand}
              onSelect={handleSelect}
              onOpenFile={onOpenFile}
              onFileMoved={onFileMoved}
              onFileDeleted={onFileDeleted}
              onFileCreated={handleFileCreated}
              onUploadFiles={onUploadFiles}
              onTriggerFileUpload={triggerFileUpload}
              onTriggerFolderUpload={triggerFolderUpload}
              onDragOverFolderChange={handleDragOverFolderChange}
              isSearchActive={!!searchQuery}
              loadingFolders={loadingFolders}
              searchHighlight={undefined}
            />
          </div>
        </div>
      )}
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
  const { revealPathInTree } = useFileTreeNavigation();
  const { onFileMoved } = props;

  const handleFileMoved = useCallback(
    (oldPath: string, newFile: FileItem) => {
      revealPathInTree(newFile.path);
      onFileMoved?.(oldPath, newFile);
    },
    [revealPathInTree, onFileMoved],
  );

  return (
    <FileTreeProvider onFileMoved={handleFileMoved}>
      <FileTreeContent {...props} onFileMoved={handleFileMoved} />
    </FileTreeProvider>
  );
};

export default FileTree;
