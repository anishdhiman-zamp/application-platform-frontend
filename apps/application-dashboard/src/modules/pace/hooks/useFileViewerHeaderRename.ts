import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import {
  buildFullPath,
  checkDuplicateName,
  getFileNameParts,
  getParentPath,
} from '@/modules/pace/components/files/file-tree.utils';
import { FILE_TOAST_MESSAGES } from '@/modules/pace/components/files/files.constants';
import { useFileViewerContext } from '@/modules/pace/context/FileViewerContext';
import { useFileActions } from '@/modules/pace/hooks/useFileActions';
import { useSiblingNames } from '@/modules/pace/hooks/useSiblingNames';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import { defaultFnType } from '@/types/commonTypes';

interface UseFileViewerHeaderRenameProps {
  filePath: string;
  fileName: string;
}

interface UseFileViewerHeaderRenameReturn {
  isRenaming: boolean;
  renameValue: string;
  fileExtension: string;
  isRenameLoading: boolean;
  isDuplicateName: boolean;
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
  const { baseName, extension } = useMemo(() => getFileNameParts(fileName, true), [fileName]);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(baseName);

  const { renameItem, isRenaming: isRenameLoading } = useFileActions();
  const { updateFileStatePath } = useFileViewerContext();
  const { updateTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const { siblingNames } = useSiblingNames({ filePath });

  const fullNewName = useMemo(() => {
    const trimmed = renameValue.trim();

    return trimmed ? `${trimmed}${extension}` : '';
  }, [renameValue, extension]);

  const isDuplicateName = useMemo(() => {
    if (!isRenaming || !fullNewName || fullNewName === fileName) return false;

    return checkDuplicateName(fullNewName, siblingNames, fileName);
  }, [isRenaming, fullNewName, siblingNames, fileName]);

  const startRename = useCallback(() => {
    setRenameValue(baseName);
    setIsRenaming(true);
  }, [baseName]);

  const handleRenameSubmit = useCallback(async () => {
    if (!fullNewName || fullNewName === fileName || isDuplicateName) {
      setIsRenaming(false);
      setRenameValue(baseName);

      return;
    }

    setIsRenaming(false);

    try {
      await renameItem(filePath, fullNewName);

      const parentPath = getParentPath(filePath);
      const newPath = buildFullPath(parentPath, fullNewName);

      updateFileStatePath(filePath, newPath);

      updateTab(filePath, newPath, fullNewName);
    } catch (error) {
      captureException(error);
      toast.error(FILE_TOAST_MESSAGES.FAILED_TO_RENAME);
      setRenameValue(baseName);
      setIsRenaming(false);
    }
  }, [fullNewName, fileName, baseName, filePath, isDuplicateName, renameItem, updateFileStatePath, updateTab]);

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
    isDuplicateName,
    startRename,
    setRenameValue,
    handleRenameSubmit,
    handleRenameKeyDown,
    handleRenameInputRef,
  };
};
