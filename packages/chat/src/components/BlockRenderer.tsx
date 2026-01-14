'use client';

import { cn } from '@zamp-platform/ui/utils';
import React, { useMemo, useState } from 'react';

import {
  Block,
  BLOCK_TYPE,
  BlockMessage,
  ButtonBlockType,
  type TextContentBlock,
  type ToolResultContentBlock,
  type ToolUseContentBlock,
} from '../types/block.types';
import { extractInitialValues } from './block.utils';
import {
  AttachmentsBlock,
  ButtonBlock,
  MarkdownBlock,
  OutputFilesBlock,
  PlainTextBlock,
  QuestionGroupBlock,
  SingleSelectBlock,
  ThinkingBlock,
  ToolCallBlock,
} from './blocks';

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

  // Create a map of tool_call_id to tool_result blocks
  const toolResultsMap = useMemo(() => {
    const map = new Map<string, ToolResultContentBlock>();
    message.block.forEach((block) => {
      if (block.type === BLOCK_TYPE.TOOL_RESULT && block.payload.tool_call_id) {
        map.set(block.payload.tool_call_id, block);
      }
    });
    return map;
  }, [message.block]);

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
      case BLOCK_TYPE.PLAIN_TEXT:
        return <PlainTextBlock key={block?.id} payload={block?.payload} />;

      case BLOCK_TYPE.THINKING:
        return (
          <ThinkingBlock
            key={block?.id ?? `thinking-${block.order}-${block.start_timestamp}`}
            payload={block?.payload}
            is_complete={block?.is_complete}
            start_timestamp={block?.start_timestamp}
            stop_timestamp={block?.stop_timestamp}
          />
        );

      case BLOCK_TYPE.TOOL_USE: {
        const toolUseBlock = block as ToolUseContentBlock;
        const toolCallId = toolUseBlock?.payload?.tool_call_id || toolUseBlock?.id;
        const toolResult = toolCallId ? toolResultsMap.get(toolCallId) : undefined;

        return (
          <ToolCallBlock
            key={block?.id ?? `tool-use-${block.order}-${block.start_timestamp}`}
            payload={block?.payload}
            is_complete={block?.is_complete}
            name={block?.name}
            toolResult={toolResult}
          />
        );
      }

      case BLOCK_TYPE.TOOL_RESULT:
        // Tool results are rendered with their corresponding tool use blocks
        // Skip rendering them separately
        return null;

      case BLOCK_TYPE.MARKDOWN:
      case BLOCK_TYPE.TEXT:
        return (
          <MarkdownBlock
            key={block?.id ?? `text-${block?.order}-${(block as TextContentBlock)?.start_timestamp}`}
            payload={block?.payload}
          />
        );

      case BLOCK_TYPE.SINGLE_SELECT:
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

      case BLOCK_TYPE.BUTTON:
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

      case BLOCK_TYPE.QUESTION_GROUP:
        return <QuestionGroupBlock key={block?.id} payload={block?.payload} />;

      case BLOCK_TYPE.ATTACHMENTS:
        return <AttachmentsBlock key={block?.id} payload={block?.payload} />;

      case BLOCK_TYPE.OUTPUT_FILES:
        return <OutputFilesBlock key={block?.id} payload={block?.payload} conversationId={conversationId} />;

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
