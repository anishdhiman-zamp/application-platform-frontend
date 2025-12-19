'use client';

import { captureException } from '@sentry/browser';
import { UseSSEOptions } from '@zamp-platform/utils';
import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useEventBus } from '@/app/_providers/sse-provider';
import type { MapAny } from '@/types/commonTypes';

import {
  APITags,
  chatApi,
  useCreateConversationMutation,
  useCreateConversationV2Mutation,
  useGetConversationByIdQuery,
  useSendMessageMutation,
  useSendMessageV2Mutation,
} from '../api';
import { getHistoryFormattedMessages } from '../components/block.utils';
import { BLOCK_TYPE } from '../types/block.types';
import {
  ChatMessage,
  ChatMessageType,
  CreateConversationPayloadType,
  CreateConversationPayloadTypeV2,
  ResourceType,
  SenderType,
  SSEEventType,
  StreamEventPayload,
  StreamingContentBlock,
  StreamingContentType,
  StreamingState,
} from '../types/chat.types';

export interface ChatConfig extends Omit<UseSSEOptions, 'url' | 'onMessage' | 'autoConnect'> {
  conversationId?: string;
  eventUrl?: string;
  onNewMessage?: (message: ChatMessage) => void;
  onTypingUpdate?: (users: string[]) => void;
  onUserJoin?: (user: { id: string; name: string }) => void;
  onUserLeave?: (userId: string) => void;
  resourceId?: string;
  resourceType?: ResourceType;
  setHeader?: (header: string) => void;
  refetchConversationHistory?: boolean;
  // Streaming config options (opt-in, all optional with defaults)
  enableStreaming?: boolean;
  showThinkingContent?: boolean;
  onStreamStart?: (sourceId: string) => void;
  onStreamDelta?: (block: StreamingContentBlock) => void;
  onStreamEnd?: (sourceId: string) => void;
}

export const useChat = (config: ChatConfig) => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sendMessageMutation, { isLoading: isSendingMessage, error: sendMessageError }] = useSendMessageMutation();
  const [sendMessageV2Mutation, { isLoading: isSendingMessageV2, error: sendMessageV2Error }] =
    useSendMessageV2Mutation();
  const [_conversationId, setConversationId] = useState<string | null>(config.conversationId || null);
  const [createConversationMutation, { isLoading: isCreatingConversation, error: createConversationError }] =
    useCreateConversationMutation();
  const [createConversationV2Mutation, { isLoading: isCreatingConversationV2, error: createConversationV2Error }] =
    useCreateConversationV2Mutation();

  // Streaming state - only active when enableStreaming is true
  const [streamingState, setStreamingState] = useState<StreamingState | null>(null);

  // Computed streaming flag - false when streaming is disabled
  const isStreaming = useMemo(() => {
    return config.enableStreaming ? (streamingState?.isActive ?? false) : false;
  }, [config.enableStreaming, streamingState?.isActive]);

  // Clear streaming state - no-op when streaming is disabled
  const clearStreamingState = useCallback(() => {
    if (config.enableStreaming) {
      setStreamingState(null);
    }
  }, [config.enableStreaming]);

  const {
    data: conversationHistory,
    isLoading: isLoadingConversationHistory,
    isFetching: isFetchingConversationHistory,
  } = useGetConversationByIdQuery(
    {
      conversationId: config.conversationId || '',
      resourceId: config.resourceId,
      resourceType: config.resourceType,
    },
    {
      skip: !config.resourceId || !config.resourceType || !config.conversationId,
      refetchOnMountOrArgChange: config.refetchConversationHistory,
    },
  );

  const { sseEventBus } = useEventBus();
  const createConversation = async (conversationPayload: CreateConversationPayloadType) => {
    setMessages([
      {
        ...conversationPayload,
        message_type: ChatMessageType.TEXT,
        sender_type: SenderType.USER,
        message_content: conversationPayload.message_content || { message: '' },
        metadata: {},
        timestamp: new Date().toISOString(),
      },
    ]);
    const response = await createConversationMutation(conversationPayload).unwrap();
    setConversationId(response.conversation_id);
    return response.conversation_id;
  };

  const createConversationV2 = async (conversationPayload: CreateConversationPayloadTypeV2) => {
    const messagePayload: ChatMessage = {
      ...conversationPayload,
      message_type: ChatMessageType.TEXT,
      sender_type: SenderType.USER,
      sender_name: conversationPayload.sender_name || '',
      message_content: conversationPayload.message_content || { text: '', text_type: 'plain_text' },
      metadata: {},
      timestamp: new Date().toISOString(),
    };
    if (messagePayload?.message_content?.attachments?.length) {
      messagePayload.message_content.elements = [
        ...(messagePayload.message_content.elements || []),
        {
          id: 'element_2',
          type: BLOCK_TYPE.ATTACHMENTS,
          order: 2,
          payload: {
            attachments: messagePayload.message_content.attachments,
          },
        },
      ];
    }
    setMessages([messagePayload]);
    const response = await createConversationV2Mutation(conversationPayload).unwrap();
    setConversationId(response.conversation_id);

    // Update header with title from response
    if (response.title) {
      config.setHeader?.(response.title);
    }

    return response;
  };

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    // Also clear streaming state when messages are cleared
    if (config.enableStreaming) {
      setStreamingState(null);
    }
  }, [config.enableStreaming]);

  /**
   * Handle streaming events from agent_streams SSE
   * Processes content_block_start, content_block_delta, and content_block_stop events
   */
  const handleStreamEvent = useCallback(
    (data: BaseEventPayload) => {
      if (!config.enableStreaming) return;

      try {
        const payload = data.payload as StreamEventPayload;
        const sourceId = data.source_id || '';

        switch (payload.type) {
          case 'content_block_start': {
            const { index, content_block } = payload;
            const blockType = content_block.type;

            // Initialize new content block based on type
            const newBlock: StreamingContentBlock =
              blockType === StreamingContentType.THINKING
                ? {
                    type: StreamingContentType.THINKING,
                    index,
                    content: '',
                    startTimestamp: content_block.start_timestamp,
                    isComplete: false,
                  }
                : blockType === StreamingContentType.TEXT
                  ? {
                      type: StreamingContentType.TEXT,
                      index,
                      content: '',
                      startTimestamp: content_block.start_timestamp,
                      isComplete: false,
                    }
                  : {
                      type: StreamingContentType.TOOL_USE,
                      index,
                      id: content_block.id,
                      name: content_block.name,
                      partialJson: '',
                      startTimestamp: content_block.start_timestamp,
                      isComplete: false,
                    };

            setStreamingState((prev) => {
              const existingBlocks = prev?.contentBlocks ?? [];
              return {
                sourceId,
                contentBlocks: [...existingBlocks, newBlock],
                isActive: true,
              };
            });

            config.onStreamStart?.(sourceId);
            break;
          }

          case 'content_block_delta': {
            const { index, delta } = payload;

            setStreamingState((prev) => {
              if (!prev) return prev;

              const updatedBlocks = prev.contentBlocks.map((block) => {
                if (block.index !== index) return block;

                switch (delta.type) {
                  case 'thinking_delta':
                    if (block.type === StreamingContentType.THINKING) {
                      return { ...block, content: block.content + delta.thinking };
                    }
                    break;
                  case 'text_delta':
                    if (block.type === StreamingContentType.TEXT) {
                      return { ...block, content: block.content + delta.text };
                    }
                    break;
                  case 'input_json_delta':
                    if (block.type === StreamingContentType.TOOL_USE) {
                      return { ...block, partialJson: block.partialJson + delta.partial_json };
                    }
                    break;
                  case 'tool_use_block_update_delta':
                    if (block.type === StreamingContentType.TOOL_USE) {
                      return {
                        ...block,
                        message: delta.message ?? block.message,
                        displayContent: delta.display_content ?? block.displayContent,
                      };
                    }
                    break;
                }
                return block;
              });

              return { ...prev, contentBlocks: updatedBlocks };
            });

            // Find the updated block and call the callback
            setStreamingState((prev) => {
              if (prev) {
                const updatedBlock = prev.contentBlocks.find((b) => b.index === index);
                if (updatedBlock) {
                  config.onStreamDelta?.(updatedBlock);
                }
              }
              return prev;
            });
            break;
          }

          case 'content_block_stop': {
            const { index, stop_timestamp } = payload;

            setStreamingState((prev) => {
              if (!prev) return prev;

              const updatedBlocks = prev.contentBlocks.map((block) => {
                if (block.index !== index) return block;
                return { ...block, isComplete: true, stopTimestamp: stop_timestamp };
              });

              // Check if all blocks are complete
              const allComplete = updatedBlocks.every((block) => block.isComplete);

              if (allComplete) {
                // Call onStreamEnd when all blocks are done
                config.onStreamEnd?.(sourceId);
              }

              return {
                ...prev,
                contentBlocks: updatedBlocks,
                isActive: !allComplete,
              };
            });
            break;
          }

          default: {
            // Handle message_start and message_stop events
            const eventType = (payload as { type: string }).type;

            if (eventType === 'message_start') {
              // Initialize streaming state when message starts
              setStreamingState({
                sourceId,
                contentBlocks: [],
                isActive: true,
              });
              config.onStreamStart?.(sourceId);
            } else if (eventType === 'message_stop') {
              setStreamingState(null);
              config.onStreamEnd?.(sourceId);
            }
            break;
          }
        }
      } catch (error) {
        captureException(error);
      }
    },
    [config],
  );

  const handleMessage = useCallback(
    (data: MapAny) => {
      try {
        switch (data.payload.type) {
          case SSEEventType.MESSAGE:
          case SSEEventType.NEW_CHAT_MESSAGE:
            const newMessage: ChatMessage = data.payload.message;
            setMessages((prev) => [...prev, { ...newMessage, timestamp: new Date().toISOString() }]);
            // Clear streaming state when a new message arrives (the final message from the stream)
            if (config.enableStreaming) {
              setStreamingState(null);
            }
            // invalidate the conversation by id cache
            if (newMessage.conversation_id) {
              dispatch(
                chatApi.util.invalidateTags([{ type: APITags.GET_CONVERSATION_BY_ID, id: newMessage.conversation_id }]),
              );
            }
            config.onNewMessage?.(newMessage);
            break;
          case SSEEventType.CONVERSATION_UPDATED:
            if (_conversationId) {
              dispatch(chatApi.util.invalidateTags([{ type: APITags.GET_CONVERSATION_BY_ID, id: _conversationId }]));
            }
            break;
          default:
        }
      } catch (error) {
        captureException(error);
      }
    },
    [dispatch, _conversationId, config.enableStreaming],
  );

  useEffect(() => {
    if (config.conversationId) {
      setConversationId(config.conversationId);
    }
  }, [config.conversationId]);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.CONVERSATION, (data: BaseEventPayload) => {
      if (data?.source_id === _conversationId) handleMessage(data);
    });
    return () => sub.unsubscribe();
  }, [handleMessage, _conversationId]);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.CONVERSATION_V2, (data: BaseEventPayload) => {
      if (data?.source_id === _conversationId) handleMessage(data);
    });
    return () => sub.unsubscribe();
  }, [handleMessage, _conversationId]);

  // Subscribe to AGENT_STREAMS only when streaming is enabled
  useEffect(() => {
    if (!config.enableStreaming) return;

    const sub = sseEventBus.subscribe(EVENT_TYPE.AGENT_STREAMS, (data: BaseEventPayload) => {
      // if (data?.source_id === _conversationId) {
      handleStreamEvent(data);
      // }
    });
    return () => sub.unsubscribe();
  }, [config.enableStreaming, handleStreamEvent, _conversationId, sseEventBus]);

  useEffect(() => {
    if (!isFetchingConversationHistory && conversationHistory && conversationHistory?.messages?.length > 0) {
      const historyMessages: ChatMessage[] = getHistoryFormattedMessages(conversationHistory);

      setMessages(historyMessages);
      config.setHeader?.(conversationHistory?.conversation?.title || '');
    }
  }, [conversationHistory, isFetchingConversationHistory]);

  const sendMessage = useCallback(
    async (messagePayload: ChatMessage, useV2Api?: boolean) => {
      if (!_conversationId) {
        throw new Error('Conversation ID is required to send messages');
      }
      clearStreamingState();

      try {
        if (messagePayload?.message_content?.attachments?.length) {
          const attachmentsMessagePayload: ChatMessage = {
            ...messagePayload,
            message_content: {
              ...messagePayload.message_content,
              elements: [
                ...(messagePayload.message_content.elements || []),
                {
                  id: 'element_2',
                  type: BLOCK_TYPE.ATTACHMENTS,
                  order: 2,
                  payload: {
                    attachments: messagePayload.message_content.attachments,
                  },
                },
              ],
            },
          };

          setMessages((prev) => [...prev, attachmentsMessagePayload]);
        } else {
          setMessages((prev) => [...prev, messagePayload]);
        }
        const response = useV2Api
          ? await sendMessageV2Mutation({
              conversationId: _conversationId,
              body: messagePayload,
            }).unwrap()
          : await sendMessageMutation({
              conversationId: _conversationId,
              body: messagePayload,
            }).unwrap();

        return response;
      } catch (error) {
        captureException(error);
        throw error;
      }
    },
    [_conversationId, sendMessageMutation, clearStreamingState],
  );

  return {
    // Existing return values - unchanged for backward compatibility
    messages,
    sendMessage,
    clearMessages,
    isSendingMessage,
    isSendingMessageV2,
    sendMessageError,
    createConversation,
    isCreatingConversation,
    isCreatingConversationV2,
    sendMessageV2Error,
    createConversationV2Error,
    createConversationError,
    setMessages,
    isLoadingConversationHistory,
    isFetchingConversationHistory,
    createConversationV2,
    conversationId: _conversationId,
    setConversationId,
    // New streaming return values - safe to ignore when not using streaming
    streamingState,
    isStreaming,
    clearStreamingState,
  };
};
