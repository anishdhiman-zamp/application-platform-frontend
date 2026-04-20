'use client';

import { memo, useMemo, useRef, useState } from 'react';
import {
  type ContextMenuAction,
  FILE_TYPE,
  type FileItem,
  type TreeNode,
} from '@/modules/pace/components/files/file-tree.types';
import FileInfoPopover from '@/modules/pace/components/files/FileInfoPopover';
import { CONTEXT_MENU_ACTIONS, SEARCH_ALLOWED_ACTIONS } from '@/modules/pace/components/files/files.constants';
import SearchResultRow from '@/modules/pace/components/files/SearchResultRow';
import { useFileTreeNodeActions } from '@/modules/pace/hooks/useFileTreeNodeActions';

interface SearchResultRootNodeProps {
  node: FileItem;
  searchHighlight: string;
  isExpanded: boolean;
  isSelected: boolean;
  isLoadingChildren: boolean;
  onToggleExpand: (path: string) => void;
  onSelect: (path: string) => void;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
  onFileDeleted?: (deletedPath: string) => void;
  onFileCreated?: (newFile: FileItem) => void;
}

const SearchResultRootNode = memo(function SearchResultRootNode({
  node,
  searchHighlight,
  isExpanded,
  isSelected,
  isLoadingChildren,
  onToggleExpand,
  onSelect,
  onFileMoved,
  onFileDeleted,
  onFileCreated,
}: SearchResultRootNodeProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const isFolder = node.type === FILE_TYPE.DIRECTORY;

  const treeNode: TreeNode = useMemo(
    () => ({
      path: node.path,
      name: node.name,
      type: node.type,
      size: node.size,
      mtime_ms: node.mtime_ms,
      owner: node.owner,
      children: isFolder ? [] : undefined,
    }),
    [node.path, node.name, node.type, node.size, node.mtime_ms, node.owner, isFolder],
  );

  const filteredActions: ContextMenuAction[] = useMemo(
    () =>
      CONTEXT_MENU_ACTIONS.filter((action) => {
        if (!SEARCH_ALLOWED_ACTIONS.has(action.id)) return false;
        if (action.fileOnly && isFolder) return false;
        if (action.folderOnly && !isFolder) return false;

        return true;
      }),
    [isFolder],
  );

  const handleShowInfo = () => {
    requestAnimationFrame(() => setIsInfoOpen(true));
  };

  const { handleActionClick } = useFileTreeNodeActions({
    node: treeNode,
    isExpanded,
    childrenNames: [],
    siblingNames: [],
    onToggleExpand,
    onStartRename: () => {},
    onOpenCreateModal: () => {},
    onCloseContextMenu: () => {},
    onFileMoved,
    onFileDeleted,
    onFileCreated,
    onShowInfo: handleShowInfo,
  });

  return (
    <>
      <FileInfoPopover node={treeNode} anchorRef={rowRef} open={isInfoOpen} onOpenChange={setIsInfoOpen} />
      <SearchResultRow
        ref={rowRef}
        node={node}
        searchHighlight={searchHighlight}
        isExpanded={isExpanded}
        isSelected={isSelected}
        isLoadingChildren={isLoadingChildren}
        actions={filteredActions}
        onActionClick={handleActionClick}
        onToggleExpand={onToggleExpand}
        onSelect={onSelect}
      />
    </>
  );
});

export default SearchResultRootNode;
