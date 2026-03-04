'use client';

import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { captureException } from '@sentry/nextjs';
import { API_DOMAIN } from '@zamp-platform/api';
import {
  type Block,
  BLOCK_TYPE,
  ChatMessageType,
  type OutputFilesBlockType,
  ResourceType,
  SenderType,
  SSEEventType,
  type StreamEventPayload,
  StreamingContentBlockDeltaType,
  StreamingContentBlockType,
  type StreamingState,
  streamingStateStore,
  type TaskContentBlock,
} from '@zamp-platform/chat';
import { EventBus, SSEConnectionState, useSSE } from '@zamp-platform/utils';
import {
  type BaseEventPayload,
  EVENT_TYPE,
  type EventBusInterface,
} from '@zamp-platform/utils/event-bus/event-bus.types';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import type { MapAny } from '@/types/commonTypes';

interface SSEContextType {
  state: SSEConnectionState;
  connect: (url?: string) => void;
  disconnect: () => void;
  close: () => void;
  eventSource: EventSource | null;
  sseEventBus: EventBusInterface;
}

const SSEContext = createContext<SSEContextType | undefined>(undefined);

export const useSSEContext = () => {
  const context = useContext(SSEContext);

  if (context === undefined) {
    throw new Error('useSSEContext must be used within an SSEProvider');
  }

  return context;
};

/** Routes AGENT_STREAMS events to the correct conversation in streamingStateStore. */
function handleGlobalStreamEvent(data: BaseEventPayload): void {
  try {
    const payload = data.payload as StreamEventPayload;
    const outerPayload = data.payload as MapAny;
    const conversationId = outerPayload?.streaming_id as string;

    if (!conversationId) return;

    switch (payload.type) {
      case StreamingContentBlockType.CONTENT_BLOCK_START: {
        const { index, content_block } = payload;
        const blockType = content_block?.type;

        let newBlock: Block;

        switch (blockType) {
          case BLOCK_TYPE.THINKING:
            newBlock = {
              type: BLOCK_TYPE.THINKING,
              order: index,
              payload: { thinking: '' },
              start_timestamp: content_block?.start_timestamp,
              is_complete: false,
            };
            break;
          case BLOCK_TYPE.TEXT:
            newBlock = {
              type: BLOCK_TYPE.TEXT,
              order: index,
              payload: { text: '' },
              start_timestamp: content_block?.start_timestamp,
              is_complete: false,
            };
            break;
          case BLOCK_TYPE.TOOL_RESULT: {
            const toolCallId = content_block?.tool_call_id || content_block?.id;

            newBlock = {
              type: BLOCK_TYPE.TOOL_RESULT,
              order: index,
              id: content_block.id,
              payload: {
                content: '',
                is_error: false,
                tool_call_id: toolCallId,
              },
              start_timestamp: content_block?.start_timestamp,
              is_complete: false,
            };
            break;
          }
          case BLOCK_TYPE.TASK:
            newBlock = {
              type: BLOCK_TYPE.TASK,
              order: index,
              id: content_block?.id,
              payload: {
                id: content_block?.id || '',
                title: (content_block as MapAny)?.title || '',
                task_id: (content_block as MapAny)?.task_id || content_block?.id || '',
                status: (content_block as MapAny)?.status,
              },
              start_timestamp: content_block?.start_timestamp,
              is_complete: false,
            } as TaskContentBlock;
            break;
          default:
            newBlock = {
              type: BLOCK_TYPE.TOOL_USE,
              order: index,
              id: content_block?.id,
              name: content_block?.name,
              payload: {
                partial_json: '',
                tool_call_id: content_block?.id,
                display_name: content_block?.display_name,
              },
              start_timestamp: content_block?.start_timestamp,
              is_complete: false,
            };
        }

        streamingStateStore.update(conversationId, (prev) => {
          if (!prev) {
            return {
              resource_type: ResourceType.ORGANIZATION,
              resource_id: '',
              conversation_id: conversationId,
              message_content: { elements: [newBlock] },
              message_type: ChatMessageType.SYSTEM,
              sender_type: SenderType.ASSISTANT,
              timestamp: new Date().toISOString(),
              metadata: {},
              is_active: true,
            };
          }
          const existingBlocks = prev.message_content?.elements ?? [];

          return {
            ...prev,
            message_content: {
              ...prev.message_content,
              elements: [...existingBlocks, newBlock],
            },
          };
        });
        break;
      }

      case StreamingContentBlockType.CONTENT_BLOCK_DELTA: {
        const { index, delta } = payload;

        streamingStateStore.update(conversationId, (prev) => {
          if (!prev) return prev;

          const existingBlocks = prev.message_content?.elements ?? [];
          const updatedBlocks = existingBlocks.map((block) => {
            if (block.order !== index) return block;

            switch (delta.type) {
              case StreamingContentBlockDeltaType.THINKING_DELTA:
                if (block.type === BLOCK_TYPE.THINKING) {
                  return { ...block, payload: { thinking: (block.payload.thinking || '') + delta.thinking } };
                }
                break;
              case StreamingContentBlockDeltaType.TEXT_DELTA:
                if (block.type === BLOCK_TYPE.TEXT) {
                  return { ...block, payload: { text: block.payload.text + delta.text } };
                }
                break;
              case StreamingContentBlockDeltaType.INPUT_JSON_DELTA:
                if (block.type === BLOCK_TYPE.TOOL_USE) {
                  return {
                    ...block,
                    payload: {
                      ...block.payload,
                      partial_json: (block.payload.partial_json || '') + delta.partial_json,
                    },
                  };
                }
                break;
              case StreamingContentBlockDeltaType.TOOL_USE_BLOCK_UPDATE_DELTA:
                if (block.type === BLOCK_TYPE.TOOL_USE) {
                  return {
                    ...block,
                    payload: {
                      ...block.payload,
                      message: delta.message ?? block.payload.message,
                      display_content: delta.display_content ?? block.payload.display_content,
                    },
                  };
                }
                break;
              case StreamingContentBlockDeltaType.TOOL_RESULT_DELTA:
                if (block.type === BLOCK_TYPE.TOOL_RESULT) {
                  return {
                    ...block,
                    payload: {
                      ...block.payload,
                      content: (block.payload.content || '') + delta.content,
                      is_error: delta.is_error,
                      tool_call_id: delta.tool_call_id ?? block.payload.tool_call_id,
                    },
                  };
                }
                break;
              case StreamingContentBlockDeltaType.TASK_DELTA:
                if (block.type === BLOCK_TYPE.TASK) {
                  return {
                    ...block,
                    payload: {
                      ...block.payload,
                      title: delta.title ?? block.payload.title,
                      status: delta.status ?? block.payload.status,
                    },
                  };
                }
                break;
            }

            return block;
          });

          return {
            ...prev,
            message_content: {
              ...prev.message_content,
              elements: updatedBlocks,
            },
          };
        });
        break;
      }

      case StreamingContentBlockType.CONTENT_BLOCK_STOP: {
        const { index, stop_timestamp } = payload;

        streamingStateStore.update(conversationId, (prev) => {
          if (!prev) return prev;

          const existingBlocks = prev.message_content?.elements ?? [];
          const updatedBlocks = existingBlocks.map((block) => {
            if (block.order !== index) return block;

            return { ...block, is_complete: true, stop_timestamp };
          });

          return {
            ...prev,
            message_content: {
              ...prev.message_content,
              elements: updatedBlocks,
            },
            is_active: true,
          };
        });
        break;
      }
    }
  } catch (error) {
    captureException(error);
  }
}

/** Handles global CONVERSATION_V2 events (MESSAGE_START, OUTPUT_FILES, MESSAGE_STOP). */
function handleGlobalConversationEvent(data: BaseEventPayload): void {
  try {
    const payload = data.payload as MapAny;

    switch (payload?.type) {
      case SSEEventType.MESSAGE_START: {
        const message = payload.message as MapAny;
        const conversationId = message?.conversation_id as string;

        if (!conversationId) return;

        const senderType =
          message.sender_type === 'ASSISTANT' || message.sender_type === SenderType.ASSISTANT
            ? SenderType.ASSISTANT
            : SenderType.USER;

        const newState: StreamingState = {
          resource_type: ResourceType.ORGANIZATION,
          resource_id: (message.organization_id as string) || '',
          conversation_id: conversationId,
          id: message.id as string,
          message_content: { elements: [] },
          message_type: ChatMessageType.SYSTEM,
          sender_type: senderType,
          sender_name: (message.sender_name as string) || 'assistant',
          timestamp: (message.created_at as string) || new Date().toISOString(),
          metadata: {},
          is_active: true,
        };

        streamingStateStore.set(conversationId, newState);
        break;
      }

      case SSEEventType.OUTPUT_FILES: {
        const outputMessage = payload.message as MapAny;
        const messageId = outputMessage?.id as string;
        const conversationId = (payload.conversation_id as string) || (data.source_id as string);

        if (!conversationId) return;

        streamingStateStore.update(conversationId, (prev) => {
          if (!prev) return prev;
          if (prev.id && prev.id !== messageId) return prev;

          const outputFilesBlock: OutputFilesBlockType = {
            id: `output-files-${messageId}`,
            type: BLOCK_TYPE.OUTPUT_FILES,
            order: (prev.message_content?.elements?.length || 0) + 1,
            payload: {
              output_files: outputMessage.output_files as OutputFilesBlockType['payload']['output_files'],
            },
          };

          return {
            ...prev,
            message_content: {
              ...prev.message_content,
              elements: [...(prev.message_content?.elements || []), outputFilesBlock],
            },
          };
        });
        break;
      }

      case SSEEventType.MESSAGE_STOP: {
        const conversationId = (payload.conversation_id as string) || (data.source_id as string);

        if (!conversationId) return;

        streamingStateStore.update(conversationId, (prev) => {
          if (!prev) return prev;

          return { ...prev, is_active: false };
        });

        // Deferred cleanup: if no useChat instance processes this entry within 5s, delete it
        // to prevent memory leaks from background conversations that have no active subscriber.
        setTimeout(() => {
          const entry = streamingStateStore.get(conversationId);

          if (entry && !entry.is_active) {
            streamingStateStore.delete(conversationId);
          }
        }, 5000);
        break;
      }
    }
  } catch (error) {
    captureException(error);
  }
}

interface SSEProviderProps {
  children: ReactNode;
  sseEventBus: EventBusInterface;
}

export const SSEProvider: React.FC<SSEProviderProps> = ({ children, sseEventBus = new EventBus() }) => {
  const handleSSEEvent = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      if (data?.type) {
        sseEventBus.publish(data.type, data);
      } else {
        captureException(new Error('SSE event received without required type field'));
      }
    } catch (error) {
      captureException(error);
    }
  };

  // Global subscriptions for streaming events across all conversations.
  useEffect(() => {
    const streamSub = sseEventBus.subscribe(EVENT_TYPE.AGENT_STREAMS, handleGlobalStreamEvent);
    const convSub = sseEventBus.subscribe(EVENT_TYPE.CONVERSATION_V2, handleGlobalConversationEvent);

    return () => {
      streamSub.unsubscribe();
      convSub.unsubscribe();
    };
  }, [sseEventBus]);

  const sseHook = useSSE({
    reconnectIntervalMs: 30000,
    maxReconnectAttempts: 5,
    url: `${API_DOMAIN}/${API_ENDPOINTS.UNIFIED_SSE}`,
    eventListeners: {
      update: handleSSEEvent,
      message: handleSSEEvent,
    },
    errorReportDelayMs: 10000,
    onError: (errorInfo) => {
      if (!errorInfo.isNetworkError) {
        captureException(new Error('SSE connection error'), {
          extra: {
            readyState: errorInfo.readyState,
            isNetworkError: errorInfo.isNetworkError,
          },
        });
      }
    },
  });

  const value: SSEContextType = {
    state: sseHook.state,
    connect: sseHook.connect,
    disconnect: sseHook.disconnect,
    close: sseHook.close,
    eventSource: sseHook.eventSource,
    sseEventBus,
  };

  return <SSEContext.Provider value={value}>{children}</SSEContext.Provider>;
};

export const useEventBus = (): SSEContextType => {
  const context = useContext(SSEContext);

  if (!context) {
    throw new Error('useEventBus must be used within an SSEProvider');
  }

  return context;
};
