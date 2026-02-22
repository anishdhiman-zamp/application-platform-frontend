import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { useFileActions } from 'modules/pace/hooks/useFileActions';
import type { FileItem, TreeNode } from '@/modules/pace/components/files/file-tree.types';
import { buildFullPath, getParentPath } from '@/modules/pace/components/files/file-tree.utils';
import { FILE_TOAST_MESSAGES } from '@/modules/pace/components/files/files.constants';

interface UseFileTreeNodeRenameProps {
  node: TreeNode;
  siblingNames: string[];
  isProtected?: boolean;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
}

interface UseFileTreeNodeRenameReturn {
  isRenaming: boolean;
  renameValue: string;
  isDuplicateName: boolean;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  startRename: () => void;
  setRenameValue: (value: string) => void;
  handleRenameSubmit: () => Promise<void>;
  handleRenameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleRenameInputRef: (element: HTMLInputElement | null) => void;
}

export const useFileTreeNodeRename = ({
  node,
  siblingNames,
  isProtected = false,
  onFileMoved,
}: UseFileTreeNodeRenameProps): UseFileTreeNodeRenameReturn => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  const { renameItem } = useFileActions();

  const isDuplicateName = useMemo(() => {
    if (!renameValue.trim() || renameValue === node.name) return false;

    return siblingNames.filter((name) => name !== node.name).some((name) => name === renameValue.trim());
  }, [renameValue, siblingNames, node.name]);

  const startRename = useCallback(() => {
    if (isProtected) return;

    setRenameValue(node.name);
    setIsRenaming(true);
  }, [node.name, isProtected]);

  const handleRenameSubmit = useCallback(async () => {
    const trimmedValue = renameValue.trim();

    if (!trimmedValue || trimmedValue === node.name || isDuplicateName) {
      setIsRenaming(false);
      setRenameValue(node.name);

      return;
    }

    try {
      await renameItem(node.path, trimmedValue);
      setIsRenaming(false);

      const parentPath = getParentPath(node.path);
      const newPath = buildFullPath(parentPath, trimmedValue);
      const newFile: FileItem = {
        path: newPath,
        name: trimmedValue,
        type: node.type,
        size: node.size,
        mtime_ms: Date.now(),
        owner: node.owner,
      };

      onFileMoved?.(node.path, newFile);
    } catch (error) {
      captureException(error);
      toast.error(FILE_TOAST_MESSAGES.FAILED_TO_RENAME);
      setRenameValue(node.name);
      setIsRenaming(false);
    }
  }, [renameValue, node, isDuplicateName, renameItem, onFileMoved]);

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();

      if (e.key === 'Enter') {
        e.preventDefault();
        handleRenameSubmit();
      } else if (e.key === 'Escape') {
        setIsRenaming(false);
        setRenameValue(node.name);
      }
    },
    [handleRenameSubmit, node.name],
  );

  const handleRenameInputRef = useCallback((element: HTMLInputElement | null) => {
    renameInputRef.current = element;
  }, []);

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      const name = node.name;
      const lastDotIndex = name.lastIndexOf('.');
      const selectionEnd = lastDotIndex > 0 ? lastDotIndex : name.length;

      renameInputRef.current.setSelectionRange(0, selectionEnd);
    }
  }, [isRenaming, node.name]);

  return {
    isRenaming,
    renameValue,
    isDuplicateName,
    renameInputRef,
    startRename,
    setRenameValue,
    handleRenameSubmit,
    handleRenameKeyDown,
    handleRenameInputRef,
  };
};
