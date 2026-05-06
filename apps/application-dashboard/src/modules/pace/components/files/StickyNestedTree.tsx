'use client';

import { memo, useMemo } from 'react';
import { FILE_TYPE, type FileItem, type TreeNode } from '@/modules/pace/components/files/file-tree.types';
import { buildDescendantCountMap } from '@/modules/pace/components/files/file-tree.utils';
import FileTreeNode from '@/modules/pace/components/files/FileTreeNode';

const MAX_STICKY_Z_INDEX = 20;

interface StickyNestedTreeProps {
  treeData: TreeNode[];
  expandedPaths: Set<string>;
  selectedPath: string | null;
  originalNodeMap: Map<string, TreeNode>;
  rowHeight: number;
  visibleStart: number;
  visibleEnd: number;
  dragOverFolderPath: string | null;
  onToggleExpand: (path: string) => void;
  onSelect: (path: string) => void;
  onOpenFile?: (path: string, name: string) => void;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
  onFileDeleted?: (deletedPath: string) => void;
  onFileCreated?: (newFile: FileItem) => void;
  onUploadFiles?: (files: FileList, targetPath: string) => void;
  onTriggerFileUpload: (targetPath: string) => void;
  onTriggerFolderUpload: (targetPath: string) => void;
  onDragOverFolderChange: (path: string | null) => void;
  isSearchActive: boolean;
  loadingFolders?: Set<string>;
  searchHighlight?: string;
}

interface RenderContext {
  expandedPaths: Set<string>;
  selectedPath: string | null;
  originalNodeMap: Map<string, TreeNode>;
  rowHeight: number;
  visibleStart: number;
  visibleEnd: number;
  dragOverFolderPath: string | null;
  descendantCounts: Map<string, number>;
  onToggleExpand: (path: string) => void;
  onSelect: (path: string) => void;
  onOpenFile?: (path: string, name: string) => void;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
  onFileDeleted?: (deletedPath: string) => void;
  onFileCreated?: (newFile: FileItem) => void;
  onUploadFiles?: (files: FileList, targetPath: string) => void;
  onTriggerFileUpload: (targetPath: string) => void;
  onTriggerFolderUpload: (targetPath: string) => void;
  onDragOverFolderChange: (path: string | null) => void;
  isSearchActive: boolean;
  loadingFolders?: Set<string>;
  searchHighlight?: string;
}

function getSiblingNames(nodes: TreeNode[]): string[] {
  return nodes.map((n) => n.name);
}

/**
 * Renders sibling nodes at the same depth using nested DOM containers.
 * Expanded folders become wrapper divs with position: sticky rows and
 * absolutely-positioned children containers. The browser's native sticky
 * behavior handles folder pinning during scroll.
 *
 * Tracks a running flat index to skip nodes outside the virtualizer's
 * visible range for performance.
 */
function renderSiblings(
  nodes: TreeNode[],
  ctx: RenderContext,
  depth: number,
  parentPath: string | null,
  flatIndexStart: number,
): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const siblingNames = getSiblingNames(nodes);
  let runningTop = 0;
  let flatIndex = flatIndexStart;

  for (const [nodeIndex, node] of nodes.entries()) {
    const descendantCount = ctx.descendantCounts.get(node.path) ?? 1;
    const totalHeight = descendantCount * ctx.rowHeight;
    const nodeStartIndex = flatIndex;
    const nodeEndIndex = flatIndex + descendantCount - 1;

    flatIndex += descendantCount;

    if (nodeEndIndex < ctx.visibleStart || nodeStartIndex > ctx.visibleEnd) {
      runningTop += totalHeight;
      continue;
    }

    const isFolder = node.type === FILE_TYPE.DIRECTORY && node.children && node.children.length > 0;
    const isExpanded = isFolder && ctx.expandedPaths.has(node.path);
    const isDragOver = ctx.dragOverFolderPath === node.path;
    const showRootFolderDivider = depth === 0 && nodeIndex > 0 && node.type === FILE_TYPE.DIRECTORY;
    const childFlatIndexStart = nodeStartIndex + 1;

    result.push(
      <div
        key={node.path}
        style={{
          position: 'absolute',
          top: runningTop,
          height: totalHeight,
          width: '100%',
        }}
      >
        <div
          className={isExpanded ? 'sticky-folder-row' : undefined}
          style={
            isExpanded
              ? {
                  position: 'sticky',
                  top: depth * ctx.rowHeight,
                  zIndex: MAX_STICKY_Z_INDEX - depth,
                  height: ctx.rowHeight,
                  backgroundColor: 'var(--BG_WHITE)',
                }
              : { height: ctx.rowHeight }
          }
        >
          <FileTreeNode
            node={node}
            depth={depth}
            expandedPaths={ctx.expandedPaths}
            selectedPath={ctx.selectedPath}
            originalNodeMap={ctx.originalNodeMap}
            siblingNames={siblingNames}
            parentPath={parentPath}
            onToggleExpand={ctx.onToggleExpand}
            onSelect={ctx.onSelect}
            onOpenFile={ctx.onOpenFile}
            onFileMoved={ctx.onFileMoved}
            onFileDeleted={ctx.onFileDeleted}
            onFileCreated={ctx.onFileCreated}
            onUploadFiles={ctx.onUploadFiles}
            onTriggerFileUpload={ctx.onTriggerFileUpload}
            onTriggerFolderUpload={ctx.onTriggerFolderUpload}
            onDragOverFolderChange={ctx.onDragOverFolderChange}
            isSearchActive={ctx.isSearchActive}
            isLoadingChildren={ctx.loadingFolders?.has(node.path) ?? false}
            searchHighlight={ctx.searchHighlight}
            className={showRootFolderDivider ? 'border-GRAY_200 border-t' : undefined}
            style={{ height: ctx.rowHeight }}
          />
          {isDragOver && (
            <div
              className={
                isExpanded
                  ? 'border-GRAY_700 pointer-events-none absolute inset-0 rounded-t-md border-2 border-b-0 border-dotted'
                  : 'border-GRAY_700 pointer-events-none absolute inset-0 rounded-md border-2 border-dotted'
              }
              style={{ zIndex: MAX_STICKY_Z_INDEX + 1 }}
            />
          )}
        </div>
        {isExpanded && (
          <div
            style={{
              position: 'absolute',
              top: ctx.rowHeight,
              width: '100%',
              height: totalHeight - ctx.rowHeight,
            }}
          >
            {renderSiblings(node.children!, ctx, depth + 1, node.path, childFlatIndexStart)}
            {isDragOver && (
              <div
                className='border-GRAY_700 pointer-events-none absolute inset-0 rounded-b-md border-2 border-t-0 border-dotted'
                style={{ zIndex: MAX_STICKY_Z_INDEX + 1 }}
              />
            )}
          </div>
        )}
      </div>,
    );

    runningTop += totalHeight;
  }

  return result;
}

const StickyNestedTree = memo(function StickyNestedTree(props: StickyNestedTreeProps) {
  const {
    treeData,
    expandedPaths,
    selectedPath,
    originalNodeMap,
    rowHeight,
    visibleStart,
    visibleEnd,
    dragOverFolderPath,
    onToggleExpand,
    onSelect,
    onOpenFile,
    onFileMoved,
    onFileDeleted,
    onFileCreated,
    onUploadFiles,
    onTriggerFileUpload,
    onTriggerFolderUpload,
    onDragOverFolderChange,
    isSearchActive,
    loadingFolders,
    searchHighlight,
  } = props;

  const descendantCounts = useMemo(() => buildDescendantCountMap(treeData, expandedPaths), [treeData, expandedPaths]);

  const ctx: RenderContext = useMemo(
    () => ({
      expandedPaths,
      selectedPath,
      originalNodeMap,
      rowHeight,
      visibleStart,
      visibleEnd,
      dragOverFolderPath,
      descendantCounts,
      onToggleExpand,
      onSelect,
      onOpenFile,
      onFileMoved,
      onFileDeleted,
      onFileCreated,
      onUploadFiles,
      onTriggerFileUpload,
      onTriggerFolderUpload,
      onDragOverFolderChange,
      isSearchActive,
      loadingFolders,
      searchHighlight,
    }),
    [
      expandedPaths,
      selectedPath,
      originalNodeMap,
      rowHeight,
      visibleStart,
      visibleEnd,
      dragOverFolderPath,
      descendantCounts,
      onToggleExpand,
      onSelect,
      onOpenFile,
      onFileMoved,
      onFileDeleted,
      onFileCreated,
      onUploadFiles,
      onTriggerFileUpload,
      onTriggerFolderUpload,
      onDragOverFolderChange,
      isSearchActive,
      loadingFolders,
      searchHighlight,
    ],
  );

  return <>{renderSiblings(treeData, ctx, 0, null, 0)}</>;
});

export default StickyNestedTree;
