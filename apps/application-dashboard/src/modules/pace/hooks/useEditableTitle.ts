'use client';

import { useCallback, useEffect, useState } from 'react';
import { ResourceType } from '@zamp-platform/chat';
import { toast } from '@zamp-platform/ui';
import { useUpdateConversationTitleMutation } from '@/apis/pace';
import { DEFAULT_CHAT_TITLE } from '@/modules/pace/pace.constants';

interface UseEditableTitleProps {
  title?: string;
  conversationId?: string | null;
  organizationId?: string;
  onTitleChange?: (newTitle: string) => void;
}

interface UseEditableTitleReturn {
  displayTitle: string;
  isEditing: boolean;
  editValue: string;
  isUpdatingTitle: boolean;
  canEdit: boolean;
  setIsEditing: (isEditing: boolean) => void;
  setEditValue: (value: string) => void;
  handleTitleClick: () => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  inputRefCallback: (node: HTMLInputElement | null) => void;
}

// Capitalize first letter of a string
const capitalizeFirst = (str: string): string => {
  if (!str) return str;

  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const useEditableTitle = ({
  title,
  conversationId,
  organizationId,
  onTitleChange,
}: UseEditableTitleProps): UseEditableTitleReturn => {
  const rawTitle = title || DEFAULT_CHAT_TITLE;
  const displayTitle = capitalizeFirst(rawTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayTitle);
  const [updateTitle, { isLoading: isUpdatingTitle }] = useUpdateConversationTitleMutation();

  const canEdit = Boolean(conversationId && organizationId);

  // Update editValue when title prop changes (e.g., from SSE events)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(capitalizeFirst(rawTitle));
    }
  }, [rawTitle, isEditing]);

  // Callback ref to focus and place cursor at end when input mounts
  const inputRefCallback = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.focus();
      // Place cursor at the end
      const length = node.value.length;

      node.setSelectionRange(length, length);
    }
  }, []);

  const handleTitleClick = useCallback(() => {
    if (canEdit && !isUpdatingTitle) {
      setIsEditing(true);
    }
  }, [canEdit, isUpdatingTitle]);

  const handleSave = useCallback(async () => {
    const trimmedValue = editValue.trim();

    setIsEditing(false);

    // If empty or only whitespace, revert to original title
    if (!trimmedValue) {
      setEditValue(displayTitle);

      return;
    }

    // Only update if the title actually changed
    if (trimmedValue !== displayTitle && conversationId && organizationId) {
      // Optimistically update local state
      onTitleChange?.(trimmedValue);

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
        onTitleChange?.(displayTitle);
        setEditValue(displayTitle);
        toast.error('Failed to update conversation title');
      }
    }
  }, [editValue, displayTitle, conversationId, organizationId, updateTitle, onTitleChange]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue(displayTitle);
  }, [displayTitle]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    handleSave();
  }, [handleSave]);

  return {
    displayTitle,
    isEditing,
    editValue,
    isUpdatingTitle,
    canEdit,
    setIsEditing,
    setEditValue,
    handleTitleClick,
    handleSave,
    handleCancel,
    handleChange,
    handleKeyDown,
    handleBlur,
    inputRefCallback,
  };
};
