'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  Input,
  TooltipV2,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { checkDuplicateName, getFileNameParts } from '@/modules/pace/components/files/file-tree.utils';
import { SIDE_OPTIONS } from '@/types/commonTypes';

interface RenameFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFileName: string;
  siblingNames: string[];
  isLoading: boolean;
  onConfirm: (newName: string) => void;
}

const RenameFileDialog = ({
  open,
  onOpenChange,
  currentFileName,
  siblingNames,
  isLoading,
  onConfirm,
}: RenameFileDialogProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const shouldSelectBaseNameRef = useRef(false);

  const [editValue, setEditValue] = useState(currentFileName);

  const trimmedValue = editValue.trim();
  const isUnchanged = trimmedValue === currentFileName;
  const isDuplicateName =
    !!trimmedValue && !isUnchanged && checkDuplicateName(trimmedValue, siblingNames, currentFileName);
  const isSaveDisabled = !trimmedValue || isUnchanged || isDuplicateName || isLoading;

  const handleSave = useCallback(() => {
    if (!trimmedValue || isUnchanged || isDuplicateName) {
      onOpenChange(false);

      return;
    }

    onConfirm(trimmedValue);
  }, [trimmedValue, isUnchanged, isDuplicateName, onConfirm, onOpenChange]);

  const setInputRef = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      shouldSelectBaseNameRef.current = false;
      if (e.key === KEYBOARD_KEYS.ENTER && !isSaveDisabled) {
        e.preventDefault();
        e.stopPropagation();
        handleSave();
      }
    },
    [handleSave, isSaveDisabled],
  );

  const handleOpenAutoFocus = useCallback((event: Event) => {
    event.preventDefault();
    inputRef.current?.focus();
  }, []);

  const handleInputFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (!shouldSelectBaseNameRef.current) return;
      const { baseName } = getFileNameParts(currentFileName, true);

      requestAnimationFrame(() => {
        if (!shouldSelectBaseNameRef.current) return;
        e.target.setSelectionRange(0, baseName.length);
      });
    },
    [currentFileName],
  );

  const handleInputPointerDown = useCallback(() => {
    shouldSelectBaseNameRef.current = false;
  }, []);

  useEffect(() => {
    if (open) {
      setEditValue(currentFileName);
      shouldSelectBaseNameRef.current = true;
    }
  }, [open, currentFileName]);

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent
        size='small'
        showCloseButton={!isLoading}
        className='w-[400px] outline-none'
        data-slot='rename-file-dialog'
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <DialogHeader>
          <DialogHeaderTitle>Rename file</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='p-5'>
          <TooltipV2
            tooltipBody='A file or folder with this name already exists.'
            side={SIDE_OPTIONS.BOTTOM}
            open={isDuplicateName}
            delayDuration={0}
            tooltipClassName='bg-RED_100 text-RED_700 border-RED_300 border'
            asChildTrigger
          >
            <Input
              ref={setInputRef}
              type='text'
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onPointerDown={handleInputPointerDown}
              placeholder='Enter file name...'
              size='small'
              className={cn('w-full', isDuplicateName && 'border-RED_700! focus:shadow-input-error-outline-shadow')}
              disabled={isLoading}
            />
          </TooltipV2>
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2.5'>
          <DialogClose asChild>
            <Button variant='secondary' size='medium' disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant='default'
            size='medium'
            onClick={handleSave}
            disabled={isSaveDisabled}
            isLoading={isLoading}
            className='w-16'
          >
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameFileDialog;
