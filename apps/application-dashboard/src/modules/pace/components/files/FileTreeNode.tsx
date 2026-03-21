'use client';

import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import CreateItemModal from '@/modules/pace/components/files/CreateItemModal';
import DeleteConfirmationDialog from '@/modules/pace/components/files/DeleteConfirmationDialog';
import {
  type CreateItemType,
  FILE_TYPE,
  type FileTreeNodeProps,
} from '@/modules/pace/components/files/file-tree.types';
import { CONTEXT_MENU_ACTION_IDS, CONTEXT_MENU_ACTIONS } from '@/modules/pace/components/files/files.constants';
import FileTreeNodeRow from '@/modules/pace/components/files/FileTreeNodeRow';
import { useFileUploadContext } from '@/modules/pace/context/FileUploadContext';
import { useFileTreeContext } from '@/modules/pace/hooks/useFileTreeContext';
import { useFileTreeNodeActions } from '@/modules/pace/hooks/useFileTreeNodeActions';
import { useFileTreeNodeDragDrop } from '@/modules/pace/hooks/useFileTreeNodeDragDrop';
import { useFileTreeNodeRename } from '@/modules/pace/hooks/useFileTreeNodeRename';
import { TAB_TYPE } from '@/modules/pace/pace.types';

const FileTreeNode = memo(function FileTreeNode({
  node,
  depth,
  ancestorIsLast,
  isLastChild,
  expandedPaths,
  selectedPath,
  originalNodeMap,
  siblingNames,
  parentPath,
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
  style,
}: FileTreeNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [createModalType, setCreateModalType] = useState<CreateItemType | null>(null);

  const { clipboard, isProtectedRoot, username } = useFileTreeContext();
  const { uploadingPaths } = useFileUploadContext();
  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });

  const isFolder = node.type === FILE_TYPE.DIRECTORY;
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = !isFolder && selectedPath === node.path;
  const isProtected = depth === 0 && isProtectedRoot(node.path);
  const isUserPrivateFolder = depth === 0 && node.path === username;
  const isUploading = uploadingPaths.has(node?.path);

  const originalNode = originalNodeMap.get(node.path);
  const childrenToRender = originalNode?.children ?? node.children;

  const childrenNames = useMemo(() => childrenToRender?.map((child) => child.name) ?? [], [childrenToRender]);
  const filteredActions = useMemo(
    () =>
      CONTEXT_MENU_ACTIONS.filter((action) => {
        if (action.fileOnly && isFolder) return false;
        if (action.folderOnly && !isFolder) return false;
        if (action.id === CONTEXT_MENU_ACTION_IDS.PASTE && !clipboard) return false;
        if (
          isProtected &&
          (action.id === CONTEXT_MENU_ACTION_IDS.DELETE ||
            action.id === CONTEXT_MENU_ACTION_IDS.RENAME ||
            action.id === CONTEXT_MENU_ACTION_IDS.CUT ||
            action.id === CONTEXT_MENU_ACTION_IDS.DUPLICATE)
        )
          return false;

        return true;
      }),
    [isFolder, clipboard, isProtected],
  );

  const handleTriggerFileUpload = useCallback(() => {
    onTriggerFileUpload?.(node.path);
  }, [onTriggerFileUpload, node.path]);

  const handleTriggerFolderUpload = useCallback(() => {
    onTriggerFolderUpload?.(node.path);
  }, [onTriggerFolderUpload, node.path]);

  const rename = useFileTreeNodeRename({
    node,
    siblingNames,
    isProtected,
    onFileMoved,
  });

  const handleExternalFileDrop = useCallback(
    (files: FileList, targetPath: string) => {
      if (onUploadFiles) {
        onUploadFiles(files, targetPath);
      }
    },
    [onUploadFiles],
  );

  const dragDrop = useFileTreeNodeDragDrop({
    node,
    nodeRef,
    isFolder,
    isExpanded,
    childrenNames,
    siblingNames,
    isProtected,
    parentPath,
    onToggleExpand,
    onFileMoved,
    onExternalFileDrop: handleExternalFileDrop,
    onDragOverFolderChange,
  });

  const { deleteConfirmation, ...actions } = useFileTreeNodeActions({
    node,
    isExpanded,
    childrenNames,
    isProtected,
    onToggleExpand,
    onStartRename: rename.startRename,
    onOpenCreateModal: setCreateModalType,
    onCloseContextMenu: () => {},
    onFileMoved,
    onFileDeleted,
    onFileCreated,
    onTriggerFileUpload: handleTriggerFileUpload,
    onTriggerFolderUpload: handleTriggerFolderUpload,
  });

  const handleClick = useCallback(() => {
    if (rename.isRenaming) return;

    if (isFolder) {
      onToggleExpand(node.path);
    } else {
      onSelect(node.path);
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

  const handleDoubleClick = useCallback(() => {
    if (rename.isRenaming || isFolder) return;

    openTab(node.path, node.name);
  }, [rename.isRenaming, isFolder, node.path, node.name, openTab]);

  return (
    <div style={style}>
      {createModalType && (
        <CreateItemModal
          isOpen={!!createModalType}
          onOpenChange={(open) => !open && setCreateModalType(null)}
          itemType={createModalType}
          onCreate={(name) => actions.handleCreate(name, node.path, createModalType)}
          existingNames={childrenNames}
        />
      )}

      <DeleteConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.onOpenChange}
        itemName={node.name}
        itemType={isFolder ? 'folder' : 'file'}
        isDeleting={deleteConfirmation.isDeleting}
        onConfirm={deleteConfirmation.onConfirm}
      />

      <FileTreeNodeRow
        ref={nodeRef}
        node={node}
        depth={depth}
        ancestorIsLast={ancestorIsLast}
        isLastChild={isLastChild}
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
          isUploading,
          isSearchActive: !!isSearchActive,
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
          onRowDoubleClick: handleDoubleClick,
          onChevronClick: handleChevronClick,
          onDragStart: dragDrop.handleDragStart,
          onDragEnd: dragDrop.handleDragEnd,
          onDragOver: dragDrop.handleDragOver,
          onDragLeave: dragDrop.handleDragLeave,
          onDrop: dragDrop.handleDrop,
        }}
        actions={filteredActions}
        onActionClick={actions.handleActionClick}
      />
    </div>
  );
});

export default FileTreeNode;
