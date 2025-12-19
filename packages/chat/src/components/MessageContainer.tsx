import { COLORS, ShimmerText } from '@zamp-platform/ui';
import { FC, useEffect, useRef } from 'react';

import Avatar from '@/components/common/avatar';
import PaceAvatar from '@/modules/chatbot/PaceAvatar';

import { ButtonBlockType } from '../types/block.types';
import { ChatMessage } from '../types/chat.types';
import Message from './Message';

interface MessageContainerProps {
  messages: ChatMessage[];
  handleAction?: (blockConfig: ButtonBlockType, payload: Record<string, string>) => void | Promise<void>;
  isAnalysing: boolean;
}

export const MessageContainer: FC<MessageContainerProps> = ({ messages, handleAction, isAnalysing }) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    if (messages?.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages?.length]);

  return (
    <div className='flex w-full flex-grow flex-col gap-6 overflow-y-auto p-4' ref={messagesContainerRef}>
      {messages?.map((message) => (
        <Message
          key={message.timestamp}
          message={message}
          onAction={handleAction}
          assistantName='Pace'
          assistantAvatar={<PaceAvatar />}
          userAvatar={(senderName) => (
            <Avatar
              name={senderName}
              backgroundColor={COLORS.YELLOW_300}
              className='f-10-500 text-gray-1000 flex h-4 min-h-4 w-4 min-w-4 items-center justify-center rounded-md'
            />
          )}
        />
      ))}
      {isAnalysing && (
        <div className='flex w-full items-center gap-1.5 text-gray-700'>
          <PaceAvatar />
          <ShimmerText text='Analysing...' autoAnimate={true} />
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
