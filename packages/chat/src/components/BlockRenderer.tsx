'use client';

import { AnimatedDot } from '@zamp-platform/ui';
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
  showMarkdownConnectors?: boolean;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  message,
  onAction,
  isLoading = false,
  className = '',
  conversationId,
  messageId,
  isStreaming = false,
  showMarkdownConnectors = false,
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

  const isMarkdownBlock = (block?: Block) => {
    return block?.type === BLOCK_TYPE.MARKDOWN || block?.type === BLOCK_TYPE.TEXT;
  };

  const isConnectedBlock = (block?: Block, isLastBlock?: boolean) => {
    if (!block) return false;
    if (isThinkingOrToolUseBlock(block)) return true;
    const effectivelyLast = isLastBlock && !isStreaming;

    if (showMarkdownConnectors && isMarkdownBlock(block) && !effectivelyLast) return true;
    return false;
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

  const renderBlock = (block: Block, index: number, nextBlock?: Block, previousBlock?: Block) => {
    const isLastBlock = index === size - 1;
    const isNextLast = index + 1 === size - 1;
    const currentConnected = isConnectedBlock(block, isLastBlock);
    const nextConnected = isConnectedBlock(nextBlock, isNextLast);
    const prevConnected = isConnectedBlock(previousBlock, false);

    const showConnectorToNext = currentConnected && nextConnected;
    const showConnectorFromPrevious = currentConnected && prevConnected;
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
        return null;

      case BLOCK_TYPE.MARKDOWN:
      case BLOCK_TYPE.TEXT:
        if (showMarkdownConnectors && (!isLastBlock || isStreaming)) {
          return (
            <div
              className='relative'
              key={block?.id ?? `text-${block?.order}-${(block as TextContentBlock)?.start_timestamp}`}
            >
              {showConnectorFromPrevious && (
                <div className='bg-border pointer-events-none absolute top-0 left-[6.5px] z-0 h-2 w-px' />
              )}
              <div
                className={cn(
                  'flex items-start gap-2 py-2',
                  showConnectorFromPrevious &&
                    '[&_div]:text-[13px] [&_ol]:text-[13px] [&_p]:text-[13px] [&_ul]:text-[13px]',
                )}
              >
                <div className='mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center'>
                  <AnimatedDot showAnimation={false} size={4} />
                </div>
                <MarkdownBlock payload={block?.payload} />
              </div>
              {showConnectorToNext && (
                <div className='bg-border pointer-events-none absolute top-[24px] bottom-0 left-[6.5px] z-0 w-px' />
              )}
            </div>
          );
        }
        return (
          <MarkdownBlock
            key={block?.id ?? `text-${block?.order}-${(block as TextContentBlock)?.start_timestamp}`}
            payload={block?.payload}
            isStreaming={isStreaming}
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
        const isLastBlock = index === size - 1;
        const isNextLast = index + 1 === size - 1;
        const shouldRemoveSpacing = isConnectedBlock(block, isLastBlock) && isConnectedBlock(nextBlock, isNextLast);

        return (
          <div
            key={block.id ?? `${block.type}-${block.order}`}
            className={cn(!shouldRemoveSpacing && size > 1 && 'mb-3')}
          >
            {renderBlock(block, index, nextBlock, previousBlock)}
          </div>
        );
      })}
    </div>
  );
};
