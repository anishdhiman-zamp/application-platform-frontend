'use client';

import { captureException } from '@sentry/browser';
import { UseSSEOptions } from '@zamp-platform/utils';
import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import {
  type Block,
  BLOCK_TYPE,
  type OutputFilesBlockType,
  type StreamEventPayload,
  StreamingContentBlockDeltaType,
  StreamingContentBlockType,
} from '../types/block.types';
import {
  ChatMessage,
  ChatMessageType,
  CreateConversationPayloadType,
  CreateConversationPayloadTypeV2,
  ResourceType,
  SenderType,
  SSEEventType,
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
  apiConfig?: {
    getConversationById?: string;
    sendMessage?: string;
    createConversation?: string;
  };
  // Streaming config options (opt-in, all optional with defaults)
  enableStreaming?: boolean;
  showThinkingContent?: boolean;
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

  const [streamingState, setStreamingState] = useState<StreamingState | null>(null);

  // Ref to track the current conversation ID for use in callbacks without stale closures
  const conversationIdRef = useRef<string | null>(_conversationId);

  // Track if conversation was created in this session (to skip fetching history for newly created conversations)
  const isNewlyCreatedConversationRef = useRef<string | null>(null);

  const isStreaming = useMemo(() => {
    return config.enableStreaming ? (streamingState?.is_active ?? false) : false;
  }, [config.enableStreaming, streamingState?.is_active]);

  const clearStreamingState = useCallback(() => {
    if (config.enableStreaming) {
      setStreamingState(null);
    }
  }, [config.enableStreaming]);

  // Skip fetching conversation history if this conversation was just created in this session (only for streaming mode)
  const shouldSkipConversationFetch =
    !config.resourceId ||
    !config.resourceType ||
    !config.conversationId ||
    (config.enableStreaming && isNewlyCreatedConversationRef.current === config.conversationId);

  const {
    data: conversationHistory,
    isLoading: isLoadingConversationHistory,
    isFetching: isFetchingConversationHistory,
    isUninitialized: isUninitializedConversationHistory,
    isError: isErrorConversationHistory,
    refetch: refetchConversationHistory,
  } = useGetConversationByIdQuery(
    {
      conversationId: config.conversationId || '',
      resourceId: config.resourceId,
      resourceType: config.resourceType,
      url: config.apiConfig?.getConversationById,
    },
    {
      skip: shouldSkipConversationFetch,
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
    isNewlyCreatedConversationRef.current = response.conversation_id;
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
    const response = await createConversationV2Mutation({
      ...conversationPayload,
      url: config.apiConfig?.createConversation,
    }).unwrap();
    setConversationId(response.conversation_id);
    isNewlyCreatedConversationRef.current = response.conversation_id;

    // Update header with title from response
    if (response.title && !config.enableStreaming) {
      config.setHeader?.(response.title);
    }

    return response;
  };

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    isNewlyCreatedConversationRef.current = null;
    if (config.enableStreaming) {
      setStreamingState(null);
    }
  }, [config.enableStreaming]);

  const handleStreamEvent = useCallback(
    (data: BaseEventPayload) => {
      if (!config.enableStreaming) return;

      try {
        const payload = data.payload as StreamEventPayload;

        switch (payload.type) {
          case StreamingContentBlockType.CONTENT_BLOCK_START: {
            const { index, content_block } = payload;
            const blockType = content_block?.type;

            let newBlock: Block;

            if (blockType === BLOCK_TYPE.THINKING) {
              newBlock = {
                type: BLOCK_TYPE.THINKING,
                order: index,
                payload: { thinking: '' },
                start_timestamp: content_block?.start_timestamp,
                is_complete: false,
              };
            } else if (blockType === BLOCK_TYPE.TEXT) {
              newBlock = {
                type: BLOCK_TYPE.TEXT,
                order: index,
                payload: { text: '' },
                start_timestamp: content_block?.start_timestamp,
                is_complete: false,
              };
            } else if (blockType === BLOCK_TYPE.TOOL_RESULT) {
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
            } else {
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

            setStreamingState((prev) => {
              // Validate that streaming state belongs to current conversation
              if (prev && prev.conversation_id && prev.conversation_id !== conversationIdRef.current) {
                return null; // Clear stale streaming state from different conversation
              }

              if (!prev) {
                // If no previous state, create a new one with defaults
                return {
                  resource_type: config.resourceType || ResourceType.ORGANIZATION,
                  resource_id: config.resourceId || '',
                  conversation_id: conversationIdRef.current || undefined,
                  message_content: {
                    elements: [newBlock],
                  },
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

            setStreamingState((prev) => {
              if (!prev) return prev;

              // Validate that streaming state belongs to current conversation
              if (prev.conversation_id && prev.conversation_id !== conversationIdRef.current) {
                return null; // Clear stale streaming state from different conversation
              }

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
                    // Update existing tool_result block with content
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

            setStreamingState((prev) => {
              if (!prev) return prev;

              // Validate that streaming state belongs to current conversation
              if (prev.conversation_id && prev.conversation_id !== conversationIdRef.current) {
                return null; // Clear stale streaming state from different conversation
              }

              const existingBlocks = prev.message_content?.elements ?? [];
              const updatedBlocks = existingBlocks.map((block) => {
                if (block.order !== index) return block;
                return { ...block, is_complete: true, stop_timestamp: stop_timestamp };
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
          case SSEEventType.TITLE_UPDATED:
            if (config.enableStreaming) {
              const title = data.payload?.title;
              config.setHeader?.(title);
            }
            break;
          case SSEEventType.MESSAGE_START:
            if (config.enableStreaming) {
              const message = data.payload.message;

              // Map sender_type string to enum
              const senderType =
                message.sender_type === 'ASSISTANT' || message.sender_type === SenderType.ASSISTANT
                  ? SenderType.ASSISTANT
                  : SenderType.USER;

              setStreamingState({
                resource_type: config.resourceType || ResourceType.ORGANIZATION,
                resource_id: config.resourceId || message.organization_id || '',
                conversation_id: message.conversation_id,
                id: message.id,
                message_content: {
                  elements: [],
                },
                message_type: ChatMessageType.SYSTEM,
                sender_type: senderType,
                sender_name: message.sender_name || 'assistant',
                timestamp: message.created_at || new Date().toISOString(),
                metadata: {},
                is_active: true,
              });
            }
            break;
          case SSEEventType.OUTPUT_FILES:
            if (config.enableStreaming) {
              const outputFilesPayload = data.payload.message;
              const messageIdForOutputFiles = outputFilesPayload.id;

              setStreamingState((prev) => {
                if (!prev) return prev;

                // Verify that the output files belong to the current streaming message
                if (prev.id && prev.id !== messageIdForOutputFiles) {
                  return prev;
                }

                const outputFilesBlock: OutputFilesBlockType = {
                  id: `output-files-${messageIdForOutputFiles}`,
                  type: BLOCK_TYPE.OUTPUT_FILES,
                  order: (prev.message_content?.elements?.length || 0) + 1,
                  payload: {
                    output_files: outputFilesPayload.output_files,
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
            }
            break;
          case SSEEventType.MESSAGE_STOP:
            setStreamingState((prev) => {
              if (!prev) return null;

              // Don't add message if it belongs to a different conversation
              if (prev.conversation_id && prev.conversation_id !== conversationIdRef.current) {
                return null; // Clear stale streaming state without adding to messages
              }

              if (prev.message_content?.elements && prev.message_content.elements.length > 0) {
                const streamingMessagePayload: ChatMessage = {
                  resource_type: prev.resource_type,
                  resource_id: prev.resource_id,
                  id: prev.id,
                  conversation_id: prev.conversation_id,
                  message_type: prev.message_type,
                  metadata: prev.metadata || {},
                  timestamp: prev.timestamp,
                  sender_type: prev.sender_type,
                  sender_name: prev.sender_name || 'assistant',
                  message_content: {
                    elements: prev.message_content.elements,
                  },
                };

                setMessages((messagePrev) => {
                  // Check if message with same id already exists to prevent duplicates from StrictMode
                  if (streamingMessagePayload.id && messagePrev.some((msg) => msg.id === streamingMessagePayload.id)) {
                    return messagePrev;
                  }
                  return [...messagePrev, streamingMessagePayload];
                });
              }

              return null;
            });

            break;
          default:
        }
      } catch (error) {
        captureException(error);
      }
    },
    [dispatch, _conversationId],
  );

  // Handle conversation ID changes - clear streaming state when switching conversations
  useEffect(() => {
    const newConversationId = config.conversationId || null;
    const previousConversationId = conversationIdRef.current;

    conversationIdRef.current = newConversationId;

    if (newConversationId !== previousConversationId) {
      // Clear streaming state when switching to a different conversation
      if (config.enableStreaming) {
        setStreamingState(null);
      }

      setConversationId(newConversationId);
    }
  }, [config.conversationId, config.enableStreaming]);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.CONVERSATION_V2, (data: BaseEventPayload) => {
      const payload = data?.payload as MapAny;
      const conversationId = payload?.conversation_id as string;
      if (data?.source_id === _conversationId || conversationId === _conversationId) handleMessage(data);
    });
    return () => sub.unsubscribe();
  }, [handleMessage, _conversationId]);

  useEffect(() => {
    if (!config.enableStreaming) return;

    const sub = sseEventBus.subscribe(EVENT_TYPE.AGENT_STREAMS, (data: BaseEventPayload) => {
      const payload = data?.payload as MapAny;
      const streamingId = payload?.streaming_id as string;
      if (streamingId === _conversationId) handleStreamEvent(data);
    });
    return () => sub.unsubscribe();
  }, [config.enableStreaming, _conversationId, handleStreamEvent]);

  useEffect(() => {
    if (!isFetchingConversationHistory && conversationHistory && conversationHistory?.messages?.length > 0) {
      const historyMessages: ChatMessage[] = getHistoryFormattedMessages(conversationHistory);

      // This handles page refresh scenarios where streaming was in progress
      if (config.enableStreaming) {
        setStreamingState(null);
      }

      setMessages(historyMessages);
      config.setHeader?.(conversationHistory?.conversation?.title || '');
    }
  }, [conversationHistory, isFetchingConversationHistory, config.enableStreaming]);

  const sendMessage = useCallback(
    async (messagePayload: ChatMessage, useV2Api?: boolean) => {
      if (!_conversationId) {
        throw new Error('Conversation ID is required to send messages');
      }

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
              url: config.apiConfig?.sendMessage,
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
    [_conversationId, sendMessageMutation, streamingState],
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
    streamingState,
    isStreaming,
    clearStreamingState,
    isUninitializedConversationHistory,
    isErrorConversationHistory,
    refetchConversationHistory: refetchConversationHistory,
  };
};
