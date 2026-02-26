import { type RefObject, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { CLIPBOARD_OPERATION, type FileItem, type TreeNode } from '@/modules/pace/components/files/file-tree.types';
import { executeMoveOrCopy, parseDragData } from '@/modules/pace/components/files/file-tree.utils';
import { FILE_TOAST_MESSAGES } from '@/modules/pace/components/files/files.constants';
import { useFileTreeContext } from '@/modules/pace/hooks/useFileTreeContext';
import { useUpdateFileTab } from '@/modules/pace/hooks/useUpdateFileTab';

interface UseFileTreeNodeDragDropProps {
  node: TreeNode;
  nodeRef: RefObject<HTMLDivElement | null>;
  isFolder: boolean;
  isExpanded: boolean;
  childrenNames: string[];
  siblingNames: string[];
  isProtected?: boolean;
  parentPath?: string | null;
  onToggleExpand: (path: string) => void;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
  onExternalFileDrop?: (files: FileList, targetPath: string) => void;
  onDragOverFolderChange?: (path: string | null) => void;
}

interface UseFileTreeNodeDragDropReturn {
  isDragging: boolean;
  isDragOver: boolean;
  handleDragStart: (e: React.DragEvent) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => Promise<void>;
}

export const useFileTreeNodeDragDrop = ({
  node,
  nodeRef,
  isFolder,
  isExpanded,
  childrenNames,
  siblingNames,
  isProtected = false,
  parentPath,
  onToggleExpand,
  onFileMoved,
  onExternalFileDrop,
  onDragOverFolderChange,
}: UseFileTreeNodeDragDropProps): UseFileTreeNodeDragDropReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const expandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { copyItem, moveItem, setConflict, isProtectedRoot, isInvalidCrossMove } = useFileTreeContext();
  const { updateFileTab } = useUpdateFileTab();

  const clearExpandTimeout = () => {
    if (expandTimeoutRef.current) {
      clearTimeout(expandTimeoutRef.current);
      expandTimeoutRef.current = null;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isProtected) {
      e.preventDefault();

      return;
    }

    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        path: node.path,
        name: node.name,
        type: node.type,
        size: node.size,
        owner: node.owner,
      }),
    );
    e.dataTransfer.effectAllowed = 'copyMove';
    setIsDragging(true);
  };

  const isExternalFileDrop = (e: React.DragEvent): boolean => {
    return e.dataTransfer.types.includes('Files') && !e.dataTransfer.types.includes('application/json');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    clearExpandTimeout();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFolder) {
      e.dataTransfer.dropEffect = e.altKey ? 'copy' : 'move';
      setIsDragOver(true);
      onDragOverFolderChange?.(node.path);

      if (!isExpanded && !expandTimeoutRef.current) {
        expandTimeoutRef.current = setTimeout(() => {
          onToggleExpand(node.path);
          expandTimeoutRef.current = null;
        }, 400);
      }
    } else {
      // For files, keep parent folder overlay visible
      onDragOverFolderChange?.(parentPath ?? null);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (nodeRef.current && !nodeRef.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      clearExpandTimeout();
      // Don't clear dragOverFolderPath here - let the next dragOver event set the correct value
      // This prevents flashing when moving between files in the same folder
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    clearExpandTimeout();
    onDragOverFolderChange?.(null);

    // Handle external file drops (from desktop)
    if (isExternalFileDrop(e)) {
      if (isFolder && onExternalFileDrop) {
        const files = e.dataTransfer.files;

        if (files.length > 0) {
          if (!isExpanded) {
            onToggleExpand(node.path);
          }
          onExternalFileDrop(files, node.path);
        }
      } else if (parentPath && onExternalFileDrop) {
        // Drop on a file - upload to parent folder
        const files = e.dataTransfer.files;

        if (files.length > 0) {
          onExternalFileDrop(files, parentPath);
        }
      }

      return;
    }

    // Handle internal drag (moving/copying files within the tree)
    try {
      const dragData = parseDragData(e);

      if (!dragData) {
        return;
      }

      const { sourcePath, sourceName, sourceType, sourceSize, sourceOwner } = dragData;

      if (isProtectedRoot(sourcePath)) {
        toast.error(FILE_TOAST_MESSAGES.CANNOT_MOVE_PROTECTED);

        return;
      }

      // Determine target folder - if dropping on a file, use its parent folder
      const targetFolder = isFolder ? node.path : parentPath;

      if (!targetFolder) return;

      const destinationPath = `${targetFolder}/${sourceName}`;

      if (!e.altKey && sourcePath === destinationPath) {
        return;
      }

      if (isInvalidCrossMove(sourcePath, destinationPath)) {
        toast.error(FILE_TOAST_MESSAGES.CANNOT_MOVE_PROTECTED_INTO_EACH_OTHER);

        return;
      }

      const isInvalidTarget = targetFolder === sourcePath || targetFolder.startsWith(`${sourcePath}/`);

      if (isInvalidTarget) return;

      // Get children names of target folder
      // If dropping on a folder, use its children; if dropping on a file, use its siblings (parent's children)
      const targetChildrenNames = isFolder ? childrenNames : siblingNames;
      const hasConflict = targetChildrenNames.includes(sourceName);
      const operation = e.altKey ? CLIPBOARD_OPERATION.COPY : 'move';

      if (hasConflict) {
        setConflict({
          sourcePath,
          sourceName,
          sourceType,
          sourceSize,
          sourceOwner,
          destinationPath,
          operation,
        });

        return;
      }

      if (isFolder && !isExpanded) {
        onToggleExpand(node.path);
      }

      const isCopy = e.altKey;

      await executeMoveOrCopy({
        sourcePath,
        sourceName,
        sourceType,
        sourceSize,
        sourceOwner,
        destinationPath,
        isCopy,
        actions: { copyItem, moveItem },
        onFileMoved,
      });

      if (!isCopy) {
        updateFileTab({
          oldPath: sourcePath,
          newPath: destinationPath,
          newName: sourceName,
        });
      }
    } catch (error) {
      captureException(error);
      toast.error(FILE_TOAST_MESSAGES.FAILED_TO_MOVE_COPY);
    }
  };

  return {
    isDragging,
    isDragOver,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};
