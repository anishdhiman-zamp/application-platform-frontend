'use client';

import { type FC, useCallback, useEffect, useState } from 'react';
import { ResourceType } from '@zamp-platform/chat';
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
  toast,
} from '@zamp-platform/ui';
import { useUpdateConversationTitleMutation } from '@/apis/pace';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';

interface RenameConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  organizationId: string;
  currentTitle: string;
  onSuccess?: (newTitle: string) => void;
}

const RenameConversationDialog: FC<RenameConversationDialogProps> = ({
  open,
  onOpenChange,
  conversationId,
  organizationId,
  currentTitle,
  onSuccess,
}) => {
  const [editValue, setEditValue] = useState(currentTitle);
  const [updateTitle, { isLoading }] = useUpdateConversationTitleMutation();

  const isSaveDisabled = !editValue.trim() || editValue.trim() === currentTitle;

  const handleSave = useCallback(async () => {
    const trimmedValue = editValue.trim();

    if (!trimmedValue || trimmedValue === currentTitle) {
      onOpenChange(false);

      return;
    }

    onSuccess?.(trimmedValue);
    onOpenChange(false);

    try {
      await updateTitle({
        conversationId,
        body: {
          resource_id: organizationId,
          resource_type: ResourceType.ORGANIZATION,
          title: trimmedValue,
        },
      }).unwrap();
    } catch {
      onSuccess?.(currentTitle);
      toast.error('Failed to rename conversation');
    }
  }, [editValue, currentTitle, conversationId, organizationId, updateTitle, onOpenChange, onSuccess]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === KEYBOARD_KEYS.ENTER && !isSaveDisabled && !isLoading) {
        e.preventDefault();
        e.stopPropagation();
        handleSave();
      }
    },
    [handleSave, isSaveDisabled, isLoading],
  );

  const inputRefCallback = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      requestAnimationFrame(() => {
        node.focus();
        node.select();
      });
    }
  }, []);

  useEffect(() => {
    if (open) {
      setEditValue(currentTitle);
    }
  }, [open, currentTitle]);

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent size='small' showCloseButton={!isLoading} className='w-[400px] outline-none'>
        <DialogHeader>
          <DialogHeaderTitle>Rename conversation</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='p-5'>
          <Input
            ref={inputRefCallback}
            type='text'
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Enter title...'
            maxLength={500}
            size='small'
            className='w-full'
            disabled={isLoading}
          />
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
            className='w-14'
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameConversationDialog;
