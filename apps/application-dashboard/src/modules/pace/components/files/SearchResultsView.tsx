'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  FILE_TYPE,
  type FileItem,
  type SortDirection,
  type SortOption,
  type TreeNode,
} from '@/modules/pace/components/files/file-tree.types';
import { buildNodeMap, buildSubtreeFromFiles, sortTreeNodes } from '@/modules/pace/components/files/file-tree.utils';
import FileTreeNode from '@/modules/pace/components/files/FileTreeNode';
import SearchResultRow from '@/modules/pace/components/files/SearchResultRow';

const SEARCH_ROOT_HEIGHT = 48;
const CHILD_ROW_HEIGHT = 32;
const OVERSCAN_COUNT = 10;

const SEARCH_ENTRY_KIND = {
  ROOT: 'search-root',
  CHILD: 'child',
} as const;

const EXPAND_KEY_ROOT_PREFIX = 'root';
const EXPAND_KEY_SEPARATOR = '::';

interface ChildEntry {
  kind: typeof SEARCH_ENTRY_KIND.CHILD;
  node: TreeNode;
  depth: number;
  siblingNames: string[];
  parentPath: string | null;
  expandKey: string;
}

interface RootEntry {
  kind: typeof SEARCH_ENTRY_KIND.ROOT;
  node: FileItem;
  expandKey: string;
}

type FlatSearchEntry = RootEntry | ChildEntry;

interface SearchResultsViewProps {
  searchQuery: string;
  searchResults: FileItem[];
  files: FileItem[];
  sortBy: SortOption;
  sortDirection: SortDirection;
  selectedPath: string | null;
  loadingFolders?: Set<string>;
  loadedFolders?: Set<string>;
  onLoadFolder?: (path: string, options?: { silent?: boolean }) => Promise<boolean>;
  onSelect: (path: string) => void;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
  onFileDeleted?: (deletedPath: string) => void;
  onFileCreated?: (newFile: FileItem) => void;
  onUploadFiles?: (files: FileList, targetPath: string) => void;
  onTriggerFileUpload: (targetPath: string) => void;
  onTriggerFolderUpload: (targetPath: string) => void;
  onDragOverFolderChange: (path: string | null) => void;
}

const SearchResultsView = ({
  searchQuery,
  searchResults,
  files,
  sortBy,
  sortDirection,
  selectedPath,
  loadingFolders,
  loadedFolders,
  onLoadFolder,
  onSelect,
  onFileMoved,
  onFileDeleted,
  onFileCreated,
  onUploadFiles,
  onTriggerFileUpload,
  onTriggerFolderUpload,
  onDragOverFolderChange,
}: SearchResultsViewProps) => {
  // State
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // Derived State
  const sortedResults = useMemo(() => {
    const asTreeNodes: TreeNode[] = searchResults.map((file) => ({
      path: file.path,
      name: file.name,
      type: file.type,
      size: file.size,
      mtime_ms: file.mtime_ms,
      owner: file.owner,
      children: file.type === FILE_TYPE.DIRECTORY ? [] : undefined,
    }));

    return sortTreeNodes(asTreeNodes, sortBy, sortDirection);
  }, [searchResults, sortBy, sortDirection]);

  const { flatEntries, originalNodeMap } = useMemo(() => {
    const entries: FlatSearchEntry[] = [];
    const subtreeRoots: TreeNode[] = [];

    const pushSubtree = (nodes: TreeNode[], depth: number, parentPath: string | null, parentExpandKey: string) => {
      const siblingNames = nodes.map((n) => n.name);

      for (const node of nodes) {
        const expandKey = `${parentExpandKey}${EXPAND_KEY_SEPARATOR}${node.path}`;

        entries.push({ kind: SEARCH_ENTRY_KIND.CHILD, node, depth, siblingNames, parentPath, expandKey });

        if (node.children && expandedKeys.has(expandKey)) {
          pushSubtree(node.children, depth + 1, node.path, expandKey);
        }
      }
    };

    for (const result of sortedResults) {
      const rootExpandKey = `${EXPAND_KEY_ROOT_PREFIX}${EXPAND_KEY_SEPARATOR}${result.path}`;

      entries.push({ kind: SEARCH_ENTRY_KIND.ROOT, node: result, expandKey: rootExpandKey });

      if (result.type === FILE_TYPE.DIRECTORY && expandedKeys.has(rootExpandKey)) {
        const subtree = sortTreeNodes(buildSubtreeFromFiles(files, result.path), sortBy, sortDirection);

        subtreeRoots.push(...subtree);
        pushSubtree(subtree, 1, result.path, rootExpandKey);
      }
    }

    return { flatEntries: entries, originalNodeMap: buildNodeMap(subtreeRoots) };
  }, [sortedResults, files, expandedKeys, sortBy, sortDirection]);

  const virtualizer = useVirtualizer({
    count: flatEntries.length,
    getScrollElement: () => containerRef.current,
    estimateSize: (index) =>
      flatEntries[index]?.kind === SEARCH_ENTRY_KIND.ROOT ? SEARCH_ROOT_HEIGHT : CHILD_ROW_HEIGHT,
    overscan: OVERSCAN_COUNT,
    getItemKey: (index) => flatEntries[index]?.expandKey ?? index,
  });

  const handleToggleByKey = useCallback(
    (expandKey: string, path: string) => {
      let isCollapsing = false;

      setExpandedKeys((prev) => {
        const next = new Set(prev);

        if (next.has(expandKey)) {
          isCollapsing = true;
          next.delete(expandKey);

          const prefix = expandKey + EXPAND_KEY_SEPARATOR;

          for (const k of prev) {
            if (k.startsWith(prefix)) next.delete(k);
          }
        } else {
          next.add(expandKey);
        }

        return next;
      });

      if (!isCollapsing && onLoadFolder && loadedFolders && loadingFolders) {
        if (!loadedFolders.has(path) && !loadingFolders.has(path)) {
          onLoadFolder(path);
        }
      }
    },
    [onLoadFolder, loadedFolders, loadingFolders],
  );

  useEffect(() => {
    setExpandedKeys(new Set());
  }, [searchQuery]);

  if (searchResults.length === 0) return null;

  return (
    <div className='flex h-full flex-col'>
      <div className='f-12-450 text-GRAY_900 shrink-0 px-2 py-1.5'>
        {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for &ldquo;{searchQuery}&rdquo;
      </div>
      <div ref={containerRef} className='min-h-0 flex-1 overflow-x-hidden overflow-y-auto [scrollbar-width:thin]'>
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const entry = flatEntries[virtualRow.index];

            if (!entry) return null;

            const isExpanded = expandedKeys.has(entry.expandKey);
            const perEntryExpandedPaths = isExpanded
              ? new Set<string>([entry.node.path])
              : (EMPTY_EXPANDED_PATHS as Set<string>);

            const handleToggleForEntry = () => {
              handleToggleByKey(entry.expandKey, entry.node.path);
            };

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {entry.kind === SEARCH_ENTRY_KIND.ROOT ? (
                  <SearchResultRow
                    node={entry.node}
                    searchHighlight={searchQuery}
                    isExpanded={isExpanded}
                    isSelected={selectedPath === entry.node.path}
                    isLoadingChildren={loadingFolders?.has(entry.node.path) ?? false}
                    onToggleExpand={handleToggleForEntry}
                    onSelect={onSelect}
                  />
                ) : (
                  <FileTreeNode
                    node={entry.node}
                    depth={entry.depth}
                    expandedPaths={perEntryExpandedPaths}
                    selectedPath={selectedPath}
                    originalNodeMap={originalNodeMap}
                    siblingNames={entry.siblingNames}
                    parentPath={entry.parentPath}
                    onToggleExpand={handleToggleForEntry}
                    onSelect={onSelect}
                    onFileMoved={onFileMoved}
                    onFileDeleted={onFileDeleted}
                    onFileCreated={onFileCreated}
                    onUploadFiles={onUploadFiles}
                    onTriggerFileUpload={onTriggerFileUpload}
                    onTriggerFolderUpload={onTriggerFolderUpload}
                    onDragOverFolderChange={onDragOverFolderChange}
                    isSearchActive
                    isLoadingChildren={loadingFolders?.has(entry.node.path) ?? false}
                    style={{ height: CHILD_ROW_HEIGHT }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const EMPTY_EXPANDED_PATHS: ReadonlySet<string> = new Set();

export default SearchResultsView;
