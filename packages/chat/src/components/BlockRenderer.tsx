'use client';

import { cn } from '@zamp-platform/ui/utils';
import React, { useState } from 'react';

import { Block, BlockAction, BlockMessage, BlockType } from '../types/block.types';
import { extractInitialValues } from './block.utils';
import { ButtonBlock, MarkdownBlock, PlainTextBlock, QuestionGroupBlock, SingleSelectBlock } from './blocks';

interface BlockRendererProps {
  message: BlockMessage;
  onAction?: (action: BlockAction, payload: Record<string, string>) => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
  containerClassName?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  message,
  onAction,
  isLoading = false,
  className = '',
}) => {
  const [elementValues, setElementValues] = useState<Record<string, string>>(() => extractInitialValues(message.block));

  const handleElementChange = (blockId: string, value: string) => {
    setElementValues((prev) => ({
      ...prev,
      [blockId]: value,
    }));
  };

  const handleAction = async (action: BlockAction, payload: Record<string, string>) => {
    if (onAction) {
      await onAction(action, payload);
    }
  };

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case BlockType.PLAIN_TEXT:
        return <PlainTextBlock key={block.id} payload={block.payload} />;

      case BlockType.MARKDOWN:
        return <MarkdownBlock key={block.id} payload={block.payload} />;

      case BlockType.SINGLE_SELECT:
        return (
          <SingleSelectBlock
            key={block.id}
            payload={block.payload}
            blockId={block.id}
            value={elementValues[block.id] || ''}
            onChange={(value) => handleElementChange(block.id, value)}
          />
        );

      case BlockType.BUTTON:
        return (
          <ButtonBlock
            key={block.id}
            payload={block.payload}
            elementValues={elementValues}
            onAction={handleAction}
            isLoading={isLoading}
          />
        );

      case BlockType.QUESTION_GROUP:
        return <QuestionGroupBlock key={block.id} payload={block.payload} />;

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {[...message.block].sort((a, b) => a.order - b.order).map((block) => renderBlock(block))}
    </div>
  );
};
