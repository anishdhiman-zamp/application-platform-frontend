'use client';

import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { captureException } from '@sentry/nextjs';
import { API_DOMAIN } from '@zamp-platform/api';
import {
  type AgentContentBlock,
  type Block,
  BLOCK_TYPE,
  ChatMessageType,
  type InstructionsUpdatedContentBlock,
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
  type TriggerContentBlock,
} from '@zamp-platform/chat';
import { EventBus, SSEConnectionState, useSSE } from '@zamp-platform/utils';
import {
  type BaseEventPayload,
  EVENT_TYPE,
  type EventBusInterface,
} from '@zamp-platform/utils/event-bus/event-bus.types';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import { store } from '@/store';
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

/** Returns SSE context if available, or undefined if outside SSEProvider. */
export const useOptionalSSEContext = () => useContext(SSEContext);

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
                title: content_block?.title || '',
                task_id: content_block?.task_id || content_block?.id || '',
                status: content_block?.status,
              },
              start_timestamp: content_block?.start_timestamp,
              is_complete: false,
            } as TaskContentBlock;
            break;
          case BLOCK_TYPE.AGENT:
            newBlock = {
              type: BLOCK_TYPE.AGENT,
              order: index,
              id: content_block?.id,
              payload: {
                agent_id: content_block?.agent_id || '',
                name: content_block?.name || '',
                description: content_block?.description || '',
                colour: content_block?.colour || '',
                avatar: content_block?.avatar || undefined,
              },
              start_timestamp: content_block?.start_timestamp,
              is_complete: false,
            } as AgentContentBlock;
            break;
          case BLOCK_TYPE.TRIGGER:
            newBlock = {
              type: BLOCK_TYPE.TRIGGER,
              order: index,
              id: content_block?.id,
              payload: {
                trigger_id: content_block?.trigger_id || '',
                title: content_block?.title || '',
                status: content_block?.status || '',
                agent_id: content_block?.agent_id || '',
              },
              start_timestamp: content_block?.start_timestamp,
              is_complete: false,
            } as TriggerContentBlock;
            break;
          case BLOCK_TYPE.INSTRUCTIONS_UPDATED:
            newBlock = {
              type: BLOCK_TYPE.INSTRUCTIONS_UPDATED,
              order: index,
              id: content_block?.id,
              payload: {
                agent_id: content_block?.agent_id || '',
              },
              start_timestamp: content_block?.start_timestamp,
              is_complete: false,
            } as InstructionsUpdatedContentBlock;
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

        // Safe guard: SSE protocol guarantees MESSAGE_START (which calls streamingStateStore.set())
        // always precedes CONTENT_BLOCK_START/DELTA/STOP. A null prev indicates an out-of-order
        // event that should be ignored.
        streamingStateStore.update(conversationId, (prev) => {
          if (!prev) return prev;

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

        const prevState = streamingStateStore.get(conversationId);
        const stoppedBlock = prevState?.message_content?.elements?.find((b) => b.order === index);

        if (stoppedBlock?.type === BLOCK_TYPE.INSTRUCTIONS_UPDATED) {
          const agentId = (stoppedBlock as InstructionsUpdatedContentBlock).payload.agent_id;

          if (agentId) {
            store.dispatch(baseApi.util.invalidateTags([{ type: APITags.GET_AGENT_INSTRUCTIONS, id: agentId }]));
          }
        }

        if (stoppedBlock?.type === BLOCK_TYPE.TRIGGER) {
          store.dispatch(baseApi.util.invalidateTags([APITags.GET_AGENT_TRIGGERS]));
        }

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

/**
 * Abstracts the payload shape differences between CONVERSATION_V2 (nested `message` object)
 * and TASK (flat payload with `task_id`).
 */
interface PayloadResolver {
  getConversationId(payload: MapAny, data: BaseEventPayload): string | undefined;
  getMessageId(payload: MapAny): string;
  getResourceId(payload: MapAny): string;
  getSenderType(payload: MapAny): SenderType;
  getSenderName(payload: MapAny): string;
  getTimestamp(payload: MapAny): string;
  getOutputFiles(payload: MapAny): OutputFilesBlockType['payload']['output_files'];
}

const conversationPayloadResolver: PayloadResolver = {
  getConversationId(payload, data) {
    const message = payload.message as MapAny;

    return (message?.conversation_id as string) || (payload.conversation_id as string) || (data.source_id as string);
  },
  getMessageId(payload) {
    const message = payload.message as MapAny;

    return (message?.id as string) || '';
  },
  getResourceId(payload) {
    const message = payload.message as MapAny;

    return (message?.organization_id as string) || '';
  },
  getSenderType(payload) {
    const message = payload.message as MapAny;

    return message?.sender_type === 'ASSISTANT' || message?.sender_type === SenderType.ASSISTANT
      ? SenderType.ASSISTANT
      : SenderType.USER;
  },
  getSenderName(payload) {
    const message = payload.message as MapAny;

    return (message?.sender_name as string) || 'assistant';
  },
  getTimestamp(payload) {
    const message = payload.message as MapAny;

    return (message?.created_at as string) || new Date().toISOString();
  },
  getOutputFiles(payload) {
    const message = payload.message as MapAny;

    return message?.output_files as OutputFilesBlockType['payload']['output_files'];
  },
};

const taskPayloadResolver: PayloadResolver = {
  getConversationId(payload) {
    return payload.task_id as string;
  },
  getMessageId(payload) {
    return (payload.message_id as string) || '';
  },
  getResourceId(payload) {
    return (payload.organization_id as string) || '';
  },
  getSenderType() {
    return SenderType.ASSISTANT;
  },
  getSenderName() {
    return 'assistant';
  },
  getTimestamp() {
    return new Date().toISOString();
  },
  getOutputFiles(payload) {
    return payload.output_files as OutputFilesBlockType['payload']['output_files'];
  },
};

function invalidateTaskCaches(): void {
  store.dispatch(
    baseApi.util.invalidateTags([APITags.GET_TASK_COUNTS, APITags.GET_TASK_LIST, APITags.GET_AGENT_TASKS]),
  );
}

/** Generic handler for MESSAGE_START / OUTPUT_FILES / MESSAGE_STOP events. */
function handleGlobalMessageEvent(resolver: PayloadResolver, data: BaseEventPayload): void {
  try {
    const payload = data.payload as MapAny;
    const conversationId = resolver.getConversationId(payload, data);

    if (!conversationId) return;

    switch (payload?.type) {
      case SSEEventType.MESSAGE_START: {
        const newState: StreamingState = {
          resource_type: ResourceType.ORGANIZATION,
          resource_id: resolver.getResourceId(payload),
          conversation_id: conversationId,
          id: resolver.getMessageId(payload),
          message_content: { elements: [] },
          message_type: ChatMessageType.SYSTEM,
          sender_type: resolver.getSenderType(payload),
          sender_name: resolver.getSenderName(payload),
          timestamp: resolver.getTimestamp(payload),
          metadata: {},
          is_active: true,
        };

        streamingStateStore.set(conversationId, newState);
        break;
      }

      case SSEEventType.OUTPUT_FILES: {
        const messageId = resolver.getMessageId(payload);

        streamingStateStore.update(conversationId, (prev) => {
          if (!prev) return prev;
          if (prev.id && prev.id !== messageId) return prev;

          const outputFilesBlock: OutputFilesBlockType = {
            id: `output-files-${messageId}`,
            type: BLOCK_TYPE.OUTPUT_FILES,
            order: (prev.message_content?.elements?.length || 0) + 1,
            payload: {
              output_files: resolver.getOutputFiles(payload),
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

/** Updates task block status in streaming state when a task_update SSE event arrives. */
function handleGlobalTaskUpdate(data: BaseEventPayload): void {
  try {
    const sourceId = data.source_id;

    if (!sourceId) return;

    const payload = data.payload as MapAny;
    const taskId = payload?.task_id as string;
    const status = (payload?.updated_fields as MapAny)?.status;

    if (!taskId || !status) return;

    invalidateTaskCaches();

    streamingStateStore.update(sourceId, (prev) => {
      if (!prev) return prev;

      const elements = prev.message_content?.elements;

      if (!elements?.length) return prev;

      let hasUpdate = false;
      const updatedElements = elements.map((el) => {
        if (el.type === BLOCK_TYPE.TASK && (el as TaskContentBlock).payload.task_id === taskId) {
          hasUpdate = true;

          return {
            ...el,
            payload: { ...(el as TaskContentBlock).payload, status },
          };
        }

        return el;
      });

      if (!hasUpdate) return prev;

      return {
        ...prev,
        message_content: { ...prev.message_content, elements: updatedElements },
      };
    });
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
      const eventKey = data?.type ?? data?.event_type;

      if (eventKey) {
        sseEventBus.publish(eventKey, data);
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
    const convSub = sseEventBus.subscribe(EVENT_TYPE.CONVERSATION_V2, (data) =>
      handleGlobalMessageEvent(conversationPayloadResolver, data),
    );
    const taskSub = sseEventBus.subscribe(EVENT_TYPE.TASK, (data) => {
      handleGlobalMessageEvent(taskPayloadResolver, data);

      const payload = data.payload as MapAny;

      if (payload?.type === SSEEventType.MESSAGE_STOP) {
        invalidateTaskCaches();
      }
    });
    const taskUpdateSub = sseEventBus.subscribe(EVENT_TYPE.TASK_UPDATE, handleGlobalTaskUpdate);
    const convCreatedSub = sseEventBus.subscribe(EVENT_TYPE.CONVERSATION_CREATED, () => {
      store.dispatch(baseApi.util.invalidateTags([APITags.GET_CONVERSATION_HISTORY]));
    });
    const titleUpdatedSub = sseEventBus.subscribe(EVENT_TYPE.CONVERSATION_TITLE_UPDATED, () => {
      store.dispatch(baseApi.util.invalidateTags([APITags.GET_CONVERSATION_HISTORY]));
    });

    return () => {
      streamSub.unsubscribe();
      convSub.unsubscribe();
      taskSub.unsubscribe();
      taskUpdateSub.unsubscribe();
      convCreatedSub.unsubscribe();
      titleUpdatedSub.unsubscribe();
    };
  }, [sseEventBus]);

  const sseHook = useSSE({
    reconnectIntervalMs: 30000,
    maxReconnectAttempts: 5,
    url: `${API_DOMAIN}/${API_ENDPOINTS.UNIFIED_SSE}`,
    eventListeners: {
      update: handleSSEEvent,
      message: handleSSEEvent,
      input_required: handleSSEEvent,
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
