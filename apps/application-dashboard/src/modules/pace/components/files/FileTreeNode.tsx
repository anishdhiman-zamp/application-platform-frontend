'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useFileClipboard } from 'modules/pace/hooks/useFileClipboard';
import { useFileTreeNodeActions } from 'modules/pace/hooks/useFileTreeNodeActions';
import { useFileTreeNodeDragDrop } from 'modules/pace/hooks/useFileTreeNodeDragDrop';
import { useFileTreeNodeRename } from 'modules/pace/hooks/useFileTreeNodeRename';
import CreateItemModal from '@/modules/pace/components/files/CreateItemModal';
import {
  type CreateItemType,
  FILE_TYPE,
  type FileTreeNodeProps,
} from '@/modules/pace/components/files/file-tree.types';
import { CONTEXT_MENU_ACTIONS } from '@/modules/pace/components/files/files.constants';
import FileTreeNodeContextMenu from '@/modules/pace/components/files/FileTreeNodeContextMenu';
import FileTreeNodeRow from '@/modules/pace/components/files/FileTreeNodeRow';
import { useProtectedFolders } from '@/modules/pace/hooks/useProtectedFolders';

const FileTreeNode = ({
  node,
  depth,
  expandedPaths,
  selectedPath,
  originalNodeMap,
  siblingNames,
  onToggleExpand,
  onSelect,
  onDropToSibling,
  onFileMoved,
  onFileDeleted,
  onFileCreated,
}: FileTreeNodeProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<CreateItemType | null>(null);

  const { clipboard } = useFileClipboard();
  const { isProtectedRoot, username } = useProtectedFolders();

  const isFolder = node.type === FILE_TYPE.DIRECTORY;
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const isProtected = depth === 0 && isProtectedRoot(node.path);
  const isUserPrivateFolder = depth === 0 && node.path === username;

  const originalNode = originalNodeMap.get(node.path);
  const childrenToRender = originalNode?.children ?? node.children;

  const childrenNames = useMemo(() => childrenToRender?.map((child) => child.name) ?? [], [childrenToRender]);
  const filteredActions = useMemo(
    () =>
      CONTEXT_MENU_ACTIONS.filter((action) => {
        if (action.fileOnly && isFolder) return false;
        if (action.folderOnly && !isFolder) return false;
        if (action.id === 'paste' && !clipboard) return false;
        if (
          isProtected &&
          (action.id === 'delete' || action.id === 'rename' || action.id === 'cut' || action.id === 'duplicate')
        )
          return false;

        return true;
      }),
    [isFolder, clipboard, isProtected],
  );

  const rename = useFileTreeNodeRename({
    node,
    siblingNames,
    isProtected,
    onFileMoved,
  });

  const dragDrop = useFileTreeNodeDragDrop({
    node,
    nodeRef,
    isFolder,
    isExpanded,
    childrenNames,
    isProtected,
    onToggleExpand,
    onDropToSibling,
    onFileMoved,
  });

  const actions = useFileTreeNodeActions({
    node,
    isExpanded,
    childrenNames,
    isProtected,
    onToggleExpand,
    onStartRename: rename.startRename,
    onOpenCreateModal: setCreateModalType,
    onCloseContextMenu: () => setContextMenuOpen(false),
    onFileMoved,
    onFileDeleted,
    onFileCreated,
  });

  const handleClick = useCallback(() => {
    if (rename.isRenaming) return;

    onSelect(node.path);
    if (isFolder) {
      onToggleExpand(node.path);
    }
  }, [rename.isRenaming, onSelect, node.path, isFolder, onToggleExpand]);

  const handleChevronClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isFolder) {
        onToggleExpand(node.path);
      }
    },
    [isFolder, onToggleExpand, node.path],
  );

  return (
    <div>
      {createModalType && (
        <CreateItemModal
          isOpen={!!createModalType}
          onOpenChange={(open) => !open && setCreateModalType(null)}
          itemType={createModalType}
          onCreate={(name) => actions.handleCreate(name, node.path, createModalType)}
          existingNames={childrenNames}
        />
      )}

      {dragDrop.isDragOverTop && (
        <div className='bg-GRAY_500 -mb-0.5 h-0.5 rounded-full' style={{ marginLeft: `${depth * 24 + 8}px` }} />
      )}

      <FileTreeNodeContextMenu
        actions={filteredActions}
        onOpenChange={setContextMenuOpen}
        onActionClick={actions.handleActionClick}
      >
        <FileTreeNodeRow
          ref={nodeRef}
          node={node}
          depth={depth}
          state={{
            isFolder,
            isExpanded,
            isSelected,
            isRenaming: rename.isRenaming,
            isDuplicateName: rename.isDuplicateName,
            isDragging: dragDrop.isDragging,
            isDragOver: dragDrop.isDragOver,
            isCutItem: actions.isCutItem,
            isProtected,
            isUserPrivateFolder,
            contextMenuOpen,
          }}
          rename={{
            value: rename.renameValue,
            onChange: rename.setRenameValue,
            onSubmit: rename.handleRenameSubmit,
            onKeyDown: rename.handleRenameKeyDown,
            onInputRef: rename.handleRenameInputRef,
          }}
          handlers={{
            onRowClick: handleClick,
            onChevronClick: handleChevronClick,
            onDragStart: dragDrop.handleDragStart,
            onDragEnd: dragDrop.handleDragEnd,
            onDragOver: dragDrop.handleDragOver,
            onDragLeave: dragDrop.handleDragLeave,
            onDrop: dragDrop.handleDrop,
          }}
        />
      </FileTreeNodeContextMenu>

      {isFolder && childrenToRender && isExpanded && childrenToRender.length > 0 && (
        <div className='flex flex-col gap-0.5 pt-0.5'>
          {childrenToRender.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              selectedPath={selectedPath}
              originalNodeMap={originalNodeMap}
              siblingNames={childrenNames}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onDropToSibling={onDropToSibling}
              onFileMoved={onFileMoved}
              onFileDeleted={onFileDeleted}
              onFileCreated={onFileCreated}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTreeNode;
