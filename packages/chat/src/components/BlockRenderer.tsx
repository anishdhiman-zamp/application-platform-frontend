'use client';

import { cn } from '@zamp-platform/ui/utils';
import React, { useMemo, useState } from 'react';

import {
  Block,
  BLOCK_TYPE,
  BlockMessage,
  ButtonBlockType,
  FileReferencesBlockType,
  type TextContentBlock,
  type ToolResultContentBlock,
  type ToolUseContentBlock,
} from '../types/block.types';
import { extractInitialValues } from './block.utils';
import {
  ButtonBlock,
  FileReferencesList,
  MarkdownBlock,
  OutputFilesBlock,
  PlainTextBlock,
  QuestionGroupBlock,
  SingleSelectBlock,
  TaskBlock,
  ThinkingBlock,
  ToolCallBlock,
} from './blocks';

interface BlockRendererProps {
  message: BlockMessage;
  onAction?: (blockConfig: ButtonBlockType, payload: Record<string, string>) => void | Promise<void>;
  isLoading?: boolean;
  isStreaming?: boolean;
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
  isStreaming = false,
}) => {
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);
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

  const isThinkingOrToolUseBlock = (block?: Block) => {
    return block?.type === BLOCK_TYPE.THINKING || block?.type === BLOCK_TYPE.TOOL_USE;
  };

  const getBlockAccordionId = (block: Block) => {
    const startTimestamp = 'start_timestamp' in block ? block.start_timestamp : undefined;
    return block?.id ?? `${block.type}-${block.order}-${startTimestamp ?? 'no-start-timestamp'}`;
  };

  const { messageBlocks, size } = useMemo(() => {
    const messageBlocks = [...message?.block]
      ?.sort((a, b) => a?.order - b?.order)
      .filter((block) => block.type !== BLOCK_TYPE.TOOL_RESULT);
    return { messageBlocks, size: messageBlocks.length };
  }, [message.block]);

  const renderBlock = (block: Block, nextBlock?: Block, previousBlock?: Block) => {
    const showConnectorToNext = isThinkingOrToolUseBlock(block) && isThinkingOrToolUseBlock(nextBlock);
    const showConnectorFromPrevious = isThinkingOrToolUseBlock(block) && isThinkingOrToolUseBlock(previousBlock);
    const accordionId = getBlockAccordionId(block);
    const isAccordionOpen = openAccordionId === accordionId;

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
            isAccordionOpen={isAccordionOpen}
            onAccordionOpenChange={(isOpen) =>
              setOpenAccordionId((currentId) => {
                if (isOpen) {
                  return accordionId;
                }

                return currentId === accordionId ? null : currentId;
              })
            }
            showConnectorFromPrevious={showConnectorFromPrevious}
            showConnectorToNext={showConnectorToNext}
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
            is_complete={!nextBlock && isStreaming ? false : block?.is_complete}
            toolResult={toolResult}
            isAccordionOpen={isAccordionOpen}
            onAccordionOpenChange={(isOpen) =>
              setOpenAccordionId((currentId) => {
                if (isOpen) {
                  return accordionId;
                }

                return currentId === accordionId ? null : currentId;
              })
            }
            showConnectorFromPrevious={showConnectorFromPrevious}
            showConnectorToNext={showConnectorToNext}
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

      case BLOCK_TYPE.FILE_REFERENCES:
        return (
          <FileReferencesList
            key={block?.id}
            fileReferences={(block as FileReferencesBlockType)?.payload?.file_references?.map((ref) => ({
              path: ref.path,
              name: ref.name,
            }))}
          />
        );

      case BLOCK_TYPE.OUTPUT_FILES:
        return <OutputFilesBlock key={block?.id} payload={block?.payload} conversationId={conversationId} />;

      case BLOCK_TYPE.TASK: {
        return (
          <TaskBlock
            key={block?.payload?.task_id ?? block?.id}
            payload={block?.payload}
            conversationId={conversationId}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={cn(className)}>
      {messageBlocks.map((block, index) => {
        const previousBlock = index > 0 ? messageBlocks[index - 1] : undefined;
        const nextBlock = messageBlocks[index + 1];
        const shouldRemoveSpacing = isThinkingOrToolUseBlock(block) && isThinkingOrToolUseBlock(nextBlock);

        return (
          <div
            key={block.id ?? `${block.type}-${block.order}`}
            className={cn(!shouldRemoveSpacing && size > 1 && 'mb-3')}
          >
            {renderBlock(block, nextBlock, previousBlock)}
          </div>
        );
      })}
    </div>
  );
};
