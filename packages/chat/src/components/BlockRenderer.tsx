'use client';

import { AnimatedDot } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import React, { useMemo, useState } from 'react';

import { useChatActions } from '../context/ChatActionsContext';
import {
  Block,
  BLOCK_TYPE,
  BlockMessage,
  ButtonBlockType,
  type InputsRespondedBlockType,
  type MarkdownBlockType,
  type OutputFilesBlockType,
  type PlainTextBlockType,
  type QuestionGroupBlockType,
  type ReferencesBlockType,
  type SingleSelectBlockType,
  type TaskBlockType,
  type TextContentBlock,
  type ThinkingContentBlock,
  type ToolResultContentBlock,
  type ToolUseContentBlock,
} from '../types/block.types';
import { extractInitialValues } from './block.utils';
import {
  AgentBlock,
  ButtonBlock,
  FileReferencesList,
  InputsRespondedBlock,
  MarkdownBlock,
  OutputFilesBlock,
  PlainTextBlock,
  QuestionGroupBlock,
  SingleSelectBlock,
  TaskBlock,
  ThinkingBlock,
  ToolCallBlock,
} from './blocks';
import { BROWSER_TOOL_DISPLAY_NAMES, TOOL_NAMES } from './chat.constants';

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
  showConnectorToLastBlock?: boolean;
  showConnectorToNextBlock?: boolean;
  embeddedInStepSummary?: boolean;
  /** Thinking/tool blocks use a transparent shell so they sit flush on muted panels. */
  quietSurface?: boolean;
  /** With `showMarkdownConnectors`, still render the timeline dot on the last/only markdown block (e.g. step group accordion). */
  alwaysShowMarkdownTimelineDot?: boolean;
  /** Reduce spacing between paragraphs — use for user message bubbles where multi-line input should look compact. */
  compactParagraphs?: boolean;
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
  showConnectorToLastBlock = false,
  showConnectorToNextBlock = false,
  embeddedInStepSummary = false,
  quietSurface = false,
  alwaysShowMarkdownTimelineDot = false,
  compactParagraphs = false,
}) => {
  const { renderAgentBlock } = useChatActions();
  const { mentionRefs: messageReferences, uploadRefs: messageUploadRefs } = useMemo(() => {
    const mentionRefs: ReferencesBlockType['payload']['references'] = [];
    const uploadRefs: ReferencesBlockType['payload']['references'] = [];
    for (const b of message.block) {
      if (b.type !== BLOCK_TYPE.REFERENCES) continue;
      for (const ref of (b as ReferencesBlockType).payload?.references ?? []) {
        if (ref.text_range) mentionRefs.push(ref);
        else uploadRefs.push(ref);
      }
    }
    return { mentionRefs, uploadRefs };
  }, [message.block]);
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
      if (block.type !== BLOCK_TYPE.TOOL_RESULT) return;
      const toolResult = block as ToolResultContentBlock;
      const callId = toolResult.payload.tool_call_id;
      if (callId) {
        map.set(callId, toolResult);
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

  const isInputsRespondedTimelineBlock = (block?: Block) => {
    return block?.type === BLOCK_TYPE.INPUTS_RESPONDED;
  };

  const isConnectedBlock = (block?: Block, isLastBlock?: boolean) => {
    if (!block) return false;
    if (embeddedInStepSummary) return false;
    if (isThinkingOrToolUseBlock(block)) return true;
    const effectivelyLast = isLastBlock && !isStreaming;

    if (showMarkdownConnectors && isInputsRespondedTimelineBlock(block) && !effectivelyLast) return true;
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

  const firstBrowserToolOrder = useMemo(() => {
    const block = messageBlocks.find((b) => {
      if (b.type !== BLOCK_TYPE.TOOL_USE) return false;
      const displayName = (b as ToolUseContentBlock).payload?.display_name || '';
      return BROWSER_TOOL_DISPLAY_NAMES.some((n) => displayName.toLowerCase().includes(n.toLowerCase()));
    });
    return block?.order ?? -1;
  }, [messageBlocks]);
  const lastToolCallOrder = useMemo(() => {
    const toolUseBlocks = messageBlocks.filter((b) => b.type === BLOCK_TYPE.TOOL_USE);
    return toolUseBlocks[toolUseBlocks.length - 1]?.order ?? -1;
  }, [messageBlocks]);

  const lastThinkingBlockOrder = useMemo(() => {
    const thinkingBlocks = messageBlocks.filter((b) => b.type === BLOCK_TYPE.THINKING);
    return thinkingBlocks[thinkingBlocks.length - 1]?.order ?? -1;
  }, [messageBlocks]);

  // The model emits both an integration tool_use block AND a redundant
  // `[Connect X](url)` markdown link in the same message — strip the link so
  // only the structured card surfaces in the chat.
  const hasIntegrationCardSibling = useMemo(
    () =>
      messageBlocks.some(
        (b) =>
          b.type === BLOCK_TYPE.TOOL_USE &&
          (b as ToolUseContentBlock).payload?.name === TOOL_NAMES.AUTHENTICATE_INTEGRATION_AND_CREATE_CONNECTION,
      ),
    [messageBlocks],
  );

  const renderBlock = (block: Block, index: number, nextBlock?: Block, previousBlock?: Block) => {
    const isLastBlock = index === size - 1;
    const isNextLast = index + 1 === size - 1;
    const currentConnected = isConnectedBlock(block, isLastBlock);
    const nextConnected = isConnectedBlock(nextBlock, isNextLast);
    const prevConnected = isConnectedBlock(previousBlock, false);

    const showConnectorToNext = (currentConnected && nextConnected) || showConnectorToNextBlock;
    const showConnectorFromPrevious = (currentConnected && prevConnected) || showConnectorToLastBlock;
    const accordionId = getBlockAccordionId(block);
    const isAccordionOpen = openAccordionId === accordionId;

    switch (block.type) {
      case BLOCK_TYPE.PLAIN_TEXT: {
        const plain = block as PlainTextBlockType;
        return <PlainTextBlock key={plain.id} payload={plain.payload} />;
      }

      case BLOCK_TYPE.THINKING: {
        const thinking = block as ThinkingContentBlock;

        return (
          <ThinkingBlock
            key={thinking.id ?? `thinking-${thinking.order}-${thinking.start_timestamp}`}
            payload={thinking.payload}
            is_complete={thinking.is_complete}
            start_timestamp={thinking.start_timestamp}
            stop_timestamp={thinking.stop_timestamp}
            isAccordionOpen={isAccordionOpen}
            embedded={embeddedInStepSummary}
            quietSurface={quietSurface}
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
            isFirstInGroup={!isThinkingOrToolUseBlock(previousBlock)}
            isLastInGroup={!isThinkingOrToolUseBlock(nextBlock)}
            isLastThinkingBlock={thinking.order === lastThinkingBlockOrder && isLastBlock}
            isStreaming={isStreaming}
          />
        );
      }

      case BLOCK_TYPE.TOOL_USE: {
        const toolUseBlock = block as ToolUseContentBlock;
        const toolCallId = toolUseBlock.payload?.tool_call_id || toolUseBlock.id;
        const toolResult = toolCallId ? toolResultsMap.get(toolCallId) : undefined;

        return (
          <ToolCallBlock
            key={toolUseBlock.id ?? `tool-use-${toolUseBlock.order}-${toolUseBlock.start_timestamp}`}
            payload={toolUseBlock.payload}
            is_complete={!nextBlock && isStreaming ? false : toolUseBlock.is_complete}
            toolResult={toolResult}
            isAccordionOpen={isAccordionOpen}
            embedded={embeddedInStepSummary}
            quietSurface={quietSurface}
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
            showWatchButton={toolUseBlock.order === firstBrowserToolOrder}
            isFirstInGroup={!isThinkingOrToolUseBlock(previousBlock)}
            isLastInGroup={!isThinkingOrToolUseBlock(nextBlock)}
            isLastToolCallOrder={toolUseBlock.order === lastToolCallOrder && isLastBlock}
            isStreaming={isStreaming}
          />
        );
      }

      case BLOCK_TYPE.TOOL_RESULT:
        return null;

      case BLOCK_TYPE.MARKDOWN:
      case BLOCK_TYPE.TEXT: {
        const textBlock = block as MarkdownBlockType | TextContentBlock;
        const textStartTs = 'start_timestamp' in textBlock ? textBlock.start_timestamp : undefined;
        const textKey = textBlock.id ?? `text-${textBlock.order}-${textStartTs ?? 'no-start-timestamp'}`;
        // Freeze the typewriter once a later block lands or this one is marked complete — otherwise a text block
        // followed by a tool block keeps animating after it should have stopped.
        const isBlockStreaming = isStreaming && textBlock.is_complete !== true && !nextBlock;

        if (showMarkdownConnectors && (!isLastBlock || isStreaming || alwaysShowMarkdownTimelineDot)) {
          return (
            <div className='relative' key={textKey}>
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
                <div className='bg-BG_WHITE mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center p-1'>
                  <AnimatedDot showAnimation={false} size={4} />
                </div>
                <MarkdownBlock
                  payload={textBlock.payload}
                  compactParagraphs={compactParagraphs}
                  isStreaming={isBlockStreaming}
                  references={messageReferences}
                  stripIntegrationLinks={hasIntegrationCardSibling}
                />
              </div>
              {showConnectorToNext && (
                <div className='bg-border pointer-events-none absolute top-[24px] bottom-0 left-[6.5px] z-0 w-px' />
              )}
            </div>
          );
        }
        return (
          <MarkdownBlock
            key={textKey}
            payload={textBlock.payload}
            isStreaming={isBlockStreaming}
            compactParagraphs={compactParagraphs}
            references={messageReferences}
            stripIntegrationLinks={hasIntegrationCardSibling}
          />
        );
      }

      case BLOCK_TYPE.SINGLE_SELECT: {
        const selectBlock = block as SingleSelectBlockType;
        const selectBlockId = selectBlock.id;
        return (
          <SingleSelectBlock
            key={selectBlockId}
            payload={selectBlock.payload}
            blockId={selectBlockId}
            value={elementValues[selectBlockId]?.value ?? ''}
            onChange={(value) =>
              handleElementChange(selectBlockId, {
                label: selectBlock.payload.options.find((option) => option.id === value)?.label ?? '',
                value,
                optionType: selectBlock.payload.options.find((option) => option.id === value)?.type ?? 'plain_text',
              })
            }
          />
        );
      }

      case BLOCK_TYPE.BUTTON: {
        const buttonBlock = block as ButtonBlockType;
        return (
          <ButtonBlock
            key={buttonBlock.id}
            elementValues={elementValues}
            onAction={handleAction}
            isLoading={isLoading}
            blockConfig={buttonBlock}
            conversationId={conversationId}
            messageId={messageId}
          />
        );
      }

      case BLOCK_TYPE.QUESTION_GROUP: {
        const questionGroup = block as QuestionGroupBlockType;
        return <QuestionGroupBlock key={questionGroup.id} payload={questionGroup.payload} />;
      }

      case BLOCK_TYPE.INPUTS_RESPONDED: {
        const inputsResponded = block as InputsRespondedBlockType;
        return (
          <InputsRespondedBlock
            key={inputsResponded.id ?? `inputs-responded-${inputsResponded.order}`}
            payload={inputsResponded.payload}
            showConnectorFromPrevious={showConnectorFromPrevious}
            showConnectorToNext={showConnectorToNext}
          />
        );
      }

      case BLOCK_TYPE.REFERENCES:
        if (messageUploadRefs.length === 0) return null;
        return (
          <FileReferencesList
            key={block?.id}
            fileReferences={messageUploadRefs.map((ref) => ({
              path: (ref.provider_hints?.path as string) ?? ref.resource_id,
              name: ref.display_label ?? ref.resource_id,
            }))}
            className={cn('mb-2', { 'mb-0': isLastBlock })}
          />
        );

      case BLOCK_TYPE.OUTPUT_FILES: {
        const outputFiles = block as OutputFilesBlockType;
        return <OutputFilesBlock key={outputFiles.id} payload={outputFiles.payload} conversationId={conversationId} />;
      }

      case BLOCK_TYPE.TASK: {
        const taskBlock = block as TaskBlockType;
        return (
          <TaskBlock
            key={taskBlock.payload.task_id ?? taskBlock.id}
            payload={taskBlock.payload}
            conversationId={conversationId}
          />
        );
      }

      case BLOCK_TYPE.AGENT: {
        return (
          <div key={block?.payload?.agent_id ?? block?.id} className={cn('pb-3', { showConnectorToNext: 'pb-4' })}>
            {renderAgentBlock ? renderAgentBlock(block?.payload) : <AgentBlock payload={block?.payload} />}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {messageBlocks.map((block, index) => {
        const previousBlock = index > 0 ? messageBlocks[index - 1] : undefined;
        const nextBlock = messageBlocks[index + 1];

        return (
          <div key={block.id ?? `${block.type}-${block.order}`}>
            {renderBlock(block, index, nextBlock, previousBlock)}
          </div>
        );
      })}
    </div>
  );
};
