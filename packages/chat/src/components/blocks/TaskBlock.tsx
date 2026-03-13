'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AnimatedDot,
  AnimatedTerminalIcon,
  Button,
  ImageWithFallback,
  ShimmerText,
} from '@zamp-platform/ui';
import { safeJsonParse } from '@zamp-platform/utils';
import { EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { type FC, useCallback, useMemo } from 'react';

import { getChatTaskRoute } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import type { RootState } from '@/store';

import { API_ENDPOINTS } from '../../api';
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

  const { toolCalls } = useMemo(() => {
    const calls: ToolCallInfo[] = [];

    const messages = chat?.messages ?? [];
    const assistantMessages = messages.filter((msg) => msg?.sender_type === SenderType.ASSISTANT);

    for (const message of assistantMessages) {
      const elements = message?.message_content?.elements ?? [];

      for (const element of elements) {
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

    return { toolCalls: calls };
  }, [chat?.messages, chat?.streamingState]);

  const previousToolCalls = toolCalls?.slice(0, -1) ?? [];
  const lastToolCall = toolCalls?.length > 0 ? toolCalls[toolCalls.length - 1] : null;
  const previousCount = previousToolCalls?.length ?? 0;

  const handleOpenTask = useCallback(() => {
    router.push(getChatTaskRoute(task_id, conversationId ?? ''));
  }, [router, task_id, conversationId]);

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
          <span className='text-GRAY_950'>{toolCall.displayName ?? 'Unknown'}</span>
        )}
      </div>
    );
  };

  return (
    <div className='border-GRAY_400 bg-BG_WHITE w-full overflow-hidden rounded-[10px] border'>
      <Accordion type='single' collapsible className='w-full' defaultValue='task'>
        <AccordionItem value='task' className='border-none'>
          <AccordionTrigger
            className='w-full overflow-hidden px-4 py-3 hover:no-underline [&>svg]:hidden'
            icon={ChevronDown}
            iconRotation={180}
          >
            <div className='flex w-full min-w-0 items-center gap-3'>
              <TaskStatusIcon status={status} />
              <span className='f-13-550 text-GRAY_1000 min-w-0 flex-1 truncate text-left' title={title}>
                {title}
              </span>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 shrink-0 p-0'
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenTask();
                }}
              >
                <ArrowUpRight size={14} className='text-GRAY_700' strokeWidth={1.5} />
              </Button>
            </div>
          </AccordionTrigger>
          {(toolCalls?.length > 0 || status === TASK_STATUS.IN_PROGRESS) && (
            <AccordionContent className='bg-BG_GRAY_2 border-GRAY_400 border-t px-4 py-3'>
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
                        <span className='f-14-450 text-GRAY_950'>
                          {previousCount} {previousCount === 1 ? 'step' : 'steps'}
                        </span>
                      </div>
                      <div className='border-GRAY_400 ml-[7px] h-4 border-l'></div>
                    </div>
                  )}

                  {lastToolCall && (
                    <div className='flex w-full items-center gap-3 pt-0.5'>
                      <div className='flex h-4 w-4 shrink-0 items-center justify-center'>
                        {getToolIcon(lastToolCall)}
                      </div>
                      {renderToolCallTrigger(lastToolCall)}
                    </div>
                  )}

                  {(toolCalls?.length ?? 0) === 0 && !isLoading && status === TASK_STATUS.IN_PROGRESS && (
                    <div className='f-14-450 text-GRAY_700 py-2'>
                      <ShimmerText text='Starting now' autoAnimate={true} />
                    </div>
                  )}
                </>
              )}
            </AccordionContent>
          )}
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default TaskBlock;
