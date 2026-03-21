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
  onToggleExpand: (path: string) => void;
  onSelect: (path: string) => void;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
  onFileDeleted?: (deletedPath: string) => void;
  onFileCreated?: (newFile: FileItem) => void;
  onUploadFiles?: (files: FileList, targetPath: string) => void;
  onTriggerFileUpload: (targetPath: string) => void;
  onTriggerFolderUpload: (targetPath: string) => void;
  onDragOverFolderChange: (path: string | null) => void;
  isSearchActive: boolean;
}

interface RenderContext {
  expandedPaths: Set<string>;
  selectedPath: string | null;
  originalNodeMap: Map<string, TreeNode>;
  rowHeight: number;
  visibleStart: number;
  visibleEnd: number;
  descendantCounts: Map<string, number>;
  onToggleExpand: (path: string) => void;
  onSelect: (path: string) => void;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
  onFileDeleted?: (deletedPath: string) => void;
  onFileCreated?: (newFile: FileItem) => void;
  onUploadFiles?: (files: FileList, targetPath: string) => void;
  onTriggerFileUpload: (targetPath: string) => void;
  onTriggerFolderUpload: (targetPath: string) => void;
  onDragOverFolderChange: (path: string | null) => void;
  isSearchActive: boolean;
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
  ancestorIsLast: boolean[],
  flatIndexStart: number,
): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const siblingNames = getSiblingNames(nodes);
  let runningTop = 0;
  let flatIndex = flatIndexStart;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const isLastChild = i === nodes.length - 1;
    const descendantCount = ctx.descendantCounts.get(node.path) ?? 1;
    const totalHeight = descendantCount * ctx.rowHeight;
    const nodeStartIndex = flatIndex;
    const nodeEndIndex = flatIndex + descendantCount - 1;

    flatIndex += descendantCount;

    if (nodeEndIndex < ctx.visibleStart || nodeStartIndex > ctx.visibleEnd) {
      runningTop += totalHeight;
      continue;
    }

    const isExpandedFolder =
      node.type === FILE_TYPE.DIRECTORY &&
      node.children &&
      node.children.length > 0 &&
      ctx.expandedPaths.has(node.path);

    if (isExpandedFolder) {
      const childAncestorIsLast = [...ancestorIsLast, isLastChild];
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
            className='bg-BG_GRAY_2 sticky-folder-row'
            style={{
              position: 'sticky',
              top: depth * ctx.rowHeight,
              zIndex: MAX_STICKY_Z_INDEX - depth,
              height: ctx.rowHeight,
            }}
          >
            <FileTreeNode
              node={node}
              depth={depth}
              ancestorIsLast={ancestorIsLast}
              isLastChild={isLastChild}
              expandedPaths={ctx.expandedPaths}
              selectedPath={ctx.selectedPath}
              originalNodeMap={ctx.originalNodeMap}
              siblingNames={siblingNames}
              parentPath={parentPath}
              onToggleExpand={ctx.onToggleExpand}
              onSelect={ctx.onSelect}
              onFileMoved={ctx.onFileMoved}
              onFileDeleted={ctx.onFileDeleted}
              onFileCreated={ctx.onFileCreated}
              onUploadFiles={ctx.onUploadFiles}
              onTriggerFileUpload={ctx.onTriggerFileUpload}
              onTriggerFolderUpload={ctx.onTriggerFolderUpload}
              onDragOverFolderChange={ctx.onDragOverFolderChange}
              isSearchActive={ctx.isSearchActive}
              style={{ height: ctx.rowHeight }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              top: ctx.rowHeight,
              width: '100%',
              height: totalHeight - ctx.rowHeight,
            }}
          >
            {renderSiblings(node.children!, ctx, depth + 1, node.path, childAncestorIsLast, childFlatIndexStart)}
          </div>
        </div>,
      );
    } else {
      result.push(
        <div
          key={node.path}
          style={{
            position: 'absolute',
            top: runningTop,
            width: '100%',
            height: ctx.rowHeight,
          }}
        >
          <FileTreeNode
            node={node}
            depth={depth}
            ancestorIsLast={ancestorIsLast}
            isLastChild={isLastChild}
            expandedPaths={ctx.expandedPaths}
            selectedPath={ctx.selectedPath}
            originalNodeMap={ctx.originalNodeMap}
            siblingNames={siblingNames}
            parentPath={parentPath}
            onToggleExpand={ctx.onToggleExpand}
            onSelect={ctx.onSelect}
            onFileMoved={ctx.onFileMoved}
            onFileDeleted={ctx.onFileDeleted}
            onFileCreated={ctx.onFileCreated}
            onUploadFiles={ctx.onUploadFiles}
            onTriggerFileUpload={ctx.onTriggerFileUpload}
            onTriggerFolderUpload={ctx.onTriggerFolderUpload}
            onDragOverFolderChange={ctx.onDragOverFolderChange}
            isSearchActive={ctx.isSearchActive}
            style={{ height: ctx.rowHeight }}
          />
        </div>,
      );
    }

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
    onToggleExpand,
    onSelect,
    onFileMoved,
    onFileDeleted,
    onFileCreated,
    onUploadFiles,
    onTriggerFileUpload,
    onTriggerFolderUpload,
    onDragOverFolderChange,
    isSearchActive,
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
      descendantCounts,
      onToggleExpand,
      onSelect,
      onFileMoved,
      onFileDeleted,
      onFileCreated,
      onUploadFiles,
      onTriggerFileUpload,
      onTriggerFolderUpload,
      onDragOverFolderChange,
      isSearchActive,
    }),
    [
      expandedPaths,
      selectedPath,
      originalNodeMap,
      rowHeight,
      visibleStart,
      visibleEnd,
      descendantCounts,
      onToggleExpand,
      onSelect,
      onFileMoved,
      onFileDeleted,
      onFileCreated,
      onUploadFiles,
      onTriggerFileUpload,
      onTriggerFolderUpload,
      onDragOverFolderChange,
      isSearchActive,
    ],
  );

  return <>{renderSiblings(treeData, ctx, 0, null, [], 0)}</>;
});

export default StickyNestedTree;
