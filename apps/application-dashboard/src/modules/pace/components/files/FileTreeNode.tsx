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
  type FileConflict,
  type FileTreeNodeProps,
} from '@/modules/pace/components/files/file-tree.types';
import FileConflictModal from '@/modules/pace/components/files/FileConflictModal';
import { CONTEXT_MENU_ACTIONS } from '@/modules/pace/components/files/files.constants';
import FileTreeNodeContextMenu from '@/modules/pace/components/files/FileTreeNodeContextMenu';
import FileTreeNodeRow from '@/modules/pace/components/files/FileTreeNodeRow';

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
}: FileTreeNodeProps) => {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [createModalType, setCreateModalType] = useState<CreateItemType | null>(null);
  const [fileConflict, setFileConflict] = useState<FileConflict | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const { clipboard } = useFileClipboard();

  const isFolder = node.type === FILE_TYPE.DIRECTORY;
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;

  const originalNode = originalNodeMap.get(node.path);
  const childrenToRender = originalNode?.children ?? node.children;
  const childrenNames = useMemo(() => childrenToRender?.map((child) => child.name) ?? [], [childrenToRender]);

  const filteredActions = useMemo(
    () =>
      CONTEXT_MENU_ACTIONS.filter((action) => {
        if (action.fileOnly && isFolder) return false;
        if (action.folderOnly && !isFolder) return false;
        if (action.id === 'paste' && !clipboard) return false;

        return true;
      }),
    [isFolder, clipboard],
  );

  const rename = useFileTreeNodeRename({
    node,
    siblingNames,
  });

  const dragDrop = useFileTreeNodeDragDrop({
    node,
    nodeRef,
    isFolder,
    isExpanded,
    childrenNames,
    onToggleExpand,
    onDropToSibling,
    onConflict: setFileConflict,
  });

  const actions = useFileTreeNodeActions({
    node,
    isExpanded,
    childrenNames,
    onToggleExpand,
    onStartRename: rename.startRename,
    onOpenCreateModal: setCreateModalType,
    onConflict: setFileConflict,
    onCloseContextMenu: () => setContextMenuOpen(false),
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

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  }, []);

  const handleConflictResolve = useCallback(
    async (resolution: Parameters<typeof actions.handleConflictResolve>[0]) => {
      setFileConflict(null);
      await actions.handleConflictResolve(resolution, fileConflict);
    },
    [actions, fileConflict],
  );

  return (
    <div>
      <FileTreeNodeContextMenu
        isOpen={contextMenuOpen}
        position={contextMenuPosition}
        actions={filteredActions}
        triggerRef={triggerRef}
        onOpenChange={setContextMenuOpen}
        onActionClick={actions.handleActionClick}
      />

      {createModalType && (
        <CreateItemModal
          isOpen={!!createModalType}
          onOpenChange={(open) => !open && setCreateModalType(null)}
          itemType={createModalType}
          onCreate={(name) => actions.handleCreate(name, node.path, createModalType)}
          existingNames={childrenNames}
        />
      )}

      <FileConflictModal
        isOpen={!!fileConflict}
        conflict={fileConflict}
        onResolve={handleConflictResolve}
        onCancel={() => setFileConflict(null)}
      />

      {dragDrop.isDragOverTop && (
        <div className='bg-GRAY_500 -mb-0.5 h-0.5 rounded-full' style={{ marginLeft: `${depth * 24 + 8}px` }} />
      )}

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
          onContextMenu: handleContextMenu,
          onDragStart: dragDrop.handleDragStart,
          onDragEnd: dragDrop.handleDragEnd,
          onDragOver: dragDrop.handleDragOver,
          onDragLeave: dragDrop.handleDragLeave,
          onDrop: dragDrop.handleDrop,
        }}
      />

      {isFolder && childrenToRender && childrenToRender.length > 0 && (
        <div
          className='grid transition-[grid-template-rows] duration-100 ease-out'
          style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
        >
          <div className='flex flex-col gap-0.5 overflow-hidden pt-0.5'>
            {childrenToRender.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                expandedPaths={expandedPaths}
                selectedPath={selectedPath}
                originalNodeMap={originalNodeMap}
                siblingNames={childrenToRender.map((c) => c.name)}
                parentPath={node.path}
                onToggleExpand={onToggleExpand}
                onSelect={onSelect}
                onDropToSibling={onDropToSibling}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileTreeNode;
