import { type RefObject, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import {
  CLIPBOARD_OPERATION,
  type DropToSiblingData,
  type FileItem,
  type TreeNode,
} from '@/modules/pace/components/files/file-tree.types';
import { executeMoveOrCopy, parseDragData } from '@/modules/pace/components/files/file-tree.utils';
import { useFileTreeContext } from '@/modules/pace/hooks/useFileTreeContext';

interface UseFileTreeNodeDragDropProps {
  node: TreeNode;
  nodeRef: RefObject<HTMLDivElement | null>;
  isFolder: boolean;
  isExpanded: boolean;
  childrenNames: string[];
  isProtected?: boolean;
  onToggleExpand: (path: string) => void;
  onDropToSibling?: (data: DropToSiblingData) => void;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
  onExternalFileDrop?: (files: FileList, targetPath: string) => void;
}

interface UseFileTreeNodeDragDropReturn {
  isDragging: boolean;
  isDragOver: boolean;
  isDragOverTop: boolean;
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
  isProtected = false,
  onToggleExpand,
  onDropToSibling,
  onFileMoved,
  onExternalFileDrop,
}: UseFileTreeNodeDragDropProps): UseFileTreeNodeDragDropReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragOverTop, setIsDragOverTop] = useState(false);

  const expandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { copyItem, moveItem, setConflict, isProtectedRoot, isInvalidCrossMove } = useFileTreeContext();

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

    const rect = nodeRef.current?.getBoundingClientRect();

    if (rect) {
      const topThreshold = rect.top + rect.height * 0.25;
      const isOverTop = e.clientY < topThreshold;

      if (isOverTop && onDropToSibling) {
        e.dataTransfer.dropEffect = e.altKey ? 'copy' : 'move';
        setIsDragOverTop(true);
        setIsDragOver(false);
        clearExpandTimeout();

        return;
      }
    }

    setIsDragOverTop(false);

    if (isFolder) {
      e.dataTransfer.dropEffect = e.altKey ? 'copy' : 'move';
      setIsDragOver(true);

      if (!isExpanded && !expandTimeoutRef.current) {
        expandTimeoutRef.current = setTimeout(() => {
          onToggleExpand(node.path);
          expandTimeoutRef.current = null;
        }, 800);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (nodeRef.current && !nodeRef.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setIsDragOverTop(false);
      clearExpandTimeout();
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsDragOverTop(false);
    clearExpandTimeout();

    if (isExternalFileDrop(e) && isFolder && onExternalFileDrop) {
      const files = e.dataTransfer.files;

      if (files.length > 0) {
        if (!isExpanded) {
          onToggleExpand(node.path);
        }
        onExternalFileDrop(files, node.path);
      }

      return;
    }

    try {
      const dragData = parseDragData(e);

      if (!dragData) {
        return;
      }

      const { sourcePath, sourceName, sourceType, sourceSize, sourceOwner } = dragData;

      if (isProtectedRoot(sourcePath)) {
        toast.error('Cannot move protected folders');

        return;
      }

      const rect = nodeRef.current?.getBoundingClientRect();

      if (rect && onDropToSibling) {
        const topThreshold = rect.top + rect.height * 0.25;
        const isOverTop = e.clientY < topThreshold;

        if (isOverTop) {
          onDropToSibling({
            sourcePath,
            sourceName,
            sourceType,
            sourceSize,
            sourceOwner,
            isCopy: e.altKey,
          });

          return;
        }
      }

      if (!isFolder) return;

      const destinationPath = `${node.path}/${sourceName}`;

      if (!e.altKey && sourcePath === destinationPath) {
        return;
      }

      if (isInvalidCrossMove(sourcePath, destinationPath)) {
        toast.error('Cannot move protected folders into each other');

        return;
      }

      const isInvalidTarget = node.path === sourcePath || node.path.startsWith(`${sourcePath}/`);

      if (isInvalidTarget) return;

      const hasConflict = childrenNames.includes(sourceName);
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

      if (!isExpanded) {
        onToggleExpand(node.path);
      }

      await executeMoveOrCopy({
        sourcePath,
        sourceName,
        sourceType,
        sourceSize,
        sourceOwner,
        destinationPath,
        isCopy: e.altKey,
        actions: { copyItem, moveItem },
        onFileMoved,
      });
    } catch (error) {
      captureException(error);
      toast.error('Failed to move/copy');
    }
  };

  return {
    isDragging,
    isDragOver,
    isDragOverTop,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};
