'use client';

import { AnimatedDot, AnimatedTerminalIcon, ImageWithFallback, ShimmerText } from '@zamp-platform/ui';
import { formatPlural, safeJsonParse } from '@zamp-platform/utils';
import { EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FC, useCallback, useMemo } from 'react';

import { getChatTaskRoute } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import type { RootState } from '@/store';

import { API_ENDPOINTS } from '../../api';
import { useChatActions } from '../../context/ChatActionsContext';
import { useChat } from '../../hooks/useChat';
import { BLOCK_TYPE, TASK_STATUS, type TaskBlockType, type ToolUseContentBlock } from '../../types/block.types';
import { ResourceType, SenderType } from '../../types/chat.types';
import TaskStatusIcon from './TaskStatusIcon';

interface TaskBlockProps {
  payload: TaskBlockType['payload'];
  conversationId?: string;
}

interface ToolCallInfo {
  id: string;
  name: string;
  displayName: string;
  icon?: string;
  isComplete: boolean;
  block: ToolUseContentBlock;
}

const TaskBlock: FC<TaskBlockProps> = ({ payload, conversationId }) => {
  const router = useRouter();
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const { onTaskOpen } = useChatActions();

  const { title, task_id, status = TASK_STATUS.IN_PROGRESS } = payload;

  const chat = useChat({
    resourceId: organizationId,
    resourceType: ResourceType.ORGANIZATION,
    conversationId: task_id,
    eventType: EVENT_TYPE.TASK,
    enableStreaming: true,
    apiConfig: {
      getConversationById: API_ENDPOINTS.TASKS_MESSAGES_GET,
    },
  });

  const isLoading = chat?.isLoadingConversationHistory ?? false;

  const { toolCalls, markdownStepsBeforeLastTool } = useMemo(() => {
    const calls: ToolCallInfo[] = [];
    const elementTypes: string[] = [];

    const messages = chat?.messages ?? [];
    const assistantMessages = messages.filter((msg) => msg?.sender_type === SenderType.ASSISTANT);

    for (const message of assistantMessages) {
      const elements = message?.message_content?.elements ?? [];

      for (const element of elements) {
        elementTypes.push(element?.type);

        if (element?.type === BLOCK_TYPE.TOOL_USE) {
          const toolUseBlock = element as ToolUseContentBlock;
          const displayContent = safeJsonParse<{ tool_name?: string; icon?: string }>(
            toolUseBlock?.payload?.display_content?.json_block,
          );
          const toolCallId = toolUseBlock?.payload?.tool_call_id ?? toolUseBlock?.id;

          calls.push({
            id: toolCallId ?? `tool-${calls.length}`,
            name: toolUseBlock?.payload?.name ?? displayContent?.tool_name ?? 'Unknown',
            displayName: toolUseBlock?.payload?.display_name ?? 'Unknown',
            icon: toolUseBlock?.payload?.icon ?? displayContent?.icon,
            isComplete: toolUseBlock?.is_complete !== false,
            block: toolUseBlock,
          });
        }
      }
    }

    const streamingElements = chat?.streamingState?.message_content?.elements ?? [];
    for (const element of streamingElements) {
      elementTypes.push(element?.type);

      if (element?.type === BLOCK_TYPE.TOOL_USE) {
        const toolUseBlock = element as ToolUseContentBlock;
        const displayContent = safeJsonParse<{ tool_name?: string; icon?: string }>(
          toolUseBlock?.payload?.display_content?.json_block,
        );
        const toolCallId = toolUseBlock?.payload?.tool_call_id ?? toolUseBlock?.id;

        calls.push({
          id: toolCallId ?? `streaming-tool-${calls.length}`,
          name: toolUseBlock?.payload?.name ?? displayContent?.tool_name ?? 'Unknown',
          displayName: toolUseBlock?.payload?.display_name ?? 'Unknown',
          icon: toolUseBlock?.payload?.icon ?? displayContent?.icon,
          isComplete: toolUseBlock?.is_complete !== false,
          block: toolUseBlock,
        });
      }
    }

    let lastToolIndex = -1;
    for (let i = elementTypes?.length - 1; i >= 0; i--) {
      if (elementTypes[i] === BLOCK_TYPE.TOOL_USE) {
        lastToolIndex = i;
        break;
      }
    }

    const isTextLike = (type: string) =>
      type === BLOCK_TYPE.TEXT || type === BLOCK_TYPE.MARKDOWN || type === BLOCK_TYPE.THINKING;

    let mdCount = 0;
    if (lastToolIndex === -1) {
      for (const type of elementTypes) {
        if (isTextLike(type)) mdCount++;
      }
      mdCount = Math.max(0, mdCount - 1);
    } else {
      for (let i = 0; i < lastToolIndex; i++) {
        if (isTextLike(elementTypes[i])) mdCount++;
      }
    }

    return { toolCalls: calls, markdownStepsBeforeLastTool: mdCount };
  }, [chat?.messages, chat?.streamingState]);

  const previousToolCalls = toolCalls?.slice(0, -1) ?? [];
  const lastToolCall = toolCalls?.length > 0 ? toolCalls[toolCalls.length - 1] : null;
  const previousCount = (previousToolCalls?.length ?? 0) + markdownStepsBeforeLastTool;

  const handleOpenTask = useCallback(() => {
    onTaskOpen?.(title, getChatTaskRoute({ taskId: task_id, conversationId: conversationId ?? '', taskTitle: title }));
    router.push(getChatTaskRoute({ taskId: task_id, conversationId: conversationId ?? '', taskTitle: title }));
  }, [router, task_id, conversationId, title, onTaskOpen]);

  const hasNoToolCalls = (toolCalls?.length ?? 0) === 0 && previousCount === 0;
  const isStartingTask = hasNoToolCalls && !isLoading && status === TASK_STATUS.IN_PROGRESS;

  const hasToolCallContent = isLoading || !!lastToolCall || isStartingTask;

  const getToolIcon = (toolCall: ToolCallInfo | null | undefined) => {
    if (!toolCall) {
      return <AnimatedTerminalIcon showAnimation={false} size={12} />;
    }
    if (toolCall.icon?.length) {
      return <ImageWithFallback src={toolCall.icon} alt={toolCall.name ?? 'Tool'} className='h-3.5 w-3.5' />;
    }
    return <AnimatedTerminalIcon showAnimation={!toolCall.isComplete} size={12} />;
  };

  const renderToolCallTrigger = (toolCall: ToolCallInfo | null | undefined) => {
    if (!toolCall) {
      return null;
    }
    return (
      <div className='flex flex-1 items-center gap-3'>
        {status === TASK_STATUS.IN_PROGRESS ? (
          <ShimmerText text={toolCall.displayName ?? 'Unknown'} autoAnimate={true} />
        ) : (
          <span className='text-GRAY_950 f-14-450'>{toolCall.displayName ?? 'Unknown'}</span>
        )}
      </div>
    );
  };

  return (
    <div
      className='border-GRAY_400 bg-BG_WHITE hover:bg-BG_GRAY_2 w-full cursor-pointer overflow-hidden rounded-[10px] border transition-colors'
      onClick={handleOpenTask}
      role='button'
      tabIndex={0}
    >
      <div className='px-4 py-3'>
        <div className='flex w-full min-w-0 items-center gap-3'>
          <TaskStatusIcon status={status} />
          <span className='f-13-550 text-GRAY_1000 min-w-0 flex-1 truncate text-left' title={title}>
            {title}
          </span>
          <ArrowUpRight size={14} className='text-GRAY_700 shrink-0' strokeWidth={1.5} />
        </div>
      </div>

      {hasToolCallContent && (
        <div className='bg-BG_GRAY_2 border-GRAY_400 f-14-450 border-t px-4 py-3'>
          {isLoading ? (
            <div className='flex items-center justify-center py-4'>
              <AnimatedDot showAnimation size={8} />
            </div>
          ) : (
            <>
              {previousCount > 0 && (
                <div>
                  <div className='flex items-center gap-2'>
                    <ChevronDown size={14} className='text-GRAY_700' />
                    <span className='f-14-450 text-GRAY_950'>{formatPlural(previousCount, 'step', 'steps')}</span>
                  </div>
                  {lastToolCall && <div className='border-GRAY_400 ml-[7px] h-4 border-l' />}
                </div>
              )}

              {lastToolCall && (
                <div className='flex w-full items-center gap-2 pt-0.5'>
                  <div className='flex h-4 w-4 shrink-0 items-center justify-center'>{getToolIcon(lastToolCall)}</div>
                  {renderToolCallTrigger(lastToolCall)}
                </div>
              )}

              {isStartingTask && (
                <div className='f-14-450 text-GRAY_700 py-2'>
                  <ShimmerText text='Starting now' autoAnimate={true} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskBlock;
