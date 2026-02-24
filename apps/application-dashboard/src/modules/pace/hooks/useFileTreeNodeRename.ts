import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { useFileActions } from 'modules/pace/hooks/useFileActions';
import { FILE_TYPE, type FileItem, type TreeNode } from '@/modules/pace/components/files/file-tree.types';
import { buildFullPath, getParentPath } from '@/modules/pace/components/files/file-tree.utils';
import { FILE_TOAST_MESSAGES } from '@/modules/pace/components/files/files.constants';
import { useDynamicTabs } from '@/modules/pace/hooks/useDynamicTabs';

const getFileNameParts = (name: string, isFile: boolean): { baseName: string; extension: string } => {
  if (!isFile) {
    return { baseName: name, extension: '' };
  }

  const lastDotIndex = name.lastIndexOf('.');

  if (lastDotIndex > 0) {
    return {
      baseName: name.slice(0, lastDotIndex),
      extension: name.slice(lastDotIndex),
    };
  }

  return { baseName: name, extension: '' };
};

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
  const isFile = node.type === FILE_TYPE.FILE;
  const { baseName, extension } = useMemo(() => getFileNameParts(node.name, isFile), [node.name, isFile]);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(baseName);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  const { renameItem } = useFileActions();
  const { updateTab } = useDynamicTabs();

  const fullNewName = useMemo(() => {
    const trimmed = renameValue.trim();

    return trimmed ? `${trimmed}${extension}` : '';
  }, [renameValue, extension]);

  const isDuplicateName = useMemo(() => {
    if (!fullNewName || fullNewName === node.name) return false;

    return siblingNames.filter((name) => name !== node.name).some((name) => name === fullNewName);
  }, [fullNewName, siblingNames, node.name]);

  const startRename = useCallback(() => {
    if (isProtected) return;

    setRenameValue(baseName);
    setIsRenaming(true);
  }, [baseName, isProtected]);

  const handleRenameSubmit = useCallback(async () => {
    if (!fullNewName || fullNewName === node.name || isDuplicateName) {
      setIsRenaming(false);
      setRenameValue(baseName);

      return;
    }

    try {
      await renameItem(node.path, fullNewName);
      setIsRenaming(false);

      const parentPath = getParentPath(node.path);
      const newPath = buildFullPath(parentPath, fullNewName);
      const newFile: FileItem = {
        path: newPath,
        name: fullNewName,
        type: node.type,
        size: node.size,
        mtime_ms: Date.now(),
        owner: node.owner,
      };

      updateTab(node.path, newPath, fullNewName);

      onFileMoved?.(node.path, newFile);
    } catch (error) {
      captureException(error);
      toast.error(FILE_TOAST_MESSAGES.FAILED_TO_RENAME);
      setRenameValue(baseName);
      setIsRenaming(false);
    }
  }, [fullNewName, baseName, node, isDuplicateName, renameItem, updateTab, onFileMoved]);

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();

      if (e.key === 'Enter') {
        e.preventDefault();
        handleRenameSubmit();
      } else if (e.key === 'Escape') {
        setIsRenaming(false);
        setRenameValue(baseName);
      }
    },
    [handleRenameSubmit, baseName],
  );

  const handleRenameInputRef = useCallback((element: HTMLInputElement | null) => {
    renameInputRef.current = element;
  }, []);

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      setTimeout(() => {
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
      }, 30);
    }
  }, [isRenaming]);

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
