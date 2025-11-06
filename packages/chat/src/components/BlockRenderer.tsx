'use client';

import { cn } from '@zamp-platform/ui/utils';
import React, { useState } from 'react';

import { Block, BlockMessage, BlockType, ButtonBlockType } from '../types/block.types';
import { extractInitialValues } from './block.utils';
import { ButtonBlock, MarkdownBlock, PlainTextBlock, QuestionGroupBlock, SingleSelectBlock } from './blocks';

interface BlockRendererProps {
  message: BlockMessage;
  onAction?: (blockConfig: ButtonBlockType, payload: Record<string, string>) => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
  containerClassName?: string;
  conversationId?: string;
  messageId?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  message,
  onAction,
  isLoading = false,
  className = '',
  conversationId,
  messageId,
}) => {
  const [elementValues, setElementValues] = useState<
    Record<string, { label: string; value: string; optionType: 'plain_text' | 'markdown' }>
  >(
    () =>
      extractInitialValues(message.block) as Record<
        string,
        { label: string; value: string; optionType: 'plain_text' | 'markdown' }
      >,
  );

  const handleElementChange = (
    blockId: string,
    selectedOption: { label: string; value: string; optionType: 'plain_text' | 'markdown' },
  ) => {
    setElementValues((prev) => ({
      ...prev,
      [blockId]: {
        label: selectedOption.label,
        value: selectedOption.value,
        optionType: selectedOption.optionType,
      },
    }));
  };

  const handleAction = async (blockConfig: ButtonBlockType, payload: Record<string, string>) => {
    if (onAction) {
      await onAction(blockConfig, payload);
    }
  };

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case BlockType.PLAIN_TEXT:
        return <PlainTextBlock key={block?.id} payload={block?.payload} />;

      case BlockType.MARKDOWN:
        return <MarkdownBlock key={block?.id} payload={block?.payload} />;

      case BlockType.SINGLE_SELECT:
        return (
          <SingleSelectBlock
            key={block?.id}
            payload={block?.payload}
            blockId={block?.id}
            value={elementValues[block?.id]?.value || ''}
            onChange={(value) =>
              handleElementChange(block?.id, {
                label: block.payload.options.find((option) => option.id === value)?.label || '',
                value,
                optionType: block.payload.options.find((option) => option.id === value)?.type || 'plain_text',
              })
            }
          />
        );

      case BlockType.BUTTON:
        return (
          <ButtonBlock
            key={block?.id}
            elementValues={elementValues}
            onAction={handleAction}
            isLoading={isLoading}
            blockConfig={block}
            conversationId={conversationId}
            messageId={messageId}
          />
        );

      case BlockType.QUESTION_GROUP:
        return <QuestionGroupBlock key={block?.id} payload={block?.payload} />;

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {[...message?.block]?.sort((a, b) => a?.order - b?.order)?.map((block) => renderBlock(block))}
    </div>
  );
};
