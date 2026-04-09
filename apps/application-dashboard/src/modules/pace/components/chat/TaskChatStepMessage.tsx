'use client';

import type { ChatMessage } from '@zamp-platform/chat';
import { BlockRenderer } from '@zamp-platform/chat';

export interface TaskChatStepMessageProps {
  message: ChatMessage;
  /** Use inside muted panels (e.g. step group card): no white card on thinking/tool rows. */
  quietSurface?: boolean;
  /** Step group accordion: show timeline dot even when this message is a single markdown block. */
  alwaysShowMarkdownTimelineDot?: boolean;
  /** Connect to previous message in a continuous thread (enables connectors on first block). */
  showConnectorToLastBlock?: boolean;
  /** Connect to next message in a continuous thread (enables connectors on last block). */
  showConnectorToNextBlock?: boolean;
}

/**
 * Task "show steps" timeline row: connector-aligned blocks, with user markdown bubbles
 * right-aligned and `inputs_responded` rows left-aligned like assistant steps.
 */
export const TaskChatStepMessage = ({
  message,
  quietSurface = false,
  alwaysShowMarkdownTimelineDot = false,
  showConnectorToLastBlock = false,
  showConnectorToNextBlock = false,
}: TaskChatStepMessageProps) => {
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
          showConnectorToLastBlock={showConnectorToLastBlock}
          showConnectorToNextBlock={showConnectorToNextBlock}
          quietSurface={quietSurface}
          alwaysShowMarkdownTimelineDot={alwaysShowMarkdownTimelineDot}
        />
      </div>
    </div>
  );
};
