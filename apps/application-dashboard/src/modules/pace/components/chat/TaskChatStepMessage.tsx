'use client';

import type { ChatMessage } from '@zamp-platform/chat';
import { BlockRenderer } from '@zamp-platform/chat';

export interface TaskChatStepMessageProps {
  message: ChatMessage;
  isLastMessage: boolean;
}

/**
 * Task “show steps” timeline row: connector-aligned blocks, with user markdown bubbles
 * right-aligned and `inputs_responded` rows left-aligned like assistant steps.
 */
export const TaskChatStepMessage = ({ message }: TaskChatStepMessageProps) => {
  const elements = message.message_content?.elements ?? [];

  return (
    <div data-sender-type={message.sender_type} className='group space-y-0'>
      <div>
        <BlockRenderer
          message={{ block: elements }}
          className='border-none shadow-none'
          conversationId={message.conversation_id}
          messageId={message.id}
          showMarkdownConnectors
          showConnectorToLastBlock
          showConnectorToNextBlock
        />
      </div>
    </div>
  );
};
