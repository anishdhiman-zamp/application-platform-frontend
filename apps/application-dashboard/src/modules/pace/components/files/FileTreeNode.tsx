'use client';

import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useLazyListFilesQuery } from '@/apis/filesystem';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import CreateItemModal from '@/modules/pace/components/files/CreateItemModal';
import DeleteConfirmationDialog from '@/modules/pace/components/files/DeleteConfirmationDialog';
import {
  type CreateItemType,
  FILE_TYPE,
  type FileTreeNodeProps,
} from '@/modules/pace/components/files/file-tree.types';
import { getParentPath } from '@/modules/pace/components/files/file-tree.utils';
import FileInfoPopover from '@/modules/pace/components/files/FileInfoPopover';
import {
  CONTEXT_MENU_ACTION_IDS,
  CONTEXT_MENU_ACTIONS,
  SEARCH_ALLOWED_ACTIONS,
} from '@/modules/pace/components/files/files.constants';
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
  isLoadingChildren,
  style,
}: FileTreeNodeProps) {
  // State
  const nodeRef = useRef<HTMLDivElement>(null);
  const [createModalType, setCreateModalType] = useState<CreateItemType | null>(null);
  const [fetchedChildrenNames, setFetchedChildrenNames] = useState<string[]>([]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [triggerListFiles] = useLazyListFilesQuery();

  // Hooks
  const { clipboard, isProtectedRoot, username } = useFileTreeContext();
  const { uploadingPaths } = useFileUploadContext();
  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });

  // Derived State
  const isFolder = node.type === FILE_TYPE.DIRECTORY;
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = !isFolder && selectedPath === node.path;
  const isProtected = depth === 0 && isProtectedRoot(node.path);
  const isUserPrivateFolder = depth === 0 && node.path === username;
  const isUploading = uploadingPaths.has(node?.path);

  const originalNode = originalNodeMap.get(node.path);
  const childrenToRender = originalNode?.children ?? node.children;

  const childrenNames = useMemo(() => childrenToRender?.map((child) => child.name) ?? [], [childrenToRender]);

  const createModalExistingNames = useMemo(() => {
    const localNames = new Set(childrenNames);

    fetchedChildrenNames.forEach((name) => localNames.add(name));

    return Array.from(localNames);
  }, [childrenNames, fetchedChildrenNames]);

  const filteredActions = useMemo(
    () =>
      CONTEXT_MENU_ACTIONS.filter((action) => {
        if (isSearchActive && !SEARCH_ALLOWED_ACTIONS.has(action.id)) return false;
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
    [isFolder, clipboard, isProtected, isSearchActive],
  );

  // Handlers (defined before hooks that consume them)
  const openCreateModal = useCallback(
    (type: CreateItemType) => {
      setCreateModalType(type);

      if (!expandedPaths.has(node.path)) {
        onToggleExpand(node.path);
      }

      const parentDir = node.path === '/' ? '' : node.path;

      triggerListFiles({ depth: 1, path: parentDir || undefined })
        .unwrap()
        .then((result) => {
          const targetPath = node.path;
          const isRoot = targetPath === '/';

          const names = result.files
            .filter((file) => {
              if (isRoot) return !file.path.includes('/');

              return getParentPath(file.path) === targetPath;
            })
            .map((file) => file.name);

          setFetchedChildrenNames(names);
        })
        .catch(() => {
          setFetchedChildrenNames([]);
        });
    },
    [node.path, expandedPaths, onToggleExpand, triggerListFiles],
  );

  const handleTriggerFileUpload = useCallback(() => {
    onTriggerFileUpload?.(node.path);
  }, [onTriggerFileUpload, node.path]);

  const handleTriggerFolderUpload = useCallback(() => {
    onTriggerFolderUpload?.(node.path);
  }, [onTriggerFolderUpload, node.path]);

  const handleExternalFileDrop = useCallback(
    (files: FileList, targetPath: string) => {
      if (onUploadFiles) {
        onUploadFiles(files, targetPath);
      }
    },
    [onUploadFiles],
  );

  // Defer so the closing dropdown/context menu doesn't race with the
  // newly-opened popover and immediately dismiss it via focus/pointer-outside.
  const handleShowInfo = () => {
    requestAnimationFrame(() => setIsInfoOpen(true));
  };

  // Hooks (depend on handlers above)
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
    siblingNames,
    isProtected,
    onToggleExpand,
    onStartRename: rename.startRename,
    onOpenCreateModal: openCreateModal,
    onCloseContextMenu: () => {},
    onFileMoved,
    onFileDeleted,
    onFileCreated,
    onTriggerFileUpload: handleTriggerFileUpload,
    onTriggerFolderUpload: handleTriggerFolderUpload,
    onShowInfo: handleShowInfo,
  });

  // Handlers
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
          onOpenChange={(open) => {
            if (!open) {
              setCreateModalType(null);
              setFetchedChildrenNames([]);
            }
          }}
          itemType={createModalType}
          onCreate={(name) => actions.handleCreate(name, node.path, createModalType)}
          existingNames={createModalExistingNames}
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

      <FileInfoPopover node={node} anchorRef={nodeRef} open={isInfoOpen} onOpenChange={setIsInfoOpen} />

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
          isUploading,
          isSearchActive: !!isSearchActive,
          isLoadingChildren: !!isLoadingChildren,
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
