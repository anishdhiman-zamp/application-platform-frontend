'use client';

import { Button } from '@zamp-platform/ui';
import React, { useMemo } from 'react';

import { ActionType, ButtonBlockType } from '../../types/block.types';

interface ButtonBlockProps {
  elementValues: Record<string, { label: string; value: string }>;
  onAction: (blockConfig: ButtonBlockType, payload: Record<string, string>) => void;
  isLoading?: boolean;
  blockConfig: ButtonBlockType;
  conversationId?: string;
  messageId?: string;
}

export const ButtonBlock: React.FC<ButtonBlockProps> = ({
  blockConfig,
  elementValues,
  onAction,
  isLoading = false,
  conversationId,
  messageId,
}) => {
  const handleClick = () => {
    const actionPayload: Record<string, { label: string; value: string }> = {};

    if (blockConfig?.action?.type === ActionType.INTERNAL_API && blockConfig?.action?.dependent_elements) {
      blockConfig?.action?.dependent_elements?.forEach((elementId) => {
        if (elementValues[elementId]) {
          actionPayload[elementId] = elementValues[elementId];
        }
      });
    }

    onAction(blockConfig, { ...actionPayload, conversationId: conversationId || '', messageId: messageId || '' });
  };

  const buttonVariant = useMemo(
    () => (blockConfig?.action?.type === ActionType.INTERNAL_REDIRECT ? 'secondary' : 'default'),
    [blockConfig?.action?.type],
  );

  return (
    <>
      {blockConfig?.payload?.is_display !== false && (
        <Button
          onClick={handleClick}
          variant={buttonVariant}
          size='small'
          isLoading={isLoading}
          disabled={isLoading || blockConfig?.payload?.is_disabled}
          data-testid='button-block'
        >
          {blockConfig?.payload?.label}
        </Button>
      )}
    </>
  );
};
