import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { useFileActions } from 'modules/pace/hooks/useFileActions';
import type { TreeNode } from '@/modules/pace/components/files/file-tree.types';

interface UseFileTreeNodeRenameProps {
  node: TreeNode;
  siblingNames: string[];
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
    setRenameValue(node.name);
    setIsRenaming(true);
  }, [node.name]);

  const handleRenameSubmit = async () => {
    const trimmedValue = renameValue.trim();

    if (!trimmedValue || trimmedValue === node.name || isDuplicateName) {
      setIsRenaming(false);
      setRenameValue(node.name);

      return;
    }

    try {
      await renameItem(node.path, trimmedValue);
      setIsRenaming(false);
    } catch (error) {
      captureException(error);
      toast.error('Failed to rename');
      setRenameValue(node.name);
      setIsRenaming(false);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setRenameValue(node.name);
    }
  };

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
