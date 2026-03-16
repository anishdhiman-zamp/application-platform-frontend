'use client';

import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { ResourceType } from '@zamp-platform/chat';
import { Input, Popover, PopoverAnchor, PopoverContent, toast } from '@zamp-platform/ui';
import { useUpdateConversationTitleMutation } from '@/apis/pace';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';

interface RenameConversationPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  organizationId: string;
  currentTitle: string;
  onSuccess?: (newTitle: string) => void;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const RenameConversationPopover: FC<RenameConversationPopoverProps> = ({
  open,
  onOpenChange,
  conversationId,
  organizationId,
  currentTitle,
  onSuccess,
  children,
  align = 'start',
  side = 'bottom',
}) => {
  const openTimestampRef = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const [editValue, setEditValue] = useState(currentTitle);
  const [updateTitle] = useUpdateConversationTitleMutation();

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
  }, [editValue, currentTitle, conversationId, organizationId, updateTitle, onSuccess, onOpenChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === KEYBOARD_KEYS.ENTER) {
        e.preventDefault();
        handleSave();
      } else if (e.key === KEYBOARD_KEYS.ESCAPE) {
        e.preventDefault();
        onOpenChange(false);
      }
    },
    [handleSave, onOpenChange],
  );

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        const elapsed = Date.now() - openTimestampRef.current;

        if (elapsed < 300) return;

        handleSave();

        return;
      }
      onOpenChange(nextOpen);
    },
    [handleSave, onOpenChange],
  );

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      const input = contentRef.current?.querySelector('input');

      if (input) {
        input.focus();
        input.select();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (open) {
      openTimestampRef.current = Date.now();
      setEditValue(currentTitle);
    }
  }, [open, currentTitle]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent
        ref={contentRef}
        align={align}
        side={side}
        className='w-52 p-2'
        onOpenAutoFocus={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
      >
        <Input
          type='text'
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder='Enter title...'
          maxLength={500}
          size='small'
          className='w-full'
        />
      </PopoverContent>
    </Popover>
  );
};

export default RenameConversationPopover;
