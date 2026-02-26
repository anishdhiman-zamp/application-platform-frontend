import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { buildFullPath, getParentPath } from '@/modules/pace/components/files/file-tree.utils';
import { FILE_TOAST_MESSAGES } from '@/modules/pace/components/files/files.constants';
import { useFileViewerContext } from '@/modules/pace/hooks/FileViewerContext';
import { useFileActions } from '@/modules/pace/hooks/useFileActions';
import { useUpdateFileTab } from '@/modules/pace/hooks/useUpdateFileTab';
import { defaultFnType } from '@/types/commonTypes';

const getFileNameParts = (name: string): { baseName: string; extension: string } => {
  const lastDotIndex = name.lastIndexOf('.');

  if (lastDotIndex > 0) {
    return {
      baseName: name.slice(0, lastDotIndex),
      extension: name.slice(lastDotIndex),
    };
  }

  return { baseName: name, extension: '' };
};

interface UseFileViewerHeaderRenameProps {
  filePath: string;
  fileName: string;
}

interface UseFileViewerHeaderRenameReturn {
  isRenaming: boolean;
  renameValue: string;
  fileExtension: string;
  isRenameLoading: boolean;
  startRename: defaultFnType;
  setRenameValue: (value: string) => void;
  handleRenameSubmit: () => Promise<void>;
  handleRenameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleRenameInputRef: (element: HTMLInputElement | null) => void;
}

export const useFileViewerHeaderRename = ({
  filePath,
  fileName,
}: UseFileViewerHeaderRenameProps): UseFileViewerHeaderRenameReturn => {
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const { baseName, extension } = useMemo(() => getFileNameParts(fileName), [fileName]);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(baseName);

  const { renameItem, isRenaming: isRenameLoading } = useFileActions();
  const { updateFileStatePath } = useFileViewerContext();
  const { updateFileTab } = useUpdateFileTab();

  const fullNewName = useMemo(() => {
    const trimmed = renameValue.trim();

    return trimmed ? `${trimmed}${extension}` : '';
  }, [renameValue, extension]);

  const startRename = useCallback(() => {
    setRenameValue(baseName);
    setIsRenaming(true);
  }, [baseName]);

  const handleRenameSubmit = useCallback(async () => {
    if (!fullNewName || fullNewName === fileName) {
      setIsRenaming(false);
      setRenameValue(baseName);

      return;
    }

    try {
      await renameItem(filePath, fullNewName);
      setIsRenaming(false);

      const parentPath = getParentPath(filePath);
      const newPath = buildFullPath(parentPath, fullNewName);

      updateFileStatePath(filePath, newPath);

      updateFileTab({
        oldPath: filePath,
        newPath,
        newName: fullNewName,
      });
    } catch (error) {
      captureException(error);
      toast.error(FILE_TOAST_MESSAGES.FAILED_TO_RENAME);
      setRenameValue(baseName);
      setIsRenaming(false);
    }
  }, [fullNewName, fileName, baseName, filePath, renameItem, updateFileStatePath, updateFileTab]);

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();

      if (e.key === KEYBOARD_KEYS.ENTER) {
        e.preventDefault();
        handleRenameSubmit();
      } else if (e.key === KEYBOARD_KEYS.ESCAPE) {
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
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  return {
    isRenaming,
    renameValue,
    fileExtension: extension,
    isRenameLoading,
    startRename,
    setRenameValue,
    handleRenameSubmit,
    handleRenameKeyDown,
    handleRenameInputRef,
  };
};
