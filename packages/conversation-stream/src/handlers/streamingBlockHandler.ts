import { captureException, captureMessage } from '@sentry/browser';
import {
  type Block,
  BLOCK_TYPE,
  ChatMessageType,
  ResourceType,
  SenderType,
  StreamingContentBlockDeltaType,
  StreamingContentBlockType,
  type StreamingState,
  streamingStateStore,
  type TaskContentBlock,
} from '@zamp-platform/chat';

type MapAny = Record<string, unknown>;

// Per-session de-dupe so Sentry isn't spammed when BE ships a new delta/block type.
const reportedUnknownDeltaTypes = new Set<string>();
const reportedUnknownBlockTypes = new Set<string>();

/**
 * Handles content_block_start / content_block_delta / content_block_stop events.
 * Works for both flat (per-conversation SSE) and wrapped (global SSE) formats —
 * caller provides the conversationId and the inner payload.
 *
 * On page-refresh the backend replays from message_start, so content_block_start
 * is always guaranteed to arrive before any content_block_delta for a given block.
 *
 * Uses bufferDelta() for content_block_delta (RAF-batched, smooth 60fps).
 * Uses synchronous update() for start/stop (infrequent, need immediate notification).
 */
export function handleContentBlockEvent(conversationId: string, type: string, index: number, payload: MapAny): void {
  try {
    switch (type) {
      case StreamingContentBlockType.CONTENT_BLOCK_START: {
        const contentBlock = payload.content_block as MapAny;
        const blockType = contentBlock?.type as string;

        const blockBase = {
          order: index,
          start_timestamp: contentBlock?.start_timestamp as string | undefined,
          is_complete: false,
        };

        let newBlock: Block;

        switch (blockType) {
          case BLOCK_TYPE.THINKING:
            newBlock = {
              ...blockBase,
              type: BLOCK_TYPE.THINKING,
              payload: { thinking: '' },
            };
            break;
          case BLOCK_TYPE.TEXT:
            newBlock = {
              ...blockBase,
              type: BLOCK_TYPE.TEXT,
              payload: { text: '' },
            };
            break;
          case BLOCK_TYPE.TOOL_RESULT: {
            const toolCallId = (contentBlock?.tool_call_id || contentBlock?.id) as string;
            newBlock = {
              ...blockBase,
              type: BLOCK_TYPE.TOOL_RESULT,
              id: contentBlock?.id as string,
              payload: {
                content: '',
                is_error: false,
                tool_call_id: toolCallId,
              },
            };
            break;
          }
          case BLOCK_TYPE.TASK:
            newBlock = {
              ...blockBase,
              type: BLOCK_TYPE.TASK,
              id: contentBlock?.id as string,
              payload: {
                id: (contentBlock?.id as string) || '',
                title: (contentBlock?.title as string) || '',
                task_id: (contentBlock?.task_id as string) || (contentBlock?.id as string) || '',
                status: contentBlock?.status,
              },
            } as TaskContentBlock;
            break;
          default:
            // Only TOOL_USE legitimately reaches default (the other BLOCK_TYPE values
            // each have explicit cases above). Anything else is a new block type from BE.
            if (blockType && blockType !== BLOCK_TYPE.TOOL_USE && !reportedUnknownBlockTypes.has(blockType)) {
              reportedUnknownBlockTypes.add(blockType);
              captureMessage('chat.streaming.unknown_block_type', {
                level: 'warning',
                tags: { area: 'sse', blockType, conversationId },
                extra: { blockType, blockOrder: index, conversationId },
              });
            }
            newBlock = {
              ...blockBase,
              type: BLOCK_TYPE.TOOL_USE,
              id: contentBlock?.id as string,
              name: contentBlock?.name as string,
              payload: {
                partial_json: '',
                tool_call_id: contentBlock?.id as string,
                display_name: contentBlock?.display_name as string,
                display_title: contentBlock?.display_title as string,
              },
            };
        }

        streamingStateStore.update(conversationId, (prev) => {
          // On page-refresh with ?message_id=, the server replays content blocks
          // without a preceding message_start. Auto-create the streaming entry
          // so blocks are not silently dropped.
          if (!prev) {
            const newState: StreamingState = {
              resource_type: ResourceType.ORGANIZATION,
              resource_id: '',
              conversation_id: conversationId,
              id: '',
              message_content: { elements: [newBlock] },
              message_type: ChatMessageType.SYSTEM,
              sender_type: SenderType.ASSISTANT,
              sender_name: 'assistant',
              timestamp: new Date().toISOString(),
              metadata: {},
              is_active: true,
            };
            return newState;
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
        const delta = payload.delta as MapAny;
        const deltaType = delta?.type as string;

        // TOOL_USE_BLOCK_UPDATE_DELTA is low-frequency (once per tool call) and
        // carries display_name updates that must appear immediately.  Using the
        // synchronous update() path avoids RAF-batching delays — RAF doesn't fire
        // in background tabs, which can postpone display_name rendering until the
        // tab regains focus.
        if (deltaType === StreamingContentBlockDeltaType.TOOL_USE_BLOCK_UPDATE_DELTA) {
          streamingStateStore.update(conversationId, (prev) => {
            if (!prev) return prev;
            const elements = prev.message_content?.elements;
            if (!elements) return prev;

            const updatedElements = elements.map((block) => {
              if (block.order !== index || block.type !== BLOCK_TYPE.TOOL_USE) return block;
              return {
                ...block,
                payload: {
                  ...block.payload,
                  message: (delta.message as string) ?? block.payload.message,
                  display_content:
                    (delta.display_content as typeof block.payload.display_content) ?? block.payload.display_content,
                  display_name: (delta.display_name as string) ?? block.payload.display_name,
                  display_title: (delta.display_title as string) ?? block.payload.display_title,
                },
              };
            });

            return {
              ...prev,
              message_content: { ...prev.message_content, elements: updatedElements },
            };
          });
          break;
        }

        // High-frequency deltas (text, thinking, input_json) use RAF-batched
        // bufferDelta for smooth 60fps rendering.
        streamingStateStore.bufferDelta(conversationId, (draft) => {
          const elements = draft.message_content?.elements;
          if (!elements) return;

          const block = elements.find((b) => b.order === index);
          if (!block) return;

          switch (deltaType) {
            case StreamingContentBlockDeltaType.THINKING_DELTA:
              if (block.type === BLOCK_TYPE.THINKING) {
                block.payload.thinking = (block.payload.thinking || '') + (delta.thinking as string);
              }
              break;
            case StreamingContentBlockDeltaType.TEXT_DELTA:
              if (block.type === BLOCK_TYPE.TEXT) {
                block.payload.text = block.payload.text + (delta.text as string);
              }
              break;
            case StreamingContentBlockDeltaType.INPUT_JSON_DELTA:
              if (block.type === BLOCK_TYPE.TOOL_USE) {
                block.payload.partial_json = (block.payload.partial_json || '') + (delta.partial_json as string);
              }
              break;
            case StreamingContentBlockDeltaType.TOOL_RESULT_DELTA:
              if (block.type === BLOCK_TYPE.TOOL_RESULT) {
                block.payload.content = (block.payload.content || '') + (delta.content as string);
                block.payload.is_error = (delta.is_error as boolean) ?? block.payload.is_error;
                block.payload.tool_call_id = (delta.tool_call_id as string) ?? block.payload.tool_call_id;
              }
              break;
            case StreamingContentBlockDeltaType.TASK_DELTA:
              if (block.type === BLOCK_TYPE.TASK) {
                const taskPayload = block.payload as TaskContentBlock['payload'];
                taskPayload.title = (delta.title as string) ?? taskPayload.title;
                taskPayload.status = (delta.status as typeof taskPayload.status) ?? taskPayload.status;
              }
              break;
            default: {
              const unknownDelta = deltaType ?? '<missing>';
              if (!reportedUnknownDeltaTypes.has(unknownDelta)) {
                reportedUnknownDeltaTypes.add(unknownDelta);
                captureMessage('chat.streaming.unknown_delta_type', {
                  level: 'warning',
                  tags: { area: 'sse', deltaType: unknownDelta, blockType: block.type, conversationId },
                  extra: { deltaType: unknownDelta, blockType: block.type, blockOrder: index, conversationId },
                });
              }
              break;
            }
          }
        });
        break;
      }

      case StreamingContentBlockType.CONTENT_BLOCK_STOP: {
        const stopTimestamp = (payload.stop_timestamp ?? (payload.content_block as MapAny)?.stop_timestamp) as
          | string
          | undefined;
        streamingStateStore.update(conversationId, (prev) => {
          if (!prev) return prev;
          const existingBlocks = prev.message_content?.elements ?? [];
          const updatedBlocks = existingBlocks.map((block) => {
            if (block.order !== index) return block;
            return { ...block, is_complete: true, stop_timestamp: stopTimestamp };
          });
          return {
            ...prev,
            message_content: { ...prev.message_content, elements: updatedBlocks },
            is_active: true,
          };
        });
        break;
      }
    }
  } catch (error) {
    captureException(error instanceof Error ? error : new Error(String(error)));
  }
}
