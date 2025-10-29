'use client';

import { Button } from '@zamp-platform/ui';
import React from 'react';

import { ActionType, BlockAction } from '../../types/block.types';

interface ButtonBlockProps {
  payload: {
    is_disabled: boolean;
    label: string;
    value: string;
    action: BlockAction;
  };
  elementValues: Record<string, string>;
  onAction: (action: BlockAction, payload: Record<string, string>) => void;
  isLoading?: boolean;
}

export const ButtonBlock: React.FC<ButtonBlockProps> = ({ payload, elementValues, onAction, isLoading = false }) => {
  const handleClick = () => {
    const actionPayload: Record<string, string> = {};

    if (payload.action.type === ActionType.INTERNAL_API && payload.action.dependent_elements) {
      payload.action.dependent_elements.forEach((elementId) => {
        if (elementValues[elementId]) {
          actionPayload[elementId] = elementValues[elementId];
        }
      });
    }

    onAction(payload.action, actionPayload);
  };

  return (
    <Button
      onClick={handleClick}
      variant={payload.action.type === ActionType.REDIRECT ? 'secondary' : 'default'}
      size='small'
      isLoading={isLoading}
      disabled={isLoading || payload.is_disabled}
      data-testid='button-block'
    >
      {payload.label}
    </Button>
  );
};
