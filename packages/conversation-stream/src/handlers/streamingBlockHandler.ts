import { captureException } from '@sentry/browser';
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

        let newBlock: Block;

        switch (blockType) {
          case BLOCK_TYPE.THINKING:
            newBlock = {
              type: BLOCK_TYPE.THINKING,
              order: index,
              payload: { thinking: '' },
              start_timestamp: contentBlock?.start_timestamp as string | undefined,
              is_complete: false,
            };
            break;
          case BLOCK_TYPE.TEXT:
            newBlock = {
              type: BLOCK_TYPE.TEXT,
              order: index,
              payload: { text: '' },
              start_timestamp: contentBlock?.start_timestamp as string | undefined,
              is_complete: false,
            };
            break;
          case BLOCK_TYPE.TOOL_RESULT: {
            const toolCallId = (contentBlock?.tool_call_id || contentBlock?.id) as string;
            newBlock = {
              type: BLOCK_TYPE.TOOL_RESULT,
              order: index,
              id: contentBlock?.id as string,
              payload: {
                content: '',
                is_error: false,
                tool_call_id: toolCallId,
              },
              start_timestamp: contentBlock?.start_timestamp as string | undefined,
              is_complete: false,
            };
            break;
          }
          case BLOCK_TYPE.TASK:
            newBlock = {
              type: BLOCK_TYPE.TASK,
              order: index,
              id: contentBlock?.id as string,
              payload: {
                id: (contentBlock?.id as string) || '',
                title: (contentBlock?.title as string) || '',
                task_id: (contentBlock?.task_id as string) || (contentBlock?.id as string) || '',
                status: contentBlock?.status,
              },
              start_timestamp: contentBlock?.start_timestamp as string | undefined,
              is_complete: false,
            } as TaskContentBlock;
            break;
          default:
            newBlock = {
              type: BLOCK_TYPE.TOOL_USE,
              order: index,
              id: contentBlock?.id as string,
              name: contentBlock?.name as string,
              payload: {
                partial_json: '',
                tool_call_id: contentBlock?.id as string,
                display_name: contentBlock?.display_name as string,
              },
              start_timestamp: contentBlock?.start_timestamp as string | undefined,
              is_complete: false,
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

        // Use bufferDelta for RAF-batched smooth rendering
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
            case StreamingContentBlockDeltaType.TOOL_USE_BLOCK_UPDATE_DELTA:
              if (block.type === BLOCK_TYPE.TOOL_USE) {
                block.payload.message = (delta.message as string) ?? block.payload.message;
                block.payload.display_content =
                  (delta.display_content as typeof block.payload.display_content) ?? block.payload.display_content;
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
