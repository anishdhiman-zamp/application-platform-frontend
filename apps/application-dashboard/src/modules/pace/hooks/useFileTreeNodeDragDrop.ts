import { type RefObject, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { useFileActions } from 'modules/pace/hooks/useFileActions';
import {
  CLIPBOARD_OPERATION,
  type DropToSiblingData,
  type FileConflict,
  type TreeNode,
} from '@/modules/pace/components/files/file-tree.types';
import { useProtectedFolders } from '@/modules/pace/hooks/useProtectedFolders';

interface UseFileTreeNodeDragDropProps {
  node: TreeNode;
  nodeRef: RefObject<HTMLDivElement | null>;
  isFolder: boolean;
  isExpanded: boolean;
  childrenNames: string[];
  isProtected?: boolean;
  onToggleExpand: (path: string) => void;
  onDropToSibling?: (data: DropToSiblingData) => void;
  onConflict: (conflict: FileConflict) => void;
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
  onConflict,
}: UseFileTreeNodeDragDropProps): UseFileTreeNodeDragDropReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragOverTop, setIsDragOverTop] = useState(false);

  const expandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { copyItem, moveItem } = useFileActions();
  const { isProtectedRoot, isInvalidCrossMove } = useProtectedFolders();

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
      }),
    );
    e.dataTransfer.effectAllowed = 'copyMove';
    setIsDragging(true);
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

    try {
      const rawData = e.dataTransfer.getData('application/json');

      if (!rawData) {
        return;
      }

      const data = JSON.parse(rawData);

      if (!data?.path || !data?.name) {
        return;
      }

      const sourcePath = data.path;
      const sourceName = data.name;
      const sourceType = data.type;

      const sourceIsProtected = isProtectedRoot(sourcePath);

      if (sourceIsProtected) {
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
        onConflict({
          sourcePath,
          sourceName,
          destinationPath,
          operation,
        });

        return;
      }

      if (!isExpanded) {
        onToggleExpand(node.path);
      }

      if (e.altKey) {
        await copyItem(sourcePath, destinationPath);
      } else {
        await moveItem(sourcePath, destinationPath);
      }
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
